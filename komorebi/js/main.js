const GRID_SIZE = 64;
const SPRITE_SCALE = GRID_SIZE/32;
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
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);


        this.load.image('assault_rifle', 'assets/assault_rifle.png');
        this.load.image('shotgun', 'assets/shotgun.png');
        this.load.spritesheet('hero', 'assets/Adventurer Female Sprite Sheet.png',
            { frameWidth: 32, frameHeight: 32});


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
        scene.anims.create({
            key: 'hero_run',
            frames: [
                { key: 'hero', frame: 9 },
                { key: 'hero', frame: 10 },
                { key: 'hero', frame: 11 },
                { key: 'hero', frame: 12 },
                { key: 'hero', frame: 13 },
                { key: 'hero', frame: 14 },
                { key: 'hero', frame: 15 },
                { key: 'hero', frame: 16 }
            ],
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
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
        let scene = this;

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle();

        let CHARACTER_SPRITE_SIZE = 3;
        scene.__character = scene.add.sprite(SCREEN_WIDTH/2 + 3*SPRITE_SCALE, SCREEN_HEIGHT/2 - 9*SPRITE_SCALE,
            'hero', 0)
            .setScale(CHARACTER_SPRITE_SIZE);

        scene.__gun_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__gun_y_offset = 7*CHARACTER_SPRITE_SIZE;
        //character.play('hero_run');
        let current_gun_index = 0;
        let gun_array = ['assault_rifle','shotgun'];
        scene.__gun = scene.add.sprite(scene.__character.x + scene.__gun_x_offset,
            scene.__character.y + scene.__gun_y_offset, gun_array[current_gun_index])
            .setScale(SPRITE_SCALE);

        scene.__hitbox_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__hitbox_y_offset = 5*CHARACTER_SPRITE_SIZE;
        scene.__hitbox = scene.add.rectangle(scene.__character.x + scene.__hitbox_x_offset,
            scene.__character.y + scene.__hitbox_y_offset,
            6*CHARACTER_SPRITE_SIZE,20*CHARACTER_SPRITE_SIZE,0x00ff00, 0.3);

        scene.__solidbox_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__solidbox_y_offset = 13*CHARACTER_SPRITE_SIZE;
        scene.__solidbox = scene.add.rectangle(scene.__character.x + scene.__solidbox_x_offset,
            scene.__character.y + scene.__solidbox_y_offset,
            6*CHARACTER_SPRITE_SIZE,4*CHARACTER_SPRITE_SIZE,0xff0000, 0.3)

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
            scene.__character.setFlipX(dx < 0);
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

        scene.cameras.main.setBounds(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__character, true, 1, 1, 0, 0);

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
            dy -= 1;
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            dy += 1;
        }
        //normalize
        let d = Math.sqrt(dx * dx + dy * dy);
        let v = GRID_SIZE/16;
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
                scene.__character.play('hero_run');
            } else {
                scene.__character.anims.stop();
                scene.__character.setTexture('hero', 0);
            }
        }
        /*if (dx < 0) {
            scene.__character.setFlipX(true);
        } else if (dx > 0) {
            scene.__character.setFlipX(false);
        }*/
        scene.__character.x += dx;
        scene.__character.y += dy;
        scene.__gun.x = scene.__character.x + scene.__gun_x_offset;
        scene.__gun.y = scene.__character.y + scene.__gun_y_offset;
        scene.__hitbox.x = scene.__character.x + scene.__hitbox_x_offset;
        scene.__hitbox.y = scene.__character.y + scene.__hitbox_y_offset;
        scene.__solidbox.x = scene.__character.x + scene.__solidbox_x_offset;
        scene.__solidbox.y = scene.__character.y + scene.__solidbox_y_offset;
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
            debug: true
        }
    },
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
