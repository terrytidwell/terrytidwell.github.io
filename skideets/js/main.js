const GRID_SIZE = 50;
//const SPRITE_SCALE = GRID_SIZE/32;
const GRID_COLS = 16;
const GRID_ROWS = 10;
const SCREEN_WIDTH = 845; //1025
const SCREEN_HEIGHT = 542; //576

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


        this.load.image('grid', 'assets/Play Grid/EmptyGrid01.png');
        this.load.image('blue', 'assets/Boxes/Blue/Blue_Single.png');
        this.load.image('player_controller', 'assets/Play Grid/PlayerController.png');
        this.load.image('l_scanline', 'assets/Play Grid/L_Scanline.png');
        this.load.image('r_scanline', 'assets/Play Grid/R_Scanline.png');

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
            return SCREEN_WIDTH/2 + dx * GRID_SIZE - 27;
        };

        let gridY = function(y) {
            let dy = y - GRID_ROWS / 2;
            return SCREEN_HEIGHT/2 + dy * GRID_SIZE - 23;
        };


        for (let x=0; x < GRID_COLS; x++){
            for (let y=0; y < GRID_ROWS; y++) {
                //scene.add.sprite(gridX(x), gridY(y), 'blue');
            }
        }

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'grid');

        let playerX = GRID_COLS/2;
        let playerY = GRID_ROWS/2;
        let player = scene.add.sprite(0,0,'player_controller');
        let scanline = scene.add.sprite(0,0,'r_scanline');

        let scanlineX = 1;
        let scanlineDx = 1;

        let set_scanline = function() {
            scanline.setPosition(gridX(scanlineX), SCREEN_HEIGHT/2)
        }
        set_scanline();

        let update_scanline = function() {
            scanlineX += scanlineDx;
            if (scanlineX < 1 || scanlineX > GRID_COLS) {
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
            "delay": 60 * 1000 / 100,
            "loop": true,
            "callback": update_scanline
        });




        //SETUP INPUTS


        scene.input.addPointer(5);

        let move_character = function (dx, dy) {
            //valid range x = [1,GRID_COLS-1]
            //valid_range y = [0,GRID_COLS]
            let newX = playerX + dx;
            let newY = playerY + dy;
            if (newX < 1 || newX > GRID_COLS - 1 ||
                newY < 1 || newY > GRID_ROWS)
            {
                return;
            }
            playerX = newX;
            playerY = newY;
            player.setPosition(gridX(playerX + .5), gridY(playerY));
        };
        move_character(0,0);

        let try_selection = function () {};

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
