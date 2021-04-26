const GRID_SIZE = 128;
const GRID_COLS = 16;
const GRID_ROWS = 9
const SCREEN_WIDTH = GRID_COLS * GRID_SIZE;
const SCREEN_HEIGHT = GRID_ROWS * GRID_SIZE;

let SPRITES = [
    'Male 01-1',
    'Female 02-1',
    'Female 15-2',
    'Male 09-2',
    'Male 03-1',
    'Female 05-3'
];

let DEPTHS = {
    BG: 0,
    FLOOR: SCREEN_HEIGHT,
    CHARACTERS: 2*SCREEN_HEIGHT,
    GLASS: 3*SCREEN_HEIGHT,
    UI: 4*SCREEN_HEIGHT,
};

let FONT = 'px PressStart2P';

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
            "0%", { font: GRID_SIZE/2 + FONT, fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        scene.load.audio('bg_music', ['assets/KAV_in_game_music.wav']);
        scene.load.audio('vampire_kill', ['assets/Vampire_Death.wav']);
        scene.load.audio('press_start', ['assets/Press_Start_.wav']);
        scene.load.audio('mission_start', ['assets/Mission_Start.wav']);
        scene.load.audio('mission_complete', ['assets/Mission_Complete.wav']);
        scene.load.audio('mission_failed', ['assets/Mission_Failed.wav']);

        scene.load.spritesheet('death_effect','assets/death_effect.png',
            { frameWidth: 128,  frameHeight: 128});

        scene.load.spritesheet('blood_splatter','assets/1_100x100px.png',
            { frameWidth: 100,  frameHeight: 100});

        for (let sprite of SPRITES) {
            this.load.spritesheet(sprite, 'assets/' + sprite+'.png',
                { frameWidth: 32, frameHeight: 32 });
        }

        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once(Phaser.Loader.Events.COMPLETE,  function() {
            scene.scene.start('TitleScene');
            scene.scene.stop('LoadScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        for (let sprite of SPRITES) {
            for (let frame of [
                {d: 'south', start: 0, end: 2},
                {d: 'west', start: 3, end: 5},
                {d: 'east', start: 6, end: 8},
                {d: 'north', start: 9, end: 11},
            ]) {
                scene.anims.create({
                    key: sprite + '_' + frame.d,
                    frames: scene.anims.generateFrameNumbers(sprite,
                        {start: frame.start, end: frame.end}),
                    skipMissedFrames: false,
                    frameRate: 6,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
        scene.anims.create({
            key: 'death_effect_anim',
            frames: scene.anims.generateFrameNumbers('death_effect',
                { start: 0, end: 11 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });
        scene.anims.create({
            key: 'blood_splatter_anim',
            frames: scene.anims.generateFrameNumbers('blood_splatter',
                { start: 0, end: 21 }),
            skipMissedFrames: false,
            frameRate: 18,
            repeat: 0
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let LevelInfo = {
    reset : () => {
        LevelInfo.stage = 1;
        LevelInfo.numCivilians = 3;
        LevelInfo.numVampires = 1;
        LevelInfo.time = 60;
    }
};

let addButton = (text, handler) => {
    text.setAlpha(0.5);
    text.setInteractive();
    text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        text.setAlpha(1);
    });
    text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        text.setAlpha(0.5);
    });
    text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, handler);
};

let addBoard = function(scene, wall_group, x, y, cols, rows) {
    let width = cols * GRID_SIZE;
    let height = rows * GRID_SIZE;
    let grid = scene.add.grid(x - width/4, y,
        width/2, height, GRID_SIZE, GRID_SIZE, 0x808080)
        .setAltFillStyle(0xC0C0C0)
        .setOutlineStyle()
        .setDepth(DEPTHS.BG);
    scene.add.grid(x + width/4, y,
        width/2, height, GRID_SIZE, GRID_SIZE, 0xC0C0C0)
        .setAltFillStyle(0x808080)
        .setOutlineStyle()
        .setDepth(DEPTHS.BG);

    let platform_size = GRID_SIZE / 4;
    let floor = scene.add.rectangle(x, y + height/2 + platform_size / 2,
        width, platform_size, 0x000000, 1.0);
    wall_group.add(floor);

    floor = scene.add.rectangle(x, y - height/2 -platform_size / 2,
        width, platform_size, 0x000000, 1.0);
    wall_group.add(floor);

    let wall = scene.add.rectangle(x, y,
        platform_size, height, 0x000000, 1.0);
    wall_group.add(wall);

    wall = scene.add.rectangle(x - width/2 - platform_size / 2 , y,
        platform_size, height, 0x000000, 1.0);
    wall_group.add(wall);

    let glass_sheen = scene.add.rectangle(x + width/4, y,
        width/2, height, 0xffffff, 0.25)
        .setDepth(DEPTHS.GLASS);
    let shape = scene.make.graphics();

    //  Create a hash shape Graphics object
    shape.fillStyle(0xffffff);

    //  You have to begin a path for a Geometry mask to work
    shape.beginPath();

    shape.fillRect(x, y - height/2, width/2, height);

    let glass_mask = shape.createGeometryMask();
    let y_start = y - height/2 - height/8 *1.5;
    let glass_streak = scene.add.rectangle(x + width/4, y_start,
        width*2, height/8, 0xffffff, 0.25)
        .setAngle(-45)
        .setDepth(DEPTHS.GLASS)
        .setMask(glass_mask);
    let y_start_2 = y - height/2 - height/8 * 2.5;
    let glass_streak_2 = scene.add.rectangle(x + width/4, y_start_2,
        width*2, height/32, 0xffffff, 0.25)
        .setAngle(-45)
        .setDepth(DEPTHS.GLASS)
        .setMask(glass_mask);
};

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        LevelInfo.reset();

        let press_start = scene.sound.add('press_start');

        scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - GRID_SIZE, ["KILL ALL", "VAMPIRES"],
            { font: GRID_SIZE + FONT, fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI);


        let start_text = scene.add.text(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE * 2,
            "START GAME",
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI)
            .setAlpha(0.5);
        addButton(start_text, () => {
            press_start.play();
            scene.scene.start('GameScene');
            scene.scene.start('MusicScene');
            scene.scene.stop('TitleScene');
        });

        let how_to_text = scene.add.text(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE * 2.5,
            "HOW TO PLAY",
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI)
            .setAlpha(0.5);
        addButton(how_to_text, () => {
            scene.scene.start('HowToPlayScene');
            scene.scene.stop('TitleScene');
        });

        let credit_text = scene.add.text(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE * 3,
            "CREDITS",
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI)
            .setAlpha(0.5);
        addButton(credit_text, () => {
            scene.scene.start('CreditScene');
            scene.scene.stop('TitleScene');
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let CreditScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'CreditScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.add.text(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - GRID_SIZE * 2,
            ["GAME BY:",
            "",
            "CricketHunter",
            "",
            "",
            "MUSIC AND SOUND BY:",
            "",
            "Sethersson",
            "",
            "",
            "ASSETS FROM: ",
            "",
            "pipoya",
            "",
            "XYEzawr",
            "",
            "NYKNCK"],
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF', align: 'center'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI);
        let text = scene.add.text(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE * 3,
            "BACK TO TITLE",
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI)
            .setAlpha(0.5);
        addButton(text, () => {
            LevelInfo.reset();
            scene.scene.start('TitleScene');
            scene.scene.stop('CreditScene');
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let HowToPlayScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'HowToPlayScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.add.text(
            SCREEN_WIDTH/4, SCREEN_HEIGHT/2 - GRID_SIZE * 2,
            ["HUMANS HAVE REFLECTIONS.", "DON'T CLICK ON THEM."],
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF', align: 'center'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI);
        scene.add.text(
            SCREEN_WIDTH*3/4, SCREEN_HEIGHT/2 - GRID_SIZE * 2,
            ["VAMPIRES HAVE NO REFLECTION.",
                "CLICK WITH EXTREME PREJUDICE."],
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF', align: 'center'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI);
        scene.add.text(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE * 2,
            ["CLICK TO KILL ALL VAMPIRES TO COMPLETE YOUR MISSION.",
                "KILLING A HUMAN OR RUNNING OUT OF TIME RESULTS IN FAILURE."],
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF', align: 'center'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI);

        addBoard(scene, {add:()=>{}}, SCREEN_WIDTH/4, SCREEN_HEIGHT/2, 4, 2);
        scene.add.sprite(SCREEN_WIDTH*3/4 - GRID_SIZE, SCREEN_HEIGHT/2, SPRITES[0], 0)
            .setScale(2)
            .setDepth(DEPTHS.CHARACTERS);
        addBoard(scene, {add:()=>{}}, SCREEN_WIDTH*3/4, SCREEN_HEIGHT/2, 4, 2);
        scene.add.sprite(SCREEN_WIDTH/4 - GRID_SIZE, SCREEN_HEIGHT/2, SPRITES[0], 0)
            .setScale(2)
            .setDepth(DEPTHS.CHARACTERS);
        scene.add.sprite(SCREEN_WIDTH/4 + GRID_SIZE, SCREEN_HEIGHT/2, SPRITES[0], 0)
            .setScale(2)
            .setFlipX(true)
            .setDepth(DEPTHS.CHARACTERS);
        let text = scene.add.text(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE * 3,
            "CONTINUE",
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI)
            .setAlpha(0.5);
        addButton(text, () => {
            LevelInfo.reset();
            scene.scene.start('GameScene');
            scene.scene.start('MusicScene');
            scene.scene.stop('HowToPlayScene');
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let MusicScene = new Phaser.Class( {
    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'MusicScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let bg_music = scene.sound.add('bg_music', {loop: true});
        bg_music.play();
        bg_music.volume = 0.75;
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, function() {
            bg_music.stop();
        })
    },

    //--------------------------------------------------------------------------
    update: function () {},
})

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
        let updateables = scene.add.group({
            runChildUpdate: true,
        });
        let player_objects = scene.physics.add.group();
        let walls = scene.physics.add.staticGroup();

        addBoard(scene,  walls,SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - GRID_SIZE/2, GRID_COLS, GRID_ROWS-1);

        let accept_player_input = false;
        let vampires_killed = 0;
        let vampire_kill = scene.sound.add('vampire_kill');
        let mission_start = scene.sound.add('mission_start');
        let mission_failed = scene.sound.add('mission_failed');
        let mission_complete = scene.sound.add('mission_complete');

        let missionEndCalled = false;
        let mission_end_text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, ["MISSION","FAILED"],
            { font: GRID_SIZE*2 + FONT, fill: '#800000', align: 'center'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.UI)
            .setScale(3)
            .setAlpha(0)
            .setAngle(-10);
        let missionEnd = function(succeeded) {
            if (missionEndCalled) {
                return;
            }
            missionEndCalled = true;
            timer.stop();

            accept_player_input = false;
            let sound = mission_failed;
            if (succeeded) {
                mission_end_text.setText(['MISSION', 'COMPLETE']);
                mission_end_text.setColor('#008000');
                sound = mission_complete;
            }
            sound.volume = .25;
            sound.play();

            scene.tweens.add({
                targets: mission_end_text,
                scale: 1,
                alpha: 1,
                duration: 500,
                onComplete: function() {
                    scene.cameras.main.shake(250, 0.007, true);
                    scene.time.delayedCall(1000,() => {
                        if (succeeded) {
                            LevelInfo.stage++;
                            LevelInfo.numVampires += Phaser.Utils.Array.GetRandom([0, 0, 1]);
                            LevelInfo.numCivilians += Phaser.Utils.Array.GetRandom([1, 1, 1, 2, 3]);
                        }
                        scene.scene.restart();
                    });
                }
            })
        };

        let killed_text = scene.add.text(GRID_SIZE/8, SCREEN_HEIGHT - GRID_SIZE/4,
            "",
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(0, 0.5)
            .setDepth(DEPTHS.UI);
        killed_text.update = () => {
            killed_text.setText("KILLED "+vampires_killed + "/" + LevelInfo.numVampires);
        };
        updateables.add(killed_text);

        scene.add.text(GRID_SIZE/8, SCREEN_HEIGHT - GRID_SIZE*3/4,
            "MISSION "+LevelInfo.stage,
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(0, 0.5)
            .setDepth(DEPTHS.UI);
        let back_text = scene.add.text(SCREEN_WIDTH - GRID_SIZE/8, SCREEN_HEIGHT - GRID_SIZE/4, "BACK TO TITLE",
            { font: GRID_SIZE/4 + FONT, fill: '#FFFFFF'})
            .setOrigin(1, 0.5)
            .setAlpha(0.5)
            .setDepth(DEPTHS.UI);
        addButton(back_text, () => {
            scene.scene.stop('GameScene');
            scene.scene.stop('MusicScene');
            scene.scene.start('TitleScene');
        });




        let addTimer = () => {
            let text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT - GRID_SIZE/2, "30.00",
                { font: GRID_SIZE *3/4 + FONT, fill: '#FFFFFF', align: 'center'})
                .setOrigin(0.5, 0.5)
                .setDepth(DEPTHS.UI)
                .setText(`${LevelInfo.time.toFixed(2)}`);

            let timer_event = null;
            let stopped = false;
            text.update = () => {
                if (stopped) {
                    return;
                }
                let remaining = (LevelInfo.time * 1000 - timer_event.getElapsed())/1000;
                text.setText(`${remaining.toFixed(2)}`);
            };

            return {
                start: () => {
                    timer_event = scene.time.addEvent({
                        delay: LevelInfo.time * 1000,
                        callback: () => {
                            text.setText('0.00');
                            missionEnd(false);
                        }
                    });
                    updateables.add(text);
                },
                stop: () => {
                    timer_event.destroy();
                    stopped = true;
                }
            };
        };
        let timer = addTimer();

        let start = () => {
            let vampire = LevelInfo.numVampires === 1 ? "VAMPIRE" : "VAMPIRES";
            let text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - SCREEN_HEIGHT,
                ["MISSION:", "KILL " + LevelInfo.numVampires, vampire],
                { font: GRID_SIZE + FONT, fill: '#FFFFFF', align: 'center'})
                .setOrigin(0.5, 0.5)
                .setDepth(DEPTHS.UI)
                .setAngle(5);
            let timeline = scene.tweens.createTimeline();
            timeline.add({
                targets: text,
                y: SCREEN_HEIGHT/2,
                duration: 500,
                onComplete: () => {
                    scene.cameras.main.shake(250, 0.007, true);

                }
            })
            timeline.add({
                targets: text,
                delay: 2000,
                duration: 500,
                alpha: 0,
                scale: 3,
                onComplete: () => {
                    accept_player_input = true;
                    timer.start();
                }
            });
            timeline.play();
            mission_start.volume = .25;
            mission_start.play();
        };
        start();

        let addPlayer = (show_reflection) => {
            let x = Phaser.Math.Between(GRID_SIZE/2, GRID_SIZE*7 + GRID_SIZE/2);
            let y = Phaser.Math.Between(GRID_SIZE/2, GRID_SIZE*7 + GRID_SIZE/2);
            let sprite = Phaser.Utils.Array.GetRandom(SPRITES);
            let player = scene.add.sprite(x, y, sprite)
                .setScale(2);
            let player_mirror = scene.add.sprite(SCREEN_WIDTH-x, y, sprite)
                .setFlipX(true)
                .setScale(2)
                .setVisible(show_reflection);
            let dx = 0;
            let dy = 0;
            let delayed_call = null;
            let update_state = () => {
                let state = Phaser.Utils.Array.GetRandom([0,1,2,3,4]);
                switch(state) {
                    case 0:
                        player.anims.stop();
                        player_mirror.anims.stop();
                        dx = 0;
                        dy = 0;
                        break;
                    case 1:
                        player.anims.play(sprite+'_south');
                        player_mirror.anims.play(sprite+'_south');
                        dx = 0;
                        dy = GRID_SIZE / 2;
                        break;
                    case 2:
                        player.anims.play(sprite+'_north');
                        player_mirror.anims.play(sprite+'_north');
                        dx = 0;
                        dy = -GRID_SIZE / 2;
                        break;
                    case 3:
                        player.anims.play(sprite+'_east');
                        player_mirror.anims.play(sprite+'_east');
                        dx = GRID_SIZE / 2;
                        dy = 0;
                        break;
                    case 4:
                        player.anims.play(sprite+'_west');
                        player_mirror.anims.play(sprite+'_west');
                        dx = -GRID_SIZE / 2;
                        dy = 0;
                        break;
                }
                delayed_call =
                    scene.time.delayedCall(Phaser.Math.Between(1000, 5000), update_state);
            };
            player.update = () => {
                player_mirror.setPosition(SCREEN_WIDTH - player.x, player.y);
                player.body.setVelocity(dx,dy);
                let depth = DEPTHS.CHARACTERS + player.y;
                player.setDepth(depth);
                player_mirror.setDepth(depth);
            };
            player.setInteractive();
            player.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                if (!accept_player_input) {
                    return;
                }
                if (!show_reflection) {
                    let death_effect = scene.add.sprite(player.x, player.y - 16, 'death_effect', 0)
                        .play('death_effect_anim')
                        .setDepth(DEPTHS.CHARACTERS + player.y);
                    death_effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        death_effect.destroy();
                    });
                    vampire_kill.play();
                    vampires_killed++;
                    if (LevelInfo.numVampires === vampires_killed) {
                        missionEnd(true);
                    }
                } else {
                    let blood_splatter = scene.add.sprite(player.x, player.y, 'blood_splatter', 0)
                        .setScale(2)
                        .play('blood_splatter_anim')
                        .setDepth(DEPTHS.FLOOR + player.y);
                    let blood_splatter_mirror = scene.add.sprite(SCREEN_WIDTH - player.x, player.y, 'blood_splatter', 0)
                        .setScale(2)
                        .play('blood_splatter_anim')
                        .setDepth(DEPTHS.FLOOR + player.y);
                    blood_splatter.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        blood_splatter.destroy();
                        blood_splatter_mirror.destroy();
                    });
                    missionEnd(false);
                }
                player.destroy();
                player_mirror.destroy();
                delayed_call.remove();
            });
            player_objects.add(player);
            update_state();

            updateables.add(player);
        };

        for (let i = 0; i < LevelInfo.numCivilians; i++) {
            addPlayer(true);
        }
        for (let i = 0; i < LevelInfo.numVampires; i++) {
            addPlayer(false);
        }

        scene.physics.add.collider(player_objects, walls);
        //scene.physics.add.collider(player_objects, player_objects);
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;
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
    scene: [ LoadScene, TitleScene, HowToPlayScene, CreditScene, MusicScene, GameScene ]
};

game = new Phaser.Game(config);
