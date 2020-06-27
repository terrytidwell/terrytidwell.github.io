const GRID_SIZE = 64;
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
                    .setStrokeStyle(GRID_SIZE/32, COLORS.GUESS, 1)
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
    },
    setColor : function(shape, color) {
        for (let part of shape) {
            part.setStrokeStyle(GRID_SIZE/32, color, 1);
            if (part.setFillStyle)
            {
                part.setFillStyle(color, 1)
            }
        }
    },
    setVisible : function(shape, visible) {
        for (let part of shape) {
            part.setVisible(visible);
        }
    }
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

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x) {
            return x * GRID_SIZE + GRID_SIZE/2 + SCREEN_BORDER * GRID_SIZE;
        };

        let yPixel = function(y) {
            return y * GRID_SIZE + GRID_SIZE/2 + SCREEN_BORDER * GRID_SIZE + GRID_SIZE;
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
            let shape = square.data.values.shapes[square.data.values.state];
            STATE.setVisible(shape, false);
            square.setData('state', state);
            shape = square.data.values.shapes[state];
            STATE.setVisible(shape, true);
        };

        let addHint = function(x, y, state)
        {
            let square = grid_squares[x][y];
            square.setData('locked', true);
            square.setData('state', state);
            for (let shape of square.data.values.shapes) {
                STATE.setVisible(shape, false);
            };
            let shape = square.data.values.shapes[square.data.values.state];
            STATE.setColor(shape, COLORS.CLUE_TEXT);
            STATE.setVisible(shape, true);
        };

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
                        found_ships[3]++;
                    }
                    if(findShip(x,y,3,1) || findShip(x,y,1,3)) {
                        found_ships[2]++;
                    }
                    if(findShip(x,y,2,1) || findShip(x,y,1,2)) {
                        found_ships[1]++;
                    }
                    if(findShip(x,y,1,1)) {
                        found_ships[0]++;
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
                let expected_ships = ship_clues[i].length;
                let ship_length = i + 1;
                let actual_ships = found_ships[i];
                if (actual_ships < expected_ships)
                {
                    violation = true;
                    let number_to_fill_in = ship_length * actual_ships;
                    let number_filled = 0;
                    for (let ship of ship_clues[i]) {
                        for (let segment of ship) {
                            let color = COLORS.GUESS;
                            if (number_filled < number_to_fill_in) {
                                number_filled++;
                                color = COLORS.CLUE;
                            }
                            for (let shape of segment) {
                                shape.setFillStyle(color, 1);
                            }
                        }
                    }
                }
                if (actual_ships === expected_ships)
                {
                    for (let ship of ship_clues[i]) {
                        for (let segment of ship) {
                            for (let shape of segment) {
                                shape.setFillStyle(COLORS.CLUE, 1);
                            }
                        }
                    }
                }
                if (actual_ships > expected_ships)
                {
                    violation = true;
                    for (let ship of ship_clues[i]) {
                        for (let segment of ship) {
                            for (let shape of segment) {
                                shape.setFillStyle(COLORS.VIOLATION, 1);
                            }
                        }
                    }
                }
            }

            if (!violation)
            {
                for (col of grid_squares) {
                    for (square of col) {
                        reveal_hint(square.data.values.x, square.data.values.y);
                    }
                }
            }
        };

        let square_action = function(square, func)
        {
            if (square.data.values.locked) {
                return;
            }
            let x = square.data.values.x;
            let y = square.data.values.y;
            let shape = square.data.values.shapes[square.data.values.state]
            STATE.setVisible(shape, false)
            square.setData('state', func(square.data.values.state));
            fix_square(x, y);
            fix_square(x-1, y);
            fix_square(x+1, y);
            fix_square(x, y-1);
            fix_square(x, y+1);
            shape = square.data.values.shapes[square.data.values.state];
            STATE.setVisible(shape, true)
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
                    yPixel(-1),
                    "" + array[x],
                    {fontSize: '' + GRID_SIZE + 'px', fill: COLORS.GUESS_TEXT})
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
                    { fontSize: '' + GRID_SIZE + 'px', fill: COLORS.GUESS_TEXT })
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
            let offset = SCREEN_ROWS;

            let min_col = 0;
            let max_col = SCREEN_COLUMNS;
            let current_row = offset;
            let current_col = 0;

            let hidden_ships = [4,3,2,1];
            for(let i = hidden_ships.length - 1; i >= 0; i--)
            {
                let ship_size = [];
                ship_clues.unshift(ship_size)
                let ship_length = i + 1;
                for(let j = 0; j < hidden_ships[i]; j++)
                {
                    let ship = [];
                    ship_size.unshift(ship);
                    if(current_col + ship_length - 1 > max_col) {
                        current_row++;
                        current_col = 0;
                    }
                    for (let k = 0; k < ship_length; k++)
                    {
                        let state = STATE.SHIP;
                        if (k === 0) {
                            state = STATE.WEST;
                        }
                        if (k === ship_length-1)
                        {
                            state = STATE.EAST;
                        }
                        if (ship_length === 1)
                        {
                            state = STATE.CIRCLE;
                        }
                        let segment = create_shape(current_col + k, current_row)[state];
                        for (let shape of segment)
                        {
                            shape.setVisible(true);
                        }
                        ship.push(segment);
                    }
                    current_col += ship.length + 1;
                    if (current_col > max_col)
                    {
                        current_row++;
                        current_col = 0;
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
        };

        //----------------------------------------------------------------------
        // CODE TO SETUP GAME
        //----------------------------------------------------------------------

        prepare_empty_grid();
        prepare_hint_ships();

        let puzzle = create_new_puzzle();

        load_puzzle(puzzle.board);
        for (let hint of puzzle.hints)
        {
            reveal_hint(hint[0],hint[1]);
        }

        checkConstraints();

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);

        Util.make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS-2),yPixel(SCREEN_ROWS+4),'undo'),
            undo_square);
        Util.make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS-1),yPixel(SCREEN_ROWS+4),'clue'),
            reveal_random_hint);
        Util.make_button(
            scene.add.image(xPixel(SCREEN_COLUMNS),yPixel(SCREEN_ROWS+4),'info'),
            HelpApi.fade_in);
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

        let panel_width = SCREEN_WIDTH-GRID_SIZE*2;
        let panel_height = SCREEN_HEIGHT-GRID_SIZE;
        let panels = [];
        let current_panel_index = 0;

        HelpApi.fade_in = function() {
            bg.setVisible(true);
            for(let component of current_panel) {
                component.setVisible(true);
            }
            /*
            scene.tweens.add({
                targets: current_panel,
                duration: 125
            });
             */
            bg.setAlpha(0);
            scene.tweens.add({
                targets: bg,
                alpha: 0.5,
                duration: 125
            });
        };

        let fade_out = function(){
            for(let component of current_panel) {
                component.setVisible(false);
            }
            bg.setAlpha(0);
            scene.tweens.add({
                targets: bg,
                alpha: 0,
                duration: 125,
                onComplete: function() {
                    bg.setVisible(false);
                }
            });
        }

        let add_next = function(panel) {
            let next_func = function() {
                for(let component of current_panel) {
                    component.setVisible(false);
                }
                current_panel_index++;
                current_panel = panels[current_panel_index];
                for(let component of current_panel) {
                    component.setVisible(true);
                }
            };
            let next = scene.add.image(
                SCREEN_WIDTH/2+panel_width/2-GRID_SIZE/2,
                SCREEN_HEIGHT/2, 'next');
            Util.make_button(next, next_func);
            next.setVisible(false);
            panel.push(next);
        };

        let add_prev = function(panel) {
            let prev_func = function() {
                for(let component of current_panel) {
                    component.setVisible(false);
                }
                current_panel_index--;
                current_panel = panels[current_panel_index];
                for(let component of current_panel) {
                    component.setVisible(true);
                }
            };
            let next = scene.add.image(
                SCREEN_WIDTH/2-panel_width/2+GRID_SIZE/2,
                SCREEN_HEIGHT/2, 'next').setFlipX(true);
            Util.make_button(next, prev_func);
            panel.push(next);
        };

        let create_panel = function(panel_create_func) {
            let panel = [];
            let panel_bg = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
                panel_width, panel_height, 0xffffff, 1)
                .setStrokeStyle(GRID_SIZE/16, COLORS.GRID_BORDER);
            panel_bg.setInteractive();
            panel.push(panel_bg);
            let cancel = scene.add.image(
                SCREEN_WIDTH/2+panel_width/2-GRID_SIZE/2,
                SCREEN_HEIGHT/2-panel_height/2+GRID_SIZE/2, 'cancel');
            Util.make_button(cancel, fade_out);
            panel.push(cancel);

            if(panels.length !== 0)
            {
                add_prev(panel);
                add_next(panels[panels.length - 1]);
            }

            panel_create_func(panel);

            for(let component of panel) {
                component.setVisible(false);
            }

            panels.push(panel);
        };

        let bg = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.5)
            .setVisible(false);
        bg.setInteractive();
        bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, fade_out);

        let sample_board_rows = 7;
        let sample_board_cols = 7;
        let sample_board_center_y = SCREEN_HEIGHT/2 + GRID_SIZE/2;
        let sample_board_center_x = SCREEN_WIDTH/2 - GRID_SIZE/2;
        let sample_board = [
            STATE.WATER, STATE.NORTH, STATE.WATER, STATE.WATER, STATE.WATER, STATE.WATER, STATE.WATER,
            STATE.WATER, STATE.SHIP , STATE.WATER, STATE.WEST , STATE.SHIP , STATE.SHIP , STATE.EAST ,
            STATE.WATER, STATE.SOUTH, STATE.WATER, STATE.WATER, STATE.WATER, STATE.WATER, STATE.WATER,
            STATE.WATER, STATE.WATER, STATE.WATER, STATE.NORTH, STATE.WATER, STATE.NORTH, STATE.WATER,
            STATE.NORTH, STATE.WATER, STATE.WATER, STATE.SOUTH, STATE.WATER, STATE.SOUTH, STATE.WATER,
            STATE.SHIP , STATE.WATER, STATE.WATER, STATE.WATER, STATE.WATER, STATE.WATER, STATE.WATER,
            STATE.SOUTH, STATE.WATER, STATE.CIRCLE,STATE.WATER, STATE.WATER, STATE.WATER, STATE.CIRCLE
        ];
        let sample_ship_clues = [
            STATE.WEST , STATE.SHIP , STATE.SHIP , STATE.EAST , STATE.EMPTY, STATE.WEST , STATE.SHIP , STATE.EAST ,
            STATE.WEST , STATE.SHIP , STATE.EAST , STATE.EMPTY, STATE.WEST , STATE.EAST , STATE.EMPTY, STATE.EMPTY,
            STATE.WEST , STATE.EAST , STATE.EMPTY, STATE.CIRCLE, STATE.EMPTY, STATE.CIRCLE, STATE.EMPTY, STATE.EMPTY,
        ];
        let sample_row_clues = [1,5,1,2,3,1,3];
        let sample_col_clues = [3,3,1,3,1,3,2];


        let xPixel = function(x) {
            let x0 = sample_board_center_x - sample_board_cols/2 * GRID_SIZE;
            return x0 + x * GRID_SIZE + GRID_SIZE/2;
        };

        let yPixel = function(y) {
            let y0 = sample_board_center_y - sample_board_rows/2 * GRID_SIZE;
            return y0 + y * GRID_SIZE + GRID_SIZE/2;
        };

        let create_sample_board = function(panel) {
            panel.push(scene.add.rectangle(
                sample_board_center_x,
                sample_board_center_y,
                sample_board_cols * GRID_SIZE,
                sample_board_rows * GRID_SIZE,
                COLORS.BORDER,
                0)
                .setStrokeStyle(GRID_SIZE / 16, COLORS.BORDER, 1)
                .setDepth(DEPTHS.BG));
            for (let x = 0; x < sample_board_cols; x++) {
                for (let y = 0; y < sample_board_rows; y++) {
                    panel.push(scene.add.rectangle(
                        xPixel(x),
                        yPixel(y),
                        GRID_SIZE,
                        GRID_SIZE,
                        COLORS.BORDER,
                        0)
                        .setStrokeStyle(GRID_SIZE / 32, COLORS.BORDER, 1)
                        .setDepth(DEPTHS.GRID));
                }
            }
        };

        let create_sample_col_clues = function(panel, array, color) {
            for (let x = 0; x < sample_board_cols && array.length; x++) {
                panel.push(scene.add.text(
                    xPixel(x),
                    yPixel(-1),
                    '' + array[x] + '',
                    {fontSize: '' + GRID_SIZE + 'px', fill: color})
                    .setOrigin(0.5, 0.5));
            }
        };

        let create_sample_row_clues = function(panel, array, color) {
            for (let y = 0; y < sample_board_rows && array.length; y++) {
                panel.push(scene.add.text(
                    xPixel(sample_board_cols),
                    yPixel(y),
                    '' + array[y] + '',
                    {fontSize: '' + GRID_SIZE + 'px', fill: color})
                    .setOrigin(0.5, 0.5));
            }
        };

        let display_shape = function(panel, x, y, shape, color) {
            let target_shape =
                STATE.createShapes(scene,xPixel(x),yPixel(y))[shape];
            STATE.setColor(target_shape, color);
            for (let part of target_shape) {
                panel.push(part)
            }
        };

        let fill_in_sample_at_location = function(panel, x, y, color) {
            let index = y * sample_board_cols + x;
            display_shape(panel, x, y, sample_board[index], color)
        }

        let fill_in_sample = function(panel, color, exculsions=[]) {
            for (let x = 0; x < sample_board_cols; x++) {
                for (let y = 0; y < sample_board_rows; y++) {
                    let draw = true;
                    for (let exclusion of exculsions) {
                        if (x === exclusion[0] && y === exclusion[1])
                        {
                            draw = false;
                        }
                    }
                    if (draw) {
                        let index = y * sample_board_cols + x;
                        display_shape(panel, x, y, sample_board[index], color);
                    }
                }
            }
        };

        let fill_in_ship_clues = function(panel, color) {
            for (let i = 0; i < sample_ship_clues.length; i++) {
                let y = sample_board_rows + Math.floor(i/(sample_board_cols + 1));
                let x = i % (sample_board_cols + 1);
                display_shape(panel, x, y, sample_ship_clues[i], color);
            }
        }

        create_panel(function (panel) {
            let text = scene.add.text(SCREEN_WIDTH/2-panel_width/2+GRID_SIZE,
                SCREEN_HEIGHT/2-panel_height/2+GRID_SIZE,
                "Goal: Find all the ships hidden in the grid.",
                {fontSize: ''+GRID_SIZE/2 + 'px', fill: COLORS.CLUE_TEXT,
                    align: 'left', wordWrap: { width: panel_width - GRID_SIZE * 2, useAdvancedWrap: true } });
            text.setOrigin(0,0);
            panel.push(text);
            create_sample_board(panel);
            fill_in_sample(panel,COLORS.GUESS);
        });

        create_panel(function (panel) {
            let text = scene.add.text(SCREEN_WIDTH/2-panel_width/2+GRID_SIZE,
                SCREEN_HEIGHT/2-panel_height/2+GRID_SIZE,
                "Each ship is surrounded by water so no hidden ships touch, even diagonally.",
                {fontSize: ''+GRID_SIZE/2 + 'px', fill: COLORS.CLUE_TEXT,
                    align: 'left', wordWrap: { width: panel_width - GRID_SIZE * 2, useAdvancedWrap: true } });
            text.setOrigin(0,0);
            panel.push(text);
            create_sample_board(panel);
            let highlights = [
                [2,0], [3,0], [4,0], [5,0], [6,0],
                [2,1], [3,1], [4,1], [5,1], [6,1],
                [2,2], [3,2], [4,2], [5,2], [6,2],
                [0,3], [1,3],
                [0,4], [1,4],
                [0,5], [1,5],
                [0,6], [1,6],
            ];
            fill_in_sample(panel,COLORS.GUESS,highlights);
            for (let highlight of highlights) {
                fill_in_sample_at_location(panel, highlight[0], highlight[1], COLORS.CLUE);
            }
        });

        create_panel(function (panel) {
            let text = scene.add.text(SCREEN_WIDTH/2-panel_width/2+GRID_SIZE,
                SCREEN_HEIGHT/2-panel_height/2+GRID_SIZE,
                "The number and size of the hidden ships are displayed below the grid.",
                {fontSize: ''+GRID_SIZE/2 + 'px', fill: COLORS.CLUE_TEXT,
                    align: 'left', wordWrap: { width: panel_width - GRID_SIZE * 2, useAdvancedWrap: true } });
            text.setOrigin(0,0);
            panel.push(text);
            create_sample_board(panel);
            fill_in_sample(panel,COLORS.GUESS);
            fill_in_ship_clues(panel,COLORS.CLUE);
        });

        create_panel(function (panel) {
            let text = scene.add.text(SCREEN_WIDTH/2-panel_width/2+GRID_SIZE,
                SCREEN_HEIGHT/2-panel_height/2+GRID_SIZE,
                "The number of ship segments in each column and row are displayed along the " +
                "side of the grid.",
                {fontSize: ''+GRID_SIZE/2 + 'px', fill: COLORS.CLUE_TEXT,
                    align: 'left', wordWrap: { width: panel_width - GRID_SIZE * 2, useAdvancedWrap: true } });
            text.setOrigin(0,0);
            panel.push(text);
            create_sample_board(panel);
            fill_in_sample(panel,COLORS.GUESS);
            fill_in_ship_clues(panel,COLORS.GUESS);
            create_sample_row_clues(panel,sample_row_clues,COLORS.CLUE_TEXT);
            create_sample_col_clues(panel,sample_col_clues,COLORS.CLUE_TEXT);
        });

        create_panel(function (panel) {
            let text = scene.add.text(SCREEN_WIDTH/2-panel_width/2+GRID_SIZE,
                SCREEN_HEIGHT/2-panel_height/2+GRID_SIZE,
                "The grid starts with some squares revealed. You must figure out the rest.",
                {fontSize: ''+GRID_SIZE/2 + 'px', fill: COLORS.CLUE_TEXT,
                    align: 'left', wordWrap: { width: panel_width - GRID_SIZE * 2, useAdvancedWrap: true } });
            text.setOrigin(0,0);
            panel.push(text);
            create_sample_board(panel);
            //fill_in_sample(panel,COLORS.GUESS);
            let highlights = [
                [4,1], [5,1],
                [1,0],
                [6,3]
            ];
            for (let highlight of highlights) {
                fill_in_sample_at_location(panel, highlight[0], highlight[1], COLORS.CLUE);
            }
            create_sample_row_clues(panel,sample_row_clues,COLORS.GUESS_TEXT);
            create_sample_col_clues(panel,sample_col_clues,COLORS.GUESS_TEXT);
            fill_in_ship_clues(panel,COLORS.GUESS);
        });

        let current_panel = panels[current_panel_index];
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
        scene.load.svg('undo', 'assets/undo-black-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.svg('clue', 'assets/search-black-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.svg('info', 'assets/help-black-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.svg('next', 'assets/navigate_next-black-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.svg('cancel', 'assets/cancel-black-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
    },

    //--------------------------------------------------------------------------
    create: function () {
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
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
            gravity: { y: 30 },
            debug: false
        }
    },
    scene: [ LoadScene, HelpScene, GameScene ]
};

game = new Phaser.Game(config);
