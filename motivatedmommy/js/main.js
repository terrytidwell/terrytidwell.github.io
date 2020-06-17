const GRID_SIZE = 32;
const SCREEN_COLUMNS = 10;
const SCREEN_ROWS = 10;
const SCREEN_BORDER = .5;
const SCREEN_HEIGHT = GRID_SIZE * (SCREEN_ROWS + 1 + SCREEN_BORDER * 2);
const SCREEN_WIDTH = GRID_SIZE * (SCREEN_COLUMNS + 1 + SCREEN_BORDER * 2);
const DEPTHS =
{
    BG : 0,
    GRID: 10,
    GRID_SELECT: 20,
    SQUAD: 30,
    FG: 40,
    UI: 50
};

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x)
        {
            return x * GRID_SIZE + GRID_SIZE/2 + SCREEN_BORDER * GRID_SIZE;
        };

        let yPixel = function(y)
        {
            return y * GRID_SIZE + GRID_SIZE/2 + SCREEN_BORDER * GRID_SIZE;
        };

        scene.add.rectangle(
            xPixel(SCREEN_COLUMNS / 2 - 0.5),
            yPixel( SCREEN_ROWS / 2 - 0.5),
            SCREEN_COLUMNS * GRID_SIZE,
            SCREEN_ROWS * GRID_SIZE,
            0xffffff,
            0
        ).setStrokeStyle(4,0x000000,1);
        let grid_squares = [];
        for (let x = 0; x < SCREEN_COLUMNS; x++)
        {
            grid_squares.push([]);
            for (let y = 0; y < SCREEN_ROWS; y++)
            {
                let square = scene.add.rectangle(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE,
                    GRID_SIZE,
                    0x000000,
                    0
                ).setStrokeStyle(2, 0x000000,1);
                grid_squares[x].push(square);
                square.setInteractive();
                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
                    square.setFillStyle(0x000000, 0.25);
                });
                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function() {
                    square.setFillStyle(0x000000, 0);
                });
            }
        };
        for (let x = 0; x < SCREEN_COLUMNS; x++)
        {
            scene.add.text(
                xPixel(x),
                yPixel(SCREEN_ROWS),
                "0",
                { fontSize: '' + GRID_SIZE + 'px', fill: '#000' })
            .setOrigin(0.5, 0.5);
        }
        for (let y = 0; y < SCREEN_ROWS; y++)
        {
            scene.add.text(
                xPixel(SCREEN_COLUMNS),
                yPixel(y),
                "0",
                { fontSize: '' + GRID_SIZE + 'px', fill: '#000' })
                .setOrigin(0.5, 0.5);
        }


        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);
    },

    update: function () {
    }
});

let config = {
    backgroundColor: '#FFFFFF',
    type: Phaser.AUTO,
    render: {
        //pixelArt: true
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
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ GameScene ]
};

game = new Phaser.Game(config);
