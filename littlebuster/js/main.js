const GRID_SIZE = 96;
const SCREEN_COLUMNS = 20;
const SCREEN_ROWS = 10;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
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
        scene.load.svg('interact', 'assets/pan_tool-white-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.svg('analyze', 'assets/visibility-white-36dp.svg', {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.spritesheet('character', 'assets/Animation_number_one_walking.png',
            { frameWidth: 34, frameHeight: 72, spacing: 1});
        scene.load.audio('footsteps', ['assets/422856__ipaddeh__footsteps-cave-01.wav']);
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.G = {};
        scene.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character'),
            frameRate: 24,
            repeat: -1
        });

        let add_character = function (scene) {
            let footsteps = scene.sound.add('footsteps', {loop: true });
            let sprite = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'character',0)
                .setScale(3)
                .setOrigin(0,0);

            let dialogue_text = scene.add.text(GRID_SIZE,SCREEN_HEIGHT - GRID_SIZE*3/4,
                '',{ fontSize: GRID_SIZE/2, fill: '#FFF' })
                .setOrigin(0,0)
                .setDepth(DEPTHS.HUD+1);
            let expected_text = '';
            scene.time.addEvent({
                "delay": 35,
                "loop": true,
                "callback": function () {
                    if (dialogue_text.text.length < expected_text.length) {
                        dialogue_text.setText(
                            expected_text.substr(0,dialogue_text.text.length+1));
                    }
                }
            });
            let setText = function(text) {
                expected_text = text;
                dialogue_text.setText('');
            };

            let analyze_text = scene.add.image(-GRID_SIZE, -GRID_SIZE/4,'analyze')
                .setOrigin(0.5,0.5)
                .setAlpha(0)
                //.setAngle(-30);
            sprite.setData('doAnalyze', function() {
                if (sprite.data.values.current_object &&
                    sprite.data.values.current_object.data.values.analyze) {
                    setText(sprite.data.values.current_object.data.values.analyze);
                }
            });
            let analyze_prompt = scene.add.text(-GRID_SIZE * .6, -GRID_SIZE*3/4, '1',
                { fontSize: GRID_SIZE/2, fill: '#FFF' })
                .setOrigin(0.5)
                .setAlpha(0)
                .setAlign('center');
            let analyze_container = scene.add.container(0,0);
            let interact_container = scene.add.container(0,0);
            let ui_container_offsetX = sprite.displayWidth/2;
            let ui_container_offsetY = sprite.displayHeight/2;
            let ui_container = scene.add.container(sprite.x + ui_container_offsetX,
                sprite.y + ui_container_offsetY)
                .setDepth(DEPTHS.HUD);
            let interact_text = scene.add.image(GRID_SIZE, -GRID_SIZE*.45,'interact')
                .setOrigin(0.5,0.5)
                .setAlpha(0)
            sprite.setData('doInteract', function() {
                if (sprite.data.values.current_object &&
                    sprite.data.values.current_object.data.values.interact) {
                    setText(sprite.data.values.current_object.data.values.interact);
                }
            });
            let interact_prompt = scene.add.text(GRID_SIZE * .6, -GRID_SIZE*3/4, '2',
                { fontSize: GRID_SIZE/2, fill: '#FFF' })
                .setOrigin(0.5)
                .setAlpha(0)
                .setAlign('center');
            analyze_container.add([analyze_text, analyze_prompt]);
            analyze_container.setAngle(-15);
            interact_container.add([interact_text, interact_prompt]);
            interact_container.setAngle(15);
            ui_container.add([interact_container, analyze_container]);

            let analyze_text_tween_queue = [];
            let add_tween_to_queue = function(tween) {
                analyze_text_tween_queue.push(tween);
                if (analyze_text_tween_queue.length === 1) {
                    //I'm the only thing in the queue, run me!
                    scene.tweens.add(tween);
                }
            };
            let open_analyze = function () {
                let tween =
                {
                    targets: [analyze_text, analyze_prompt, interact_text, interact_prompt],
                    alpha: 0.5,
                    //scale: 1,
                    duration: 500,
                    onComplete: function() {
                        analyze_text_tween_queue.shift();
                        if (analyze_text_tween_queue.length > 0) {
                            scene.tweens.add(analyze_text_tween_queue[0]);
                        }
                    }
                };
                add_tween_to_queue(tween);
            };
            let close_analyze = function () {
                let tween =
                    {
                        targets: [analyze_text, analyze_prompt, interact_text, interact_prompt],
                        alpha: 0,
                        //scale: 0,
                        duration: 250,
                        onComplete: function() {
                            analyze_text_tween_queue.shift();
                            if (analyze_text_tween_queue.length > 0) {
                                scene.tweens.add(analyze_text_tween_queue[0]);
                            }
                        }
                    };
                add_tween_to_queue(tween);
            };

            let collision_box_offset = sprite.displayHeight - GRID_SIZE/8;
            let sprite_collision_box = scene.add.rectangle(SCREEN_WIDTH/2,
                SCREEN_HEIGHT/2 + collision_box_offset,
                sprite.displayWidth,GRID_SIZE/8,0xffffff,0)
                .setOrigin(0,0);
            scene.physics.add.existing(sprite_collision_box);

            sprite.setData('addCollider', function(physics, group) {
               physics.add.collider(sprite_collision_box, group);
            });

            sprite.setData('isOverlapping', false);
            sprite.setData('current_object', null);

            let onOverlapStart = function()  {
                open_analyze();
            };

            let onOverlapStop = function() {
                close_analyze();

                sprite.setData('current_object',null);
                sprite.setData('isOverlapping',false);
            };

            let analyze = function(sprite_collision_box, object) {
                if (!sprite.data.values.current_object &&
                    sprite.data.values.current_object !== object) {
                    sprite.setData('current_object',object);
                    onOverlapStart();
                }
                sprite.setData('isOverlapping',true);
            };

            sprite.setData('addOverlap', function(physics, group) {
                physics.add.overlap(sprite_collision_box, group, analyze, null, sprite);
            });
            sprite.setData('moving', false);
            sprite.setData('setVelocity',function(dx,dy) {
                let moving = false
                if (dx !== 0 || dy !== 0) {
                    moving = true;
                }
                if (moving !== sprite.data.values.moving) {
                    sprite.setData('moving', moving);
                    if (moving) {
                        footsteps.play();
                        sprite.anims.play('walk');
                    } else {
                        footsteps.stop();
                        sprite.anims.stop();
                    }
                }
                if (dx < 0) {
                    sprite.setFlipX(true);
                } else if (dx > 0) {
                    sprite.setFlipX(false);
                }
                sprite_collision_box.body.setVelocity(dx, dy);
            });

            let AABB = function(object1, object2) {
                return (object1.x < object2.x + object2.width &&
                    object1.x + object1.width > object2.x &&
                    object1.y < object2.y + object2.height &&
                    object1.y + object1.height > object2.y);
            };

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
                    dy -= 1;
                }
                if (cursor_keys.down.isDown) {
                    dy += 1;
                }
                //normalize
                let d = Math.sqrt(dx * dx + dy * dy);
                let v = GRID_SIZE * 2;
                if (d !== 0) {
                    dx = dx / d * v;
                    dy = dy / d * v;
                }

                sprite.data.values.setVelocity(dx,dy);

                sprite.x = sprite_collision_box.body.x;
                sprite.y = sprite_collision_box.body.y - collision_box_offset;
                sprite.setDepth(DEPTHS.NORMAL + sprite.y + sprite.displayHeight);
                /*
                analyze_text.x = sprite.x + analyze_text_offsetX;
                analyze_text.y = sprite.y + analyze_text_offsetY;
                interact_text.x = sprite.x + interact_text_offsetX;
                interact_text.y = sprite.y + interact_text_offsetY;
                */
                ui_container.x = sprite.x + ui_container_offsetX;
                ui_container.y = sprite.y + ui_container_offsetY;

                if (sprite.data.values.isOverlapping)
                {
                    if (!AABB(sprite_collision_box.body, sprite.data.values.current_object.body)) {
                        onOverlapStop();
                    }
                }
            };

            sprite.setActive(true);

            return sprite;
        };

        let platforms = scene.physics.add.staticGroup();
        let overlaps = scene.physics.add.staticGroup();

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE, GRID_SIZE, 0x000000)
            .setAltFillStyle(0x004000)
            .setOutlineStyle()
            .setDepth(DEPTHS.FLOOR);
        let interaction_zone = scene.add.rectangle(8 * GRID_SIZE, 3 * GRID_SIZE,
            GRID_SIZE,GRID_SIZE,0xFFFFFF,0)
            .setOrigin(0,0)
            .setDepth(DEPTHS.FLOOR);
        interaction_zone.setData('analyze','A featureless wall.');
        interaction_zone.setData('interact',"I can't do anything with that.");
        overlaps.add(interaction_zone);

        scene.G.player = add_character(scene);

        let obstacle = scene.add.rectangle(7*GRID_SIZE,0,GRID_SIZE*3,GRID_SIZE*3,0x008000)
            .setOrigin(0,0)
            .setDepth(DEPTHS.NORMAL + 0 + GRID_SIZE * 3)
        platforms.add(obstacle);

        let obstacle2 = scene.add.rectangle(12*GRID_SIZE,5*GRID_SIZE,GRID_SIZE*2,GRID_SIZE*2,0x008000)
            .setOrigin(0,0)
            .setDepth(DEPTHS.NORMAL + 4*GRID_SIZE + GRID_SIZE * 3);
        let obstacle3 = scene.add.rectangle(12*GRID_SIZE,4.5*GRID_SIZE,GRID_SIZE*2,GRID_SIZE*2,0x00C000)
            .setOrigin(0,0)
            .setDepth(DEPTHS.NORMAL + 4*GRID_SIZE + GRID_SIZE * 3)
        platforms.add(obstacle2);
        let interaction_zone2 = scene.add.rectangle(11 * GRID_SIZE, 4 * GRID_SIZE,
            4*GRID_SIZE,4*GRID_SIZE,0xFFFFFF,0)
            .setOrigin(0,0)
            .setDepth(DEPTHS.FLOOR);
        interaction_zone2.setData('analyze','An empty table.');
        interaction_zone2.setData('interact',"I can't do anything with that.");
        overlaps.add(interaction_zone2);

        scene.add.rectangle(0*GRID_SIZE,8*GRID_SIZE,GRID_SIZE*22,GRID_SIZE*3,0x000000)
            .setOrigin(0,0)
            .setDepth(DEPTHS.NORMAL + 9*GRID_SIZE + GRID_SIZE * 1)
            .setStrokeStyle(GRID_SIZE/32, 0x004000);
        let obstacle4 = scene.add.rectangle(0*GRID_SIZE,9*GRID_SIZE,GRID_SIZE*20,GRID_SIZE*1,0x000000)
            .setOrigin(0,0)
            .setDepth(DEPTHS.NORMAL + 9*GRID_SIZE + GRID_SIZE * 1);
        platforms.add(obstacle4);


        scene.G.player.data.values.addCollider(scene.physics, platforms);
        scene.G.player.data.values.addOverlap(scene.physics, overlaps);

        scene.G.player.data.values.addCursorKeys(scene.input.keyboard.createCursorKeys());
        let analyze_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        analyze_key.on(Phaser.Input.Keyboard.Events.DOWN,
            scene.G.player.data.values.doAnalyze);
        let interact_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        interact_key.on(Phaser.Input.Keyboard.Events.DOWN,
            scene.G.player.data.values.doInteract);
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
