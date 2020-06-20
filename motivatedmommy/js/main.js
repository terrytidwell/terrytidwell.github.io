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
    getPrev: function(current) {
        if (STATE.isShip(current))
        {
            current = 2;
        }
        return (current + 2) % 3
    },
    getNext: function(current) {
        if (STATE.isShip(current))
        {
            current = 2;
        }
        return (current + 1) % 3;
    },
    isShip: function(current) {
        return current >= 2 && current <= 7;
    },
    createShapes: function(scene, x, y) {
        let shapes = [];

        //EMPTY
        shapes.push([])

        //WATER
        let water = [];
        let y_offsets = [-GRID_SIZE/4,0,GRID_SIZE/4];
        for ( let y_offset of y_offsets) {
            water.push(
                scene.add.line(
                    x,
                    y,
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
            x,
            y,
            GRID_SIZE * 3/4,
            GRID_SIZE * 3/4,
            COLORS.GUESS,
            1
        ).setVisible(false)
            .setDepth(DEPTHS.GUESS);
        shapes.push([fill_square]);

        //CIRCLE
        let circle = scene.add.circle(
            x,
            y,
            GRID_SIZE/8 * 3,
            COLORS.GUESS,
            1).setVisible(false)
            .setDepth(DEPTHS.GUESS);
        shapes.push([circle]);

        let make_cardinal = function(
            angle_start, angle_end,
            dx, dy)
        {
            let cardinal = [];
            cardinal.push(
                scene.add.arc(
                    x,
                    y,
                    GRID_SIZE/8 * 3,
                    angle_start,
                    angle_end,
                    false,
                    COLORS.GUESS,
                    1
                ).setVisible(false)
                    .setDepth(DEPTHS.GUESS));
            let x_adjust = dx === 0 ? 4 : 8;
            let y_adjust = dy === 0 ? 4 : 8;

            cardinal.push(scene.add.rectangle(
                x + dx * (GRID_SIZE/4 - GRID_SIZE/16),
                y + dy * (GRID_SIZE/4 - GRID_SIZE/16),
                GRID_SIZE/x_adjust * 3,
                GRID_SIZE/y_adjust * 3,
                COLORS.GUESS,
                1
            ).setVisible(false)
                .setDepth(DEPTHS.GUESS));
            shapes.push(cardinal);
        }

        //STATE.NORTH:
        make_cardinal(180,0,0,1);

        //STATE.EAST:
        make_cardinal(270,90,-1, 0);

        //STATE.SOUTH:
        make_cardinal(0,180,0,-1);

        //STATE.WEST:
        make_cardinal(90,270,1, 0);

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

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.image('undo', 'assets/undo-black-36dp.svg');
        this.load.image('clue', 'assets/search-black-36dp.svg');
        this.load.image('info', 'assets/help-black-36dp.svg');
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
        let ship_shapes = [];

        //do/undo log
        let events = [];

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x) {
            return x * GRID_SIZE + GRID_SIZE/2 + SCREEN_BORDER * GRID_SIZE;
        };

        let yPixel = function(y) {
            return y * GRID_SIZE + GRID_SIZE/2 + SCREEN_BORDER * GRID_SIZE;
        };

        let create_shape = function(x, y) {
            return STATE.createShapes(scene, xPixel(x), yPixel(y));
        };

        let is_ship = function(x, y)
        {
            if (x < 0 || x >= SCREEN_COLUMNS ||
                y < 0 || y >= SCREEN_ROWS) {
                return false;
            }
            return STATE.isShip(grid_squares[x][y].data.values.state);
        };

        let is_hidden_ship = function(x, y)
        {
            if (x < 0 || x >= SCREEN_COLUMNS ||
                y < 0 || y >= SCREEN_ROWS) {
                return false;
            }
            return grid_squares[x][y].data.values.hidden_ship;
        };

        let get_proper_ship_state = function(x,y,func)
        {
            let state = STATE.CIRCLE;
            let counter = 0;
            if (func(x,y+1)) {
                state = STATE.NORTH;
                counter++;
            }
            if (func(x,y-1)) {
                state = STATE.SOUTH;
                counter++;
            }
            if (func(x+1,y)) {
                state = STATE.WEST;
                counter++;
            }
            if (func(x-1,y)) {
                state = STATE.EAST;
                counter++;
            }
            if (counter > 1) {
                state = STATE.SHIP
            }
            return state;
        };

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

            let state = get_proper_ship_state(x, y, is_ship);
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
                let ship_length = 4 - i;
                let actual_ships = found_ships[i];
                if (actual_ships < expected_ships)
                {
                    violation = true;
                    let number_to_fill_in = ship_length * actual_ships;
                    let number_filled = 0;
                    for (let segment of ship_shapes[i]) {
                        let color = COLORS.GUESS;
                        if (number_filled < number_to_fill_in)
                        {
                            number_filled++;
                            color = COLORS.CLUE;
                        }
                        for (let subshape of segment) {
                            subshape.setFillStyle(color, 1);
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

        let square_action = function(square, func)
        {
            if (square.data.values.locked) {
                return;
            }
            let x = square.data.values.x;
            let y = square.data.values.y;
            let shapes = square.data.values.shapes[square.data.values.state]
            for (let shape of shapes) {
                shape.setVisible(false);
            }
            square.setData('state', func(square.data.values.state));
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
        };

        let do_square = function(square)
        {
            events.push(square);
            square_action(square,STATE.getNext);
        };

        let undo_square = function()
        {
            if (events.length === 0) {
                return
            }
            let square = events.pop();
            square_action(square, STATE.getPrev);
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

        let prepare_empty_grid = function() {
            scene.add.rectangle(
                xPixel(SCREEN_COLUMNS / 2 - 0.5),
                yPixel(SCREEN_ROWS / 2 - 0.5),
                SCREEN_COLUMNS * GRID_SIZE,
                SCREEN_ROWS * GRID_SIZE,
                0xffffff,
                0
            ).setStrokeStyle(4, COLORS.BORDER, 1).setDepth(DEPTHS.BG);

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
                    ).setStrokeStyle(2, COLORS.BORDER, 1).setDepth(DEPTHS.GRID);
                    grid_squares[x].push(square);
                    square.setInteractive();
                    square.setData('x', x);
                    square.setData('y', y);
                    square.setData('locked', false);
                    square.setData('state', STATE.EMPTY);
                    square.setData('hidden_ship', false);
                    square.setData('shapes', create_shape(x, y));

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
                        do_square(square);
                    });
                }
            }
        };

        let prepare_hint_ships = function() {
            scene.add.text(
                xPixel(-.5),
                yPixel(SCREEN_ROWS + 1),
                "Hidden:",
                { fontSize: '' + GRID_SIZE/2 + 'px', fill: '#c0c0c0' })
                .setOrigin(0, 0.5);

            let four_shapes = [];
            four_shapes.push(create_shape(0, SCREEN_ROWS + 2)[STATE.WEST]);
            four_shapes.push(create_shape(1, SCREEN_ROWS + 2)[STATE.SHIP]);
            four_shapes.push(create_shape(2, SCREEN_ROWS + 2)[STATE.SHIP]);
            four_shapes.push(create_shape(3, SCREEN_ROWS + 2)[STATE.EAST]);

            ship_shapes.push(four_shapes);

            let three_shapes = [];
            three_shapes.push(create_shape(0, SCREEN_ROWS + 3)[STATE.WEST]);
            three_shapes.push(create_shape(1, SCREEN_ROWS + 3)[STATE.SHIP]);
            three_shapes.push(create_shape(2, SCREEN_ROWS + 3)[STATE.EAST]);
            three_shapes.push(create_shape(4, SCREEN_ROWS + 3)[STATE.WEST]);
            three_shapes.push(create_shape(5, SCREEN_ROWS + 3)[STATE.SHIP]);
            three_shapes.push(create_shape(6, SCREEN_ROWS + 3)[STATE.EAST]);

            ship_shapes.push(three_shapes);

            let two_shapes = [];
            two_shapes.push(create_shape(0, SCREEN_ROWS + 4)[STATE.WEST]);
            two_shapes.push(create_shape(1, SCREEN_ROWS + 4)[STATE.EAST]);
            two_shapes.push(create_shape(3, SCREEN_ROWS + 4)[STATE.WEST]);
            two_shapes.push(create_shape(4, SCREEN_ROWS + 4)[STATE.EAST]);
            two_shapes.push(create_shape(6, SCREEN_ROWS + 4)[STATE.WEST]);
            two_shapes.push(create_shape(7, SCREEN_ROWS + 4)[STATE.EAST]);

            ship_shapes.push(two_shapes);

            let one_shapes = [];
            one_shapes.push(create_shape(0, SCREEN_ROWS + 5)[STATE.CIRCLE]);
            one_shapes.push(create_shape(2, SCREEN_ROWS + 5)[STATE.CIRCLE]);
            one_shapes.push(create_shape(4, SCREEN_ROWS + 5)[STATE.CIRCLE]);
            one_shapes.push(create_shape(6, SCREEN_ROWS + 5)[STATE.CIRCLE]);

            ship_shapes.push(one_shapes);

            for (let ships of ship_shapes) {
                for (let shape of ships) {
                    for (let s of shape) {
                        s.setVisible(true);
                    }
                }
            }
        };

        let load_puzzle = function(puzzle) {
            let column_sums = [];
            for (let i = 0; i < SCREEN_COLUMNS; i++) {
                column_sums.push(0)
            }
            let row_sums = [];
            for (let i = 0; i < SCREEN_ROWS; i++) {
                row_sums.push(0)
            }
            for(let i = 0; i < puzzle.length && i < SCREEN_COLUMNS * SCREEN_ROWS; i++)
            {
                let y = Math.floor(i / SCREEN_COLUMNS);
                let x = i % SCREEN_COLUMNS;
                if (puzzle[i] === 1) {
                    grid_squares[x][y].setData('hidden_ship', true);
                    row_sums[y]++;
                    column_sums[x]++;
                }
            }
            setColumns(column_sums);
            setRows(row_sums);
        };

        let reveal_hint = function(x, y) {
            let square = grid_squares[x][y];
            if (square.data.values.hidden_ship) {
                addHint(x,y, get_proper_ship_state(x, y, is_hidden_ship));
            } else {
                addHint(x,y,STATE.WATER);
            }
        };

        let reveal_random_hint = function() {
            let candidate_squares = [];
            for (col of grid_squares) {
                for (square of col) {
                    if (!square.data.values.locked)
                    {
                        candidate_squares.push(square);
                    }
                }
            }
            if (candidate_squares.length === 0)
            {
                return;
            }
            let reveal =
                candidate_squares[Phaser.Math.Between(0, candidate_squares.length-1)];
            reveal_hint(reveal.data.values.x, reveal.data.values.y);
            checkConstraints();
        }

        //----------------------------------------------------------------------
        // CODE TO SETUP GAME
        //----------------------------------------------------------------------

        prepare_empty_grid();
        prepare_hint_ships();

        let puzzle = [
            0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
            1, 1, 1, 0, 0, 1, 0, 1, 1, 1,
            0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
            1, 1, 0, 0, 0, 1, 0, 0, 0, 1,
            0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 1, 0, 1,
            0, 0, 0, 0, 0, 0, 0, 1, 0, 0
        ];

        load_puzzle(puzzle);
        reveal_hint(7,3);
        reveal_hint(3,4);
        reveal_hint(3,6);

        checkConstraints();

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);

        let make_button = function(image,func) {
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

        let esc_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        esc_key.on(Phaser.Input.Keyboard.Events.DOWN, undo_square);
        make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS),yPixel(SCREEN_ROWS+3),'undo'),
            undo_square);
        make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS),yPixel(SCREEN_ROWS+4),'clue'),
            reveal_random_hint);
        make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS),yPixel(SCREEN_ROWS+5),'info'),
            function(){});
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
