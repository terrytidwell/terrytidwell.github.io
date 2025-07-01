const DEBUG_BUILD = false;

const SCREEN_HEIGHT = 1080;
const SCREEN_WIDTH = 1920;

const GRID_SIZE = 60;

const DEPTHS = {
    BG: 0,
};

const SIZES = {
    CARD_WIDTH : SCREEN_WIDTH/4,
    CARD_HEIGHT : SCREEN_WIDTH/4 * 4/3,
    PADDING: 16,
    LEFT_STOP: SCREEN_WIDTH/2 - SCREEN_WIDTH/4 * 3/4,
    RIGHT_STOP: SCREEN_WIDTH/2 + SCREEN_WIDTH/4 * 3/4,
};

let getFont = (align = "center", fontSize = SIZES.font,
               color="#FFFFFF", wrap_length= SCREEN_WIDTH) => {
    return {font: '' + fontSize + 'px m5x7', fill: color, align: align,
        wordWrap: {width: wrap_length, useAdvancedWrap: true}};
};

let getChoiceFont = () => {
    return getFont("center",
        48,
        "#FFFFFF",
        SIZES.CARD_WIDTH);
};

let getPositiveFont = () => {
    return getFont("center",
        48,
        "#00E000",
        SIZES.CARD_WIDTH);
};

let getNegativeFont = () => {
    return getFont("center",
        48,
        "#E00000",
        SIZES.CARD_WIDTH);
};

let getLeftFont = () => {
    return getFont("left",
        48,
        "#000000",
        SIZES.CARD_WIDTH);
};

let getRightFont = () => {
    return getFont("right",
        48,
        "#000000",
        SIZES.CARD_WIDTH);
};

let scenarios = [
    {
        scenario_text: "A street kid pulled a gun on one of your guys. Crew wants blood.",
        left: {
            text: "Handle it",
            stats: {
                Rep: 10,
                Heat: 10,
            },
        },
        right: {
            text: "Let it go",
            stats: {
                Rep: -10,
            },
        },
    },
    {
        scenario_text: "A politician wants a favor. Promises protection if you help him bury something.",
        left: {
            text: "Do it",
            stats: {
                Rep: -5,
                Power: 10,
            },
        },
        right: {
            text: "Refuse",
            stats: {
                Rep: 5,
                Heat: 5,
            },
        },
    },
    {
        scenario_text: "Your supplier’s late again. Crew’s getting anxious.",
        left: {
            text: "Cut ties",
            stats: {
                Cash: -5,
                Rep: 5,
            },
        },
        right: {
            text: "Let it slide",
            stats: {
                Cash: 5,
                Rep: -5,
            },
        },
    },
];

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

        let scene_state = {
            updateables: scene.add.group({runChildUpdate: true}),
        };

        scene.input.addPointer(5);

        let STATS = {
            Cash: {
                label: "Cash",
                x: SCREEN_WIDTH/2-SIZES.CARD_WIDTH/2,
                positive: (value) => { return value >= 0 },
                current: 10,
            },
            Rep: {
                label: "Rep",
                x: SCREEN_WIDTH/2-SIZES.CARD_WIDTH/6,
                positive: (value) => { return value >= 0 },
                current: 10,
            },
            Heat: {
                label: "Heat",
                x: SCREEN_WIDTH/2+SIZES.CARD_WIDTH/6,
                positive: (value) => { return value <= 0 },
                current: 10,
            },
            Power: {
                label: "Power",
                x: SCREEN_WIDTH/2+SIZES.CARD_WIDTH/2,
                positive: (value) => { return value >= 0 },
                current: 10,
            },
        };
        Object.keys(STATS).forEach((key) => {
            let stat_text = scene.add.text(STATS[key].x, SCREEN_HEIGHT, [key, STATS[key].current],
                getChoiceFont())
                .setOrigin(0.5,1)
                .setDepth(DEPTHS.BG+1);
            STATS[key].__update_value = (delta) => {
                STATS[key].current += delta;
                stat_text.setText([key, STATS[key].current]);
            }
        });
        let addBonusText = (stat, value) => {
            let value_string = value >= 0 ? "+" + value : "" + value;
            let fontChoice = STATS[stat].positive(value) ? getPositiveFont :
                getNegativeFont;
            return scene.add.text(STATS[stat].x,SCREEN_HEIGHT,
                [value_string,"", STATS[stat].current], fontChoice())
                .setOrigin(0.5,1)
                .setAlpha(0)
                .setDepth(DEPTHS.BG);
        };

        let addCard = () => {
            let card_group = scene.add.group();
            let card = scene.add.container(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, [])
                .setAlpha(0);
            card_group.add(card);

            let sprite = scene.add.sprite(0, 0, 'card_bg');
            card.add(sprite);
            card.setSize(SIZES.CARD_WIDTH, SIZES.CARD_HEIGHT);
            card.y += SIZES.CARD_HEIGHT/5;
            scene.tweens.add({
                targets: card,
                y: SCREEN_HEIGHT/2,
                duration: 250,
                alpha: 1,
                onComplete: () => {
                    card.setInteractive();
                    scene.input.setDraggable(card);
                }
            });

            let left_stuff = scene.add.group();
            let right_stuff = scene.add.group();
            let scenario = Phaser.Utils.Array.GetRandom(scenarios);
            Object.keys(scenario.left.stats).forEach((key) => {
                let bonus_text = addBonusText(key,scenario.left.stats[key])
                card_group.add(bonus_text);
                left_stuff.add(bonus_text);
            });
            Object.keys(scenario.right.stats).forEach((key) => {
                let bonus_text = addBonusText(key,scenario.right.stats[key])
                card_group.add(bonus_text);
                right_stuff.add(bonus_text);
            });
            let choice_text = scene.add.text(SCREEN_WIDTH/2, -8,
                scenario.scenario_text,
                getChoiceFont())
                .setOrigin(0.5,0)
                .setAlpha(0);
            card_group.add(choice_text);
            let left_text = scene.add.text(
                -SIZES.CARD_WIDTH/2 + SIZES.PADDING,
                -SIZES.CARD_HEIGHT/2 + SIZES.PADDING,
                scenario.left.text,
                getLeftFont())
                .setOrigin(0,0)
                .setAlpha(0);
            card.add(left_text);
            left_stuff.add(left_text);
            let right_text = scene.add.text(
                SIZES.CARD_WIDTH/2 - SIZES.PADDING,
                -SIZES.CARD_HEIGHT/2 + SIZES.PADDING,
                scenario.right.text,
                getRightFont())
                .setOrigin(1,0)
                .setAlpha(0);
            card.add(right_text);
            right_stuff.add(right_text);
            scene.tweens.add({
                targets: choice_text,
                y: 0,
                duration: 250,
                alpha: 1,
                onComplete: () => {
                    card.setInteractive();
                    scene.input.setDraggable(card);
                }
            });

            scene_state.updateables.add(card);
            card.update = () => {
                let left_progress = Phaser.Math.Clamp(
                    1 - ((SIZES.LEFT_STOP - card.x) / (SIZES.LEFT_STOP - SCREEN_WIDTH/2)),
                    0, 1);
                let right_progress = Phaser.Math.Clamp(
                    1 - ((SIZES.RIGHT_STOP - card.x) / (SIZES.RIGHT_STOP - SCREEN_WIDTH/2)),
                    0, 1);
                let left_alpha =
                    Phaser.Math.Clamp(left_progress*4, 0, 1);
                let right_alpha =
                    Phaser.Math.Clamp(right_progress*4, 0, 1);
                for(let item of left_stuff.getChildren()) {
                    item.setAlpha(left_alpha);
                }
                for(let item of right_stuff.getChildren()) {
                    item.setAlpha(right_alpha);
                }
            };

            card.__cleanup = (swipe_left, swipe_right) => {
                let stat_change = {};
                if (swipe_left) {
                    stat_change = scenario.left.stats;
                }
                if (swipe_right) {
                    stat_change = scenario.right.stats;
                }
                Object.keys(stat_change).forEach((key) => {
                    STATS[key].__update_value(stat_change[key]);
                });
                left_stuff.destroy();
                right_stuff.destroy();
                card_group.clear(true, true);
                card_group.destroy();
            };
        };
        addCard();

        scene.input.on(Phaser.Input.Events.DRAG_START, (pointer, gameObject) => {
            scene.tweens.killTweensOf(gameObject);
        });
        scene.input.on(Phaser.Input.Events.DRAG, (pointer, gameObject, dragX, dragY) => {
            gameObject.setPosition(dragX, gameObject.y);
            let swipe_right = gameObject.x > SIZES.RIGHT_STOP;
            let swipe_left = gameObject.x < SIZES.LEFT_STOP;
            if (swipe_left || swipe_right) {
                scene.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();
                let target_x = swipe_right ? SCREEN_WIDTH * 3/4 : SCREEN_WIDTH * 1/4;
                scene.tweens.add({
                    targets: gameObject,
                    alpha: 0,
                    x: target_x,
                    duration: 500,
                    onComplete: () => {
                        gameObject.__cleanup(swipe_left, swipe_right);
                        addCard();
                    },
                });
            }
        });
        scene.input.on(Phaser.Input.Events.DRAG_END, (pointer, gameObject, dragX, dragY) => {
            scene.tweens.add({
                targets: gameObject,
                x: SCREEN_WIDTH / 2,
                duration: 100,});
        });
    },

    //--------------------------------------------------------------------------
    update: function () {
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
        //add_audio_handler(scene);
        scene.scene.launch('GameScene' );
    },

    //--------------------------------------------------------------------------
    update: function () {
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

        scene.load.spritesheet('phaser_logo', 'assets/phaser-pixel-medium-flat.png',
            { frameWidth: 104, frameHeight: 22 });
        //load_audio(scene);

        scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 0.5)
            .setOrigin(0, 0.5);
        let loading_bar = scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 1)
            .setOrigin(0, 0.5)
            .setScale(0,1);
        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            loading_bar.setScale(percentage,1);
        });

        scene.load.on(Phaser.Loader.Events.COMPLETE, function() {
            scene.scene.start('ControllerScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        let makeRoundedPanelTexture = (scene, key, w, h, radius = 16) => {
            // 1) Draw off-screen
            const g = scene.add.graphics()
                .fillStyle(0xFFFFFF, 1)
                .fillRoundedRect(0, 0, w, h, radius)
            //.lineStyle(5, 0x808080, 1)
            //.strokeRoundedRect(0, 0, w, h, radius);

            // 2) Turn the drawing into a texture in the global cache
            g.generateTexture(key, w, h);

            // 3) Free the Graphics object (no longer needed)
            g.destroy();
        };
        makeRoundedPanelTexture(scene, 'card_bg', SIZES.CARD_WIDTH, SIZES.CARD_HEIGHT);

        /*
        scene.anims.create({
            key: 'crabbucketgames_logo_anim',
            frames: scene.anims.generateFrameNumbers('crabbucketgames_logo',
                { start: 0, end: 17 }),
            skipMissedFrames: true,
            frameRate: 6,
            repeat: 0
        });
        */
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: 0x000000,
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
    scene: [ LoadScene, LogoScene, ControllerScene, GameScene ]
};

let game = new Phaser.Game(config);
