const DEBUG_BUILD = false;

const SCREEN_HEIGHT = 1080;
const SCREEN_WIDTH = 1920;

const GRID_SIZE = 60;

const DEPTHS = {
    BG: 0,
    MG: 1000,
    FG: 2000,
    UI: 3000,
};

let getFont = (align = "left", fontSize = GRID_SIZE,
               color= '#000000', wrap_length= SCREEN_WIDTH) => {
    return {font: '' + fontSize + 'px Marker_Felt', fill: color, align: align,
        wordWrap: {width: wrap_length, useAdvancedWrap: true}};
};

let GAME_INPUT = {
    left: false,
    right: false,
    up: false,
    down: false,
    interact: false,
    interact_event: 'GAME_INPUT.INTERACT_EVENT',
};

let TILEMAP_COORDINATES = {
    brave: null,
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

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.input.addPointer(5);

        let walls = scene.physics.add.staticGroup();

        /*
        scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH,SCREEN_HEIGHT,
            0xE0E0E0)
            .setDepth(DEPTHS.BG);
        */
        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'underground_bg')
            .setDepth(DEPTHS.BG);

        TiledHelper.get_object_loader_map('Wall',
            (object) => {
                let coordinates = TiledHelper.get_rectangle_coordinates(object);
                walls.add(scene.add.zone(
                    coordinates.x, coordinates.y,
                    coordinates.width, coordinates.height,
                    0x00ff00, 0.5));
            })
            .load(scene, 'level_tilemap', 'Objects');

        let center = TILEMAP_COORDINATES.brave.bounding_box;
        let player = scene.add.container(SCREEN_WIDTH/2,
            SCREEN_HEIGHT - GRID_SIZE,
            [])
            .setSize(center.width, center.height)
            .setDepth(DEPTHS.MG);
        scene.physics.add.existing(player);

        scene.physics.add.collider(player, walls);

        player.body.setOffset(0,-center.height/2);
        /*
        player.add(scene.add.rectangle(
            0, 0,
            center.width,
            center.height,
            0xff0000, 0.5)
            .setOrigin(0.5,1)
        );
        */
        let coordinates = TILEMAP_COORDINATES.brave.sprite;
        let player_sprite =
            scene.add.sprite(
                center.x - coordinates.x,
                center.y - coordinates.y,
                'Brave', 0)
                .setOrigin(0.5,1);
        player.add(player_sprite);

        let d = 2000;
        let light1 = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'underground_light1')
            .setAlpha(0)
            .setDepth(DEPTHS.MG);
        scene.tweens.add({
            targets: light1,
            duration: d,
            alpha: 1,
            yoyo: true,
            repeat: -1,
        });
        let light2 = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'underground_light2')
            .setAlpha(1)
            .setDepth(DEPTHS.MG);
        scene.tweens.add({
            targets: light2,
            duration: d,
            alpha: 0,
            yoyo: true,
            repeat: -1,
        });

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'underground_fg')
            .setDepth(DEPTHS.FG);

        let direction = new Phaser.Math.Vector2(0,0);
        scene.__update = () => {
            direction.copy(Phaser.Math.Vector2.ZERO);
            if (GAME_INPUT.left) {
                direction.add(Phaser.Math.Vector2.LEFT);
            }
            if (GAME_INPUT.right) {
                direction.add(Phaser.Math.Vector2.RIGHT);
            }
            //console.log(direction);
            if (direction.equals(Phaser.Math.Vector2.ZERO)) {
                player.body.setVelocity(0,0);
                player_sprite.anims.stop();
                player_sprite.setFrame(0);
            } else {
                direction.normalize().setLength(7.5*GRID_SIZE);
                player.body.setVelocity(direction.x, direction.y)
                if (!player_sprite.anims.isPlaying) {
                    player_sprite.play('brave_walk');
                }
                if (direction.x !== 0) {
                    player_sprite.setFlipX(direction.x < 0)
                }
            }
        };

        //scene.add.text(GRID_SIZE,GRID_SIZE,["Treasure... monster... It's","everything Dad wanted","to find in Norway..."], getFont())
        //    .setDepth(DEPTHS.UI)
    },

    //--------------------------------------------------------------------------
    update: function () {
        let scene = this;
        scene.__update();
    }
});

let ControllerScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ControllerScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        let cursor_keys = scene.input.keyboard.createCursorKeys();
        cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        cursor_keys.letter_interact = scene.input.keyboard.addKey("e");
        cursor_keys.interact = scene.input.keyboard.addKey("x");

        bind_event(scene, scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            Phaser.Input.Keyboard.Events.DOWN,
            () => {
                game.events.emit(GAME_INPUT.interact_event);
            }
        );
        bind_event(scene, scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            Phaser.Input.Keyboard.Events.DOWN,
            () => {
                game.events.emit(GAME_INPUT.interact_event);
            }
        );

        scene.__update = () => {
            GAME_INPUT.left = false;
            GAME_INPUT.right = false;
            GAME_INPUT.up = false;
            GAME_INPUT.down = false;
            GAME_INPUT.interact = false;
            if (cursor_keys.left.isDown ||
                cursor_keys.letter_left.isDown) {
                GAME_INPUT.left = true;
            }
            if (cursor_keys.right.isDown ||
                cursor_keys.letter_right.isDown) {
                GAME_INPUT.right = true;
            }
            if (cursor_keys.up.isDown ||
                cursor_keys.letter_up.isDown) {
                GAME_INPUT.up = true;
            }
            if (cursor_keys.down.isDown ||
                cursor_keys.letter_down.isDown) {
                GAME_INPUT.down = true;
            }
            if (cursor_keys.interact.isDown ||
                cursor_keys.letter_interact.isDown) {
                GAME_INPUT.interact = true
            }
        };

        //add_audio_handler(scene);
        scene.scene.launch(DEBUG_BUILD ? 'GameScene' : 'LogoScene');
    },

    //--------------------------------------------------------------------------
    update: function () {
        let scene = this;
        scene.__update();
    }
});

let LogoScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LogoScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.add.rectangle(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT,
            0xffffff);
        addLogo(scene);
        scene.time.delayedCall(2500, () => {
            scene.scene.start('GameScene');
        })
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        scene.load.setPath("assets/");
        scene.load.spritesheet('phaser_logo', 'phaser-pixel-medium-flat.png',
            { frameWidth: 104, frameHeight: 22 });

        scene.load.setPath("assets/");
        scene.load.spritesheet('Brave', 'Brave2.png',
            { frameWidth: 340, frameHeight: 810 });

        scene.load.setPath("assets/");
        scene.load.image('underground_fg','underground_fg.png');
        scene.load.image('underground_bg','underground_bg.png');
        scene.load.image('underground_light1','underground_light1.png');
        scene.load.image('underground_light2','underground_light2.png');
        //load_audio(scene);

        scene.load.setPath("assets/");
        scene.load.tilemapTiledJSON("brave_tilemap","brave_tilemap.json");
        scene.load.tilemapTiledJSON("level_tilemap","level_tilemap.json");

        add_loading_bar(scene);
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.anims.create({
            key: 'brave_walk',
            frames: scene.anims.generateFrameNumbers('Brave',
                { frames: [1, 2, 3, 4, 5, 6, 7, 0] }),
            skipMissedFrames: true,
            frameRate: 12,
            repeat: -1
        });

        TILEMAP_COORDINATES.brave = TiledHelper.get_object_loader_map()
            .add_rectangle_coordinates('bounding_box')
            .add_image_coordinates('sprite')
            .load(scene, 'brave_tilemap', 'Objects');
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: 0xFFFFFF,
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
            gravity: { y: 0},
            debug: DEBUG_BUILD,
        }
    },
    scene: [ LoadScene, LogoScene, ControllerScene, GameScene ],
};

let game = new Phaser.Game(config);
