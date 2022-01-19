const GRID_SIZE = 64;
const BUFFER = 1;
const SCREEN_COLUMNS = 7;
const SCREEN_ROWS = 12;
const SCREEN_HEIGHT = GRID_SIZE * (SCREEN_ROWS + 2 * BUFFER);
const SCREEN_WIDTH = GRID_SIZE * (SCREEN_COLUMNS + 2 * BUFFER);
const DEPTHS =
{
    BG_SHADOW : 0,
    BG : 500,
    GRID: 1000,
    PLAYER: 1500,
    GUESS: 2000,
    FG: 4000,
    UI: 5000
};

let COLORS = {
    BORDER: 0x000000,
    BORDER_TEXT: '#000000',
    CLUE: 0x000000,
    CLUE_TEXT: '#000000',
    GUESS: 0xC0C0C0,
    GUESS_TEXT: '#C0C0C0',
    VIOLATION: 0x800000,
    VIOLATION_TEXT: '#800000'
};

let TILES = {
    TREE_BIG: 0,
    TREE_BIG_SHADOW: 1,
    FENCE_1: 2,
    FENCE_2: 3,
    FENCE_OPENING: 4,
    CRATER: 5,
    SNOW: 6,
    TREE_SMALL: 7,
    TREE_SMALL_SHADOW: 8,
    CHEST: 9
};

let xPixel = function(x) {
    return Math.round(x * GRID_SIZE + GRID_SIZE/2 + BUFFER * GRID_SIZE);
};

let yPixel = function(y) {
    return Math.round(y * GRID_SIZE + GRID_SIZE/2 + BUFFER * GRID_SIZE);
};

let player_stats = {
    version: 1,
    boards_cleared : 0,
};

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {

        //----------------------------------------------------------------------
        // STATE VARIABLES
        //----------------------------------------------------------------------

        let scene = this;

        //board
        let grid_squares = [];

        let start_x = 3;
        let start_y = -2;
        let current_x = start_x;
        let current_y = start_y;
        let target_x = 3;
        let target_y = 0;
        let player_pic = null;

        let local_stats = localStorage.getItem('player_stats');
        if (local_stats) {
            player_stats = JSON.parse(local_stats);
        }

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let set_player_location = function(x, y) {
            target_x = x;
            target_y = y;
            state_handler.changeState(STATES.WALK);
        };

        let INPUT_STATE = {
            WALK: 0,
            FLAG: 1
        };
        let current_input_state = INPUT_STATE.WALK;

        let add_ui = () => {
            let ui = scene.add.sprite(xPixel(SCREEN_COLUMNS), yPixel(-1),
                'ui')
                .setDepth(DEPTHS.UI);
            let enter_to_walk = () => {
                current_input_state = INPUT_STATE.WALK;
                ui.play('ui_to_walk');
                ui.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    ui_state_handler.changeState(UI_STATES.WALK);
                })
            };
            let enter_walk = () => {
                current_input_state = INPUT_STATE.WALK;
                ui.play('ui_walk');
            };
            let enter_to_flag = () => {
                current_input_state = INPUT_STATE.FLAG;
                ui.play('ui_to_flag');
                ui.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    ui_state_handler.changeState(UI_STATES.FLAG);
                })
            };
            let enter_flag = () => {
                current_input_state = INPUT_STATE.FLAG;
                ui.play('ui_flag');
            };

            let UI_STATES = {
                TO_WALK: {enter: enter_to_walk, exit: null},
                WALK: {enter: enter_walk, exit: null},
                TO_FLAG: {enter: enter_to_flag, exit: null},
                FLAG: {enter: enter_flag, exit: null},
            };
            let ui_state_handler = stateHandler(scene, UI_STATES, UI_STATES.WALK);
            ui_state_handler.start();

            ui.play('ui_walk');
            ui.setInteractive();
            ui.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function () {
                if (current_input_state === INPUT_STATE.WALK) {
                    ui_state_handler.changeState(UI_STATES.TO_FLAG);
                } else {
                    ui_state_handler.changeState(UI_STATES.TO_WALK);
                }
            });
        };
        add_ui();

        let addTree = () => {
            let tile = Phaser.Utils.Array.GetRandom([
                TILES.TREE_BIG,TILES.TREE_BIG,TILES.TREE_BIG,TILES.TREE_BIG,
                TILES.TREE_SMALL]);
            let x = Phaser.Math.Between(-50,-150)/100;
            x += Phaser.Utils.Array.GetRandom([0,8]);
            let y = Phaser.Math.Between(-150,1250)/100;
            let flip = Phaser.Utils.Array.GetRandom([true,false]);
            scene.add.sprite(xPixel(x), yPixel(y), 'tiles', tile).setFlipX(flip)
                .setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(x), yPixel(y), 'tiles', tile+1).setFlipX(flip)
                .setDepth(DEPTHS.BG_SHADOW);
        };

        let prepare_empty_grid = function() {

            for(let x = 0; x < 40; x++) {
                addTree();
            }

            scene.add.rectangle(
                xPixel(SCREEN_COLUMNS / 2 - 0.5),
                yPixel(SCREEN_ROWS / 2 - 0.5),
                SCREEN_COLUMNS * GRID_SIZE,
                SCREEN_ROWS * GRID_SIZE,
                COLORS.BORDER,
                0
            ).setStrokeStyle(GRID_SIZE/16, COLORS.BORDER, 1).setDepth(DEPTHS.BG);

            let solution_statistics = solve_and_take_best();
            console.log(solution_statistics);

            for (let x = 0; x < SCREEN_COLUMNS; x++) {
                grid_squares.push([]);
                for (let y = 0; y < SCREEN_ROWS; y++) {
                    let square = scene.add.rectangle(
                        xPixel(x),
                        yPixel(y),
                        GRID_SIZE,
                        GRID_SIZE,
                        COLORS.BORDER,
                        0
                    ).setStrokeStyle(GRID_SIZE/32, COLORS.BORDER, 1).setDepth(DEPTHS.GRID);
                    grid_squares[x].push(square);
                    square.setInteractive();
                    square.setData('x', x);
                    square.setData('y', y);
                    square.setData('locked', false);
                    square.setData('hidden_mine', solution_statistics.board[x][y].hidden_mine);
                    if ( (y === 0 || y === 1) && (x === 2 || x === 3 || x === 4))
                    {
                        square.setData('hidden_mine', false);
                    }
                    if ( y === SCREEN_ROWS - 1 && x === 3)
                    {
                        square.setData('hidden_mine', false);
                    }
                    if (solution_statistics.board[x][y].generation >
                        solution_statistics.exit_generation) {
                        scene.add.sprite(xPixel(x), yPixel(y), 'tiles', TILES.CHEST)
                            .setDepth(DEPTHS.BG);
                    }
                    let flag = scene.add.sprite(xPixel(x), yPixel(y-.25),'flag');
                    flag.play('flag_blowing');
                    flag.setVisible(false);
                    square.setData('flag', flag);

                    square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function () {
                        square.setFillStyle(0x000000, 0.15);
                    });
                    square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function () {
                        square.setFillStyle(0x000000, 0);
                    });
                    square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function () {
                        switch (current_input_state) {
                            case INPUT_STATE.WALK:
                                let delta = Phaser.Math.Distance.Snake(
                                    current_x, current_y,
                                    square.data.values.x, square.data.values.y);
                                if (delta === 1 && state_handler.getState() === STATES.IDLE) {
                                    if (square.data.values.hidden_mine) {
                                        target_x = x;
                                        target_y = y;
                                        square.data.values.hidden_mine = false;
                                        state_handler.changeState(STATES.DEAD);
                                    } else {
                                        set_player_location(square.data.values.x, square.data.values.y);
                                    }
                                }
                                break;
                            case INPUT_STATE.FLAG:
                                if (!square.data.values.text.visible) {
                                    square.data.values.locked = !square.data.values.locked;
                                    square.data.values.flag.setVisible(square.data.values.locked);
                                    flag.play('flag_blowing');
                                }
                                break;
                        }
                    });
                }
            }

            for (let x = 0; x < SCREEN_COLUMNS; x++) {
                for (let y = 0; y < SCREEN_ROWS; y++) {

                    let sum = 0;
                    for (let d of [[-1, -1], [-1, 0], [-1, 1],
                        [0, -1],[0, 1],
                        [1, -1],[1, 0],[1, 1]]) {
                        let dx = d[0];
                        let dy = d[1];
                        if (x + dx >= 0 && x + dx < SCREEN_COLUMNS &&
                            y + dy >= 0 && y + dy < SCREEN_ROWS &&
                            grid_squares[x+dx][y+dy].data.values.hidden_mine) {
                            sum++
                        }
                    }
                    let clue_text =
                        grid_squares[x][y].data.values.hidden_mine ? ' ' : '' + sum + '';
                    let text = scene.add.text(
                        xPixel(x),
                        yPixel(y + 0.5),
                        clue_text,
                        {font: '' + GRID_SIZE/2 + 'px kremlin', fill: '#000000'})
                        .setDepth(DEPTHS.GUESS)
                        .setOrigin(1, 1)
                        .setVisible(false);
                    grid_squares[x][y].setData('text',text);
                }
            }

            for (let x = 0 - BUFFER; x < SCREEN_COLUMNS + BUFFER; x++) {
                let tile = TILES.FENCE_1;
                let flipX = true;
                if (x === Math.floor(SCREEN_COLUMNS/2)) {
                    tile = TILES.FENCE_OPENING;
                } else if (Phaser.Math.Between(0,100) < 25) {
                    tile = TILES.FENCE_2;
                }
                if (Phaser.Math.Between(0,100) < 50) {
                    flipX = false;
                }
                scene.add.sprite(xPixel(x), yPixel(-1.9), 'tiles', tile)
                    .setDepth(DEPTHS.GRID).setFlipX(flipX);
                scene.add.sprite(xPixel(x), yPixel(SCREEN_ROWS-1), 'tiles', tile)
                    .setDepth(DEPTHS.GRID).setFlipX(flipX);
            }

        };

        //----------------------------------------------------------------------
        // CODE TO SETUP GAME
        //----------------------------------------------------------------------

        prepare_empty_grid();

        player_pic = scene.add.sprite(xPixel(current_x),yPixel(current_y-0.5),'guy', 0)
            .setScale(1)
            .setDepth(DEPTHS.PLAYER);
        let walk = (complete) => {
            player_pic.play('guy_walk_anim');
            if (current_x > target_x) {
                player_pic.setFlipX(true);
            } else if (current_x < target_x) {
                player_pic.setFlipX(false);
            }
            let delta = Phaser.Math.Distance.Between(
                current_x, current_y,
                target_x, target_y);
            state_handler.addTween({
                targets: player_pic,
                x: xPixel(target_x),
                y: yPixel(target_y - 0.5),
                duration: 1000 * delta,
                onComplete: complete
            });
        };

        let enter_walk = () => {
            walk(() => {
                if (target_x === 3 && target_y === 11) {
                    state_handler.changeState(STATES.LEAVE);
                } else {
                    state_handler.changeState(STATES.IDLE);
                }
            });
        };

        let enter_leave = () => {
            target_y = 15;
            player_stats.boards_cleared++;
            localStorage.setItem('player_stats', JSON.stringify(player_stats));
            let exit_text = scene.add.text(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,
                'KMS WALKED: '+(player_stats.boards_cleared-1),
                {font: '' + GRID_SIZE/2 + 'px kremlin', fill: '#000000'})
                .setDepth(DEPTHS.UI)
                .setAlpha(0)
                .setOrigin(0.5, 0.5);
            state_handler.addDelayedCall(2000, () => {
                    exit_text.setText('KMS WALKED: '+player_stats.boards_cleared)
                });
            state_handler.addTween({
                targets: [exit_text, matte],
                alpha: 1,
                duration: 3000,
                onComplete : () => {
                    scene.scene.restart();
                }
            });
            walk(() => {});
        };

        let exit_walk = () => {
            player_pic.anims.stop();
            current_x = target_x;
            current_y = target_y;
            player_pic.x = xPixel(current_x);
            player_pic.y = yPixel(current_y - 0.5);
            grid_squares[current_x][current_y].data.values.text.setVisible(true);
        };

        let enter_idle = () => {
            player_pic.setFrame(0);
        };

        let enter_dead = () => {
            walk(() => {
                scene.add.sprite(xPixel(target_x), yPixel(target_y), 'tiles', TILES.CRATER);
                current_x = start_x;
                current_y = start_y;
                player_pic.x = xPixel(current_x);
                player_pic.y = yPixel(current_y - 0.5);
                let flash = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
                    SCREEN_WIDTH, SCREEN_HEIGHT, 0xffffff)
                    .setDepth(DEPTHS.FG);
                state_handler.addTween({
                    targets: flash,
                    alpha: 0,
                    delay: 500,
                    duration: 2000,
                    onComplete: () => {
                        set_player_location(3, 0);
                        flash.destroy();
                    }
                });
            });
        };

        let STATES = {
            WALK: {enter: enter_walk, exit: exit_walk},
            IDLE: {enter: enter_idle, exit: null},
            DEAD: {enter: enter_dead, exit: null},
            LEAVE: {enter: enter_leave, exit: null},
        };
        let state_handler = stateHandler(scene, STATES, STATES.IDLE);

        let matte = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0xE8E8E8)
            .setDepth(DEPTHS.UI);
        scene.tweens.add({
            targets: matte,
            alpha: 0,
            onComplete: () => {
                set_player_location(3, 0)
            }
        });
        state_handler.start();


        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);
    },

    update: function () {
    }
});

let CreateScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'CreateScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        let grid_squares = [];

        scene.add.rectangle(
            xPixel(SCREEN_COLUMNS / 2 - 0.5),
            yPixel(SCREEN_ROWS / 2 - 0.5),
            SCREEN_COLUMNS * GRID_SIZE,
            SCREEN_ROWS * GRID_SIZE,
            COLORS.BORDER,
            0
        ).setStrokeStyle(GRID_SIZE/16, COLORS.BORDER, 1).setDepth(DEPTHS.BG);

        for (let x = 0; x < SCREEN_COLUMNS; x++) {
            grid_squares.push([]);
            for (let y = 0; y < SCREEN_ROWS; y++) {
                let square = scene.add.rectangle(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE,
                    GRID_SIZE,
                    COLORS.BORDER,
                    0
                ).setStrokeStyle(GRID_SIZE/32, COLORS.BORDER, 1).setDepth(DEPTHS.GRID);
                grid_squares[x].push(square);
                square.setInteractive();
                square.setData('x', x);
                square.setData('y', y);
                square.setData('locked', false);
                square.setData('hidden_mine', false);
                if ( (y === 0 || y === 1) && (x === 2 || x === 3 || x === 4))
                {
                    square.setData('hidden_mine', false);
                }
                if ( y === SCREEN_ROWS - 1 && x === 3)
                {
                    square.setData('hidden_mine', false);
                }
                let text = scene.add.text(
                    xPixel(x),
                    yPixel(y + 0.5),
                    ' ',
                    {font: '' + GRID_SIZE/2 + 'px kremlin', fill: '#000000'})
                    .setDepth(DEPTHS.GUESS)
                    .setOrigin(1, 1)
                    .setVisible(false);
                square.setData('text',text);
                let flag = scene.add.sprite(xPixel(x), yPixel(y-.25),'flag');
                flag.play('flag_blowing');
                flag.setVisible(false);
                square.setData('flag', flag);
                //square.setData('shapes', create_shape(x, y));

                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function () {
                    square.setFillStyle(0x000000, 0.15);
                });
                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function () {
                    square.setFillStyle(0x000000, 0);
                });
                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function () {
                        let hidden_mine = !square.data.values.hidden_mine;
                        square.data.values.hidden_mine = hidden_mine;
                        square.data.values.flag.setVisible(hidden_mine);
                        flag.play('flag_blowing');
                        square.data.values.text.setVisible(!hidden_mine);
                });
            }
        }

        let randomize = () => {
            for (let grid_line of grid_squares) {
                for (let square of grid_line) {
                    let y = square.data.values.y;
                    let x = square.data.values.x;
                    let hidden_mine =
                        Phaser.Math.Between(0, 100) < 25;
                    if ((y === 0 || y === 1) && (x === 2 || x === 3 || x === 4)) {
                        hidden_mine = false;
                    }
                    if (y === SCREEN_ROWS - 1 && x === 3) {
                        hidden_mine = false;
                    }
                    square.data.values.hidden_mine = hidden_mine;
                    square.data.values.flag.setVisible(hidden_mine);
                    square.data.values.flag.play('flag_blowing');
                    square.data.values.text.setVisible(!hidden_mine);
                }
            }
        };

        let text = scene.add.text(
            0,
            SCREEN_HEIGHT,
            'RANDOM',
            {font: '' + GRID_SIZE/2 + 'px kremlin', fill: '#000000'})
            .setDepth(DEPTHS.GUESS)
            .setOrigin(0, 1)
            .setVisible(true);
        addButton(text, () => {
            let solution_statistics = solve_and_take_best();
            console.log(solution_statistics);
            set_board(solution_statistics.board, grid_squares);
        });



        text = scene.add.text(
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            'SOLVE',
            {font: '' + GRID_SIZE/2 + 'px kremlin', fill: '#000000'})
            .setDepth(DEPTHS.GUESS)
            .setOrigin(1, 1)
            .setVisible(true);
        addButton(text, () => {
            let board = create_board_from_grid(grid_squares);
            let solution_statistics = solve(board);
            console.log(solution_statistics);
            set_board(solution_statistics.board, grid_squares);
        });


    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let MenuScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'MenuScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let matte = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000)
            .setDepth(DEPTHS.FG);

        let rectangle = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2  + 0.5 * GRID_SIZE,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0xE8E8E8)//0xE8E8E8)
            .setDepth(DEPTHS.FG)
            .setAlpha(0)
            .setOrigin(0.5,1);
        let rectangle2 = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 0.5 * GRID_SIZE,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0xE8E8E8)
            .setDepth(DEPTHS.FG)
            .setAlpha(0)
            .setOrigin(0.5,0);


        scene.tweens.add({
            targets: rectangle,
            alpha: 0.5,
            delay: 2000,
            duration: 2000
        });
        scene.tweens.add({
            delay: 4000,
            duration: 500,
            targets: rectangle2,
            alpha: 0.5,
            onComplete : () => {
                text2_shadow.setInteractive();
                text2_shadow.input.alwaysEnabled = true;
                text2_shadow.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                    text2_shadow.setAlpha(0.5);
                });
                text2_shadow.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                    text2_shadow.setAlpha(0);
                });
                text2_shadow.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                    close_menu();
                    scene.scene.launch('GameScene');
                    scene.scene.bringToTop('MenuScene');
                });
            }
        })


        let text = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2 - GRID_SIZE,
            "MINE",
            {font: '' + 3*GRID_SIZE + 'px kremlin', fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setVisible(false);
        let mask = new Phaser.Display.Masks.BitmapMask(scene, text);

        let text2 = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2 + GRID_SIZE,
            "START",
            {font: '' + GRID_SIZE + 'px kremlin', fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setVisible(false);
        let text2_shadow = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2 + GRID_SIZE,
            "START",
            {font: '' + GRID_SIZE + 'px kremlin', fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setAlpha(0)
            .setDepth(DEPTHS.UI);
        let mask2 = new Phaser.Display.Masks.BitmapMask(scene, text2);

        let close_menu = (oncomplete) => {
            text2.disableInteractive();
            particles.clearMask();
            particles2.clearMask();
            let objects = [matte,rectangle,rectangle2,text,
                text2,text2_shadow,particles,particles2,particles3,particles4];

            scene.tweens.add({
                targets: objects,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    Phaser.Utils.Array.Each(objects, (object) => {
                        object.destroy();
                    });
                    if (oncomplete) {
                        oncomplete();
                    }
                },
            });
        };

        let snow_big = scene.add.particles('tiles',TILES.SNOW);
        snow_big.createEmitter({
            alpha: 0.85, //{ start: 0.85, end: 0.75 },
            //scale: { start: 0.5, end: 2.5 },
            //tint: 0x000080,
            //speed: 100,
            speedY : 175,
            speedX : 20,
            //accelerationY: 300,
            angle: 0, // { min: -85, max: -95 },
            //scale: .25,
            //rotate: 20, //{ min: -180, max: 180 },
            lifespan: { min: 6000, max: 9000 },
            //blendMode: 'ADD',
            frequency: 300,
            //maxParticles: 10,
            x: { min: -100, max: SCREEN_WIDTH},
            y: 0,
        });
        snow_big.setDepth(DEPTHS.BG);

        let snow_small = scene.add.particles('tiles',TILES.SNOW);
        snow_small.createEmitter({
            alpha: 0.85,
            scale: 0.5, //{ start: 0.5, end: 2.5 },
            //tint: 0x000080,
            //speed: 100,
            speedY : 100,
            speedX : 10,
            //accelerationY: 300,
            angle: 0, // { min: -85, max: -95 },
            //scale: .25,
            //rotate: 20, //{ min: -180, max: 180 },
            lifespan: { min: 3000, max: 12000 },
            //blendMode: 'ADD',
            frequency: 200,
            //maxParticles: 10,
            x: { min: 0, max: SCREEN_WIDTH},
            y: 0,
            mask: mask,
        });
        snow_small.setDepth(DEPTHS.BG);

        let particles = scene.add.particles('tiles',TILES.SNOW);
        particles.createEmitter({
            alpha: 0.85, //{ start: 0.85, end: 0.75 },
            //scale: { start: 0.5, end: 2.5 },
            //tint: 0x000080,
            //speed: 100,
            speedY : 175,
            speedX : 20,
            //accelerationY: 300,
            angle: 0, // { min: -85, max: -95 },
            //scale: .25,
            //rotate: 20, //{ min: -180, max: 180 },
            lifespan: { min: 6000, max: 9000 },
            //blendMode: 'ADD',
            frequency: 300,
            //maxParticles: 10,
            x: { min: -100, max: SCREEN_WIDTH},
            y: SCREEN_HEIGHT/2 - 1.5 * GRID_SIZE,
            mask: mask,
        });
        particles.setDepth(DEPTHS.FG);
        particles.setMask(mask);

        let particles2 = scene.add.particles('tiles',TILES.SNOW);

        particles2.createEmitter({
            alpha: 0.85,
            scale: 0.5, //{ start: 0.5, end: 2.5 },
            //tint: 0x000080,
            //speed: 100,
            speedY : 100,
            speedX : 10,
            //accelerationY: 300,
            angle: 0, // { min: -85, max: -95 },
            //scale: .25,
            //rotate: 20, //{ min: -180, max: 180 },
            lifespan: { min: 3000, max: 12000 },
            //blendMode: 'ADD',
            frequency: 200,
            //maxParticles: 10,
            x: { min: 0, max: SCREEN_WIDTH},
            y: SCREEN_HEIGHT/2 - 1.5 * GRID_SIZE,
            mask: mask,
        });
        particles2.setDepth(DEPTHS.FG);
        particles2.setMask(mask);
        rectangle.setMask(mask);

        let particles3 = scene.add.particles('tiles',TILES.SNOW);
        particles3.createEmitter({
            alpha: 0.85, //{ start: 0.85, end: 0.75 },
            //scale: { start: 0.5, end: 2.5 },
            //tint: 0x000080,
            //speed: 100,
            speedY : 175,
            speedX : 20,
            //accelerationY: 300,
            angle: 0, // { min: -85, max: -95 },
            //scale: .25,
            //rotate: 20, //{ min: -180, max: 180 },
            lifespan: { min: 6000, max: 9000 },
            //blendMode: 'ADD',
            frequency: 300,
            //maxParticles: 10,
            x: { min: -100, max: SCREEN_WIDTH},
            y: SCREEN_HEIGHT/2 - 1.5 * GRID_SIZE,
            mask: mask,
        });
        particles3.setDepth(DEPTHS.FG);
        particles3.setMask(mask2);

        let particles4 = scene.add.particles('tiles',TILES.SNOW);

        particles4.createEmitter({
            alpha: 0.85,
            scale: 0.5, //{ start: 0.5, end: 2.5 },
            //tint: 0x000080,
            //speed: 100,
            speedY : 100,
            speedX : 10,
            //accelerationY: 300,
            angle: 0, // { min: -85, max: -95 },
            //scale: .25,
            //rotate: 20, //{ min: -180, max: 180 },
            lifespan: { min: 3000, max: 12000 },
            //blendMode: 'ADD',
            frequency: 200,
            //maxParticles: 10,
            x: { min: 0, max: SCREEN_WIDTH},
            y: SCREEN_HEIGHT/2 - 1.5 * GRID_SIZE,
            mask: mask,
        });
        particles4.setDepth(DEPTHS.FG);
        particles4.setMask(mask2);
        rectangle2.setMask(mask2);
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;


        scene.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 64, frameHeight: 160});
        scene.load.spritesheet('guy', 'assets/guy3.png', { frameWidth: 48, frameHeight: 96});
        scene.load.spritesheet('flag', 'assets/flag.png', { frameWidth: 64, frameHeight: 64});
        scene.load.spritesheet('ui', 'assets/UI.png', { frameWidth: 64, frameHeight: 64});

        scene.load.on('complete', function() {
            scene.scene.start('MenuScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'flag_blowing',
                frames: scene.anims.generateFrameNumbers('flag',
                    { start: 0, end: 5 }),
            skipMissedFrames: false,
            frameRate: 3,
            repeat: -1
        });

        scene.anims.create({
            key: 'ui_to_walk',
            frames: scene.anims.generateFrameNumbers('ui',
                { start: 0, end: 1 }),
            skipMissedFrames: false,
            frameRate: 16,
            repeat: 0
        });
        scene.anims.create({
            key: 'ui_walk',
            frames: scene.anims.generateFrameNumbers('ui',
                { start: 2, end: 9 }),
            skipMissedFrames: false,
            frameRate: 3,
            repeat: -1
        });
        scene.anims.create({
            key: 'ui_to_flag',
            frames: scene.anims.generateFrameNumbers('ui',
                { start: 10, end: 11 }),
            skipMissedFrames: false,
            frameRate: 16,
            repeat: 0
        });
        scene.anims.create({
            key: 'ui_flag',
            frames: scene.anims.generateFrameNumbers('ui',
                { start: 12, end: 17 }),
            skipMissedFrames: false,
            frameRate: 3,
            repeat: -1
        });

        scene.anims.create({
            key: 'guy_walk_anim',
            frames: scene.anims.generateFrameNumbers('guy',
                { start: 0, end: 9 }),
            skipMissedFrames: false,
            frameRate: 10,
            repeat: -1
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: '#E8E8E8',
    type: Phaser.AUTO,
    render: {
        pixelArt: false
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 30 },
            debug: false
        }
    },
    scene: [ LoadScene, MenuScene, CreateScene, GameScene ]
};

game = new Phaser.Game(config);
