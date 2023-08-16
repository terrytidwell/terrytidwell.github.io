const SPRITE_SCALE = 1;
const GRID_SIZE = 67;
const GRID_SQUARES = 3;
const GRID_ROWS = GRID_SQUARES+2;
const GRID_COLS = GRID_SQUARES+2;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS * SPRITE_SCALE;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS * SPRITE_SCALE;
const FONT = 'px Schoolbell-Regular';

const DEPTHS = {
    BG: 0,
    GRID: 500,
    BLOCK_DRAG_ZONES: 750,
    SELECTED_BLOCK_DRAG_ZONE: 800,
    BLOCKS: 1000,
    SELECTED_BLOCKS: 2000,
};

let json_version = 1;

let player_stats = {
    version: json_version,
    grid_visible: true,
};

let letters = [ 'blank', '01', '02', '03','04',
    '05', '06', '07', '08', '09'];

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        scene.load.path = "assets/";

        for (let letter of letters) {
            scene.load.spritesheet(letter, 'tile1_' + letter + '_67.png',
                { frameWidth: 67, frameHeight: 67 });
        }
        //scene.load.image('bg', 'papelIGuess.jpeg');

        scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 0.5)
            .setOrigin(0, 0.5);
        let loading_bar = scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 1)
            .setOrigin(0, 0.5)
            .setScale(0,1);
        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            loading_bar.setScale(percentage,1);
        });

        scene.load.on('complete', function() {
            scene.scene.start('GameScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});


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
    create: function (data) {
        let scene = this;
        this.cameras.main.setPostPipeline(HueRotatePostFX);

        let board_utils = (() => {
            let total_squares = GRID_SQUARES * GRID_SQUARES;
            let board_create = () => {
                let board = [];
                for (let i = 0; i < total_squares; i++) {
                    board.push(0);
                }
                return board;
            };
            let board = board_create();
            let history = ['blank board'];
            let x_value = (index) => {
                return index % GRID_SQUARES;
            };
            let y_value = (index) => {
                return Math.floor(index/GRID_SQUARES)
            }
            let board_index = (x,y) => {
                return x+y*GRID_SQUARES;
            };
            let board_value = (x, y) => {
                return board[board_index(x,y)];
            };
            let scratch_pad_create = () => {
                let scratch_pad = [];
                for (let i = 0; i <= GRID_SQUARES; i++) {
                    scratch_pad.push(0);
                }
                return scratch_pad;
            };

            let scratch_pad = scratch_pad_create();
            let reset_scratch = () => {
                for (let i = 0; i < scratch_pad.length; i++) {
                    scratch_pad[i] = 0;
                }
            };
            let is_unset = (index) => {
                return board[index] === 0;
            };
            let count_literals = (x, y) => {
                reset_scratch();
                for (let z = 0; z < GRID_SQUARES; z++) {
                    if (z !== x) {
                        scratch_pad[board_value(z, y)]++;
                    }
                    if (z !== y) {
                        scratch_pad[board_value(x, z)]++;
                    }
                }
            };
            let force_value = () => {
                let return_value = 0;
                for (let i = 1; i <= GRID_SQUARES; i++) {
                    if (scratch_pad[i] === 0) {
                        if (return_value !== 0) {
                            return 0; //multiple options, leave unset
                        }
                        return_value = i;
                    }
                }
                return return_value;
            };
            let set_forced = (index) => {
                if (is_unset(index)) {
                    count_literals(x_value(index), y_value(index));
                    board[index] = force_value();
                    if (board[index] !== 0) {
                        //history.push('Forced value ' + board[index] + ' at ' + x_value(index) + ',' + y_value(index));
                        return true;
                    }
                }
                return false;
            };
            let propagate = () => {
                let force = true;
                while (force)
                {
                    force = false;
                    for (let i = 0; i < total_squares; i++) {
                        force = force || set_forced(i);
                    }
                }
            };
            let count_zeroes = () => {
                let count = 0;
                for (let i = 0; i < total_squares; i++) {
                    if (board[i] === 0)  {
                        count++;
                    }
                }
                return count;
            };
            let random_values = [];
            for (let i = 1; i <= GRID_SQUARES; i++) {
                random_values.push(i)
            }
            let assign_random = (index) => {
                count_literals(x_value(index),y_value(index));
                Phaser.Utils.Array.Shuffle(random_values);
                for (let r of random_values) {
                    if (scratch_pad[r] === 0) {
                        board[index] = r;
                        //history.push('Randomly choose ' + board[index] + ' at ' + x_value(index) + ',' + y_value(index));
                        return;
                    }
                }
            };
            let choose_random_to_assign = (count) => {
                let current = 0;
                let target = Phaser.Math.Between(0, count-1);
                for (let i = 0; i< total_squares; i++) {
                    if (is_unset(i)) {
                        if (current === target) {
                            assign_random(i);
                        }
                        current++;
                    }
                }
            };

            let create_next_children = () => {
                for (let i = 0; i < total_squares; i++) {
                    if (is_unset(i)) {
                        return create_all_children(i);
                    }
                }
                return [];
            };

            let create_all_children = (index) => {
                count_literals(x_value(index),y_value(index));
                let return_value = [];
                for (let r of random_values) {
                    if (scratch_pad[r] === 0) {
                        let child = [...board];
                        child[index] = r;
                        return_value.push(child);
                    }
                }
                return return_value;
            };

            let reset_board = () => {
                for (let i = 0; i < total_squares; i++) {
                    board[i] = 0;
                }
            };

            let check_corners = (board) => {
                let corners = [0, GRID_SQUARES-1, total_squares-GRID_SQUARES, total_squares-1];
                let values = scratch_pad_create();
                for (let c of corners) {
                    let value = board[c];
                    if (values[value] !== 0) {
                        return true;
                    }
                    values[value]++;
                }
                return false;
            };

            let create_board = () => {
                //loop because simple forward propagation can create boards that don't work
                reset_board();
                while (0 !==count_zeroes()) {
                    reset_board();
                    for (let n = 0; n < total_squares; n++) {
                        let count = count_zeroes();
                        if (count === 0) {
                            //done
                            break;
                        }
                        choose_random_to_assign(count);
                        propagate();
                    }
                }

                return board;
            };

            let create_all_boards = () => {
                reset_board();
                //set first row to standard
                for (let x = 0; x < GRID_SQUARES; x++) {
                    board[x] = x+1;
                }
                let board_set = [];
                let complete_boards = [];
                board_set.push([...board]);
                while (board_set.length > 0) {
                    board = board_set.pop();
                    if (0 === count_zeroes()) {
                        complete_boards.push([...board]);
                        continue;
                    }
                    board_set.push(...create_next_children());
                }
                return complete_boards;
            };

            let paint_board = (scene, board) => {
                let grid_square = (x) => {
                    return Math.round( x * GRID_SIZE + GRID_SIZE/2);
                };

                let lookup = letters;
                for (let x = 0; x < GRID_SQUARES; x++) {
                    for (let y = 0; y < GRID_SQUARES; y++) {
                        let tile = scene.add.sprite(
                            grid_square(x+1),
                            grid_square(y+1),
                            lookup[board[x+y*GRID_SQUARES]]
                        );
                        tile.scaleY = 0;
                        scene.tweens.add({
                            targets: tile,
                            scaleY : 1,
                            duration: Phaser.Math.Between(500, 750),
                            delay: Phaser.Math.Between(500,750),
                            ease:'Bounce.easeOut'
                        });
                        tile.scaleX = 0;
                        scene.tweens.add({
                            targets: tile,
                            scaleX : 1,
                            duration: Phaser.Math.Between(500, 750),
                            delay: Phaser.Math.Between(500,750),
                            ease:'Bounce.easeOut'
                        });
                        let y_target = tile.y - GRID_SIZE;
                        scene.tweens.add({
                            targets: tile,
                            y: y_target,
                            yoyo: true,
                            delay: Phaser.Math.Between(500,750),
                            duration: Phaser.Math.Between(100,200),
                            ease: Phaser.Math.Easing.Quadratic.Out,
                        });
                    }
                }
            };

            return {
                create_board: create_board,
                check_corners: check_corners,
                paint_board: paint_board,
                create_all_boards: create_all_boards,
            };
        })();



        let boards = board_utils.create_all_boards();
        console.log(boards.length);
        let counter = 0;
        for (let board of boards) {
            counter += board_utils.check_corners(board) ? 1 : 0;
        }
        console.log(counter);
        board_utils.paint_board(scene, boards[0]);
/*
        let counter = 0;

        let board = [];
        for (let n = 0; n < 10000; n++) {
            board = board_utils.create_board();
            counter += board_utils.check_corners(board) ? 1 : 0;
            if (n > 0 && n % 100 === 0) {
                console.log(n);
            }
        }
        console.log(counter);
        board_utils.paint_board(scene, board);
*/

        let world_bounds = new Phaser.Geom.Rectangle(0,0,0,0);
        scene.cameras.main.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        scene.cameras.main.getBounds(world_bounds);
        scene.physics.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.width, world_bounds.height);
        scene.physics.world.setBoundsCollision();

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.interact = scene.input.keyboard.addKey("x");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let config = {
    backgroundColor: "#000000",
    type: Phaser.WEBGL,
    render: {
        pixelArt: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    pipeline: { HueRotatePostFX, LazersPostFX },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: [ LoadScene, GameScene ]
};

let game = new Phaser.Game(config);
