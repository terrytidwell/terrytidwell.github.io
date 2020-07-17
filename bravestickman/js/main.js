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
        scene.load.spritesheet('character', 'assets/IMG_0015.png',
            { frameWidth: 256, frameHeight: 512});
        scene.load.image('bg', 'assets/IMG_0011.PNG');
        scene.load.image('bg2', 'assets/IMG_0013.PNG');
        scene.load.image('fg', 'assets/IMG_0012.PNG');
        scene.load.image('speech_bubble', 'assets/speech_bubble.png');
        //scene.load.audio('footsteps', ['assets/422856__ipaddeh__footsteps-cave-01.wav']);
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.G = {};
        scene.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character'),
            frameRate: 14,
            repeat: -1
        });



        let add_character = function (scene) {
            let STATES = {
                PRE_TALKING: -1,
                TALKING:0,
                IDLE:1,
                DONE_TALKING:2
            };

            let sprite_shadow = scene.add.sprite(SCREEN_WIDTH/2+GRID_SIZE/8, SCREEN_HEIGHT/2+66, 'character',0)
                .setScale(1)
                .setOrigin(0.5,0.5)
                .setTintFill(0x000000)
                .setAlpha(0.5);
            let sprite = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2+66, 'character',0)
                .setScale(1)
                .setOrigin(0.5,0.5);

            let dialogue_box_shadow = scene.add.image(SCREEN_WIDTH/2,GRID_SIZE*1.375+GRID_SIZE/8,'speech_bubble')
                .setAlpha(0)
                .setTintFill(0x000000)
                .setAlpha(0);
            let dialogue_box = scene.add.image(SCREEN_WIDTH/2,GRID_SIZE*1.375,'speech_bubble')
                .setAlpha(0);
            let dialogue_text = scene.add.text(GRID_SIZE*3/4,GRID_SIZE*3/8,
                '',{ fontSize: GRID_SIZE*3/4, fontFamily:'schoolbell', fill: '#000' })
                .setOrigin(0,0)
                .setAlpha(0);
            /*let dialogue_text_2 = scene.add.text(GRID_SIZE*3/4,GRID_SIZE,
                'BRAVE STICKMAN',{ fontSize: GRID_SIZE*3/4, fontFamily:'schoolbell', fill: '#000' })
                .setOrigin(0,0);
            */

            sprite.setData('state',STATES.IDLE);

            let expected_text = '';

            scene.time.addEvent({
                "delay": 35,
                "loop": true,
                "callback": function () {
                    if (sprite.data.values.state !== STATES.TALKING) {
                        return true;
                    }
                    if (dialogue_text.text.length < expected_text.length) {
                        dialogue_text.setText(
                            expected_text.substr(0,dialogue_text.text.length+1));
                    } else {
                        sprite.setData('state',STATES.DONE_TALKING);
                    }
                }
            });
            let setText = function(text) {
                sprite.setData('state',STATES.PRE_TALKING);
                sprite.setData('destination_set',false);
                sprite.data.values.setVelocity(0,0);
                scene.tweens.add({
                    targets: [dialogue_box,dialogue_text],
                    alpha:1,
                    duration:250,
                    onComplete: function() {
                        sprite.setData('state',STATES.TALKING);
                        expected_text = text;
                        dialogue_text.setText('');
                    }
                });
                scene.tweens.add({
                    targets: [dialogue_box_shadow],
                    alpha:0.5,
                    duration:250
                });
            };
            sprite.setData('setText',setText);

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
                        sprite_shadow.anims.play('walk');

                    } else {
                        sprite.anims.stop();
                        sprite_shadow.anims.stop();
                        sprite.setTexture('character',0);
                        sprite_shadow.setTexture('character',0);
                    }
                }
                if (dx < 0) {
                    sprite.setFlipX(true);
                    sprite_shadow.setFlipX(true);
                } else if (dx > 0) {
                    sprite.setFlipX(false);
                    sprite_shadow.setFlipX(false);
                }
            });

            let calculate_dx = function(x) {
                if (sprite.x > x) {
                    return -1;
                }
                return 1;
            };

            sprite.setData('destination_set', false);
            sprite.setData('destination_x',0);
            sprite.setData('destination_dx',0);
            sprite.setData('setDestination',function(x) {
                sprite.setData('destination_x', x);
                sprite.setData('destination_set',true);
                sprite.setData('destination_dx', calculate_dx(x));
                if (sprite.flipX && sprite.data.values.destination_dx === -1 ||
                    !sprite.flipX && sprite.data.values.destination_dx === 1) {
                    if (Math.abs(x - sprite.x) < GRID_SIZE) {
                        //nvm do nothing we are already facing that direction
                        //and we are already close enough (avoids weird slide)
                        sprite.setData('destination_set', false);
                    }
                }
            });

            sprite.setData('handleClick',function(pointer) {
               if (sprite.data.values.state === STATES.TALKING) {
                   dialogue_text.setText(expected_text);
               } else if (sprite.data.values.state === STATES.DONE_TALKING) {
                   scene.tweens.add({
                       targets: [dialogue_box,dialogue_box_shadow,dialogue_text],
                       alpha:0,
                       duration:250,
                       onComplete: function() {
                           expected_text = '';
                           dialogue_text.setText('');
                           sprite.setData('state',STATES.IDLE);
                       }
                   });
               } else if (sprite.data.values.state === STATES.IDLE) {
                   sprite.data.values.setDestination(pointer.x);
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
                if (sprite.data.values.state !== STATES.IDLE) {
                    return;
                }
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
                if (d !== 0) {
                    sprite.setData('destination_set', false);
                }
                if (sprite.data.values.destination_set) {
                    if (sprite.data.values.destination_dx !==
                        calculate_dx(sprite.data.values.destination_x)) {
                        //you've made it (or overshot)
                        sprite.setData('destination_set', false);
                    } else {
                        dx = sprite.data.values.destination_dx;
                        d = 1;
                    }
                }
                let v = GRID_SIZE / 16;
                if (d !== 0) {
                    dx = dx / d * v;
                    dy = dy / d * v;
                }


                sprite.data.values.setVelocity(dx,dy);
                sprite.x += sprite.data.values.dx;
                sprite_shadow.x += sprite.data.values.dx;
            };

            sprite.setActive(true);

            return sprite;
        };

        scene.add.image(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,'bg');
        let book = scene.add.image(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,'bg2');
        let highlight = scene.add.polygon(0,0,[852,432,826,415,703,411,674,429]).setOrigin(0);
        scene.G.player = add_character(scene);
        //scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,SCREEN_WIDTH,SCREEN_HEIGHT,'#000000',0.5);
        scene.add.image(SCREEN_WIDTH/2+GRID_SIZE/8,SCREEN_HEIGHT/2,'fg')
            .setTintFill(0x000000)
            .setAlpha(0.5);
        scene.add.image(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,'fg');

        scene.G.player.data.values.addCursorKeys(scene.input.keyboard.createCursorKeys());
        let shape = new Phaser.Geom.Polygon([852,432,826,415,703,411,674,429]);

        let zone = scene.add.zone(0,0,SCREEN_HEIGHT,SCREEN_WIDTH)
            .setOrigin(0)
            .setInteractive(shape, Phaser.Geom.Polygon.Contains);
        zone.on('pointerdown',function() {
            scene.tweens.add({
                targets: [book,highlight],
                alpha: 0
            });
            scene.G.player.data.values.setText("MY DAD'S DIARY, MAYBE THERE'S A CLUE?");
            zone.disableInteractive();
        });
        scene.input.on('pointerdown', function (pointer) {
            scene.G.player.data.values.handleClick(pointer);
            console.log(pointer.x, pointer.y);
        }, this);

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
