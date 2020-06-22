const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 256;

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('fighter_idle', 'assets/fighter_idle.png', { frameWidth: 128, frameHeight: 128});
    },

    //--------------------------------------------------------------------------
    create: function () {
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'fighter_idle', frame: 0 },
                { key: 'fighter_idle', frame: 1 },
                { key: 'fighter_idle', frame: 2 },
                { key: 'fighter_idle', frame: 3 }
            ],
            skipMissedFrames: false,
            frameRate: 4,
            repeat: -1
        });
        this.add.sprite(SCREEN_WIDTH/2 - 96, SCREEN_HEIGHT, 'fighter_idle', 0)
            .setOrigin(0.5, 1)
            .setScale(2)
            .play('walk');
        this.add.sprite(SCREEN_WIDTH/2 + 96, SCREEN_HEIGHT, 'fighter_idle', 0)
            .setOrigin(0.5, 1)
            .setScale(2)
            .setFlipX(true)
            .play('walk');
    },

    //--------------------------------------------------------------------------
    update: function() {
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
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ GameScene ]
};

game = new Phaser.Game(config);
