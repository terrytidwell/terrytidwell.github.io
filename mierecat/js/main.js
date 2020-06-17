const GRID_SIZE = 32;
const SCREEN_COLUMNS = 10;
const SCREEN_ROWS = 10;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS;
const DEPTHS =
{
    BG : 0,
    BLOCK: 10,
    PLAYER_BLOCK: 20,
    PLAYER: 30,
    PLAYER_BORDER: 31,
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
        this.load.spritesheet('squids', 'assets/squids.png', { frameWidth: 32, frameHeight: 32});
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x)
        {
            return x * GRID_SIZE + GRID_SIZE/2;
        }

        let yPixel = function(y)
        {
            return y * GRID_SIZE + GRID_SIZE/2;
        }

        for (let x = 0; x < SCREEN_COLUMNS; x++)
        {
            for (let y = 0; y < SCREEN_ROWS; y++)
            {
                let value = [0,0,0,1,2][Phaser.Math.Between(0, 4)];
                scene.add.sprite(xPixel(x),yPixel(y),'squids', value);
                if (y !== 0 && y !== SCREEN_ROWS - 1) {
                    //do nothing
                }
            }
        }
        for (let x = 0; x < 4; x++)
        {
            scene.add.sprite(xPixel(x),yPixel(0),'squids',3);
        }
        for (let x = SCREEN_COLUMNS - 1; x > SCREEN_COLUMNS - 5; x--)
        {
            scene.add.sprite(xPixel(x),yPixel(SCREEN_ROWS - 1),'squids',5);
        }

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);
        /*
        screen.m_cursor_keys = screen.input.keyboard.createCursorKeys();
        screen.m_cursor_keys.down.on('down', function(event) {
            move_character(0,1)});
        screen.m_cursor_keys.up.on('down', function(event) {
            move_character(0,-1)});
        screen.m_cursor_keys.left.on('down', function(event) {
            move_character(-1,0)});
        screen.m_cursor_keys.right.on('down', function(event) {
            move_character(1,0)});
        screen.space_key = screen.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        screen.space_key.on('down', try_selection);
         */
    },

    update: function () {
        let scene = this;
    }
});

let config = {
    backgroundColor: '#000000',
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
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ GameScene ]
};

game = new Phaser.Game(config);