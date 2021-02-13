const GRID_SIZE = 64;
const SPRITE_SCALE = GRID_SIZE/32;
const SCREEN_WIDTH = 17 * GRID_SIZE; //1025
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
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);


        this.load.image('assault_rifle', 'assets/assault_rifle.png');
        this.load.image('shotgun', 'assets/shotgun.png');
        this.load.spritesheet('hero', 'assets/Adventurer Female Sprite Sheet.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('slash', 'assets/slash.png',
            { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('slime_medium', 'assets/Slime_Medium_Blue.png',
            { frameWidth: 32, frameHeight: 32 });

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
        let CHARACTER_SPRITE_SIZE = 3;

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle();

        let platforms = scene.physics.add.staticGroup();
        let floor = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT + 8,
            SCREEN_WIDTH, 16, 0xff0000, 1.0);
        platforms.add(floor);

        floor = scene.add.rectangle(SCREEN_WIDTH/2, - 8,
            SCREEN_WIDTH, 16, 0xff0000, 1.0);
        platforms.add(floor);

        let wall = scene.add.rectangle(SCREEN_WIDTH + 8, SCREEN_HEIGHT/2,
            16, SCREEN_HEIGHT, 0xff0000, 1.0)
            platforms.add(wall);
        wall = scene.add.rectangle(- 8, SCREEN_HEIGHT/2,
            16, SCREEN_HEIGHT, 0xff0000, 1.0)
        platforms.add(wall);

        let platform = scene.add.rectangle(4*GRID_SIZE, 7*GRID_SIZE,
            4 * GRID_SIZE, 8,
            0x000000, 1.0);
        platforms.add(platform);

        platform = scene.add.rectangle(4*GRID_SIZE, 2*GRID_SIZE,
            4 * GRID_SIZE, 8,
            0x000000, 1.0);
        platforms.add(platform);

        platform = scene.add.rectangle(5*GRID_SIZE, 4.5*GRID_SIZE,
            2 * GRID_SIZE, 8,
            0x000000, 1.0);
        platforms.add(platform);

        /*
        for (let n = 0; n < 60; n++) {
            let x = Phaser.Math.Between(-4, 19);
            let y = Phaser.Math.Between(-5, 14);
            let obstacle = scene.add.rectangle((x) * GRID_SIZE, (y - 0.5) * GRID_SIZE,
                GRID_SIZE, GRID_SIZE, 0x000000, 1.0)
                .setOrigin(0);
            platforms.add(obstacle);
        }
        */

        scene.__character = scene.add.rectangle(0.5 * GRID_SIZE, 8.5 * GRID_SIZE
            ,16,48,0x00ff00, 1.0);

        scene.__gun_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__gun_y_offset = 0*CHARACTER_SPRITE_SIZE;
        //character.play('hero_run');
        let current_gun_index = 0;
        let gun_array = ['assault_rifle','shotgun'];
        scene.__gun = scene.add.sprite(0, 0, gun_array[current_gun_index])
            .setScale(2)
            .setVisible(true);

        scene.physics.add.existing(scene.__character);
        //scene.__character.body.collideWorldBounds = true;
        scene.__character.body.gravity.y = 450;


        scene.__align_player_group = function () {
            let center_x = scene.__character.body.x + scene.__character.width / 2;
            let center_y = scene.__character.body.y + scene.__character.height / 2;

            scene.__gun.x = center_x + scene.__gun_x_offset;
            scene.__gun.y =  center_y + scene.__gun_y_offset;
        };
        scene.__align_player_group();

        scene.input.addPointer(5);
        //scene.input.setPollAlways();

        let mouse_vector = new Phaser.Math.Vector2(0, 0);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, function(pointer) {
            let dx = pointer.worldX - scene.__gun.x;
            let dy = pointer.worldY - scene.__gun.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            dx = dx / d * GRID_SIZE/SPRITE_SCALE/2;
            dy = dy / d * GRID_SIZE/SPRITE_SCALE/2;
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            scene.__gun.setFlipY(dx < 0);
            //scene.__character.setFlipX(dx < 0);
            scene.__gun.setAngle(Phaser.Math.RadToDeg(mouse_vector.angle()));
        });

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey("q");

        scene.__cursor_keys.letter_one.on(Phaser.Input.Keyboard.Events.UP, function() {
            current_gun_index = (current_gun_index+1) % gun_array.length;
            scene.__gun.setTexture(gun_array[current_gun_index]);
        });
        scene.__moving = false;

        //scene.cameras.main.setBounds(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        //scene.cameras.main.startFollow(scene.__character, true, 1, 1, 0, 0);

        scene.physics.add.collider(scene.__character, platforms);

        /*
        let platforms = scene.physics.add.staticGroup();
        let overlaps = scene.physics.add.staticGroup();

        scene.G.player.data.values.addCollider(scene.physics, platforms);
        scene.G.player.data.values.addOverlap(scene.physics, overlaps);d
         */
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

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
            if (scene.__character.body.blocked.down) {
                scene.__character.body.setVelocityY(-450);
            }
        }
        if (!scene.__cursor_keys.up.isDown &&
            !scene.__cursor_keys.letter_up.isDown)
        {
            if (scene.__character.body.velocity.y < 0)
            {
                scene.__character.body.setVelocityY(scene.__character.body.velocity.y * .1);
            }
        }
        /*
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            dy += 1;
        }
        */

        //normalize
        let d = Math.sqrt(dx * dx + dy * dy);
        let v = 90*GRID_SIZE/16;
        if (d !== 0) {
            dx = dx / d * v;
            dy = dy / d * v;
        }

        let moving = false;
        if (dx !== 0) {
            moving = true;
        }
        if (moving !== scene.__moving) {
            scene.__moving = moving;
            if (moving) {
                //scene.__character.play('hero_run');
            } else {
                //scene.__character.anims.stop();
                //scene.__character.setTexture('hero', 0);
            }
        }
        /*if (dx < 0) {
            scene.__character.setFlipX(true);
        } else if (dx > 0) {
            scene.__character.setFlipX(false);
        }*/
        scene.__character.body.setVelocityX(dx);
        scene.__align_player_group()
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
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
