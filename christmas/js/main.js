const SPRITE_SCALE = 5;
const GRID_SIZE = 8;
const GRID_ROWS = 10;
const GRID_COLS = 6;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS * SPRITE_SCALE;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS * SPRITE_SCALE;
const FONT = 'px PressStart2P';

const DEPTHS = {
    BG: 0,
    TREE: 2000,
    DECORATIONS: 3000,
    FRONT_SNOW: 3500,
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
        scene.load.spritesheet('stars', 'stars.png',
            { frameWidth: 12, frameHeight: 14 });
        scene.load.spritesheet('bulbs', 'bulbs.png',
            { frameWidth: 5, frameHeight: 5 });
        scene.load.spritesheet('snowballs', 'snowballs.png',
            { frameWidth: 5, frameHeight: 5 });
        scene.load.spritesheet('trees', 'trees.png',
            { frameWidth: 38, frameHeight: 62 });
        scene.load.spritesheet('background', 'background.png',
            { frameWidth: 38, frameHeight: 62 });
        scene.load.spritesheet('UI', 'UI.png',
            { frameWidth: 32, frameHeight: 32 });

        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once(Phaser.Loader.Events.COMPLETE,  function() {
            scene.time.delayedCall(500, () => {
                scene.scene.start('ControllerScene');
            });
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
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
    create: function (data) {
        let scene = this;

        let background_width = 8*SPRITE_SCALE;
        for (let x = background_width; x + SCREEN_WIDTH/2 < SCREEN_WIDTH + background_width;
             x += background_width) {
            scene.add.sprite(SCREEN_WIDTH/2 - x, SCREEN_HEIGHT, 'background')
                .setOrigin(0.5, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG);
            scene.add.sprite(SCREEN_WIDTH/2 + x, SCREEN_HEIGHT, 'background')
                .setOrigin(0.5, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG);
        }

        let current_frame = 0;
        let tree = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT, 'trees', current_frame)
            .setOrigin(0.5, 1)
            .setScale(SPRITE_SCALE)
            .setDepth(DEPTHS.TREE);

        scene.__updateables = scene.add.group({
            runChildUpdate: true,
        });
        scene.__explodables = scene.add.group({
        });

        let addSnow = (size) => {
            let speed = [20, 10, 5][size];
            let xoffset = [32, 16, 8][size];
            let delay = [400, 200, 100][size];
            let depth = [DEPTHS.FRONT_SNOW, DEPTHS.BG, DEPTHS.BG][size]
            let startX = Phaser.Math.Between(0, SCREEN_WIDTH);
            let startY = Phaser.Math.Between(-SCREEN_HEIGHT, 0);
            let snowball = scene.add.sprite(startX, startY, 'snowballs', size)
                .setAlpha(0.25)
                .setDepth(depth)
                .setScale(SPRITE_SCALE);
            let tween = scene.tweens.add({
                targets: [snowball],
                ease: 'Sine.easeInOut',
                yoyo: true,
                duration: 2000,
                repeat: -1,
                x: startX + xoffset,
            });
            scene.physics.add.existing(snowball);
            scene.__updateables.add(snowball)

            let speed_adjust = (100+Phaser.Math.Between(-10,10))/100;
            snowball.body.setVelocity(0, speed_adjust*speed*SPRITE_SCALE);
            snowball.update = () => {
                if (snowball.body.y > SCREEN_HEIGHT+5*SPRITE_SCALE) {
                    snowball.destroy();
                }
            }
            scene.time.delayedCall(delay, addSnow, [size]);
        };
        scene.time.delayedCall(0, addSnow, [0]);
        scene.time.delayedCall(0, addSnow, [1]);
        scene.time.delayedCall(0, addSnow, [2]);

        let addBulb = () => {
            let startX = Phaser.Math.Between(0, SCREEN_WIDTH);
            let startY = Phaser.Math.Between(0, SCREEN_HEIGHT);
            let frame = Phaser.Utils.Array.GetRandom([0,1,2]);
            let type = Phaser.Utils.Array.GetRandom(
                ['bulbs', 'bulbs', 'bulbs', 'bulbs', 'stars']);
            let bulb = scene.add.sprite(startX, startY, type, frame)
                .setOrigin(0.5, 0.5)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.DECORATIONS);
            scene.__updateables.add(bulb);
            scene.__explodables.add(bulb);
            scene.physics.add.existing(bulb);

            let power = GRID_SIZE * SPRITE_SCALE * 5;

            bulb.update = () => {
                if (bulb.body.blocked.down) {
                    bulb.body.velocity.x *= 0.5;
                }
            };
            bulb.__explode = () => {
                let dx = Phaser.Math.Between(-power, power);
                let dy = Phaser.Math.Between(-power, power);
                bulb.body.setGravity(0, +500);
                bulb.body.setVelocity(dx, dy);
            };
            bulb.__explode();
            bulb.body.setBounce(0.5);
            bulb.body.setCollideWorldBounds(true);
            bulb.setInteractive();
            scene.input.setDraggable(bulb);
            scene.input.on(Phaser.Input.Events.DRAG, function(pointer, gameObject, dragX, dragY) {
                gameObject.body.setGravity(0);
                gameObject.body.setVelocity(0);
                gameObject.setPosition(dragX, dragY);
            });
            scene.input.on(Phaser.Input.Events.DRAG_END, function(pointer, gameObject, dragX, dragY) {
                if (scene.physics.overlap(gameObject, scene.__trash)) {
                    gameObject.destroy();
                }
            });
        };
        for (let x = 0; x < 7; x++) {
            addBulb();
        };
        let button = scene.add.sprite(SCREEN_WIDTH - GRID_SIZE, 0 + GRID_SIZE,
            'UI', 0)
            .setOrigin(1, 0)
            .setDepth(DEPTHS.UI);
        addButton(button, () => {
            Phaser.Actions.Call(this.__explodables.getChildren(), (explodable) => {
                explodable.__explode();
            })
        });

        button = scene.add.sprite(SCREEN_WIDTH - GRID_SIZE, 0 + 32 + 2* GRID_SIZE,
            'UI', 2)
            .setOrigin(1, 0)
            .setDepth(DEPTHS.UI);
        addButton(button, () => {
            addBulb();
        });

        button = scene.add.sprite(SCREEN_WIDTH - GRID_SIZE, 0 + 2*32 + 3* GRID_SIZE,
            'UI', 3)
            .setOrigin(1, 0)
            .setDepth(DEPTHS.UI);
        addButton(button, () => {
            Phaser.Actions.Call(this.__explodables.getChildren(), (explodable) => {
                if (explodable.body.gravity.y === 0) {
                    explodable.__explode();
                }
            })
            current_frame = (current_frame+1)%3;
            tree.setFrame(current_frame);
        });

        scene.__trash = scene.add.sprite(0 + GRID_SIZE, 0 + GRID_SIZE,
            'UI', 1)
            .setOrigin(0, 0)
            .setDepth(DEPTHS.UI);
        addButton(scene.__trash, () => {
        });
        scene.physics.add.existing(scene.__trash);


        let world_bounds = new Phaser.Geom.Rectangle(0,0,0,0);
        scene.cameras.main.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        scene.cameras.main.getBounds(world_bounds);
        scene.physics.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.width, world_bounds.height);
        scene.physics.world.setBoundsCollision();

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.interact = scene.input.keyboard.addKey("x");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let config = {
    backgroundColor: "#99aecb",
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
    scene: [ LoadScene, ControllerScene ]
};

let game = new Phaser.Game(config);
