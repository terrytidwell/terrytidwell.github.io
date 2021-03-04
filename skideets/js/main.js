const GRID_SIZE = 50;
//const SPRITE_SCALE = GRID_SIZE/32;
const GRID_COLS = 16;
const GRID_ROWS = 10;
const SCREEN_WIDTH = 1280; //845 + 400; //845; //1025
const SCREEN_HEIGHT = 768; //542 + 150; //542; //576
const BPM = 133;
const ARROW = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
};
const DIRECTION = {
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    dx(direction) {
        return [0, 0,0,-1,1][direction];
    },
    dy(direction) {
        return [0, -1,1,0,0][direction];
    },
    opposite(direction) {
        return [0, 2, 1, 4, 3][direction];
    },
};
const CONNECTION = {
    NONE: 0,
    LEFT: 1,
    LEFT_2_DOWN: 2,
    LEFT_2_RIGHT: 3,
    LEFT_2_UP: 4,
    RIGHT: 5,
    RIGHT_2_DOWN: 6,
    RIGHT_2_UP: 7,
    UP: 8,
    UP_2_DOWN: 9,
    DOWN: 10,
    directionToSegment(d1,d2) {
      return [
           0, 8,10, 1, 5,
           8, 8, 9, 4, 7,
          10, 9,10, 2, 6,
           1, 4, 2, 1, 3,
           5, 7, 6, 3, 5
      ][d1*5+d2];
    },
    offset: function(connection) {
        return [
            0, 1, 3, 2,
            3, 1, 3, 3,
            1, 2, 1
        ][connection]
    },
    flipX: function(connection) {
        return [
            false, true, false, false,
            false, false, true, true,
            false, false, false
        ][connection];
    },
    flipY: function(connection) {
        return [
            false, false, true, false,
            false, false, true, false,
            false, false, true
        ][connection];
    },
    rotation: function(connection) {
        return [
            0, 0, 0, 0,
            0, 0, 0, 0,
            -Math.PI/2, Math.PI/2, Math.PI/2
        ][connection];
    }
};
const COLORS = {
    BLUE: 0,
    GREEN: 1,
    LIME: 2,
    ORANGE: 3,
    PURPLE: 4,
    RED: 5,
    COLORLESS: 6,
    isColor: function(color) {
        return color !== 6;
    },
    randomColor: function() {
        return Phaser.Math.Between(0,5);
    },
    randomColorExcluding(color) {
        if (COLORS.isColor(color)) {
            return (color + Phaser.Math.Between(1,5)) % 6;
        }
        return COLORS.randomColor();
    }
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

        let loading_text = scene.add.text(
            SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.spritesheet('boxes', 'assets/Boxes/Boxes2.png', { frameWidth: 50, frameHeight: 50 });
        this.load.image('grid', 'assets/Play Grid/EmptyGrid01.png');
        this.load.image('player_controller', 'assets/Play Grid/PlayerController.png');
        this.load.image('grey_arrow', 'assets/Boxes/GreyArrow_Right.png');
        this.load.image('grey_box', 'assets/Boxes/Grey_Single.png');
        this.load.image('scanline', 'assets/Play Grid/R_Scanline.png');
        this.load.image('menu', 'assets/ScanlineMenu_v2.png')
        this.load.video('bg_video','assets/Play Grid/Background Video/dynamic lines.mp4');

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('TitleScene');
            scene.scene.stop('LoadScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let menu = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'menu');
        menu.setInteractive();
        menu.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function() {
            scene.scene.start('GameScene');
            scene.scene.stop('TitleScene');
        });
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
    create: function () {
        let scene = this;

        //----------------------------------------------------------------------
        //FUNCTIONS
        //----------------------------------------------------------------------
        let gridX = function(x) {
            let dx = x - GRID_COLS / 2;
            return SCREEN_WIDTH/2 + dx * GRID_SIZE + 23;
        };

        let gridY = function(y) {
            let dy = y - GRID_ROWS / 2;
            return SCREEN_HEIGHT/2 + dy * GRID_SIZE + 27;
        };

        let yLegal = function(y) {
            return y >= 0 && y < GRID_ROWS;
        }

        let xLegal = function(x) {
            return x >= 0 && x < GRID_COLS;
        };

        let gridLegal = function(x, y) {
            return xLegal(x) && yLegal(y);
        };

        let set_block_texture = function(square) {
            square.rotation = 0;
            square.setFlipX(false);
            square.setFlipY(false);
            square.setVisible(false);
            square.rotation = 0;
            let color = square.data.values.color;
            if (COLORS.isColor(color)) {
                let connection = square.data.values.connection;
                let offset = CONNECTION.offset(connection);
                if (square.data.values.locked) {
                    offset += 4;
                }
                let flipX = CONNECTION.flipX(connection);
                let flipY = CONNECTION.flipY(connection);
                let rotation = CONNECTION.rotation(connection);
                square.setTexture('boxes', color*9 + offset).setFlipX(flipX).setFlipY(flipY);
                square.rotation = rotation;
                square.setVisible(true);
            } else {
                if (square.data.values.arrow === ARROW.NONE) {
                    square.setTexture('grey_box');
                    square.setVisible(false);
                } else {
                    square.setTexture('grey_arrow')
                        .setFlipX(ARROW.LEFT === square.data.values.arrow);
                    if (COLORS.isColor(square.data.values.arrow_color)) {
                        let offset = 4;
                        if (square.data.values.locked) {
                            offset += 4;
                        }
                        square.setTexture('boxes', square.data.values.arrow_color*9 + offset);
                    }
                    square.setVisible(true);
                }
            }
        };

        let swap_squares = function(square1, square2) {
            let data_properties = ['connection', 'color', 'arrow_color', 'arrow', 'locked', 'path'];
            for (let i = 0; i < data_properties.length; i++) {
                let temp = square1.data.values[data_properties[i]];
                square1.setData(data_properties[i],square2.data.values[data_properties[i]]);
                square2.setData(data_properties[i],temp);
            }
            let properties = ['visible'];
            for (let i = 0; i < properties.length; i++) {
                let temp = square1[properties[i]];
                square1[properties[i]] = square2[properties[i]];
                square2[properties[i]] = temp;
            }
        };

        scene.__gravity = function() {
            for (let y = 1; y < GRID_ROWS; y++ ) {
                for(let x = 0; x < GRID_COLS; x++) {
                    let square = grid[x][y];
                    let blank = square.data.values.color === COLORS.COLORLESS &&
                        square.data.values.arrow === ARROW.NONE;
                    if (blank) {
                        try_swap_squares(square, grid[x][y-1]);
                    }
                }
                scan_grid();
            }
        };

        let clear_block = function(square) {
            square.setData('connection',CONNECTION.NONE);
            square.setData('color',COLORS.COLORLESS);
            square.setData('arrow_color',COLORS.COLORLESS);
            square.setData('arrow',ARROW.NONE);
            square.setData('locked',false);
            square.setData('path', null);
        };

        let create_block = function (x,y) {
            let square = scene.add.sprite(gridX(x), gridY(y),
                'boxes', 0).setAlpha(0.75);
            clear_block(square);
            return square;
        };

        let randomize_block = function(x, y) {
            let square = grid[x][y];
            let chosen_color = COLORS.randomColor();
            let chosen_arrow = ARROW.NONE;
            if (x - 2 >= 0)
            {
                chosen_color =
                    COLORS.randomColorExcluding(grid[x-2][y].data.values.color);
            }
            if (Phaser.Math.Between(0, 100) < 10) {
                chosen_arrow = ARROW.LEFT;
                chosen_color = COLORS.COLORLESS;
                if (Phaser.Math.Between(0,1) === 0) {
                    chosen_arrow = ARROW.RIGHT;
                }
            }
            square.setData('arrow', chosen_arrow);
            square.setData('color', chosen_color);
        };

        let find_line = function(x, y) {
            let arrow = grid[x][y].data.values.arrow;
            let dx = 0;
            let dy = 0;
            let cx = x;
            let cy = y;
            let directions = [
                ARROW.RIGHT === arrow ?
                    DIRECTION.RIGHT : DIRECTION.LEFT, //right
                DIRECTION.UP, //up
                DIRECTION.DOWN, //down
            ];
            let path = [];
            path.unshift({
                square: grid[cx][cy],
                dx: dx,
                dy: dy,
                d1: DIRECTION.NONE,
                d2: directions[0]
            });
            dx += DIRECTION.dx(directions[0]);
            dy += DIRECTION.dy(directions[0]);
            cx = x + dx;
            cy = y + dy;

            if (!gridLegal(cx,cy)) {
                return path;
            }
            let path_color = grid[cx][cy].data.values.color;
            if (!COLORS.isColor(path_color)) {
                return path;
            }
            path.unshift({
                square: grid[cx][cy],
                dx: dx,
                dy: dy,
                d1: DIRECTION.opposite(directions[0]),
                d2: DIRECTION.NONE});
            let previous_direction = directions[0];
            let finished = false;
            while (!finished) {
                finished = true;
                for (let direction of directions) {
                    if (direction === DIRECTION.opposite(previous_direction)) {
                        continue;
                    }
                    let test_x = cx + DIRECTION.dx(direction);
                    let test_y = cy + DIRECTION.dy(direction);
                    if (!gridLegal(test_x, test_y)) {
                        continue;
                    }
                    if (grid[test_x][test_y].data.values.color !== path_color) {
                        continue;
                    }
                    if (grid[test_x][test_y].data.values.connection !== CONNECTION.NONE) {
                        continue;
                    }
                    if (grid[test_x][test_y].data.values.locked) {
                        continue;
                    }

                    dx += DIRECTION.dx(direction);
                    dy += DIRECTION.dy(direction);
                    cx = test_x;
                    cy = test_y;
                    previous_direction = direction;
                    path[0].d2 = direction;
                    path.unshift({
                        square: grid[cx][cy],
                        dx: dx,
                        dy: dy,
                        d1: DIRECTION.opposite(direction),
                        d2: DIRECTION.NONE});
                    finished = false;
                    break;
                }
            }
            return path;
        };

        let scan_grid = function() {
            //clear all unlocked blocks
            for (let y = 0; y < GRID_ROWS; y++) {
                for (let x = 0; x < GRID_COLS; x++) {
                    if (!grid[x][y].data.values.locked &&
                        COLORS.isColor(grid[x][y].data.values.color)) {
                        grid[x][y].setData('connection', CONNECTION.NONE);
                    }
                }
            }
            //look for grey arrows
            for (let y = 0; y < GRID_ROWS; y++) {
               for (let x = 0; x < GRID_COLS; x++) {
                    let square = grid[x][y];
                    let color = square.data.values.color;
                    let arrow = square.data.values.arrow;
                    if (!COLORS.isColor(color) &&
                        arrow !== ARROW.NONE &&
                        !square.data.values.locked) {

                        let path = find_line(x, y);
                        //includes arrow
                        if (path.length >= 4) {
                            //path[0] is arrow
                            //path[1] is first square
                            let color = path[1].square.data.values.color;
                            square.setData('arrow_color',
                                color);
                            for (let step of path) {
                                step.square.setData('connection',
                                    CONNECTION.directionToSegment(step.d1, step.d2));
                            }
                            square.setData('path', path);
                        } else {
                            square.setData('arrow_color', COLORS.COLORLESS);
                            square.setData('path', null);
                        }
                    }
                }
            }
            for (let y = 0; y < GRID_ROWS; y++) {
                for(let x = 0; x < GRID_COLS; x++) {
                    let square = grid[x][y];
                    set_block_texture(square);
                }
            }
        }

        let try_swap_squares = function(square1, square2) {
            if (square1.data.values.locked || square2.data.values.locked) {
                return false;
            }

            swap_squares(square1, square2);
            return true;
        };

        let try_selection = function () {
            let left_square = grid[playerX][playerY];
            let right_square = grid[playerX+1][playerY];

            if (try_swap_squares(left_square,right_square)) {
                scan_grid();
            }
        };

        let move_character = function (dx, dy) {
            let newX = playerX + dx;
            let newY = playerY + dy;
            if (!xLegal(newX) ||
                !xLegal(newX+1) ||
                !yLegal(newY))
            {
                return;
            }
            playerX = newX;
            playerY = newY;
            player.setPosition(gridX(playerX + .5), gridY(playerY));
        };

        let add_test_line = function () {
            for (let x = 0; x < CONNECTION.DOWN + 1; x++) {
                grid[x][GRID_ROWS - 1].setData('color', COLORS.RED);
                grid[x][GRID_ROWS - 1].setData('connection',x);
                grid[x][GRID_ROWS - 2].setData('color', COLORS.RED);
                grid[x][GRID_ROWS - 2].setData('connection',x);
                grid[x][GRID_ROWS - 2].setData('locked',true);
            }
            scan_grid();
        }

        let add_line = function() {
            for (let y = 0; y < GRID_ROWS; y++) {
                for(let x = 0; x < GRID_COLS; x++) {
                    //two things on most rows we...
                    if (y + 1 < GRID_ROWS) {
                        //...shift squares up, but...
                        let square = grid[x][y];
                        swap_squares(square, grid[x][y+1]);
                    } else {
                        //...on the bottom row, add random blocks
                        clear_block(grid[x][y]);
                        randomize_block(x,y);
                    }
                }
                scan_grid();
            }
            move_character(0,-1);
        };

        let remove_n_blocks_from_line = function(y, number) {
            let indexes = Phaser.Utils.Array.NumberArray(0, GRID_COLS-1);
            Phaser.Utils.Array.Shuffle(indexes);
            number = Math.min(number, indexes.length)
            for (let i = 0; i < number; i++) {
                let square = grid[indexes[i]][y];
                clear_block(square);
            }
            scan_grid();
        }

        let set_scanline = function() {
            scanline.setPosition(gridX(scanlineX), SCREEN_HEIGHT/2)
        };

        let scan_line_exit_handlers = [];
        let scan_line_enter = function(x, dx) {
            if (!xLegal(x)) {
                return;
            }
            for (let y = 0; y < GRID_ROWS; y++) {
                //test for locking
                let square = grid[x][y];
                let arrow_color = square.data.values.arrow_color;
                let arrow = square.data.values.arrow;
                if (arrow !== ARROW.NONE &&
                    arrow_color !== COLORS.COLORLESS) {
                    if (dx > 0 && arrow === ARROW.RIGHT ||
                        dx < 0 && arrow === ARROW.LEFT) {
                        let x_extrema = x;
                        for (let step of square.data.values.path) {
                            if (gridLegal(x+step.dx, y+step.dy)) {
                                x_extrema = dx > 0 ? Math.max(x_extrema, x+step.dx) :
                                    Math.min(x_extrema, x+step.dx);
                                grid[x+step.dx][y+step.dy].setData('locked', true);
                            }
                        }
                        scan_line_exit_handlers.push({exit_x:x_extrema,
                            start_x: x,
                            start_y: y,
                            arrow: square
                        });
                    }
                    scan_grid();
                }
            }
        };

        let scan_line_exit = function(x) {
            if (!xLegal(x)) {
                return;
            }
            scan_line_exit_handlers =
                scan_line_exit_handlers.filter(function(exit_handler) {
                if (x !== exit_handler.exit_x) {
                    //keep this around
                    return true;
                }
                for (let step of exit_handler.arrow.data.values.path) {
                    let path_x = exit_handler.start_x +step.dx;
                    let path_y = exit_handler.start_y +step.dy;
                    if (gridLegal(path_x, path_y)) {
                        clear_block(grid[path_x][path_y]);
                    }
                }
                return false;
            });
            scan_grid();
        };

        let update_scanline = function() {

            scan_line_exit(scanlineX, scanlineDx);

            scanlineX += scanlineDx;
            if (scanlineX < 0 || scanlineX > GRID_COLS-1) {
                scanlineDx *= -1;
                if ( scanlineX < 0) {
                    console.assert(scan_line_exit_handlers.length === 0);
                    add_line();
                }
            }
            if (scanlineDx > 0) {
                scanline.setFlipX(false);
            } else {
                scanline.setFlipX(true);
            }

            set_scanline();
            scan_line_enter(scanlineX, scanlineDx);
        };

        //----------------------------------------------------------------------
        //GAME ENTITY SETUP
        //----------------------------------------------------------------------

        let grid = [];

        let video = scene.add.video(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg_video').play(true);
        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'grid');

        for (let x = 0; x < GRID_COLS; x++)
        {
            grid.push([]);
            for (let y = 0; y < GRID_ROWS; y++)
            {
                let square = create_block(x,y);
                grid[x].push(square);
                set_block_texture(square);
            }
        }

        let playerX = GRID_COLS/2 - 1;
        let playerY = GRID_ROWS - 1;
        let player = scene.add.sprite(0,0,'player_controller');
        //reconcile sprite to playerX, playerY
        move_character(0,0);

        let scanlineX = 0;
        let scanlineDx = 1;
        let scanline = scene.add.sprite(0,0,'scanline');

        //add_test_line();

        add_line();
        remove_n_blocks_from_line(GRID_ROWS - 1, Math.round(GRID_COLS * .75));

        add_line();
        remove_n_blocks_from_line(GRID_ROWS - 1, Math.round(GRID_COLS * .50));

        add_line();
        remove_n_blocks_from_line(GRID_ROWS - 1, Math.round(GRID_COLS * .25));

        add_line();
        /*
         */

        //reconcile sprite to scanelineX
        set_scanline();

        scene.time.addEvent({
            "delay": 60 * 1000 / BPM,
            "loop": true,
            "callback": update_scanline
        });

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

        scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.m_cursor_keys.down.on('down', function(event) {
            move_character(0,1)});
        scene.m_cursor_keys.up.on('down', function(event) {
            move_character(0,-1)});
        scene.m_cursor_keys.left.on('down', function(event) {
            move_character(-1,0)});
        scene.m_cursor_keys.right.on('down', function(event) {
            move_character(1,0)});
        scene.space_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        scene.space_key.on('down', try_selection);
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;
        scene.__gravity();
    },
});

let config = {
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    render: {
        pixelArt: true
    },
    input: {
        gamepad: true
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
    scene: [ LoadScene, TitleScene, GameScene ]
};

game = new Phaser.Game(config);
