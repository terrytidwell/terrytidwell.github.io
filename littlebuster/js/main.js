const GRID_SIZE = 64;
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
        scene.load.spritesheet('character', 'assets/Animation_number_one_walking.png',
            { frameWidth: 34, frameHeight: 72, spacing: 1});
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
            let sprite = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'character',0)
                .setScale(2)
                .setOrigin(0,0);

            let dialogue_text = scene.add.text(GRID_SIZE,SCREEN_HEIGHT - GRID_SIZE*3/4,
                '',{ fontSize: GRID_SIZE/2, fill: '#FFF' })
                .setOrigin(0,0)
                .setDepth(DEPTHS.HUD+1);

            let text_off_tween = null;
            let collision_box_offset = sprite.displayHeight - GRID_SIZE/8;
            let analyze_text_offsetX = 0;
            let analyze_text_offsetY = sprite.displayHeight/2;
            let analyze_text = scene.add.text(SCREEN_WIDTH/2 +analyze_text_offsetX,
                SCREEN_HEIGHT/2 + analyze_text_offsetY,'analyze',
                { fontSize: GRID_SIZE/2, fill: '#FFF' })
                .setOrigin(1,0.5)
                .setDepth(DEPTHS.HUD)
                .setVisible(false)
                .setInteractive();
            analyze_text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function() {
                if (sprite.data.values.current_object &&
                    sprite.data.values.current_object.data.values.analyze) {
                    dialogue_text.setText(sprite.data.values.current_object.data.values.analyze);
                }
            });
            let interact_text_offsetX = sprite.displayWidth;
            let interact_text_offsetY = sprite.displayHeight/2;
            let interact_text = scene.add.text(SCREEN_WIDTH/2 + interact_text_offsetX,
                SCREEN_HEIGHT/2 + interact_text_offsetY,'interact',
                { fontSize: GRID_SIZE/2, fill: '#FFF' })
                .setOrigin(0,0.5)
                .setDepth(DEPTHS.HUD)
                .setVisible(false)
                .setInteractive();
            interact_text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function() {
                if (sprite.data.values.current_object &&
                    sprite.data.values.current_object.data.values.interact) {
                    dialogue_text.setText(sprite.data.values.current_object.data.values.interact);
                }
            });

            let sprite_collision_box = scene.add.rectangle(SCREEN_WIDTH/2,
                SCREEN_HEIGHT/2 + collision_box_offset,
                sprite.displayWidth,GRID_SIZE/8,0xffffff,0)
                .setOrigin(0,0);
            scene.physics.add.existing(sprite_collision_box);

            sprite.setData('addCollider', function(physics, group) {
               physics.add.collider(sprite_collision_box, group);
            });

            sprite.setData('overlapTime', -1);
            sprite.setData('isOverlapping', false);
            sprite.setData('current_object', null);

            let onOverlapStart = function()  {
                analyze_text.setVisible(true);
                interact_text.setVisible(true);
            };

            let onOverlapStop = function() {
                analyze_text.setVisible(false);
                interact_text.setVisible(false);

                sprite.setData('current_object',null);
                sprite.setData('isOverlapping',false);
                sprite.setData('overlapTime',-1);
            };

            let analyze = function(sprite_collision_box, object) {
                if (!sprite.data.values.current_object ||
                    sprite.data.values.current_object !== object) {
                    sprite.setData('current_object',object);
                    onOverlapStart();
                }
                sprite.setData('isOverlapping', true);
                sprite.setData('overlapTime', scene.time.now);
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
                        sprite.anims.play('walk');
                    } else {
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
                analyze_text.x = sprite.x + analyze_text_offsetX;
                analyze_text.y = sprite.y + analyze_text_offsetY;
                interact_text.x = sprite.x + interact_text_offsetX;
                interact_text.y = sprite.y + interact_text_offsetY;

                if (sprite.data.values.isOverlapping)
                {
                    if (scene.time.now > sprite.data.values.overlapTime + 100) {
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
