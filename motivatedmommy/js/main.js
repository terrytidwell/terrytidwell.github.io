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
        let STATE = {
            EMPTY: 0,
            WATER: 1,
            SHIP: 2,
            X: 3,
            CIRCLE: 4,
            NORTH: 5,
            EAST: 6,
            SOUTH: 7,
            WEST: 8,
            getNext: function(current) {
                return (current + 1) % 4;
            },
            needCustom: function(current) {
                return current >= 4;
            }
        };
        let COLORS = {
            BORDER: 0x000000,
            CLUE: 0x000000,
            GUESS: 0xC0C0C0
        };

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

        let grid_squares = [];
        let addHint = function(x, y, state)
        {
            let square = grid_squares[x][y];
            square.setData('locked', true);
            square.setData('state', state);
            if (STATE.needCustom(state)) {
                switch (square.data.values.state)
                {
                    case STATE.CIRCLE:
                        scene.add.circle(
                            xPixel(x),
                            yPixel(y),
                            GRID_SIZE/8 * 3,
                            COLORS.CLUE,
                            1);
                        break;
                    case STATE.NORTH:
                        scene.add.arc(
                            xPixel(x),
                            yPixel(y),
                            GRID_SIZE/8 * 3,
                            180,
                            0,
                            false,
                            COLORS.CLUE,
                            1
                        );
                        scene.add.rectangle(
                            xPixel(x),
                            yPixel(y) + GRID_SIZE/4 - GRID_SIZE/16,
                            GRID_SIZE/4 * 3,
                            GRID_SIZE/8 * 3,
                            COLORS.CLUE,
                            1
                        );
                        break;
                    case STATE.SOUTH:
                        scene.add.arc(
                            xPixel(x),
                            yPixel(y),
                            GRID_SIZE/8 * 3,
                            0,
                            180,
                            false,
                            COLORS.CLUE,
                            1
                        );
                        scene.add.rectangle(
                            xPixel(x),
                            yPixel(y) - GRID_SIZE/4 + GRID_SIZE/16,
                            GRID_SIZE/4 * 3,
                            GRID_SIZE/8 * 3,
                            COLORS.CLUE,
                            1
                        );
                        break;
                }

            } else {
                switch (square.data.values.state) {
                    case STATE.SHIP:
                        square.data.values.fill_square.setVisible(true)
                            .setStrokeStyle(1, COLORS.CLUE, 1);
                        break;
                    case STATE.EMPTY:
                        //do nothing
                        break;
                    case STATE.WATER:
                        for (let w of square.data.values.water) {
                            w.setVisible(true).setStrokeStyle(1, COLORS.CLUE, 1);
                        }
                        break;
                    case STATE.X:
                        for (let c of square.data.values.cross) {
                            c.setVisible(true).setStrokeStyle(1, COLORS.CLUE, 1);
                        }
                        break;
                }
            }
        }

        scene.add.rectangle(
            xPixel(SCREEN_COLUMNS / 2 - 0.5),
            yPixel( SCREEN_ROWS / 2 - 0.5),
            SCREEN_COLUMNS * GRID_SIZE,
            SCREEN_ROWS * GRID_SIZE,
            0xffffff,
            0
        ).setStrokeStyle(4,COLORS.BORDER,1);

        for (let x = 0; x < SCREEN_COLUMNS; x++)
        {
            grid_squares.push([]);
            for (let y = 0; y < SCREEN_ROWS; y++)
            {
                let fill_square = scene.add.rectangle(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE * 3/4,
                    GRID_SIZE * 3/4,
                    COLORS.GUESS,
                    1
                ).setVisible(false);
                let water = [];
                let y_offsets = [-GRID_SIZE/4,0,GRID_SIZE/4];
                for ( let y_offset of y_offsets) {
                    water.push(
                        scene.add.line(
                            xPixel(x),
                            yPixel(y),
                            0,
                            y_offset,
                            GRID_SIZE / 4 * 3,
                            y_offset,
                            COLORS.GUESS,
                            1
                        ).setVisible(false).setStrokeStyle(1, COLORS.GUESS, 1)
                    );
                }
                let cross = [];
                cross.push(
                    scene.add.line(
                        xPixel(x),
                        yPixel(y),
                        0,
                        0,
                        GRID_SIZE/4 * 3,
                        GRID_SIZE/4 * 3,
                        COLORS.GUESS,
                        1
                    ).setVisible(false).setStrokeStyle(1, COLORS.GUESS, 1)
                );
                cross.push(
                    scene.add.line(
                        xPixel(x),
                        yPixel(y),
                        GRID_SIZE/4 * 3,
                        0,
                        0,
                        GRID_SIZE/4 * 3,
                        COLORS.GUESS,
                        1
                    ).setVisible(false).setStrokeStyle(1, COLORS.GUESS, 1)
                );
                let square = scene.add.rectangle(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE,
                    GRID_SIZE,
                    COLORS.BORDER,
                    0
                ).setStrokeStyle(2, COLORS.BORDER,1);
                grid_squares[x].push(square);
                square.setInteractive();
                square.setData('x', x);
                square.setData('y', y);
                square.setData('locked', false);
                square.setData('state', STATE.EMPTY);
                square.setData('fill_square', fill_square);
                square.setData('cross', cross);
                square.setData('water', water)

                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
                    if (square.data.values.locked) {
                        return;
                    }
                    square.setFillStyle(0x000000, 0.25);
                });
                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function() {
                    if (square.data.values.locked) {
                        return;
                    }
                    square.setFillStyle(0x000000, 0);
                });
                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function(){
                    if (square.data.values.locked) {
                        return;
                    }
                    switch(square.data.values.state)
                    {
                        case STATE.SHIP:
                            square.data.values.fill_square.setVisible(false);
                            break;
                        case STATE.EMPTY:
                            //do nothing
                            break;
                        case STATE.WATER:
                            for (let w of square.data.values.water)
                            {
                                w.setVisible(false);
                            }
                            break;
                        case STATE.X:
                            for (let c of square.data.values.cross)
                            {
                                c.setVisible(false);
                            }
                            break;
                    }
                    square.setData('state', STATE.getNext(square.data.values.state));
                    switch(square.data.values.state)
                    {
                        case STATE.SHIP:
                            square.data.values.fill_square.setVisible(true);
                            break;
                        case STATE.EMPTY:
                            //do nothing
                            break;
                        case STATE.WATER:
                            for (let w of square.data.values.water)
                            {
                                w.setVisible(true);
                            }
                            break;
                        case STATE.X:
                            for (let c of square.data.values.cross)
                            {
                                c.setVisible(true);
                            }
                            break;
                    }
                })
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

        addHint(7,3,STATE.WATER);
        addHint(3,4,STATE.CIRCLE);
        addHint(3,5,STATE.NORTH);
        addHint(3,6,STATE.SOUTH);


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
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ GameScene ]
};

game = new Phaser.Game(config);
