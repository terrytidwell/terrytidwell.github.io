const GRID_SIZE = 32;
const SCREEN_COLUMNS = 6;
const SCREEN_ROWS = 6;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS;

//const PNG_TO_GRID_SCALE = GRID_SIZE/PNG_GRID_SIZE;

let  StartScreen = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'StartScreen', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('blocks', 'assets/match3_character.png', { frameWidth: 32, frameHeight: 32,  margin: 1, spacing: 1});
    },

    //--------------------------------------------------------------------------
    create: function () {
        let screen = this;
        screen.input.addPointer(5);
        screen.me_state = 5;
        screen.grid = [];
        screen.me_x = 0;
        screen.me_y = 0;
        for (let x = 0; x < SCREEN_COLUMNS; x++) {
            screen.grid.push([]);
            for (let y = 0; y < SCREEN_ROWS; y++) {
                let value = Math.floor(Math.random() * 6)
                if (x == screen.me_x && y == screen.me_y && value == 5)
                {
                    value--;
                }
                if (value != 5) {
                    screen.grid[x].push({
                        valid: true,
                        value:value,
                        sprite: screen.add.tileSprite(
                            x * GRID_SIZE + GRID_SIZE/2,
                            y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE, GRID_SIZE, 'blocks',value)
                    });
                } else {
                    screen.grid[x].push({
                        valid: false,
                        value: value,
                        sprite: null});
                }
            }
        }

        screen.grid[screen.me_x][screen.me_y].sprite.setTexture('blocks', screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
        screen.time.addEvent({
            "delay": 750,
            "loop": true,
            "callback": function () {
                if (screen.me_state == 5) {
                    screen.me_state = 10;
                } else {
                    screen.me_state = 5;
                }
                screen.grid[screen.me_x][screen.me_y].sprite.setTexture('blocks', screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
            }
        });

        let move_character = function(delta_x, delta_y)
        {
            if (screen.me_x + delta_x < 0 ||
                screen.me_x + delta_x > screen.grid.length ||
                screen.me_y + delta_y < 0 ||
                screen.me_y + delta_y > screen.grid[screen.me_x + delta_x].length ||
                !screen.grid[screen.me_x + delta_x][screen.me_y + delta_y].valid
            )
            {
                //no move
                return;
            }
            screen.grid[screen.me_x][screen.me_y].sprite.setTexture('blocks', screen.grid[screen.me_x][screen.me_y].value);
            screen.me_x += delta_x;
            screen.me_y += delta_y;
            screen.grid[screen.me_x][screen.me_y].sprite.setTexture('blocks', screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
        };

        screen.m_cursor_keys = screen.input.keyboard.createCursorKeys();
        screen.m_cursor_keys.down.on('down', function(event) {
            move_character(0,1)});
        screen.m_cursor_keys.up.on('down', function(event) {
            move_character(0,-1)});
        screen.m_cursor_keys.left.on('down', function(event) {
            move_character(-1,0)});
        screen.m_cursor_keys.right.on('down', function(event) {
            move_character(1,0)});

    },

    update: function () {
    }
});

let config = {
    backgroundColor: '#050505',
    type: Phaser.AUTO,
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
            gravity: { y: 20 * GRID_SIZE },
            debug: false
        }
    },
    scene: [ StartScreen ]
};

game = new Phaser.Game(config);