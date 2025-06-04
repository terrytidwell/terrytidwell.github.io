const SPRITE_SCALE = 1;
const GRID_SIZE = 4;
const SHOW_COLORS = false;
const GRID_ROWS = 48;
const GRID_COLS = GRID_ROWS;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS * SPRITE_SCALE;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS * SPRITE_SCALE;
const FONT = 'px VT323-Regular';

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
            let local_stats = localStorage.getItem('player_stats');

            if (local_stats) {
                local_stats = JSON.parse(local_stats);
                if (local_stats.version &&
                    local_stats.version === json_version) {
                    Object.assign(player_stats, local_stats);
                } else {
                    localStorage.setItem('player_stats', JSON.stringify(player_stats));
                }
            }
            scene.scene.start('GameScene');
        });

        scene.load.image('bg', 'papelIGuess.jpeg');
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

        const COLORS = {
            GREY: 0,
            RED: 1,
            GREEN: 2,
            BLUE: 3,
            LIGHT_GREY: 4,
            isReachable: function(color) {
                return color === 4;
            },
            value: function(color) {
                if (!SHOW_COLORS) {
                    return 0x808080;
                }
                return [0x808080, 0xff0000, 0x00ff00, 0x0000ff,0xc0c0c0][color];
            }
        };

        let grid_center = (x) => {
            return grid_square(x) + GRID_SIZE/2;
        };

        let grid_square = (x) => {
            return x*GRID_SIZE;
        };

        let addGridSquare = (x, y, color) => {
            return scene.add.rectangle(
                grid_center(x),
                grid_center(y),
                GRID_SIZE/2,
                GRID_SIZE/2,
                COLORS.value(color)
            );
        };

        let addLineSegment = (x1, y1, x2, y2, color) => {
            return scene.add.rectangle(
                grid_center((x1+x2)/2),
                grid_center((y1+y2)/2),
                GRID_SIZE/2,
                GRID_SIZE/2,
                COLORS.value(color)
            );
        };

        let grid_squares = [];
        let squares_to_expand = [];

        let get_grid_square = (x, y) => {
            if (x < 0 || y < 0 ||
                x > GRID_COLS || y > GRID_ROWS) {
                return null;
            }
            return grid_squares[x * GRID_ROWS + y];
        };

        let return_neighbors = (x, y) => {
            let neighbors = [];
            for(let d of [[0,1],[0,-1],[1,0],[-1,0]]) {
                let neighbor = get_grid_square(x + d[0], y+d[1]);
                if (neighbor) {
                    neighbors.push(neighbor);
                }
            }
            return neighbors;
        };

        let set_color = (square, color) => {
            if (!square) {
                return;
            }
            square.square.setFillStyle(COLORS.value(color));
            square.color = color;
        };

        let add_square_to_group = (square, color) => {
            if (!square) {
                return;
            }
            squares_to_expand = squares_to_expand.filter(s => s !== square);
            let neighbors = return_neighbors(square.x, square.y);
            for(let n of neighbors) {
                if (n.color === COLORS.GREY) {
                    set_color(n, COLORS.LIGHT_GREY);
                    squares_to_expand.push(n);
                }
            }
            set_color(square, color);
        };

        let extend_group = (square1, square2) => {
            addLineSegment(square1.x, square1.y,
                square2.x, square2.y,
                square1.color);
            add_square_to_group(square2, square1.color);
            //count_squares_and_verify();
        };

        let choose_expandable_square_and_extend = () => {
            if (squares_to_expand.length === 0) {
                return false;
            }
            Phaser.Utils.Array.Shuffle(squares_to_expand);
            let s = squares_to_expand.pop();
            let neighbors = return_neighbors(s.x, s.y);
            Phaser.Utils.Array.Shuffle(neighbors);
            for(let n of neighbors) {
                if (n.color !== COLORS.GREY && n.color !== COLORS.LIGHT_GREY) {
                    extend_group(n, s);
                    return true;
                }
            }
        };

        for (let x = 0; x < GRID_COLS; x++) {
            for (let y = 0; y < GRID_ROWS; y++) {
                let grid_square = {
                    x: x,
                    y: y,
                    square: addGridSquare(x, y, COLORS.GREY),
                    color: COLORS.GREY
                };
                grid_squares.push(grid_square);
            }
        };

        let original_square = get_grid_square(0,0);
        add_square_to_group(original_square, COLORS.RED);
        let next_square;
        let current_square = original_square;
        for (let n = 1; n < GRID_COLS; n++) {
            next_square = get_grid_square(n, 0);
            extend_group(current_square, next_square);
            current_square = next_square;
        }
        current_square = original_square;
        for (let n = 1; n < GRID_COLS; n++) {
            next_square = get_grid_square(0, n);
            extend_group(current_square, next_square);
            current_square = next_square;
        }
        current_square = get_grid_square(0, GRID_ROWS-1);
        for (let n = 1; n < GRID_COLS; n++) {
            next_square = get_grid_square(n, GRID_ROWS-1);
            extend_group(current_square, next_square);
            current_square = next_square;
        }
        current_square = get_grid_square(GRID_COLS-1, 0);
        for (let n = 1; n < GRID_COLS; n++) {
            next_square = get_grid_square(GRID_COLS-1, n);
            extend_group(current_square, next_square);
            current_square = next_square;
        }

        let center = GRID_COLS/2;
        add_square_to_group(get_grid_square(center - 1, center - 1), COLORS.BLUE);
        extend_group(get_grid_square(center - 1, center - 1),
            get_grid_square(center, center - 1))
        extend_group(get_grid_square(center - 1, center - 1),
            get_grid_square(center - 1, center))
        extend_group(get_grid_square(center, center - 1),
            get_grid_square(center, center));

        for (let n = 0; n < 100; n++) {
            let x = Phaser.Math.Between(1, GRID_COLS-2);
            let y = Phaser.Math.Between(1, GRID_COLS-2);
            if (get_grid_square(x, y).color === COLORS.GREY) {
                add_square_to_group(get_grid_square(x, y), COLORS.GREEN);
                break;
            }
        }

        scene.add.rectangle(
            SCREEN_HEIGHT/2,
            SCREEN_HEIGHT/2,
            GRID_SIZE/2,
            GRID_SIZE/2,
            0xffffff
        );

        scene.add.rectangle(
            SCREEN_HEIGHT/2,
            GRID_SIZE/2,
            GRID_SIZE/2,
            GRID_SIZE/2,
            0x000000
        );

        while (choose_expandable_square_and_extend());

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
