const GRID_SIZE = 128;
const SCREEN_WIDTH = 16 * GRID_SIZE;
const SCREEN_HEIGHT = 9 * GRID_SIZE;
const DEPTHS = {
    BG: 0 * SCREEN_HEIGHT,
    MG: 2 * SCREEN_HEIGHT,
    FG: 4 * SCREEN_HEIGHT,
};
const SVG_SCALE = 5;
const FONT = 'px AcmeRegular Bold';

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

        //scene.load.audio('bg_music', ['assets/PG_In_Game.mp3']);
        /*
        this.load.spritesheet('spawn', 'assets/spawn.png',
            { frameWidth: 60, frameHeight: 60 });
        */
        scene.load.path = "assets/";
        scene.load.image('bg_image', 'papelIGuess.jpeg');
        scene.load.svg('bass_clef', 'bass-only_23998.svg', { scale: SVG_SCALE });
        scene.load.svg('treble_clef', 'treble-only_304441.svg', { scale: SVG_SCALE });
        scene.load.spritesheet('evil_note', 'EvilNote.png',
            { frameWidth: 32, frameHeight: 32 });

        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once(Phaser.Loader.Events.COMPLETE,  function() {
            scene.scene.start('GameScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'evil_note_move_anim',
            frames: scene.anims.generateFrameNumbers('evil_note',
                { start: 0, end: 6 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'evil_note_death_anim',
            frames: scene.anims.generateFrameNumbers('evil_note',
                { start: 7, end: 10 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'evil_note_chomp_anim',
            frames: scene.anims.generateFrameNumbers('evil_note',
                { start: 11, end: 17 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let asyncHandler = function (scene) {
    let self = this;
    let m_tweens = [];
    let m_timelines = [];
    let m_delayedCalls = [];

    //clear async calls
    let clear = function () {
        Phaser.Utils.Array.Each(m_tweens, function (tween) {
            tween.remove();
        }, self);
        Phaser.Utils.Array.Each(m_timelines, function (timeline) {
            timeline.stop();
        }, self);
        Phaser.Utils.Array.Each(m_delayedCalls, function (delayedCall) {
            delayedCall.remove(false);
        }, self);
        m_tweens = [];
        m_timelines = [];
        m_delayedCalls = [];
    };

    let pause = function () {
        Phaser.Utils.Array.Each(m_tweens, (tween) => tween.pause(), self);
        Phaser.Utils.Array.Each(m_timelines, (timeline) => timeline.pause(), self);
        Phaser.Utils.Array.Each(m_delayedCalls, (delayedCall) => delayedCall.paused = true, self);
    };

    let resume = function () {
        Phaser.Utils.Array.Each(m_tweens, (tween) => tween.resume(), self);
        Phaser.Utils.Array.Each(m_timelines, (timeline) => timeline.resume(), self);
        Phaser.Utils.Array.Each(m_delayedCalls, (delayedCall) => delayedCall.paused = false, self);
    };

    let addTween = function (tween) {
        m_tweens.push(scene.tweens.add(tween));
    };

    let addTweenSequence = function (tweens) {
        let timeline = scene.tweens.createTimeline();
        m_timelines.push(timeline);
        for (let tween of tweens) {
            timeline.add(tween);
        }
        timeline.play();
    };

    let addTweenParallel = function (tweens, onComplete) {
        let target_rendevous = tweens.length;
        let current_rendevous = 0;
        let check_rendevous = function () {
            current_rendevous++;
            if (current_rendevous === target_rendevous) {
                onComplete();
            }
        };
        for (let tween of tweens) {
            tween.onComplete = check_rendevous;
            m_tweens.push(scene.tweens.add(tween));
        }
    };

    let addDelayedCall = function (delay, callback, args, scope) {
        m_delayedCalls.push(scene.time.delayedCall(delay, callback, args, scope));
    };

    return {
        clear: clear,
        pause: pause,
        resume: resume,
        addTween: addTween,
        addTweenParallel: addTweenParallel,
        addTweenSequence: addTweenSequence,
        addDelayedCall: addDelayedCall
    };
};

let addHoverZone = function(scene, x_left, y_center, length) {
    let hover_zone = scene.add.rectangle(x_left, y_center, length, 11*SVG_SCALE, 0x000000, 0.25)
        .setVisible(false)
        .setOrigin(0, 0.5)
        .setDepth(DEPTHS.BG);
    hover_zone.setInteractive();
    hover_zone.input.alwaysEnabled = true;
    hover_zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        hover_zone.setVisible(true);
    });
    hover_zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        hover_zone.setVisible(false);
    });
};

let addButton = (object, handler) => {
    object.setAlpha(0.5);
    object.setInteractive();
    object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        object.setAlpha(1);
    });
    object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        object.setAlpha(0.5);
    });
    object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, handler);
};

let addBars = function(scene, x_left, y_center, length) {
    scene.add.rectangle(x_left, y_center, length, 1.25*SVG_SCALE, 0x000000)
        .setDepth(DEPTHS.MG)
        .setOrigin(0, 0.5);
    /*
    for (let y of [0, 11, -11, 22, -22, 33, -33, -44, 44, -55, 55, -66, 66]) {
        addHoverZone(scene, x_left, y_center + (3*SVG_SCALE) + y*SVG_SCALE, length);
    }
    */
    scene.add.rectangle(x_left, y_center + (22*SVG_SCALE), length, 1.25*SVG_SCALE, 0x000000)
        .setDepth(DEPTHS.MG)
        .setOrigin(0, 0.5);
    scene.add.rectangle(x_left, y_center + (22*2*SVG_SCALE), length, 1.25*SVG_SCALE, 0x000000)
        .setDepth(DEPTHS.MG)
        .setOrigin(0, 0.5);
    scene.add.rectangle(x_left, y_center - (22*SVG_SCALE), length, 1.25*SVG_SCALE, 0x000000)
        .setDepth(DEPTHS.MG)
        .setOrigin(0, 0.5);
    scene.add.rectangle(x_left, y_center - (22*2*SVG_SCALE), length, 1.25*SVG_SCALE, 0x000000)
        .setDepth(DEPTHS.MG)
        .setOrigin(0, 0.5);
    scene.add.rectangle(x_left, y_center, 5*SVG_SCALE, 88*SVG_SCALE, 0x000000)
        .setDepth(DEPTHS.MG)
        .setOrigin(0, 0.5);
};

let addBassClef = function(scene, x_left, y_center, length) {
    scene.add.image(x_left + (969/5 * SVG_SCALE)/2 - (10*SVG_SCALE) - (3*SVG_SCALE), y_center, 'bass_clef');
    addBars(scene, x_left, y_center, length);
};

let addTrebleClef = function(scene, x_left, y_center, length) {
    scene.add.image(x_left + (969/5 * SVG_SCALE)/2 + (24 * SVG_SCALE) - (10*SVG_SCALE), y_center  + (18 * SVG_SCALE) - (3*SVG_SCALE), 'treble_clef');
    addBars(scene, x_left, y_center, length);
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
    create: function (data) {
        let scene = this;

        let bg_image = scene.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg_image')
            .setDepth(DEPTHS.BG);

        //addBassClef(scene, GRID_SIZE, SCREEN_HEIGHT/2, SCREEN_WIDTH);
        addTrebleClef(scene, GRID_SIZE, SCREEN_HEIGHT/2, SCREEN_WIDTH);

        let current_note = 'undefined';
        let wrong_count = 0;
        let wrong_text = scene.add.text(0, 0, 'WRONG: 0', { font: GRID_SIZE*1 + FONT, fill: '#000' })
            .setOrigin(0, 0)
            .setDepth(DEPTHS.MG);
        let increment_wrong_text = () => {
            wrong_count++;
            wrong_text.setText("WRONG: " + wrong_count);
        };

        let current_evil_note;
        let add_note = function() {
            let note_speed = 16;
            let async_handler = asyncHandler(scene);
            let min_offset = SCREEN_WIDTH + SVG_SCALE * 16;
            let threshold = GRID_SIZE * 4;
            let min_dist = min_offset - threshold;
            let number_of_steps = Math.ceil(min_dist/(note_speed * SVG_SCALE));
            let offset = Phaser.Math.Between(-6, 6);

            current_note = ['A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C'][offset + 6];

            let evil_note = scene.add.sprite(threshold + number_of_steps * note_speed * SVG_SCALE, SCREEN_HEIGHT / 2 + offset * 11 * SVG_SCALE, 'evil_note', 0)
                .setScale(SVG_SCALE)
                .setDepth(DEPTHS.MG+1);

            let evil_note_bar = scene.add.rectangle(evil_note.x, evil_note.y, evil_note.displayWidth, 1.25 * SVG_SCALE, 0x000000, 1)
                .setDepth(DEPTHS.MG)
                .setVisible(offset === 6 || offset === -6);
            let note_move = () => {
                if (evil_note.x <= threshold) {
                    evil_note.play('evil_note_chomp_anim');
                    evil_note.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        destroy();
                        increment_wrong_text();
                    });
                    return;
                }
                evil_note.play('evil_note_move_anim');
                async_handler.addTween({
                    targets: [evil_note, evil_note_bar],
                    x: Math.max(threshold, evil_note.x - note_speed * SVG_SCALE),
                    delay: 0,
                    duration: 500,
                    ease: 'Quad.EaseOut',
                    onComplete: () => {
                        async_handler.addDelayedCall(500 - 125, note_move)
                    },
                })
            };
            note_move();

            let destroy = function () {
                async_handler.clear();
                evil_note.play('evil_note_death_anim');
                evil_note.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    evil_note.destroy();
                    evil_note_bar.destroy();
                    current_evil_note = add_note();
                });
            };

            return {
                destroy: destroy,
                getNote: () => {
                    return current_note;
                }
            };
        };
        current_evil_note = add_note();
/*
        //repeat: 10,
        onComplete: () => {
            evil_note.play('evil_note_chomp_anim');
            evil_note.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                evil_note.play('evil_note_death_anim');
                evil_note.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    evil_note.destroy();
                });
            });
        }
*/

        scene.input.addPointer(5);

        let notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        for(let x = -3; x <= 3; x++) {
            let this_note = notes[x + 3];
            let this_note_button = scene.add.text(SCREEN_WIDTH/2 + x * 1.5 * GRID_SIZE, SCREEN_HEIGHT, this_note, { font: GRID_SIZE + FONT, fill: '#000' })
                .setDepth(DEPTHS.FG)
                .setOrigin(0.5, 1);
            addButton(this_note_button, () => {
                if (current_evil_note.getNote() === this_note) {
                    current_evil_note.destroy();
                } else {
                    increment_wrong_text();
                }
            });
        }

        return;


        let bass_clef = scene.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bass_clef')
            .setDepth(DEPTHS.MG)
            .setVisible(false);
        console.log(bass_clef.displayWidth);
        console.log(bass_clef.getBounds());
        /*
        scene.add.rectangle(bass_clef.x, bass_clef.y, bass_clef.displayWidth, bass_clef.displayHeight, 0xff0000, 0.5)
            .setDepth(DEPTHS.BG);
        */
        let treble_clef = scene.add.image(SCREEN_WIDTH/2 + (24 * SVG_SCALE), SCREEN_HEIGHT/2 + (18 * SVG_SCALE), 'treble_clef')
            .setDepth(DEPTHS.MG)
            .setVisible(true);
        /*
        scene.add.rectangle(treble_clef.x, treble_clef.y, treble_clef.displayWidth, treble_clef.displayHeight, 0x00ff00, 0.5)
            .setDepth(DEPTHS.BG);
         */
        addBars(scene, bass_clef.x - bass_clef.displayWidth/2 + 10*SVG_SCALE, bass_clef.y, bass_clef.displayWidth);
/*
        scene.add.rectangle(bass_clef.x + 7.5*SVG_SCALE, bass_clef.y + (3*SVG_SCALE), bass_clef.displayWidth, 1.25*SVG_SCALE, 0x000000)
            .setDepth(DEPTHS.FG);
        scene.add.rectangle(bass_clef.x + 7.5*SVG_SCALE, bass_clef.y + (3*SVG_SCALE) + (22*SVG_SCALE), bass_clef.displayWidth, 1.25*SVG_SCALE, 0x000000)
            .setDepth(DEPTHS.FG);
        scene.add.rectangle(bass_clef.x + 7.5*SVG_SCALE, bass_clef.y + (3*SVG_SCALE) + (22*2*SVG_SCALE), bass_clef.displayWidth, 1.25*SVG_SCALE, 0x000000)
            .setDepth(DEPTHS.FG);
        scene.add.rectangle(bass_clef.x + 7.5*SVG_SCALE, bass_clef.y + (3*SVG_SCALE) - (22*SVG_SCALE), bass_clef.displayWidth, 1.25*SVG_SCALE, 0x000000)
            .setDepth(DEPTHS.FG);
        scene.add.rectangle(bass_clef.x + 7.5*SVG_SCALE, bass_clef.y + (3*SVG_SCALE) - (22*2*SVG_SCALE), bass_clef.displayWidth, 1.25*SVG_SCALE, 0x000000)
            .setDepth(DEPTHS.FG);
        scene.add.rectangle(bass_clef.x - bass_clef.displayWidth/2 + 10*SVG_SCALE, bass_clef.y + (3*SVG_SCALE), 5*SVG_SCALE, 88*SVG_SCALE, 0x000000)
            .setDepth(DEPTHS.FG);
*/
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let config = {
    backgroundColor: '#C0C0C0',
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
