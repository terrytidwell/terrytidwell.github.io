const GRID_SIZE = 64;
const SCREEN_HEIGHT = 768;
const SCREEN_WIDTH = 1024;
const DEPTHS =
{
    BG : 0,
    MID : 1000,
    FORE : 2000,
    HUD: 3000,
    POINTER: 4000,
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
                DONE_TALKING:2,
                PAUSE_TALKING:3,
            };

            let sprite_shadow = scene.add.sprite(SCREEN_WIDTH/2+GRID_SIZE/8, SCREEN_HEIGHT/2+66, 'character',0)
                .setScale(1)
                .setOrigin(0.5,0.5)
                .setTintFill(0x000000)
                .setAlpha(0.5)
                .setDepth(DEPTHS.MID-1);
            let sprite = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2+66, 'character',0)
                .setScale(1)
                .setOrigin(0.5,0.5)
                .setDepth(DEPTHS.MID);
            let dialogue_box_shadow = scene.add.image(SCREEN_WIDTH/2,GRID_SIZE*1.375+GRID_SIZE/8,'speech_bubble')
                .setAlpha(0)
                .setTintFill(0x000000)
                .setAlpha(0)
                .setDepth(DEPTHS.HUD-1);
            let dialogue_box = scene.add.image(SCREEN_WIDTH/2,GRID_SIZE*1.375,'speech_bubble')
                .setAlpha(0)
                .setDepth(DEPTHS.HUD);
            let text_x_offset = GRID_SIZE*3/4;
            let dialogue_text = scene.add.text(text_x_offset,GRID_SIZE*3/8,
                ['',''],{ fontSize: GRID_SIZE*3/4, fontFamily:'schoolbell', fill: '#000', lineSpacing:-GRID_SIZE/4 })
                .setOrigin(0,0)
                .setAlpha(0)
                .setDepth(DEPTHS.HUD+1);
            let max_text_width = SCREEN_WIDTH - 2*text_x_offset;

            sprite.setData('state',STATES.IDLE);

            let expected_text = [''];

            scene.time.addEvent({
                "delay": 35,
                "loop": true,
                "callback": function () {
                    if (sprite.data.values.state !== STATES.TALKING) {
                        return true;
                    }
                    if (dialogue_text.text.length < expected_text[0].length) {
                        dialogue_text.setText(
                            expected_text[0].substr(0,dialogue_text.text.length+1));
                    } else {
                        expected_text.shift();
                        if (expected_text.length === 0) {
                            sprite.setData('state',STATES.DONE_TALKING);
                        } else {
                            sprite.setData('state',STATES.PAUSE_TALKING);
                        }
                    }
                }
            });
            let setText = function(text) {
                sprite.setData('state',STATES.PRE_TALKING);
                sprite.setData('destination_set',false);
                sprite.data.values.setVelocity(0,0);
                if (!Array.isArray(text)) {
                    text = [text];
                }
                expected_text = [];

                let maximum_lines = 2;

                for (let line of text) {
                    let words = line.split(" ");
                    expected_text.push('');
                    let candidate_line = words.shift();
                    let current_line = 0;
                    let previous_line_part = '';
                    while (words.length !== 0) {
                        let next_word = words.shift();
                        let new_candidate_line = candidate_line + ' ' + next_word;
                        dialogue_text.setText(new_candidate_line);
                        if (max_text_width < dialogue_text.displayWidth) {
                            current_line++;
                            if (current_line === maximum_lines) {
                                expected_text[expected_text.length - 1] = previous_line_part + candidate_line;
                                previous_line_part = '';
                                expected_text.push('');
                                candidate_line = next_word;
                                current_line = 0;
                            }
                            else {
                                previous_line_part += candidate_line + '\n';
                                candidate_line = next_word;
                            }
                        } else {
                            candidate_line = new_candidate_line;
                        }
                    }
                    expected_text[expected_text.length - 1] = previous_line_part + candidate_line;
                }
                dialogue_text.setText('');

                scene.tweens.add({
                    targets: [dialogue_box,dialogue_text],
                    alpha:1,
                    duration:250,
                    onComplete: function() {
                        sprite.setData('state',STATES.TALKING);
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
            sprite.setData('destination_interaction',null);

            let handle_arrival = function() {
                if (sprite.data.values.destination_interaction) {
                    sprite.data.values.destination_interaction();
                }
                cancel_destination();
            };

            let cancel_destination = function() {
                sprite.setData('destination_set', false);
                sprite.setData('destination_interaction',null);
            };

            sprite.setData('setDestination',function(x,destination_interaction) {
                let dx = calculate_dx(x);
                let new_x = x - GRID_SIZE * dx;
                if (calculate_dx(new_x) === dx)
                {
                    x = new_x;
                }


                if (sprite.flipX && dx === -1 ||
                    !sprite.flipX && dx === 1) {
                    if (Math.abs(x - sprite.x) < GRID_SIZE) {
                        //nvm do nothing we are already facing that direction
                        //and we are already close enough (avoids weird slide)
                        sprite.setData('destination_interaction', destination_interaction);
                        handle_arrival();
                        return;
                    }
                }

                sprite.setData('destination_dx', dx);
                sprite.setData('destination_set',true);
                sprite.setData('destination_x', x);
                sprite.setData('destination_interaction', destination_interaction);
            });

            sprite.setData('handleClick',function(pointer,destination_interaction) {
               if (sprite.data.values.state === STATES.TALKING) {
                   dialogue_text.setText([expected_text[0], '']);
               } else if (sprite.data.values.state === STATES.PAUSE_TALKING) {
                   dialogue_text.setText(['']);
                   sprite.setData('state',STATES.TALKING);
               } else  if (sprite.data.values.state === STATES.DONE_TALKING) {
                   scene.tweens.add({
                       targets: [dialogue_box,dialogue_box_shadow,dialogue_text],
                       alpha:0,
                       duration:250,
                       onComplete: function() {
                           expected_text = '';
                           dialogue_text.setText(['','']);
                           sprite.setData('state',STATES.IDLE);
                       }
                   });
               } else if (sprite.data.values.state === STATES.IDLE) {
                   sprite.data.values.setDestination(pointer.x,destination_interaction);
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
                    cancel_destination();
                }
                if (sprite.data.values.destination_set) {
                    if (sprite.data.values.destination_dx !==
                        calculate_dx(sprite.data.values.destination_x)) {
                        //you've made it (or overshot)
                        handle_arrival();
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

        let circle = scene.add.circle(0,0,GRID_SIZE/16)
            .setStrokeStyle(GRID_SIZE/16,0x000000)
            .setAlpha(0)
            .setDepth(DEPTHS.POINTER)
            .setData('tween',null);
        let update_circle = function(x,y) {
            circle.setAlpha(0.5).setX(x).setY(y).setRadius(GRID_SIZE/16);
            if (circle.data.values.tween) {
                circle.data.values.tween.stop();
            };
            let tween = scene.tweens.add({
                targets:circle,
                radius: GRID_SIZE/8,
                alpha: 0,
                duration: 500
            });
            circle.setData('tween',tween);
        };

        scene.add.image(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,'bg').setDepth(DEPTHS.BG);
        let book = scene.add.image(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,'bg2').setDepth(DEPTHS.BG+1);
        scene.input.setTopOnly(true);
        scene.input.on('pointerdown', function (pointer) {
            event.stopPropagation();
            update_circle(pointer.x,pointer.y);
            scene.G.player.data.values.handleClick(pointer);
            console.log('pointer interaction',Math.round(pointer.x), Math.round(pointer.y));
        }, this);

        scene.G.player = add_character(scene);
        //scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,SCREEN_WIDTH,SCREEN_HEIGHT,'#000000',0.5);
        scene.add.image(SCREEN_WIDTH/2+GRID_SIZE/8,SCREEN_HEIGHT/2,'fg')
            .setTintFill(0x000000)
            .setAlpha(0.5)
            .setDepth(DEPTHS.FORE-1);
        scene.add.image(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,'fg')
            .setDepth(DEPTHS.FORE);

        scene.G.player.data.values.addCursorKeys(scene.input.keyboard.createCursorKeys());

        let shape_array = [852,432,826,415,703,411,674,429];
        let interaction_function = function(highlight, zone,pointer) {
            zone.disableInteractive();
            scene.G.player.data.values.handleClick(pointer,function() {
                scene.tweens.add({
                    targets: [book,highlight],
                    alpha: 0
                });
                scene.G.player.data.values.setText(
                    ["MY DAD'S DIARY, MAYBE THIS WILL HELP ME FIGURE OUT WHAT HAPPENED TO HIM? HE KEEPS NOTES ABOUT ALL HIS CRAZY IDEAS IN HERE.",
                        "...",
                        "I HOPE HE DOESN'T MIND ME READING IT..."]);
            });
        }

        let addInteractiveZone = function(shape_array, interaction_function) {
            let reshape = function(shape_array) {
                let x_min = shape_array[0];
                let x_max = shape_array[0];
                let y_min = shape_array[1];
                let y_max = shape_array[1];
                for(let i = 2; i < shape_array.length; i+=2) {
                    x_max = Math.max(x_max,shape_array[i]);
                    x_min = Math.min(x_min,shape_array[i]);
                    y_max = Math.max(y_max,shape_array[i+1]);
                    y_min = Math.min(y_min,shape_array[i+1]);
                }
                let width = x_max - x_min;
                let height = y_max - y_min;
                let x_center = Math.round(width/2) + x_min;
                let y_center = Math.round(height/2) + y_min;
                for (let i = 0; i < shape_array.length; i+=2) {
                    shape_array[i] -= x_min;
                    shape_array[i+1] -= y_min;
                }
                return {
                    x_center: x_center,
                    y_center: y_center,
                    width: width,
                    height: height,
                    shape_array: shape_array,
                };
            };
            let zone_object = reshape(shape_array);

            let shape = new Phaser.Geom.Polygon(zone_object.shape_array);

            let highlight = scene.add.polygon(
                zone_object.x_center, zone_object.y_center,zone_object.shape_array,0x6666ff,0.5)
                .setOrigin(0.5)
                .setDepth(DEPTHS.HUD+1);
            let zone = scene.add.zone(zone_object.x_center, zone_object.y_center,
                zone_object.width,zone_object.height)
                .setOrigin(0.5)
                .setInteractive(shape, Phaser.Geom.Polygon.Contains)
                .setDepth(DEPTHS.HUD);
            zone.on('pointerdown',function(pointer,localX,localY,event) {
                console.log('zone interaction');
                update_circle(pointer.x,pointer.y);
                event.stopPropagation();
                interaction_function(highlight,zone,pointer);
            });
        }
        addInteractiveZone(shape_array, interaction_function);
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        scene.G.player.update();
    },
});

let config = {
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    render: {
        pixelArt: false
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
