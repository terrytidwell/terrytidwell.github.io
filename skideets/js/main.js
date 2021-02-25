const GRID_SIZE = 50;
//const SPRITE_SCALE = GRID_SIZE/32;
const GRID_COLS = 16;
const GRID_ROWS = 10;
const SCREEN_WIDTH = 1280; //845 + 400; //845; //1025
const SCREEN_HEIGHT = 768; //542 + 150; //542; //576
const ARROW = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
    /*
    random: function() { return Phaser.Math.Between(0, 2); },
    color: function(color) { return [0xff0000, 0x00ff00, 0x0000ff][color]; },
    */
};
const SEGMENT = {
    NONE: 0,
    LEFT: 1,
    MIDDLE: 2,
    RIGHT: 3,
    offset: function(segment) {
        return segment;
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

        this.load.spritesheet('boxes', 'assets/Boxes.png', { frameWidth: 50, frameHeight: 50 });
        this.load.image('grid', 'assets/Play Grid/EmptyGrid01.png');
        this.load.image('player_controller', 'assets/Play Grid/PlayerController.png');
        this.load.image('grey_arrow', 'assets/Boxes/Grey/GreyArrow_Left.png');
        this.load.image('grey_box', 'assets/Boxes/Grey/Unused/Grey_Single.png');
        this.load.image('scanline', 'assets/Play Grid/R_Scanline.png');

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('GameScene');
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

        let gridX = function(x) {
            let dx = x - GRID_COLS / 2;
            return SCREEN_WIDTH/2 + dx * GRID_SIZE + 23;
        };

        let gridY = function(y) {
            let dy = y - GRID_ROWS / 2;
            return SCREEN_HEIGHT/2 + dy * GRID_SIZE + 27;
        };

        //let video = scene.add.video(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg_video').play(true);

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'grid');

        let grid = [];

        let set_block_texture = function(square) {
            let color = square.data.values.color;
            if (COLORS.isColor(color)) {
                let offset = SEGMENT.offset(square.data.values.segment);
                square.setTexture('boxes', color*6 + offset).setFlipX(false);
            } else {
                if (square.data.values.arrow === ARROW.NONE) {
                    square.setTexture('grey_box').setFlipX(false);
                } else {
                    square.setTexture('grey_arrow')
                        .setFlipX(ARROW.RIGHT === square.data.values.arrow);
                    if (COLORS.isColor(square.data.values.arrow_color)) {
                        square.setTexture('boxes', square.data.values.arrow_color*6 + 4);
                    }
                }
            }
        };

        let swap_square = function(square1, square2) {
            let properties = ['segment', 'color', 'arrow_color', 'arrow', 'locked'];
            for (let i = 0; i < properties.length; i++) {
                let temp = square1.data.values[properties[i]];
                square1.setData(properties[i],square2.data.values[properties[i]]);
                square2.setData(properties[i],temp);
            }
        };

        let clear_block = function(square) {
            square.setData('segment',SEGMENT.NONE);
            square.setData('color',COLORS.COLORLESS);
            square.setData('arrow_color',COLORS.COLORLESS);
            square.setData('arrow',ARROW.NONE);
            square.setData('locked',false);
        };

        let create_block = function (x,y) {
            let square = scene.add.sprite(gridX(x), gridY(y),
                'boxes', 0).setAlpha(0.75);
            clear_block(square);
            return square;
        }

        let randomize_block = function(square, x, y) {
            let chosen_color = COLORS.randomColor();
            let chosen_arrow = ARROW.NONE;
            if (x !== 0)
            {
                chosen_color =
                    COLORS.randomColorExcluding(grid[x-1][y].data.values.color);
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
            set_block_texture(square);
        }

        for (let x = 0; x < GRID_COLS; x++)
        {
            grid.push([]);
            for (let y = 0; y < GRID_ROWS; y++)
            {
                let square = create_block(x,y);
                grid[x].push(square);
                randomize_block(square, x, y);


                square.setVisible(y >= GRID_ROWS/2 - 2 && y <= GRID_ROWS/2 + 1);
            }
        }

        let playerX = GRID_COLS/2 - 1;
        let playerY = GRID_ROWS/2;
        let player = scene.add.sprite(0,0,'player_controller');
        let scanline = scene.add.sprite(0,0,'scanline');

        let scanlineX = 0;
        let scanlineDx = 1;

        let set_scanline = function() {
            scanline.setPosition(gridX(scanlineX), SCREEN_HEIGHT/2)
        }
        set_scanline();

        let scan_line = function(x, dx) {
            if (x < 0 || x >= GRID_COLS) {
                return;
            }
            for (let y = 0; y < GRID_ROWS; y++) {
                let square = grid[x][y];
                let arrow_color = square.data.values.arrow_color;
                let arrow = square.data.values.arrow;
                if (arrow !== ARROW.NONE &&
                    arrow_color !== COLORS.COLORLESS)
                {
                    //match?
                    if (dx > 0 && arrow === ARROW.RIGHT ||
                        dx < 0 && arrow === ARROW.LEFT)
                    {
                        //square.setVisible(false);
                        clear_block(square);
                        let match_x = x + dx;
                        while (match_x >= 0 && match_x < GRID_COLS &&
                            grid[match_x][y].data.values.segment !== SEGMENT.NONE) {
                            //grid[match_x][y].setVisible(false);
                            square = grid[match_x][y];
                            clear_block(square);
                            match_x += dx;
                        }
                        merge_squares(y);
                    }
                }
            }
        };

        let update_scanline = function() {
            scanlineX += scanlineDx;
            if (scanlineX < 0 || scanlineX > GRID_COLS-1) {
                scanlineDx *= -1;
            }
            if (scanlineDx > 0) {
                scanline.setFlipX(false);
            } else {
                scanline.setFlipX(true);
            }
            set_scanline();
            scan_line(scanlineX, scanlineDx);
        }

        scene.time.addEvent({
            "delay": 60 * 1000 / 112,
            "loop": true,
            "callback": update_scanline
        });

        //SETUP INPUTS

        scene.input.addPointer(5);

        let left_test = function(x,y,test_color) {
            if (!COLORS.isColor(test_color)) {
                return false;
            }
            if (x !== 0 && grid[x-1][y].data.values.color === test_color) {
                return false;
            }
            if (x + 2 < GRID_COLS &&
                grid[x+1][y].data.values.color === test_color &&
                grid[x+2][y].data.values.color === test_color) {
                return true;
            }
            return false;
        };

        let middle_test = function(x,y,test_color) {
            if (!COLORS.isColor(test_color)) {
                return false;
            }
            if (x + 1 < GRID_COLS && x - 1 >= 0 &&
                grid[x-1][y].data.values.color === test_color &&
                grid[x+1][y].data.values.color === test_color) {
                return true;
            }
            return false;
        };

        let right_test = function(x,y,test_color) {
            if (!COLORS.isColor(test_color)) {
                return false;
            }
            if (x !== GRID_COLS-1 && grid[x+1][y].data.values.color === test_color) {
                return false;
            }
            if (x - 2 >= 0 &&
                grid[x-1][y].data.values.color === test_color &&
                grid[x-2][y].data.values.color === test_color) {
                return true;
            }
            return false;
        };

        let merge_squares = function(y) {
            //handle color squares
            for(let x = 0; x < GRID_COLS; x++) {
                let square = grid[x][y];
                let test_color = square.data.values.color;
                if (left_test(x,y,test_color)) {
                    square.setData('locked',false);
                    square.setData('segment', SEGMENT.LEFT);
                } else if (middle_test(x,y,test_color)) {
                    square.setData('locked',false);
                    square.setData('segment', SEGMENT.MIDDLE);
                } else if (right_test(x,y,test_color)) {
                    square.setData('locked',false);
                    square.setData('segment', SEGMENT.RIGHT);
                } else {
                    square.setData('locked',false);
                    square.setData('segment', SEGMENT.NONE);
                }
            }
            //handle grey arrows
            for(let x = 0; x < GRID_COLS; x++) {
                let square = grid[x][y];
                square.setData('arrow_color', COLORS.COLORLESS);
                let test_color = square.data.values.color;
                if (!COLORS.isColor(test_color)) {
                    if (x !== 0 &&
                        square.data.values.arrow === ARROW.LEFT &&
                        COLORS.isColor(grid[x-1][y].data.values.color) &&
                        grid[x-1][y].data.values.segment === SEGMENT.RIGHT ) {
                        //end cap!!
                        grid[x - 1][y].setData('segment', SEGMENT.MIDDLE);
                        square.setData('arrow_color', grid[x-1][y].data.values.color);
                    } else if (x !== GRID_COLS -1  &&
                        square.data.values.arrow === ARROW.RIGHT &&
                        COLORS.isColor(grid[x+1][y].data.values.color) &&
                        grid[x+1][y].data.values.segment === SEGMENT.LEFT) {
                        grid[x+1][y].setData('segment', SEGMENT.MIDDLE);
                        square.setData('arrow_color', grid[x+1][y].data.values.color);
                    }
                }
            }
            //now paint tiles
            for(let x = 0; x < GRID_COLS; x++) {
                let square = grid[x][y];
                set_block_texture(square);
            }
        };

        let move_character = function (dx, dy) {
            let newX = playerX + dx;
            let newY = playerY + dy;
            if (newX < 0 || newX > GRID_COLS - 2 ||
                newY < 0 || newY > GRID_ROWS - 1)
            {
                return;
            }
            playerX = newX;
            playerY = newY;
            player.setPosition(gridX(playerX + .5), gridY(playerY));
        };
        move_character(0,0);

        let try_selection = function () {
            let left_square = grid[playerX][playerY];
            let right_square = grid[playerX+1][playerY];

            if (left_square.data.values.locked || right_square.data.values.locked) {
                return;
            }

            swap_square(left_square, right_square);
            merge_squares(playerY);
        };

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
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
