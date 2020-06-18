const GRID_SIZE = 32;
const SCREEN_COLUMNS = 10;
const SCREEN_ROWS = 10;
const SCREEN_BORDER = .5;
const SCREEN_VERTICAL_BUFFER = 5;
const SCREEN_HEIGHT = GRID_SIZE * (SCREEN_ROWS + 1 + SCREEN_BORDER * 2 + SCREEN_VERTICAL_BUFFER);
const SCREEN_WIDTH = GRID_SIZE * (SCREEN_COLUMNS + 1 + SCREEN_BORDER * 2);
const DEPTHS =
{
    BG : 0,
    GRID: 10,
    GUESS: 20,
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
        let NEIGHBORS = [[0,1],[0,-1],[1,0],[-1,0]];
        let STATE = {
            EMPTY: 0,
            WATER: 1,
            SHIP: 2,
            CIRCLE: 3,
            NORTH: 4,
            EAST: 5,
            SOUTH: 6,
            WEST: 7,
            X: 8,
            getNext: function(current) {
                if (STATE.isShip(current))
                {
                    current = 2;
                }
                return (current + 1) % 3;
            },
            needCustom: function(current) {
                return current >= 4;
            },
            isShip: function(current) {
                return current >= 2 && current <= 7;
            },
            createShapes: function(x, y) {
                let shapes = [];

                //EMPTY
                shapes.push([])

                //WATER
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
                        ).setVisible(false)
                        .setStrokeStyle(1, COLORS.GUESS, 1)
                        .setDepth(DEPTHS.GUESS));
                }
                shapes.push(water);

                //SHIP
                let fill_square = scene.add.rectangle(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE * 3/4,
                    GRID_SIZE * 3/4,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                .setDepth(DEPTHS.GUESS);
                shapes.push([fill_square]);

                //CIRCLE
                let circle = scene.add.circle(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE/8 * 3,
                    COLORS.GUESS,
                    1).setVisible(false)
                    .setDepth(DEPTHS.GUESS);
                shapes.push([circle]);

                //STATE.NORTH:
                let north = [];
                north.push(
                    scene.add.arc(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE/8 * 3,
                    180,
                    0,
                    false,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                .setDepth(DEPTHS.GUESS));
                north.push(scene.add.rectangle(
                    xPixel(x),
                    yPixel(y) + GRID_SIZE/4 - GRID_SIZE/16,
                    GRID_SIZE/4 * 3,
                    GRID_SIZE/8 * 3,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                .setDepth(DEPTHS.GUESS));
                shapes.push(north);

                //STATE.EAST:
                let east = [];
                east.push(scene.add.arc(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE/8 * 3,
                    270,
                    90,
                    false,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                    .setDepth(DEPTHS.GUESS));
                east.push(scene.add.rectangle(
                    xPixel(x) - GRID_SIZE/4 + GRID_SIZE/16,
                    yPixel(y),
                    GRID_SIZE/8 * 3,
                    GRID_SIZE/4 * 3,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                    .setDepth(DEPTHS.GUESS));
                shapes.push(east);

                //STATE.SOUTH:
                let south = [];
                south.push(scene.add.arc(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE/8 * 3,
                    0,
                    180,
                    false,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                    .setDepth(DEPTHS.GUESS));
                south.push(scene.add.rectangle(
                    xPixel(x),
                    yPixel(y) - GRID_SIZE/4 + GRID_SIZE/16,
                    GRID_SIZE/4 * 3,
                    GRID_SIZE/8 * 3,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                    .setDepth(DEPTHS.GUESS));
                shapes.push(south);

                //STATE.WEST:
                let west = [];
                west.push(scene.add.arc(
                    xPixel(x),
                    yPixel(y),
                    GRID_SIZE/8 * 3,
                    90,
                    270,
                    false,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                .setDepth(DEPTHS.GUESS));
                west.push(scene.add.rectangle(
                    xPixel(x) + GRID_SIZE/4 - GRID_SIZE/16,
                    yPixel(y),
                    GRID_SIZE/8 * 3,
                    GRID_SIZE/4 * 3,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                .setDepth(DEPTHS.GUESS));
                shapes.push(west);

                return shapes;
            }
        };
        let COLORS = {
            BORDER: 0x000000,
            BORDER_TEXT: "#000000",
            CLUE: 0x000000,
            CLUE_TEXT: "#000000",
            GUESS: 0xC0C0C0,
            GUESS_TEXT: "#C0C0C0",
            VIOLATION: 0x800000,
            VIOLATION_TEXT: "#800000"
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
        let column_clues = [];
        let row_clues = [];

        let is_ship = function(x, y)
        {
            if (x < 0 || x >= SCREEN_COLUMNS ||
                y < 0 || y >= SCREEN_ROWS) {
                return false;
            }
            return STATE.isShip(grid_squares[x][y].data.values.state);
        }

        let fix_square = function(x, y)
        {
            if (x < 0 || x >= SCREEN_COLUMNS ||
                y < 0 || y >= SCREEN_ROWS) {
                return;
            }
            let square = grid_squares[x][y];
            if (!STATE.isShip(square.data.values.state) ||
                square.data.values.locked)
            {
                return;
            }

            let state = STATE.CIRCLE;
            let counter = 0;
            if (is_ship(x,y+1)) {
                state = STATE.NORTH;
                counter++;
            }
            if (is_ship(x,y-1)) {
                state = STATE.SOUTH;
                counter++;
            }
            if (is_ship(x+1,y)) {
                state = STATE.WEST;
                counter++;
            }
            if (is_ship(x-1,y)) {
                state = STATE.EAST;
                counter++;
            }
            if (counter > 1) {
                state = STATE.SHIP
            }
            let shapes = square.data.values.shapes[square.data.values.state];
            for (shape of shapes) {
                shape.setVisible(false);
            }
            square.setData('state', state);
            shapes = square.data.values.shapes[state];
            for (shape of shapes) {
                shape.setVisible(true);
            }
        };


        let addHint = function(x, y, state)
        {
            let square = grid_squares[x][y];
            square.setData('locked', true);
            square.setData('state', state);
            for (shape_array of square.data.values.shapes) {
                for (let shape of shape_array) {
                    shape.setVisible(false);
            }};
            let shapes = square.data.values.shapes[square.data.values.state];

            for (let shape of shapes) {
                shape.setVisible(true);
                shape.setStrokeStyle(1, COLORS.CLUE, 1);
                if (shape.setFillStyle)
                {
                    shape.setFillStyle(COLORS.CLUE, 1)
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
        ).setStrokeStyle(4,COLORS.BORDER,1).setDepth(DEPTHS.BG);

        let findShip = function(x, y, width, height) {
            for (let i = x - 1; i <= x + width; i++)
            {
                for (let j = y - 1; j <= y + height; j++)
                {
                    if (i >= x && i < x + width &&
                        j >= y && j < y + height) {
                        //we're in the ship part
                        if (!is_ship(i,j))
                        {
                            return false;
                        }
                    }
                    else {
                        //non ship
                        if (is_ship(i,j))
                        {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        let checkConstraints = function() {
            let violation = false;
            let found_ships = [0, 0, 0, 0];

            //columns
            for(let x = 0; x < SCREEN_COLUMNS; x++) {
                let current_value = 0;
                for (let y = 0; y < SCREEN_ROWS; y++) {
                    if (is_ship(x, y)) {
                        current_value++;
                    }
                    if(findShip(x,y,4,1) || findShip(x,y,1,4)) {
                        found_ships[0]++;
                    }
                    if(findShip(x,y,3,1) || findShip(x,y,1,3)) {
                        found_ships[1]++;
                    }
                    if(findShip(x,y,2,1) || findShip(x,y,1,2)) {
                        found_ships[2]++;
                    }
                    if(findShip(x,y,1,1)) {
                        found_ships[3]++;
                    }
                }
                let expected_value = column_clues[x].data.values.value;
                if (expected_value > current_value) {
                    violation = true;violation = true;
                    column_clues[x].setColor(COLORS.GUESS_TEXT)
                } else if (expected_value === current_value) {
                    column_clues[x].setColor(COLORS.CLUE_TEXT)
                } else {
                    violation = true;
                    column_clues[x].setColor(COLORS.VIOLATION_TEXT);
                }
            }

            //rows
            for(let y = 0; y < SCREEN_ROWS; y++) {
                let current_value = 0;
                for (let x = 0; x < SCREEN_COLUMNS; x++) {
                    if (is_ship(x, y)) {
                        current_value++;
                    }
                }
                let expected_value = row_clues[y].data.values.value;
                if (expected_value > current_value) {
                    violation = true;
                    row_clues[y].setColor(COLORS.GUESS_TEXT)
                } else if (expected_value === current_value) {
                    row_clues[y].setColor(COLORS.CLUE_TEXT)
                } else {
                    violation = true;
                    row_clues[y].setColor(COLORS.VIOLATION_TEXT);
                }
            }

            for (let i = 0; i < 4; i++)
            {
                let expected_ships = i + 1;
                let actual_ships = found_ships[i];
                if (actual_ships < expected_ships)
                {
                    violation = true;
                    for (let shape of ship_shapes[i]) {
                        for (let s of shape) {
                            s.setFillStyle(COLORS.GUESS, 1);
                        }
                    }
                }
                if (actual_ships === expected_ships)
                {
                    for (let shape of ship_shapes[i]) {
                        for (let s of shape) {
                            s.setFillStyle(COLORS.CLUE, 1);
                        }
                    }
                }
                if (actual_ships > expected_ships)
                {
                    violation = true;
                    for (let shape of ship_shapes[i]) {
                        for (let s of shape) {
                            s.setFillStyle(COLORS.VIOLATION, 1);
                        }
                    }
                }
            }

            if (!violation)
            {
                alert("Victory!");
                scene.scene.pause('GameScreen');
            }
        };

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
                    COLORS.BORDER,
                    0
                ).setStrokeStyle(2, COLORS.BORDER,1).setDepth(DEPTHS.GRID);
                grid_squares[x].push(square);
                square.setInteractive();
                square.setData('x', x);
                square.setData('y', y);
                square.setData('locked', false);
                square.setData('state', STATE.EMPTY);
                square.setData('shapes', STATE.createShapes(x, y));

                square.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
                    if (square.data.values.locked) {
                        return;
                    }
                    square.setFillStyle(0x000000, 0.15);
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
                    let shapes = square.data.values.shapes[square.data.values.state]
                    for (let shape of shapes) {
                        shape.setVisible(false);
                    }
                    square.setData('state', STATE.getNext(square.data.values.state));
                    fix_square(x, y);
                    fix_square(x-1, y);
                    fix_square(x+1, y);
                    fix_square(x, y-1);
                    fix_square(x, y+1);
                    shapes = square.data.values.shapes[square.data.values.state];
                    for (shape of shapes) {
                        shape.setVisible(true);
                    }
                    checkConstraints();
                })
            }
        };
        let setColumns = function(array) {
            for (let x = 0; x < SCREEN_COLUMNS; x++) {
                let column_clue = scene.add.text(
                    xPixel(x),
                    yPixel(SCREEN_ROWS),
                    "" + array[x],
                    {fontSize: '' + GRID_SIZE + 'px', fill: '#c0c0c0'})
                    .setOrigin(0.5, 0.5);
                column_clue.setData('value', array[x]);
                column_clues.push(column_clue);
            }
        };

        let setRows = function(array) {
            for (let y = 0; y < SCREEN_ROWS; y++)
            {
                let row_clue = scene.add.text(
                    xPixel(SCREEN_COLUMNS),
                    yPixel(y),
                    "" + array[y],
                    { fontSize: '' + GRID_SIZE + 'px', fill: '#c0c0c0' })
                    .setOrigin(0.5, 0.5);
                row_clue.setData('value', array[y]);
                row_clues.push(row_clue);
            }
        };

        addHint(7,3,STATE.WATER);
        addHint(3,4,STATE.CIRCLE);
        addHint(3,6,STATE.NORTH);
        setColumns([3,2,1,3,0,4,0,3,1,3]);
        setRows([1,7,1,4,1,0,1,1,3,1]);

        scene.add.text(
            xPixel(-.5),
            yPixel(SCREEN_ROWS + 1),
            "Hidden:",
            { fontSize: '' + GRID_SIZE/2 + 'px', fill: '#c0c0c0' })
            .setOrigin(0, 0.5);

        let ship_shapes = []
        let four_shapes = [];
        four_shapes.push(STATE.createShapes(0, SCREEN_ROWS + 2)[STATE.WEST]);
        four_shapes.push(STATE.createShapes(1, SCREEN_ROWS + 2)[STATE.SHIP]);
        four_shapes.push(STATE.createShapes(2, SCREEN_ROWS + 2)[STATE.SHIP]);
        four_shapes.push(STATE.createShapes(3, SCREEN_ROWS + 2)[STATE.EAST]);

        ship_shapes.push(four_shapes);

        let three_shapes = [];
        three_shapes.push(STATE.createShapes(0, SCREEN_ROWS + 3)[STATE.WEST]);
        three_shapes.push(STATE.createShapes(1, SCREEN_ROWS + 3)[STATE.SHIP]);
        three_shapes.push(STATE.createShapes(2, SCREEN_ROWS + 3)[STATE.EAST]);
        three_shapes.push(STATE.createShapes(4, SCREEN_ROWS + 3)[STATE.WEST]);
        three_shapes.push(STATE.createShapes(5, SCREEN_ROWS + 3)[STATE.SHIP]);
        three_shapes.push(STATE.createShapes(6, SCREEN_ROWS + 3)[STATE.EAST]);

        ship_shapes.push(three_shapes);

        let two_shapes = [];
        two_shapes.push(STATE.createShapes(0, SCREEN_ROWS + 4)[STATE.WEST]);
        two_shapes.push(STATE.createShapes(1, SCREEN_ROWS + 4)[STATE.EAST]);
        two_shapes.push(STATE.createShapes(3, SCREEN_ROWS + 4)[STATE.WEST]);
        two_shapes.push(STATE.createShapes(4, SCREEN_ROWS + 4)[STATE.EAST]);
        two_shapes.push(STATE.createShapes(6, SCREEN_ROWS + 4)[STATE.WEST]);
        two_shapes.push(STATE.createShapes(7, SCREEN_ROWS + 4)[STATE.EAST]);

        ship_shapes.push(two_shapes);

        let one_shapes = [];
        one_shapes.push(STATE.createShapes(0, SCREEN_ROWS + 5)[STATE.CIRCLE]);
        one_shapes.push(STATE.createShapes(2, SCREEN_ROWS + 5)[STATE.CIRCLE]);
        one_shapes.push(STATE.createShapes(4, SCREEN_ROWS + 5)[STATE.CIRCLE]);
        one_shapes.push(STATE.createShapes(6, SCREEN_ROWS + 5)[STATE.CIRCLE]);

        ship_shapes.push(one_shapes);

        for (let ships of ship_shapes) {
            for (let shape of ships) {
                for (let s of shape) {
                    s.setVisible(true);
                }
            }
        }

        checkConstraints();

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
