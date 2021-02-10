const GRID_SIZE = 64;
const BUFFER = 1;
const SCREEN_COLUMNS = 7;
const SCREEN_ROWS = 12;
const SCREEN_HEIGHT = GRID_SIZE * (SCREEN_ROWS + 2 * BUFFER);
const SCREEN_WIDTH = GRID_SIZE * (SCREEN_COLUMNS + 2 * BUFFER);
const DEPTHS =
{
    BG : 0,
    GRID: 10,
    GUESS: 20,
    FG: 40,
    UI: 50
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

        let current_x = 3;
        let current_y = 0;
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
            current_x = x;
            current_y = y;
            player_pic.x = xPixel(current_x);
            player_pic.y = yPixel(current_y - 0.5);
            player_text.x = xPixel(current_x);
            player_text.y = yPixel(current_y + 0.5);
            let sum = 0;
            for(let dx = -1; dx <= 1; dx++) {
                for(let dy = -1; dy <= 1; dy++) {
                    if (current_x + dx >= 0 && current_x + dx < SCREEN_COLUMNS &&
                        current_y + dy >= 0 && current_y + dy < SCREEN_ROWS &&
                        grid_squares[current_x+dx][current_y+dy].data.values.hidden_ship) {
                        sum++
                    }
                }
            }
            player_text.text = '' + sum + '';
        };

        let prepare_empty_grid = function() {

            scene.add.sprite(xPixel(-0.55), yPixel(2), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-0.75), yPixel(8), 'tiles',6).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1.2), yPixel(-.75), 'tiles',6).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1), yPixel(4), 'tiles',0).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-0.75), yPixel(5.25), 'tiles',0).setFlipX(true).setDepth(DEPTHS.BG);
            scene.add.sprite(xPixel(-1.35), yPixel(5.6), 'tiles',0).setFlipX(false).setDepth(DEPTHS.BG);

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
                    square.setData('hidden_ship', false);
                    if (Phaser.Math.Between(0,100) < 14) {
                        square.setData('hidden_ship', true);
                    }
                    if ( (y === 0 || y === 1) && (x === 2 || x === 3 || x === 4))
                    {
                        square.setData('hidden_ship', false);
                    }
                    //square.setData('shapes', create_shape(x, y));

                    square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function () {
                        if (square.data.values.locked) {
                            return;
                        }
                        square.setFillStyle(0x000000, 0.15);
                    });
                    square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function () {
                        if (square.data.values.locked) {
                            return;
                        }
                        square.setFillStyle(0x000000, 0);
                    });
                    square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function () {
                        if (Phaser.Math.Distance.Snake(
                            current_x, current_y,
                            square.data.values.x, square.data.values.y) == 1) {
                            if (square.data.values.hidden_ship) {
                                set_player_location(3, 0)
                            } else {
                                set_player_location(square.data.values.x, square.data.values.y);
                            }
                        }
                    });
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

            let particles = scene.add.particles('tiles',5);

            particles.createEmitter({
                alpha: { start: 0.75, end: 0 },
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
                alpha: 0.75,
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

        };

        //----------------------------------------------------------------------
        // CODE TO SETUP GAME
        //----------------------------------------------------------------------

        prepare_empty_grid();

        player_pic = scene.add.sprite(xPixel(current_x),yPixel(current_y-0.5),'guy', 0);
        player_text = scene.add.text(
            xPixel(current_x),
            yPixel(current_y + 0.5),
            '' + 0 + '',
            {font: '' + GRID_SIZE/2 + 'px kremlin', fill: '#000000'})
            .setOrigin(1, 1);


        set_player_location(3, 0);

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);

        /*
        Util.make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS-2),yPixel(SCREEN_ROWS+4),'undo'),
            undo_square);
        Util.make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS-1),yPixel(SCREEN_ROWS+4),'clue'),
            reveal_random_hint);
        Util.make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS),yPixel(SCREEN_ROWS+4),'info'),
            HelpApi.fade_in);

         */
    },

    update: function () {
    }
});

//Util functions
let Util = {
    make_button : function(image,func) {
        image.setAlpha(0.5);
        image.setInteractive();
        image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
            image.setAlpha(1);
        });
        image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function() {
            image.setAlpha(0.5);
        });
        image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, func);
    }
};

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

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;
        scene.load.on('complete', function() {
            scene.scene.start('HelpScene');
            scene.scene.start('GameScene');
            scene.scene.bringToTop('HelpScene');
            scene.scene.stop('LoadScene');
        });
        scene.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 64, frameHeight: 160});
        scene.load.spritesheet('guy', 'assets/guy.png', { frameWidth: 64, frameHeight: 128});
    },

    //--------------------------------------------------------------------------
    create: function () {
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
    scene: [ LoadScene, HelpScene, GameScene ]
};

game = new Phaser.Game(config);
