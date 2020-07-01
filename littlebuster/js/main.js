const GRID_SIZE = 64;
const SCREEN_COLUMNS = 20;
const SCREEN_ROWS = 10;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
const DEPTHS =
{
    BG : 0,
    GRID: 10,
    GUESS: 20,
    FG: 40,
    UI: 50
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
        scene.load.spritesheet('character', 'assets/Animation_number_one_walking.png',
            { frameWidth: 34, frameHeight: 72, spacing: 1});
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character'),
            frameRate: 12,
            repeat: -1
        });

        scene.grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE, GRID_SIZE, 0x000000)
            .setAltFillStyle(0x008000).setOutlineStyle();

        scene.character = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'character',0)
            .setScale(2);

        scene.character.setData('moving', false);

        scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let moving = false;
        if (scene.m_cursor_keys.left.isDown) {
            moving = true;
            scene.character.setFlipX(true);
            scene.character.x -= 2;
        }
        if (scene.m_cursor_keys.right.isDown) {
            moving = true;
            scene.character.setFlipX(false);
            scene.character.x += 2;
        }
        if (scene.m_cursor_keys.up.isDown) {
            moving = true;
            scene.character.y -= 2;
        }
        if (scene.m_cursor_keys.down.isDown) {
            moving = true;
            scene.character.y += 2;
        }
        if (moving !== scene.character.data.values.moving) {
            if (!moving) {
                scene.character.anims.stop();
            } else {
                scene.character.anims.play('walk');
            }
        }
        scene.character.setData('moving', moving);
    },
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
            gravity: { y: 30 },
            debug: false
        }
    },
    scene: [ LoadScene ]
};

game = new Phaser.Game(config);
