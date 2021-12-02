const GRID_SIZE = 32;
const SCREEN_WIDTH = 27 * GRID_SIZE;
const SCREEN_HEIGHT = 15 * GRID_SIZE;
const FONT = 'px PressStart2P';
const PLAYER_SPEED = GRID_SIZE*4;
const LEGACY_SCALE = 1;
const SPRITE_SCALE = 2;
const DEPTHS = {
    BG: 0,
    FLOOR: 500,
    BG_ENTITY: 750,
    ENTITY: 1000,
    PLAYER: 2000,
    FG: 3000,
    UI: 4000
}

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
            "0%", { font: GRID_SIZE + FONT, fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        scene.load.path = "assets/";
        scene.load.image('bg_image', 'papelIGuess.jpeg');
        scene.load.spritesheet('character', 'Parkgirl.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('dog', 'Parkdog.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('dog2', 'Dog2.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('dog3', 'Dog3.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('objects', 'objects.png',
            { frameWidth: 14, frameHeight: 14 });
        scene.load.spritesheet('park_objects', 'parkObjects.png',
            { frameWidth: 16, frameHeight: 16 });
        scene.load.spritesheet('hut', 'Hut.png',
            { frameWidth: 98, frameHeight: 64 });

        scene.load.image('tree1', 'Tree1.png');
        scene.load.image('tree2', 'Tree2.png');
        scene.load.image('ground', 'ground.png');

        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once(Phaser.Loader.Events.COMPLETE,  function() {
            scene.time.delayedCall(500, () => {
                scene.scene.start('GameScene');
            });
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'character_move_anim',
            frames: scene.anims.generateFrameNumbers('character',
                { start: 0, end: 7 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'character_idle_anim',
            frames: scene.anims.generateFrameNumbers('character',
                { start: 8, end: 14 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'dog_move_anim',
            frames: scene.anims.generateFrameNumbers('dog',
                { start: 0, end: 3 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'dog_idle_anim',
            frames: scene.anims.generateFrameNumbers('dog',
                { start: 8, end: 10 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'dog_spin_anim',
            frames: scene.anims.generateFrameNumbers('dog2',
                { start: 0, end: 7 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 2
        });
        scene.anims.create({
            key: 'dog_sit_anim',
            frames: scene.anims.generateFrameNumbers('dog3',
                { start: 0, end: 1 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'hut_open_anim',
            frames: scene.anims.generateFrameNumbers('hut',
                { start: 1, end: 5 }),
            skipMissedFrames: false,
            frameRate: 8,
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
    create: function (data) {
        let scene = this;

        /*
        let bg_image = scene.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg_image')
            .setDepth(DEPTHS.BG);
         */

        let bind_event = (key, event, handler) => {
            key.on(event, handler);

            scene.events.once(Phaser.Scenes.Events.SHUTDOWN, function() {
                key.off(event);
            })
        };

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.interact = scene.input.keyboard.addKey("x");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        scene.__updateables = scene.add.group({
            runChildUpdate: true,
        });
        scene.__interactables = scene.physics.add.group();
        scene.__floor = scene.physics.add.staticGroup();

        scene.__playerCharacter = addPlayer(scene, SCREEN_WIDTH/2, GRID_SIZE*12 - 4*SPRITE_SCALE);
        scene.__dog = addDog(scene, SCREEN_WIDTH/2-GRID_SIZE, GRID_SIZE*12 - 4*SPRITE_SCALE);

        let addTree = (x, y, image) => {
            let tree = scene.add.sprite(x, y, image)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG_ENTITY);
            return tree;
        };

        let floor_height = GRID_SIZE*12;

        let addHut = (x) => {
            let hut = scene.add.sprite(x, floor_height - 32 * SPRITE_SCALE, 'hut', 0)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG_ENTITY);
            scene.__interactables.add(hut);
            let openable = true;
            hut.__interact = () => {
                if (!openable) {
                    return;
                }
                openable = false;
                hut.play('hut_open_anim');
            };
            return hut;
        };

        let addParkObject = (x, index) => {
            scene.add.sprite(x, floor_height-8*SPRITE_SCALE, 'park_objects', index)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG_ENTITY);
        };
        let addBench = (x) => {
            addParkObject(x-8*SPRITE_SCALE, 8);
            addParkObject(x+8*SPRITE_SCALE, 9);
        };

        addBench(SCREEN_WIDTH/2);
        addParkObject(SCREEN_WIDTH/2 + GRID_SIZE, 1);
        for (let x of [3, 17, 21, 22, 25, 29, 37, 42]) {
            addParkObject(SCREEN_WIDTH/2 + x*GRID_SIZE, 2);
        };
        for (let x of [7, 12, 20, 27, 31, 44, 49]) {
            addParkObject(SCREEN_WIDTH/2 + x*GRID_SIZE, 3);
        };
        for (let x of [-3, 5, 7, 36, 40]) {
            addParkObject(SCREEN_WIDTH/2 + x*GRID_SIZE, 0);
        };

        addHut(SCREEN_WIDTH/2 + GRID_SIZE  * 27);

        addTree(SCREEN_WIDTH/2 + GRID_SIZE * 4, GRID_SIZE*12 - 24 * SPRITE_SCALE, 'tree1');
        addTree(SCREEN_WIDTH/2 - GRID_SIZE * 7, GRID_SIZE*12 - 24 * SPRITE_SCALE, 'tree2');
        for(let x = 16 * LEGACY_SCALE; x < SCREEN_WIDTH*2; x += 32 * LEGACY_SCALE) {
            scene.add.image(x, GRID_SIZE*13 - 18*LEGACY_SCALE, 'ground')
                .setScale(LEGACY_SCALE)
                .setDepth(DEPTHS.FLOOR);
        };

        scene.__addObject = (x, y, dx, dy, frame) => {
            let bottle = scene.add.sprite(x, y, 'objects', frame)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.FG);
            bottle.__interact = () => {
                if (!scene.physics.overlap(bottle, scene.__playerCharacter)) {
                    return
                }
                bottle.destroy();
                scene.__playerCharacter.__pick_up(frame);
            };
            scene.__interactables.add(bottle);
            bottle.body.setGravityY(3*PLAYER_SPEED);
            bottle.body.setVelocity(dx, dy);
            return bottle;
        };

        scene.__addObject(SCREEN_WIDTH/2 + GRID_SIZE*7, GRID_SIZE*12 - 6 * SPRITE_SCALE,
            0, 0, 1);
        scene.__addObject(SCREEN_WIDTH/2 - GRID_SIZE*9, GRID_SIZE*12 - 6 * SPRITE_SCALE,
            0, 0, 2);

        scene.physics.add.overlap(scene.__playerCharacter, scene.__interactables, function(player, interactable) {
            scene.__playerCharacter.__register_interactable(interactable);
        });

        scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH, GRID_SIZE*13 - 9*SPRITE_SCALE,
            SCREEN_WIDTH*2, 29*LEGACY_SCALE,
            0xff00ff, 0.00)
            .setDepth(DEPTHS.FG));
        scene.__floor.add(scene.add.rectangle(0-16, SCREEN_HEIGHT/2,
            32, SCREEN_HEIGHT,
            0xff00ff, 0.80)
            .setDepth(DEPTHS.FG));
        scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH*2 + 16, SCREEN_HEIGHT/2,
            32, SCREEN_HEIGHT,
            0xff00ff, 0.80)
            .setDepth(DEPTHS.FG));
        scene.physics.add.collider(scene.__interactables, scene.__floor, (interactable, floor) => {
            interactable.body.setVelocityX(0);
        });
        scene.physics.add.collider(scene.__playerCharacter, scene.__floor);

        let world_bounds = new Phaser.Geom.Rectangle(0,0,0,0);
        scene.cameras.main.setBounds(0, 0, 2*SCREEN_WIDTH, SCREEN_HEIGHT);
        scene.cameras.main.getBounds(world_bounds);
        scene.cameras.main.startFollow(scene.__playerCharacter, true, 1, 1, 0, 0);
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let input = {
            up: false,
            down: false,
            left: false,
            right: false,
            interact: false,
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
        if (scene.__cursor_keys.interact.isDown) {
            input.interact = true;
        }
        scene.__playerCharacter.__input(input);
    },
});

let config = {
    backgroundColor: "#bbad7b",
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

let game = new Phaser.Game(config);
