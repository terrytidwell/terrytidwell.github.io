const GRID_SIZE = 50;
const GRID_COLS = 16;
const GRID_ROWS = 10;
const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 768;
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
    isEndpoint(connection) {
      return [
          false,  true, false, false,
          false,  true, false, false,
           true, false,  true
      ][connection];
    },
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
        ][connection];
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
            for (let y = GRID_ROWS - 1; y > 0; y--) {
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

        let line_algorithm = function(path, x, y) {
            let arrow = path.steps[path.steps.length-1].square.data.values.arrow;
            let path_color = grid[x][y].data.values.color;
            let preferred_direction = ARROW.RIGHT === arrow ?
                DIRECTION.RIGHT : DIRECTION.LEFT
            let dx = path.steps[0].dx;
            let dy = path.steps[0].dy;
            let previous_direction = DIRECTION.opposite(path.steps[0].d1);
            let directions = [
                preferred_direction,
                DIRECTION.UP, //up
                DIRECTION.DOWN, //down
            ];
            let finished = false;
            while (!finished) {
                finished = true;
                for (let direction of directions) {
                    if (direction === DIRECTION.opposite(previous_direction)) {
                        continue;
                    }
                    let test_x = x + DIRECTION.dx(direction);
                    let test_y = y + DIRECTION.dy(direction);
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
                    x = test_x;
                    y = test_y;
                    previous_direction = direction;
                    path.steps[0].d2 = direction;
                    path.steps.unshift({
                        square: grid[x][y],
                        dx: dx,
                        dy: dy,
                        d1: DIRECTION.opposite(direction),
                        d2: DIRECTION.NONE});
                    path.min_x = Math.min(path.min_x, x);
                    path.min_y = Math.min(path.min_y, y);
                    path.max_x = Math.max(path.max_x, x);
                    path.max_y = Math.max(path.max_y, y);

                    finished = false;
                    break;
                }
            }
            return path;
        }

        let find_line = function(x, y) {
            let arrow = grid[x][y].data.values.arrow;
            let dx = 0;
            let dy = 0;
            let preferred_direction = arrow === ARROW.RIGHT ?
                DIRECTION.RIGHT : DIRECTION.LEFT;

            let path = {
                min_x: x, max_x: x,
                min_y: y, max_y: y,
                steps: [] };
            path.steps.unshift({
                square: grid[x][y],
                dx: dx,
                dy: dy,
                d1: DIRECTION.NONE,
                d2: preferred_direction
            });
            dx += DIRECTION.dx(preferred_direction);
            dy += DIRECTION.dy(preferred_direction);
            x += dx;
            y += dy;

            if (!gridLegal(x,y)) {
                return path;
            }
            let path_color = grid[x][y].data.values.color;
            if (!COLORS.isColor(path_color)) {
                return path;
            }
            path.steps.unshift({
                square: grid[x][y],
                dx: dx,
                dy: dy,
                d1: DIRECTION.opposite(preferred_direction),
                d2: DIRECTION.NONE});
            path.min_x = Math.min(path.min_x, x);
            path.min_y = Math.min(path.min_y, y);
            path.max_x = Math.max(path.max_x, x);
            path.max_y = Math.max(path.max_y, y);

            return line_algorithm(path, x, y);
        };

        let continue_line = function(x, y) {
            let path = grid[x][y].data.values.path;
            return line_algorithm(path, x, y);
        };

        let scan_grid = function() {
            //clear all unlocked blocks
            for (let y = 0; y < GRID_ROWS; y++) {
                for (let x = 0; x < GRID_COLS; x++) {
                    if (!grid[x][y].data.values.locked &&
                        COLORS.isColor(grid[x][y].data.values.color)) {
                        grid[x][y].setData('connection', CONNECTION.NONE);
                        grid[x][y].setData('path', null);
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
                        if (path.steps.length >= 4) {
                            //path.steps[0] is last square
                            let color = path.steps[0].square.data.values.color;
                            square.setData('arrow_color',
                                color);
                            for (let step of path.steps) {
                                step.square.setData('connection',
                                    CONNECTION.directionToSegment(step.d1, step.d2));
                                step.square.setData('path', path);
                            }
                        } else {
                            square.setData('arrow_color', COLORS.COLORLESS);
                            square.setData('path', null);
                        }
                    }
                }
            }

            for (let y = 0; y < GRID_ROWS; y++) {
                for (let x = 0; x < GRID_COLS; x++) {
                    let square = grid[x][y];
                    let color = square.data.values.color;
                    let arrow = square.data.values.arrow;
                    if (square.data.values.locked &&
                        COLORS.isColor(color) &&
                        arrow === ARROW.NONE &&
                        CONNECTION.isEndpoint(square.data.values.connection)) {

                        let path = continue_line(x, y);
                        for (let step of path.steps) {
                            step.square.setData('connection',
                                CONNECTION.directionToSegment(step.d1, step.d2));
                            step.square.setData('path', path);
                            step.square.setData('locked', true);
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

        let move_character = function (direction) {
            let newX = playerX + DIRECTION.dx(direction);
            let newY = playerY + DIRECTION.dy(direction);
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
            move_character(DIRECTION.UP);
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
        };

        let set_scanline = function() {
            scanline.setPosition(gridX(scanlineX), SCREEN_HEIGHT/2)
        };

        let active_lines = [];
        let scan_line_enter = function(x, direction) {
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
                    if (DIRECTION.RIGHT === direction && arrow === ARROW.RIGHT ||
                        DIRECTION.LEFT === direction && arrow === ARROW.LEFT) {
                        for (let step of square.data.values.path.steps) {
                            step.square.setData('locked', true);
                        }
                        active_lines.push({start_x: x, start_y:y, path: square.data.values.path});
                    }
                    scan_grid();
                }
            }
        };

        let scan_line_exit = function(x, direction) {
            if (!xLegal(x)) {
                return;
            }
            active_lines =
                active_lines.filter(function(active_line) {
                let end_x = direction === DIRECTION.LEFT ?
                    active_line.path.min_x :
                    active_line.path.max_x
                if (x !== end_x) {
                    //keep this around
                    return true;
                }

                let delta = active_line.path.steps.length * 100;
                let mid_x = (active_line.path.min_x + active_line.path.max_x)/2;
                let mid_y = (active_line.path.min_y + active_line.path.max_y)/2;
                let text = scene.add.text(
                    gridX(mid_x),
                    gridY(mid_y),
                    '+' + delta,
                    {font: '' + GRID_SIZE*2 + 'px xolonium', fill: '#FFFFFF'})
                    .setOrigin(0.5, 0.5)
                    .setAlpha(0)
                    .setScale(0);
                let timeline = scene.tweens.createTimeline();
                timeline.add({
                    targets: text,
                    scale: 1,
                    alpha: 1,
                    duration: 100,
                });
                timeline.add({
                    targets: text,
                    scale: 0.75,
                    alpha: 0.5,
                    duration: 1000,
                })
                timeline.add({
                    targets: text,
                    scale: 0,
                    alpha: 0,
                    duration: 200,
                    x: 0,
                    y: 0,
                    onComplete: function() {
                        addScore(delta);
                        text.destroy();
                    }
                });
                timeline.play();
                for (let step of active_line.path.steps) {

                    let afterglow = afterglow_pool.length === 0 ? create_block(0, 0) : afterglow_pool.pop();
                    clear_block(afterglow);
                    afterglow.setPosition(gridX(active_line.start_x + step.dx),
                        gridY(active_line.start_y + step.dy));
                    swap_squares(afterglow, step.square);
                    set_block_texture(afterglow);
                    afterglow.setAlpha(0);
                    afterglow.setTintFill(0xffffff);
                    let timeline2 = scene.tweens.createTimeline();
                    timeline2.add({
                        targets: afterglow,
                        alpha: 1,
                        duration: 100,
                    });
                    timeline2.add({
                        targets: afterglow,
                        alpha: 0,
                        duration: 500,
                        onComplete: function() {
                            afterglow_pool.push(afterglow);
                        }
                    });
                    timeline2.play();
                }
                return false;
            });
            scan_grid();
        };

        let update_scanline = function() {

            scan_line_exit(scanlineX, scanlineDirection);

            scanlineX += DIRECTION.dx(scanlineDirection);
            if (!xLegal(scanlineX)) {
                scanlineDirection = DIRECTION.opposite(scanlineDirection);
                if ( scanlineX < 0) {
                    console.assert(active_lines.length === 0);
                    add_line();
                }
            }

            scanline.setFlipX(DIRECTION.LEFT === scanlineDirection);

            set_scanline();
            scan_line_enter(scanlineX, scanlineDirection);
        };

        //----------------------------------------------------------------------
        //GAME ENTITY SETUP
        //----------------------------------------------------------------------

        let grid = [];
        let afterglow_pool = [];

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
        move_character(DIRECTION.NONE);

        let scanlineX = 0;
        let scanlineDirection = DIRECTION.RIGHT;
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

        let addScore = function(delta) {
            scene.tweens.add({
                targets: {score: score},
                props: {score: score+delta},
                duration: 250,
                onUpdate: function() {
                    score = Math.round(this.getValue());
                    score_text.text = '' + score + '';
                }
            });
            scene.tweens.add({
                targets: score_text,
                alpha: 1,
                duration: 125,
                yoyo: true
            });
        }
        let score = 0;
        let score_text = scene.add.text(
            0,
            GRID_SIZE/2,
            '' +  score + '',
            {font: '' + GRID_SIZE + 'px xolonium', fill: '#FFFFFF'})
            .setOrigin(0, 0.5)
            .setAlpha(0.7);

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

        scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.m_cursor_keys.down.on('down', function(event) {
            move_character(DIRECTION.DOWN)});
        scene.m_cursor_keys.up.on('down', function(event) {
            move_character(DIRECTION.UP)});
        scene.m_cursor_keys.left.on('down', function(event) {
            move_character(DIRECTION.LEFT)});
        scene.m_cursor_keys.right.on('down', function(event) {
            move_character(DIRECTION.RIGHT)});
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
