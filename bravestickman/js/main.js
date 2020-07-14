const GRID_SIZE = 64;
const SCREEN_HEIGHT = 768;
const SCREEN_WIDTH = 1024;
const DEPTHS =
{
    FLOOR : 0,
    NORMAL : 1000,
    HUD: 2000
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
        //scene.load.svg('interact', 'assets/pan_tool-white-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        //scene.load.svg('analyze', 'assets/visibility-white-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.spritesheet('character', 'assets/Brave.png',
            { frameWidth: 64, frameHeight: 128});
        scene.load.image('bg', 'assets/office.jpg');
        //scene.load.audio('footsteps', ['assets/422856__ipaddeh__footsteps-cave-01.wav']);
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.G = {};
        scene.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character'),
            frameRate: 12,
            repeat: -1
        });

        let add_character = function (scene) {
            let sprite = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2+64, 'character',0)
                .setScale(4)
                .setOrigin(0.5,0.5);

            sprite.setData('moving', false);
            sprite.setData('dx',0);
            sprite.setData('setVelocity',function(dx,dy) {
                let moving = false;
                if (dx !== 0 || dy !== 0) {
                    moving = true;
                }
                sprite.data.values.dx = dx;
                if (moving !== sprite.data.values.moving) {
                    sprite.setData('moving', moving);
                    if (moving) {
                        sprite.anims.play('walk');

                    } else {
                        sprite.anims.stop();
                        sprite.setTexture('character',0);
                    }
                }
                if (dx < 0) {
                    sprite.setFlipX(true);
                } else if (dx > 0) {
                    sprite.setFlipX(false);
                }
            });

            let cursor_keys = {
                left: {isDown:false},
                right: {isDown:false},
                up: {isDown:false},
                down: {isDown:false},
            };
            sprite.setData('addCursorKeys', function(keys) {
                cursor_keys = keys;
            });

            sprite.update = function() {
                let dx = 0;
                let dy = 0;
                if (cursor_keys.left.isDown) {
                    dx -= 1;
                }
                if (cursor_keys.right.isDown) {
                    dx += 1;
                }
                if (cursor_keys.up.isDown) {
                    //dy -= 1;
                }
                if (cursor_keys.down.isDown) {
                    //dy += 1;
                }
                //normalize
                let d = Math.sqrt(dx * dx + dy * dy);
                let v = GRID_SIZE / 32;
                if (d !== 0) {
                    dx = dx / d * v;
                    dy = dy / d * v;
                }

                sprite.data.values.setVelocity(dx,dy);
                sprite.x += sprite.data.values.dx;
            };

            sprite.setActive(true);

            return sprite;
        };

        scene.add.image(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,'bg');
        scene.G.player = add_character(scene);

        scene.G.player.data.values.addCursorKeys(scene.input.keyboard.createCursorKeys());
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        scene.G.player.update();
        //scene.G.lightLayer.update();
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
    scene: [ LoadScene ]
};

game = new Phaser.Game(config);
