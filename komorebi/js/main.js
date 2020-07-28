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
            frameRate: 8,
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

        scene.__character = scene.add.sprite(SCREEN_WIDTH/2 + 3*SPRITE_SCALE, SCREEN_HEIGHT/2 - 9*SPRITE_SCALE,
            'hero', 0)
            .setScale(3);
        scene.__gun_x_offset = 0;
        scene.__gun_y_offset = 11*SPRITE_SCALE;
        //character.play('hero_run');
        scene.__gun = scene.add.sprite(scene.__character.x + scene.__gun_x_offset,
            scene.__character.y + scene.__gun_y_offset, 'assault_rifle')
            .setScale(SPRITE_SCALE);
        scene.input.addPointer(5);

        let mouse_vector = new Phaser.Math.Vector2(0, 0);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, function(pointer) {
            let dx = pointer.worldX - scene.__character.x + scene.__gun_x_offset;
            let dy = pointer.worldY - scene.__character.y + scene.__gun_y_offset;
            let d = Math.sqrt(dx * dx + dy * dy);
            dx = dx / d * GRID_SIZE/SPRITE_SCALE/2;
            dy = dy / d * GRID_SIZE/SPRITE_SCALE/2;
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            scene.__gun.setFlipY(dx < 0);
            scene.__character.setFlipX(dx < 0);
            scene.__gun.x = dx + scene.__character.x + scene.__gun_x_offset;
            scene.__gun.y = dy + scene.__character.y + scene.__gun_y_offset;
            scene.__gun.setAngle(Phaser.Math.RadToDeg(mouse_vector.angle()));
        });

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__moving = false;

        scene.cameras.main.setBounds(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__character, true, 1, 1, 0, 0);
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let dx = 0;
        let dy = 0;
        if (scene.__cursor_keys.left.isDown) {
            dx -= 1;
        }
        if (scene.__cursor_keys.right.isDown) {
            dx += 1;
        }
        if (scene.__cursor_keys.up.isDown) {
            dy -= 1;
        }
        if (scene.__cursor_keys.down.isDown) {
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
