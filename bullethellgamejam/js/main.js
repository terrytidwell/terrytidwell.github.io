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

        this.load.spritesheet('hero', 'assets/16x16 knight 1 v3.png',
            { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('slash', 'assets/slash.png',
            { frameWidth: 1024, frameHeight: 432 });

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
            repeat: -1
        });

        scene.anims.create({
            key: 'hero_idle',
            frames: scene.anims.generateFrameNumbers('hero',
                { start: 0, end: 4 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'hero_run',
            frames: scene.anims.generateFrameNumbers('hero',
                { start: 8, end: 15 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'hero_attack',
            frames: scene.anims.generateFrameNumbers('hero',
                { start: 32, end: 37 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });
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
        console.log(Phaser.VERSION);
        let scene = this;
        let CHARACTER_SPRITE_SIZE = 4;

        let layer = scene.add.layer().setPipeline('Light2D');

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle();
        layer.add(grid);

        scene.__shadow = scene.add.ellipse(0,0,
            12*CHARACTER_SPRITE_SIZE,4*CHARACTER_SPRITE_SIZE,0x000000, 0.5);

        scene.__character_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__character_y_offset = -16*CHARACTER_SPRITE_SIZE;
        scene.__character = scene.add.sprite(0,0,
            'hero', 0)
            .setScale(CHARACTER_SPRITE_SIZE);
        layer.add(scene.__character);

        scene.__hitbox_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__hitbox_y_offset = -8*CHARACTER_SPRITE_SIZE;
        scene.__hitbox = scene.add.rectangle(0, 0,
            6*CHARACTER_SPRITE_SIZE,20*CHARACTER_SPRITE_SIZE,0x00ff00, 0.0);
        scene.physics.add.existing(scene.__hitbox);

        //scene.__solidbox_x_offset = 0*CHARACTER_SPRITE_SIZE;
        //scene.__solidbox_y_offset = 13*CHARACTER_SPRITE_SIZE;
        scene.__solidbox = scene.add.rectangle(0,0,
            12*CHARACTER_SPRITE_SIZE,4*CHARACTER_SPRITE_SIZE,0xff0000, 0.0);
        scene.physics.add.existing(scene.__solidbox);

        scene.__strikebox = scene.add.sprite(0,0, 'slash', 0)
            .setScale(CHARACTER_SPRITE_SIZE/6)
            .play('slash_anim');
        scene.__strikebox_offset = new Phaser.Math.Vector2(
            0 * CHARACTER_SPRITE_SIZE, -8 * CHARACTER_SPRITE_SIZE);

        scene.__hurtbox = scene.add.rectangle(0,0, 64*CHARACTER_SPRITE_SIZE, 64*CHARACTER_SPRITE_SIZE,
            0xff00000, 0.0);
        scene.__hurtbox_offset = new Phaser.Math.Vector2(
            40 * CHARACTER_SPRITE_SIZE, 0 * CHARACTER_SPRITE_SIZE);
        scene.physics.add.existing(scene.__hurtbox);

        scene.__align_player_group = function () {
            let align_physics_object = function(object, x,y) {
                object.body.x = x - object.body.width/2;
                object.body.y = y - object.body.height/2;
            };

            let center_x = scene.__solidbox.body.x + scene.__solidbox.width / 2;
            let center_y = scene.__solidbox.body.y + scene.__solidbox.height / 2;

            scene.__character.setPosition(center_x + scene.__character_x_offset,
                center_y + scene.__character_y_offset);

            scene.__shadow.setPosition(center_x, center_y);

            align_physics_object(scene.__hitbox,
                center_x + scene.__hitbox_x_offset,
                center_y + scene.__hitbox_y_offset);

            scene.__strikebox.setPosition(center_x + scene.__strikebox_offset.x,
                center_y + scene.__strikebox_offset.y);

            align_physics_object(scene.__hurtbox,
                center_x + scene.__hurtbox_offset.x,
                center_y + scene.__hurtbox_offset.y + scene.__hitbox_y_offset);
        };
        scene.__align_player_group();

        scene.input.addPointer(5);
        //scene.input.setPollAlways();

        let mouse_vector = new Phaser.Math.Vector2(0, 0);

        scene.input.on(Phaser.Input.Events.POINTER_MOVE, function(pointer) {
            let center_x = scene.__hitbox.body.x + scene.__hitbox.width / 2;
            let center_y = scene.__hitbox.body.y + scene.__hitbox.height / 2;
            let dx = pointer.worldX - center_x;
            let dy = pointer.worldY - center_y;
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            let angle = mouse_vector.angle();
            scene.__strikebox.setAngle(Phaser.Math.RadToDeg(angle));
            scene.__hurtbox_offset.setAngle(angle);
            scene.__character.setFlipX(dx < 0);
        });

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey("q");

        scene.__moving = false;
        scene.__hitting = false;

        scene.cameras.main.setBounds(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__character, true, 1, 1, 0, 0);

        //scene.physics.add.collider(scene.__solidbox, platforms);

        /*
        let platforms = scene.physics.add.staticGroup();
        let overlaps = scene.physics.add.staticGroup();

        scene.G.player.data.values.addCollider(scene.physics, platforms);
        scene.G.player.data.values.addOverlap(scene.physics, overlaps);d
         */
        scene.__character.play('hero_idle');

        scene.lights.enable();
        scene.lights.setAmbientColor(0x000000);
        let light = scene.lights.addLight(0, 0, 200);

        scene.lights.addLight(0, 100, 140).setColor(0xff0000).setIntensity(3.0);
        scene.lights.addLight(0, 250, 140).setColor(0x00ff00).setIntensity(3.0);
        scene.lights.addLight(0, 400, 140).setColor(0xff00ff).setIntensity(3.0);
        scene.lights.addLight(0, 550, 140).setColor(0xffff00).setIntensity(3.0);


        let score_text = scene.add.text(GRID_SIZE*4,GRID_SIZE*1,"00000000", { font: GRID_SIZE*3/4 + 'px PressStart2P', fill: '#000' })
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

        if (scene.__hitting) {
            return;
        }

        if (scene.__cursor_keys.letter_one.isDown) {
            scene.__solidbox.body.setVelocity(0,0);
            scene.__character.anims.stop();
            scene.__character.play('hero_attack');
            scene.__hitting = true;
            scene.__moving = false;
            scene.time.delayedCall(500, function () {
                scene.__hitting = false;
                scene.__character.anims.stop();
                scene.__character.play('hero_idle');
            });
            return;
        }

        let dx = 0;
        let dy = 0;
        if (scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown) {
            dx -= 1;
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            dx += 1;
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            dy -= 1;
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            dy += 1;
        }
        //normalize
        let d = Math.sqrt(dx * dx + dy * dy);
        let v = 90*GRID_SIZE/16;
        if (d !== 0) {
            dx = dx / d * v;
            dy = dy / d * v;
        }



        let moving = false;
        if (dx !== 0 || dy !== 0) {
            moving = true;
        }
        if (moving !== scene.__moving) {
            scene.__moving = moving;
            if (moving) {
                scene.__character.anims.stop();
                scene.__character.play('hero_run');
            } else {
                scene.__character.anims.stop();
                scene.__character.play('hero_idle');
                //scene.__character.setTexture('hero', 0);
            }
        }
        /*
        if (dx < 0) {
            scene.__character.setFlipX(true);
        } else if (dx > 0) {
            scene.__character.setFlipX(false);
        }
         */
        scene.__solidbox.body.setVelocity(dx,dy);
        scene.__align_player_group()
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
            debug: true
        }
    },
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
