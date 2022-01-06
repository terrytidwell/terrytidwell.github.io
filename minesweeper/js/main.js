const GRID_SIZE = 64;
const BUFFER = 1;
const SCREEN_COLUMNS = 7;
const SCREEN_ROWS = 12;
const SCREEN_HEIGHT = GRID_SIZE * (SCREEN_ROWS + 2 * BUFFER);
const SCREEN_WIDTH = GRID_SIZE * (SCREEN_COLUMNS + 2 * BUFFER);
const DEPTHS =
{
    BG : 0,
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

        //row and column clues
        let column_clues = [];
        let row_clues = [];

        //hidden ship clues
        let ship_clues = [];

        //do/undo log
        let events = [];

        let start_x = 3;
        let start_y = -2;
        let current_x = start_x;
        let current_y = start_y;
        let target_x = 3;
        let target_y = 0;
        let player_pic = null;
        let player_text = null;

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x) {
            return Math.round(x * GRID_SIZE + GRID_SIZE/2 + BUFFER * GRID_SIZE);
        };

        let yPixel = function(y) {
            return Math.round(y * GRID_SIZE + GRID_SIZE/2 + BUFFER * GRID_SIZE);
        };

        let set_player_location = function(x, y) {
            target_x = x;
            target_y = y;
            state_handler.changeState(STATES.WALK);
        };

        let addTree = () => {
            let tile = Phaser.Utils.Array.GetRandom([0,0,0,0,6]);
            let x = Phaser.Math.Between(-50,-150)/100;
            x += Phaser.Utils.Array.GetRandom([0,8]);
            let y = Phaser.Math.Between(-150,1250)/100;
            let flip = Phaser.Utils.Array.GetRandom([true,false]);
            scene.add.sprite(xPixel(x), yPixel(y), 'tiles', tile).setFlipX(flip).setDepth(DEPTHS.BG + y);
        };

        let prepare_empty_grid = function() {

            for(let x = 0; x < 40; x++) {
                addTree();
            }

            /*
            scene.add.sprite(xPixel(-0.55), yPixel(2), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1.1), yPixel(3), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-0.85), yPixel(8), 'tiles',6).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-0.6), yPixel(4), 'tiles',6).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1.2), yPixel(-.65), 'tiles',6).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1), yPixel(4), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-0.75), yPixel(5.25), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1.35), yPixel(5.6), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1.35), yPixel(10), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-0.7), yPixel(9.5), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1), yPixel(10.9), 'tiles',0).setDepth(DEPTHS.BG);

            scene.add.sprite(xPixel(6.85), yPixel(1), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(7.3), yPixel(0.5), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(7), yPixel(1.9), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(6.65), yPixel(8), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(7.2), yPixel(8.5), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(7.4), yPixel(9.9), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(7.1), yPixel(4.3), 'tiles',6).setDepth(DEPTHS.BG);
             */


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
                    if (Phaser.Math.Between(0,100) < 14) {
                        square.setData('hidden_mine', true);
                    }
                    if ( (y === 0 || y === 1) && (x === 2 || x === 3 || x === 4))
                    {
                        square.setData('hidden_mine', false);
                    }
                    if ( y === SCREEN_ROWS - 1 && x === 3)
                    {
                        square.setData('hidden_mine', false);
                    }
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
                        let delta = Phaser.Math.Distance.Snake(
                            current_x, current_y,
                            square.data.values.x, square.data.values.y)
                        if (delta > 1 || square.data.values.locked) {
                            if (!square.data.values.text.visible) {
                                square.data.values.locked = !square.data.values.locked;
                                square.data.values.flag.setVisible(square.data.values.locked);
                                flag.play('flag_blowing');
                            }
                        } else if (delta === 1 && state_handler.getState() === STATES.IDLE) {
                            if (square.data.values.hidden_mine) {
                                target_x = x;
                                target_y = y;
                                square.data.values.hidden_mine = false;
                                state_handler.changeState(STATES.DEAD);
                            } else {
                                set_player_location(square.data.values.x, square.data.values.y);
                            }
                        } else if (delta === 0) {
                            square.data.values.text.setVisible(true);
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
                let tile = 1;
                let flipX = true;
                if (x === Math.floor(SCREEN_COLUMNS/2)) {
                    tile = 3;
                } else if (Phaser.Math.Between(0,100) < 25) {
                    tile = 2;
                }
                if (Phaser.Math.Between(0,100) < 50) {
                    flipX = false;
                }
                scene.add.sprite(xPixel(x), yPixel(-1.9), 'tiles', tile)
                    .setDepth(DEPTHS.GRID).setFlipX(flipX);
                scene.add.sprite(xPixel(x), yPixel(SCREEN_ROWS-1), 'tiles', tile)
                    .setDepth(DEPTHS.GRID).setFlipX(flipX);
            }

            /*
            let particles = scene.add.particles('tiles',5);

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
                y: 0
            });
            particles.setDepth(DEPTHS.FG);

            particles = scene.add.particles('tiles',5);

            particles.createEmitter({
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
                y: 0
            });
            particles.setDepth(DEPTHS.FG);
*/
        };

        //----------------------------------------------------------------------
        // CODE TO SETUP GAME
        //----------------------------------------------------------------------

        prepare_empty_grid();

        player_pic = scene.add.sprite(xPixel(current_x),yPixel(current_y-0.5),'guy', 0)
            .setScale(1.5)
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
            state_handler.addTween({
                targets: matte,
                alpha: 1,
                duration: 3000,
                onComplete : () => {
                    scene.scene.restart();
                }
            })
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
                scene.add.sprite(xPixel(target_x), yPixel(target_y), 'tiles', 4);
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
            .setDepth(DEPTHS.FG);
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


//external help api
//filled in during HelpScene.create();
let HelpApi = {
    fade_in : function() {}
};

let HelpScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'HelpScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
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
            .setDepth(DEPTHS.BG);


        let rectangle = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0xE8E8E8)
            .setDepth(DEPTHS.BG)
            .setAlpha(0);

        scene.tweens.add({
            targets: rectangle,
            alpha: 0.5,
            delay: 4000,
            duration: 2000
        });


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
            {font: '' + 1*GRID_SIZE + 'px kremlin', fill: '#E8E8E8'})
            .setOrigin(0.5, 0.5)
            .setVisible(true);
        addButton(text2,() => {
            text2.disableInteractive();
            particles.clearMask();
            particles2.clearMask();
            let objects = [matte,rectangle,text,text2];
            let completer =

            scene.tweens.add({
                targets: objects,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    Phaser.Utils.Array.Each(objects, (object) => {
                        object.destroy();
                    });
                },
            })
            scene.scene.launch('GameScene');
            scene.scene.bringToTop('MenuScene');
        });
        text2.setAlpha(0);
        scene.tweens.add({
            targets: text2,
            alpha: 0.5,
            delay: 6000,
            duration: 500,
        });

        let particles = scene.add.particles('tiles',5);
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
            y: 0,
            mask: mask,
        });
        particles.setDepth(DEPTHS.FG);
        particles.setMask(mask);

        particles2 = scene.add.particles('tiles',5);

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
            y: 0,
            mask: mask,
        });
        particles2.setDepth(DEPTHS.FG);
        particles2.setMask(mask);
        rectangle.setMask(mask);
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
        scene.load.spritesheet('guy', 'assets/guy2.png', { frameWidth: 32, frameHeight: 64});
        scene.load.spritesheet('flag', 'assets/flag.png', { frameWidth: 64, frameHeight: 64});

        scene.load.on('complete', function() {
            scene.scene.start('MenuScene');
            /*
            scene.scene.start('GameScene');
            scene.scene.bringToTop('HelpScene');
            */
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'flag_blowing',
            frames: [
                { key: 'flag', frame: 0 },
                { key: 'flag', frame: 1 },
                { key: 'flag', frame: 2 },
                { key: 'flag', frame: 3 },
                { key: 'flag', frame: 4 },
                { key: 'flag', frame: 5 },
            ],
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
    scene: [ LoadScene, MenuScene, HelpScene, GameScene ]
};

game = new Phaser.Game(config);
