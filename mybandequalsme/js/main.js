const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 512;
const GAME_CONSTANTS = {
    damage_on_attack: 20
};

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('fighter', 'assets/fighter.png', { frameWidth: 128, frameHeight: 128});
        this.load.spritesheet('bg', 'assets/bg.png', { frameWidth: 512, frameHeight: 216});
        this.load.audio('qtclash', ['assets/qtclash.mp3']);
        this.load.image('up', 'assets/up.png');
        this.load.image('down', 'assets/down.png');
        this.load.image('left', 'assets/left.png');
        this.load.image('right', 'assets/right.png');
        this.load.image('d-pad', 'assets/shadedDark04.png');
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let play = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2,
            "click to continue...",
            { font: 32 + 'px Arial', color: '#ffffff'})
            .setOrigin(0.5, 0.5);
        play.setInteractive();
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
            play.scaleX = 1.2;
            play.scaleY = 1.2;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
            play.scaleX = 1;
            play.scaleY = 1;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function(){
            scene.scene.start('GameScene');
            scene.scene.stop('TitleScene');
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

        let INPUTS = {
            UP: 0,
            DOWN: 1,
            LEFT: 2,
            RIGHT: 3,
            MAX: 4,
            random: function () {
                return Phaser.Math.Between(0,3)
            },
            prompt_keys_labels: ['up', 'down', 'left', 'right'],
            prompt_keys: [],
            current_prompt: 0
        };

        let STATES =  {
            ACTIVE: 0,
            OVER: 1
        };

        let game_state = STATES.ACTIVE;
        let health = [100,100];
        let players = [];
        let bg_music = null;

        scene.anims.create({
            key: 'idle',
            frames: [
                { key: 'fighter', frame: 0 },
                { key: 'fighter', frame: 1 },
                { key: 'fighter', frame: 2 },
                { key: 'fighter', frame: 3 }
            ],
            skipMissedFrames: false,
            frameRate: 4,
            repeat: -1
        });
        scene.anims.create({
            key: 'hit',
            frames: [
                { key: 'fighter', frame: 4 },
                { key: 'fighter', frame: 5 },
                { key: 'fighter', frame: 6 },
                { key: 'fighter', frame: 7 }
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'attack',
            frames: [
                { key: 'fighter', frame: 8 },
                { key: 'fighter', frame: 9 },
                { key: 'fighter', frame: 10 },
                { key: 'fighter', frame: 11 },
                { key: 'fighter', frame: 12 },
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0,
        });

        let celebration = function(winner) {
            winner++;
            let ko = scene.add.text(
                SCREEN_WIDTH/2,
                SCREEN_HEIGHT/2,
                "K.O.",
                { font: SCREEN_HEIGHT/2 + 'px Arial Black', color: '#ff0000'})
                .setOrigin(0.5, 0.5)
                .setStroke("#000000", SCREEN_HEIGHT/16)
                .setScale(3)
                .setAlpha(0);
            let winner_text = scene.add.text(
                SCREEN_WIDTH/2,
                SCREEN_HEIGHT/2,
                "Player " + winner + " wins",
                { font: SCREEN_HEIGHT/8 + 'px Arial Black', color: '#ff0000'})
                .setOrigin(0.5, 0.5)
                .setStroke("#000000", SCREEN_HEIGHT/16)
                .setScale(3)
                .setAlpha(0);
            let timeline = scene.tweens.createTimeline();
            timeline.add({
                targets: ko,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 250,
                onComplete: function() {
                    scene.cameras.main.shake(250, 0.015, true);
                }
            });
            timeline.add({
                targets: ko,
                scale: 2,
                alpha: 0,
                duration: 100,
                delay: 500
            });
            timeline.add({
                targets: winner_text,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 250,
                onComplete: function() {
                    scene.cameras.main.shake(250, 0.015, true);
                    scene.time.delayedCall(1000, function() {
                        bg_music.stop();
                        scene.scene.start('TitleScene');
                        scene.scene.stop('GameScene');
                    })
                }
            });
            timeline.play();
        }

        let attack_update = function (animation, frame, gameObject) {
            if (frame.index === 3) {
                damage((gameObject.data.values.index + 1) % 2);
            }
        };

        let life_x = SCREEN_WIDTH/2;
        let life_x_offset = 32;
        let life_y = 64;
        let life_w = SCREEN_WIDTH/2 - 128;
        let life_h = 32;
        let pinstripe = 4;

        let damage = function(index)
        {
            players[index].play('hit')
                .once("animationcomplete-hit", function() {
                    if (INPUTS.prompt_keys[INPUTS.current_prompt].visible) {
                        players[index].setData('ready',true);
                    }
                    players[index].play('idle');
                });
            health[index] = Phaser.Math.Clamp(
                health[index] -  GAME_CONSTANTS.damage_on_attack, 0, 100);
            scene.cameras.main.shake(250, 0.015, true);
            if (health[index] === 0)
            {
                game_state = STATES.OVER;
                for(let player of players) {
                    player.anims.pause();
                }
                celebration((index + 1) % 2);
            }
            //left bar target = scaleX
            //rigth bar target = width
            let tween1 = {
                targets: life[index],
                duration: 200
            };
            let tween2 = {
                targets: life_bg[index],
                delay: 500,
                duration: 100
            };
            if (index === 0)
            {
                tween1.scaleX = health[index]/100;
                tween2.scaleX = health[index]/100;
            } else
            {
                tween1.width = life_w * health[index]/100;
                tween2.width = life_w * health[index]/100;
            }
            scene.tweens.add(tween1);
            scene.tweens.add(tween2);
        };

        for (let i = 2; i >= 0; i--) {
            scene.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT + 64, 'bg', i)
            .setOrigin(0.5, 1)
            .setScale(4);
        }

        players.push(
            scene.add.sprite(SCREEN_WIDTH/2 - 192, SCREEN_HEIGHT, 'fighter', 0)
                .setOrigin(0.5, 1)
                .setScale(4)
                .play('idle')
                .setData('index', 0));
        players.push(
            scene.add.sprite(SCREEN_WIDTH/2 + 192, SCREEN_HEIGHT, 'fighter', 0)
                .setOrigin(0.5, 1)
                .setScale(4)
                .setFlipX(true)
                .play('idle')
                .setData('index', 1));
        players[0].on('animationupdate-attack', attack_update);
        players[0].on('animationcomplete-attack', function() {
            players[0].play('idle');
        });
        players[0].setData('ready',false);
        players[1].on('animationupdate-attack', attack_update);
        players[1].on('animationcomplete-attack', function() {
            players[1].play('idle');
        });
        players[1].setData('ready',false);

        scene.add.rectangle(life_x - life_x_offset + pinstripe/2, life_y,
            life_w + pinstripe, life_h + pinstripe, 0xffff00,0)
            .setOrigin(1,0.5)
            .setStrokeStyle(pinstripe,0xffffff,1);
        scene.add.rectangle(life_x + life_x_offset - pinstripe/2, life_y,
            life_w + pinstripe, life_h + pinstripe, 0xffff00,0)
            .setOrigin(0,0.5)
            .setStrokeStyle(pinstripe,0xffffff,1);
        let life_bg = [];
        life_bg.push(
            scene.add.rectangle(life_x - life_x_offset, life_y,
                life_w, life_h, 0xff0000)
                .setOrigin(1,0.5));
        life_bg.push(
            scene.add.rectangle(life_x + life_x_offset, life_y,
                life_w, life_h, 0xff0000)
                .setOrigin(0,0.5));
        let life = [];
        life.push(
            scene.add.rectangle(life_x - life_x_offset, life_y,
                life_w, life_h, 0xffff00)
            .setOrigin(1,0.5));
        life.push(
            scene.add.rectangle(life_x + life_x_offset, life_y,
                life_w, life_h, 0xffff00)
            .setOrigin(0,0.5))

        for (let label of INPUTS.prompt_keys_labels) {
            INPUTS.prompt_keys.push(
                scene.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, label)
                    .setVisible(false)
            );
        }

        let handle_key_press = function(player_index, input)
        {
            if (!players[player_index].data.values.ready)
            {
                return;
            }

            if (INPUTS.current_prompt === input &&
                INPUTS.prompt_keys[INPUTS.current_prompt].visible) {
                INPUTS.prompt_keys[INPUTS.current_prompt].setVisible(false);
                players[player_index].play('attack');
                scene.time.delayedCall(2000,display_prompt);
                for (let player of players) {
                    player.setData('ready', false);
                }
            } else {
                players[player_index].setData('ready', false);
                damage(player_index);
            }
        };

        let display_prompt = function()
        {
            if (game_state === STATES.OVER) {
                return;
            }
            for (let prompt of INPUTS.prompt_keys)
            {
                prompt.setVisible(false);
            }
            INPUTS.current_prompt = INPUTS.random();
            let prompt = INPUTS.prompt_keys[INPUTS.current_prompt];
            for (let player of players) {
                player.setData('ready', true);
            }
            prompt.setVisible(true);
            prompt.alpha = 0;
            prompt.setScale(3);
            scene.tweens.add({
               targets: prompt,
               scaleX: 1,
               scaleY: 1,
               alpha: 1,
               duration: 250,
               onComplete() {
                   scene.cameras.main.shake(250, 0.015, true);
               }
            });
        };
        scene.time.delayedCall(2000,display_prompt);

        let shutdown_handler = [];

        let bind_key = function(key, handler)
        {
            key.on(Phaser.Input.Keyboard.Events.DOWN, handler);

            shutdown_handler.push(function() {
                key.off(Phaser.Input.Keyboard.Events.DOWN);
            })
        }

        scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
        bind_key(scene.m_cursor_keys.down,
            function(event) {handle_key_press(1,INPUTS.DOWN)});
        bind_key(scene.m_cursor_keys.up,
            function(event) {handle_key_press(1,INPUTS.UP)});
        bind_key(scene.m_cursor_keys.left,
            function(event) {handle_key_press(1,INPUTS.LEFT)});
        bind_key(scene.m_cursor_keys.right,
            function(event) {handle_key_press(1,INPUTS.RIGHT)});
        bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            function() {handle_key_press(0,INPUTS.UP)});
        bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            function() {handle_key_press(0,INPUTS.LEFT)});
        bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            function() {handle_key_press(0,INPUTS.DOWN)});
        bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            function() {handle_key_press(0,INPUTS.RIGHT)});


        scene.input.addPointer(5);
        let locations = [ [128, SCREEN_HEIGHT - 128], [SCREEN_WIDTH - 128, SCREEN_HEIGHT - 128]];
        for(let i = 0; i < locations.length; i++) {
            let dpad = this.add.sprite(locations[i][0], locations[i][1], 'd-pad')
                .setScale(2);
                dpad.alpha = 0.85;
            dpad.setInteractive();
            let dpad_input = function (pointer, index) {
                let dx = pointer.worldX - dpad.x;
                let dy = pointer.worldY - dpad.y;
                if (dx > dy && dy > -dx) {
                    handle_key_press(index, INPUTS.RIGHT);
                } else if (dx < dy && dy < -dx) {
                    handle_key_press(index, INPUTS.LEFT);
                } else if (dx < dy && dy > -dx) {
                    handle_key_press(index, INPUTS.DOWN);
                } else if (dx > dy && dy < -dx) {
                    handle_key_press(index, INPUTS.UP);
                } else {
                    //nothing
                }
            };
            dpad.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
               dpad.alpha = 1;
            });
            dpad.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function() {
                dpad.alpha = .85;
            });
            dpad.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function (pointer) {
                dpad_input(pointer, i);
            });
        }

        scene.events.once('shutdown', function() {
            for (let handler of shutdown_handler)
            {
                handler();
            }
        });

        scene.sound.pauseOnBlur = false;
        bg_music = scene.sound.add('qtclash', {loop: true });
        bg_music.play();
    },

    //--------------------------------------------------------------------------
    update: function() {
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
    scene: [ TitleScene, GameScene ]
};

game = new Phaser.Game(config);
