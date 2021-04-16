const GRID_SIZE = 128;
const SCREEN_WIDTH = 16 * GRID_SIZE; //1025
const SCREEN_HEIGHT = 9 * GRID_SIZE; //576

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
            "0%", { font: GRID_SIZE/2 + 'px PressStart2P', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.spritesheet('BWKnight', 'assets/BWKnight.png',
            { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('slash', 'assets/slash.png',
            { frameWidth: 1024, frameHeight: 432 });
        this.load.spritesheet('sword', 'assets/sword.png',
            { frameWidth: 32, frameHeight: 32 });

        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once(Phaser.Loader.Events.COMPLETE,  function() {
            scene.scene.start('GameScene');
            scene.scene.stop('LoadScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'slash_anim',
            frames: scene.anims.generateFrameNumbers('slash',
                { start: 0, end: 3 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let LayoutManager = {
    align_physics_object: function(object, x,y) {
        object.body.x = x - object.body.width/2;
        object.body.y = y - object.body.height/2;
    }
};

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    __addCharacter: function(scene) {
        let CHARACTER_SPRITE_SIZE = 8;
        let CHARACTER_SPRITE_SCALE = 4;
        let character_width = CHARACTER_SPRITE_SIZE * CHARACTER_SPRITE_SCALE;
        let character_height = CHARACTER_SPRITE_SIZE * CHARACTER_SPRITE_SCALE;

        let character_sprite_offset = new Phaser.Math.Vector2(
            0, 0
        );
        let character_sprite = scene.add.sprite(0,0,
            'BWKnight', 0)
            .setScale(CHARACTER_SPRITE_SIZE);

        let hit_box_offset = new Phaser.Math.Vector2(
            0 * character_width, 0 * character_height
        );
        let hit_box = scene.add.rectangle(0, 0,
            character_width/2,character_height,0x00ff00, 0);
        scene.physics.add.existing(hit_box);

        let solid_box_offset = new Phaser.Math.Vector2(
            0 * character_width, 0 * character_height
        );
        let solid_box = scene.add.rectangle(0, 0,
            character_width/2,character_height,0x0000ff, 0);
        scene.physics.add.existing(solid_box);

        let ready_to_fire = true;
        let strike_box_offset = new Phaser.Math.Vector2(
            0 * character_width, 0*character_height);
        let strike_box = scene.add.sprite(0,0, 'slash', 0)
            .setScale(CHARACTER_SPRITE_SIZE/12)
            .setVisible(false);

        let hurt_box_offset = new Phaser.Math.Vector2(
            5 * character_width, 0 * character_height);
        let hurt_box = scene.add.rectangle(0,0, 7*character_width, 7*character_height,
            0xff00000, 0);
        scene.physics.add.existing(hurt_box);

        let sword_sprite_offset = new Phaser.Math.Vector2(
            2.5 * character_width, 2.5 * character_height);
        let sword_sprite = scene.add.sprite(0,0, 'sword', 0)
            .setScale(CHARACTER_SPRITE_SCALE);

        character_sprite.update = function () {
            let center_x = solid_box.body.x + solid_box.width / 2;
            let center_y = solid_box.body.y + solid_box.height / 2;

            character_sprite.setPosition(center_x + character_sprite_offset.x,
                center_y + character_sprite_offset.y);

            LayoutManager.align_physics_object(hit_box,
                center_x + hit_box_offset.x,
                center_y + hit_box_offset.y);

            let rotation_center_x = character_sprite.x;
            let rotation_center_y = character_sprite.y;

            strike_box.setPosition(rotation_center_x + strike_box_offset.x,
                rotation_center_y + strike_box_offset.y);

            LayoutManager.align_physics_object(hurt_box,
                rotation_center_x + hurt_box_offset.x,
                rotation_center_y + hurt_box_offset.y);

            sword_sprite.setPosition(rotation_center_x + sword_sprite_offset.x,
                rotation_center_y + sword_sprite_offset.y);
            align_to_mouse_angle();
        };

        let mouse_vector = new Phaser.Math.Vector2(1, 0);
        let offset_angle = 180;
        let align_to_mouse_angle = () => {
            let angle = mouse_vector.angle();
            strike_box.setAngle(Phaser.Math.RadToDeg(angle));
            hurt_box_offset.setAngle(angle);
            sword_sprite_offset.setAngle(angle + Phaser.Math.DegToRad(offset_angle));
            let correction_angle = sword_sprite.flipY ? 45: - 45;
            sword_sprite.setAngle(Phaser.Math.RadToDeg(angle) + correction_angle + offset_angle);
            character_sprite.setFlipX(mouse_vector.x < 0);
        };
        character_sprite.__pointer_move = (pointer) => {
            let rotation_center_x = character_sprite.x;
            let rotation_center_y = character_sprite.y;
            let dx = pointer.worldX - rotation_center_x;
            let dy = pointer.worldY - rotation_center_y;
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            align_to_mouse_angle();
        };

        character_sprite.__input = (input) => {
            let dx = 0;
            let dy = 0;
            if (input.left) {
                dx -= 1;
            }
            if (input.right) {
                dx += 1;
            }
            if (input.up) {
                dy -= 1;
            }
            if (input.down) {
                dy += 1;
            }
            if (input.fire) {
                if (ready_to_fire) {
                    ready_to_fire = false;
                    strike_box.play('slash_anim');
                    strike_box.setVisible(true);
                    let polarity = strike_box.flipY ? -1: 1;
                    sword_sprite.setFlipY(!sword_sprite.flipY);
                    let sword_tween = scene.tweens.add({
                        targets: {offset_angle: -polarity * 180},
                        props: {offset_angle: polarity * 180},
                        onUpdate: () => {
                            offset_angle = sword_tween.getValue();
                        },
                        duration: 150,
                    });
                    scene.cameras.main.shake(50, 0.005, true);
                    strike_box.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        strike_box.setVisible(false);
                        ready_to_fire = true;
                        strike_box.setFlipY(!strike_box.flipY);
                    });
                }
            }
            //normalize
            let d = Math.sqrt(dx * dx + dy * dy);
            let v = 90*GRID_SIZE/16;
            if (d !== 0) {
                dx = dx / d * v;
                dy = dy / d * v;
            }

            solid_box.body.setVelocity(dx,dy);
            character_sprite.update();
        };

        return character_sprite;
    },

    //--------------------------------------------------------------------------
    create: function () {
        console.log(Phaser.VERSION);
        let scene = this;
        scene.__updateables = scene.add.group({
            runChildUpdate: true,
        });

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0x000060)
            .setAltFillStyle(0x000080)
            .setOutlineStyle();

        scene.input.addPointer(5);
        //scene.input.setPollAlways();

        scene.__character_sprite = scene.__addCharacter(scene);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, scene.__character_sprite.__pointer_move);

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");

        scene.cameras.main.setBounds(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__character_sprite, true, 1, 1, 0, 0);

        let score_text = scene.add.text(GRID_SIZE*4,GRID_SIZE*1,"00000000", { font: GRID_SIZE*3/4 + 'px PressStart2P', fill: '#FFF' })
            .setOrigin(0.5,0.5)
            .setScrollFactor(0)
            .setAngle(7.5);
        scene.tweens.add({
            targets: score_text,
            angle: -7.5,
            yoyo: true,
            repeat: -1,
            duration: 2000
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let input = {
            up: false,
            down: false,
            left: false,
            right: false,
            fire: false,
        };

        if (scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown) {
            input.left = true;
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            input.right = true;
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            input.up = true;
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            input.down = true;
        }
        if (scene.input.activePointer.leftButtonDown()) {
            input.fire = true;
        }

        scene.__character_sprite.__input(input);
    },
});

let config = {
    backgroundColor: '#000000',
    type: Phaser.WEBGL,
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
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
