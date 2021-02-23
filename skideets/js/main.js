const GRID_SIZE = 50;
//const SPRITE_SCALE = GRID_SIZE/32;
const GRID_COLS = 16;
const GRID_ROWS = 10;
const SCREEN_WIDTH = 1280; //845 + 400; //845; //1025
const SCREEN_HEIGHT = 768; //542 + 150; //542; //576

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
        this.load.image('l_scanline', 'assets/Play Grid/L_Scanline.png');
        this.load.image('r_scanline', 'assets/Play Grid/R_Scanline.png');
        //this.load.video('bg_video', 'assets/Play Grid/Background Video/dynamic lines.mp4');

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

        let colors = 6;
        let grid = [];
        for (let x = 0; x < GRID_COLS; x++)
        {
            grid.push([]);
            for (let y = 0; y < GRID_ROWS; y++)
            {
                let chosen_color = Phaser.Math.Between(0, colors - 1);
                if (x !== 0)
                {
                    chosen_color = grid[x-1][y].data.values.color
                        + Phaser.Math.Between(1, colors - 1);
                    chosen_color %= colors;
                }

                let square = scene.add.sprite(gridX(x), gridY(y),
                    'boxes', chosen_color * 6).setAlpha(0.75);
                square.setData('color', chosen_color);
                square.setData('locked', false);
                grid[x].push(square);
                square.setVisible(y >= GRID_ROWS/2 - 2 && y <= GRID_ROWS/2 + 1);
            }
        }

        let playerX = GRID_COLS/2 - 1;
        let playerY = GRID_ROWS/2;
        let player = scene.add.sprite(0,0,'player_controller');
        let scanline = scene.add.sprite(0,0,'r_scanline');

        let scanlineX = 0;
        let scanlineDx = 1;

        let set_scanline = function() {
            scanline.setPosition(gridX(scanlineX), SCREEN_HEIGHT/2)
        }
        set_scanline();

        let update_scanline = function() {
            scanlineX += scanlineDx;
            if (scanlineX < 0 || scanlineX > GRID_COLS-1) {
                scanlineDx *= -1;
            }
            if (scanlineDx > 0) {
                scanline.setTexture('r_scanline');
            } else {
                scanline.setTexture('l_scanline');
            }
            set_scanline();
        }

        scene.time.addEvent({
            "delay": 60 * 1000 / 112,
            "loop": true,
            "callback": update_scanline
        });

        //SETUP INPUTS

        scene.input.addPointer(5);

        let left_test = function(x,y,test_color) {
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
            if (x + 1 < GRID_COLS && x - 1 >= 0 &&
                grid[x-1][y].data.values.color === test_color &&
                grid[x+1][y].data.values.color === test_color) {
                return true;
            }
            return false;
        };

        let right_test = function(x,y,test_color) {
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
            for(let x = 0; x < GRID_COLS; x++) {
                let test_color = grid[x][y].data.values.color;
                if (left_test(x,y,test_color)) {
                    grid[x][y].setTexture('boxes',test_color*6 + 1);
                    grid[x][y].setData('locked',true);
                }
                else if (middle_test(x,y,test_color)) {
                    grid[x][y].setTexture('boxes',test_color*6 + 2);
                    grid[x][y].setData('locked',true);
                }
                else if (right_test(x,y,test_color)) {
                    grid[x][y].setTexture('boxes',test_color*6 + 3);
                    grid[x][y].setData('locked',true);
                } else {
                    grid[x][y].setTexture('boxes',test_color*6);
                    grid[x][y].setData('locked',false);
                }
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
            let left_color = left_square.data.values.color;
            let right_square = grid[playerX+1][playerY];
            let right_color = right_square.data.values.color;
            if (left_square.data.values.locked || right_square.data.values.locked) {
                return;
            }
            left_square.setData('color',right_color);
            left_square.setTexture('boxes',right_color * 6);
            right_square.setData('color',left_color);
            right_square.setTexture('boxes',left_color * 6);
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
