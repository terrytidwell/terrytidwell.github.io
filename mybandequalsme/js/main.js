const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 512;
let GAME_CONSTANTS = {
    damage_on_attack: 20,
    cpu_speed: { default: 500, minimum: 300, maximum: 1000, step: 25 },
    avatars: {default:0, options:['ryu','cammy']}
};

let global_game_state = {
    avatars: [GAME_CONSTANTS.avatars.default,GAME_CONSTANTS.avatars.default],
    cpu: [false, false],
    cpu_speed: [GAME_CONSTANTS.cpu_speed.default, GAME_CONSTANTS.cpu_speed.default]
};

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('ryu', 'assets/ryu.png', { frameWidth: 128, frameHeight: 128});
        this.load.spritesheet('cammy', 'assets/cammy.png', { frameWidth: 128, frameHeight: 128});
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

        scene.anims.create({
            key: 'ryu_idle',
            frames: [
                { key: 'ryu', frame: 0 },
                { key: 'ryu', frame: 1 },
                { key: 'ryu', frame: 2 },
                { key: 'ryu', frame: 3 }
            ],
            skipMissedFrames: false,
            frameRate: 4,
            repeat: -1
        });
        scene.anims.create({
            key: 'ryu_hit',
            frames: [
                { key: 'ryu', frame: 4 },
                { key: 'ryu', frame: 5 },
                { key: 'ryu', frame: 6 },
                { key: 'ryu', frame: 7 }
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'ryu_pre_attack',
            frames: [
                { key: 'ryu', frame: 8 },
                { key: 'ryu', frame: 9 },
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0,
        });
        scene.anims.create({
            key: 'ryu_post_attack',
            frames: [
                { key: 'ryu', frame: 10 },
                { key: 'ryu', frame: 11 },
                { key: 'ryu', frame: 12 },
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0,
        });

        scene.anims.create({
            key: 'cammy_idle',
            frames: [
                { key: 'cammy', frame: 0 },
                { key: 'cammy', frame: 1 },
                { key: 'cammy', frame: 2 },
                { key: 'cammy', frame: 3 },
                { key: 'cammy', frame: 4 }
            ],
            skipMissedFrames: false,
            frameRate: 4,
            yoyo: true,
            repeat: -1
        });
        scene.anims.create({
            key: 'cammy_hit',
            frames: [
                { key: 'cammy', frame: 12 },
                { key: 'cammy', frame: 13 },
                { key: 'cammy', frame: 14 },
                { key: 'cammy', frame: 15 }
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'cammy_pre_attack',
            frames: [
                { key: 'cammy', frame: 5 },
                { key: 'cammy', frame: 6 },
                { key: 'cammy', frame: 7 },
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0,
        });
        scene.anims.create({
            key: 'cammy_post_attack',
            frames: [
                { key: 'cammy', frame: 8 },
                { key: 'cammy', frame: 9 },
                { key: 'cammy', frame: 10 },
                { key: 'cammy', frame: 11 }
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0,
        });

        let make_button = function(object, func) {
            object.setInteractive();
            object.alpha = 0.5;
            object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
                object.alpha = 1;
            });
            object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
                object.alpha = 0.5;
            });
            object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, func);
        }


        let TEXT_SIZE = 32;

            let play = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2,
            "Fight!",
            { font: TEXT_SIZE + 'px', color: '#ffffff'})
            .setOrigin(0.5, 0.5);
        make_button(play, function(){
            scene.scene.start('GameScene');
            scene.scene.stop('TitleScene');
        })


        let player_type = ['player', 'cpu'];
        let player_index = [global_game_state.cpu[0] ? 1 : 0, global_game_state.cpu[1] ? 1 : 0];
        let max_width = scene.add.text(
            0,0, 'player',
            { fontSize: ''+TEXT_SIZE+'px', fill: '#FFF' }).setVisible(false).width;
        let make_selector = function(x,y,index, selection, selection_function) {
            let text = scene.add.text(x,
                y,
                selection[index], { fontSize: ''+TEXT_SIZE+'px', fill: '#FFF' })
                .setOrigin(0.5 , 0.5);
            let make_func = function(delta) {
                return function() {
                    index += delta;
                    if (index < 0) {
                        index = selection.length - 1;
                    }
                    if (index >= selection.length) {
                        index = 0
                    }
                    text.setText(selection[index])
                    selection_function(index);
                };
            }
            let prev = scene.add.text(x - max_width/2 - TEXT_SIZE,
                y,
                "<<", { fontSize: ''+TEXT_SIZE+'px', fill: '#FFF' }).setOrigin(0.5,0.5);
            make_button(prev, make_func(-1));
            let next = scene.add.text(x + max_width/2 + TEXT_SIZE,
                y,
                ">>", { fontSize: ''+TEXT_SIZE+'px', fill: '#FFF' }).setOrigin(0.5,0.5);
            make_button(next, make_func(1));
            return [text, prev, next];
        }
        make_selector(
            SCREEN_WIDTH/4,SCREEN_HEIGHT * 3/4,
            global_game_state.avatars[0], GAME_CONSTANTS.avatars.options,function(choice){
            global_game_state.avatars[0] = choice;
        });
        make_selector(
            SCREEN_WIDTH * 3/4,SCREEN_HEIGHT * 3/4,
            global_game_state.avatars[1], GAME_CONSTANTS.avatars.options,function(choice){
            global_game_state.avatars[1] = choice;
        });

        let cpu_speeds = [];
        let cpu_speed_indexes = [0, 0];
        for (let i = 0;  GAME_CONSTANTS.cpu_speed.minimum + i * GAME_CONSTANTS.cpu_speed.step
        <= GAME_CONSTANTS.cpu_speed.maximum; i++) {
            let cpu_speed = GAME_CONSTANTS.cpu_speed.minimum + i * GAME_CONSTANTS.cpu_speed.step;
            cpu_speeds.push(cpu_speed);
            if (cpu_speed === global_game_state.cpu_speed[0]) {
                cpu_speed_indexes[0] = i;
            }
            if (cpu_speed === global_game_state.cpu_speed[1]) {
                cpu_speed_indexes[1] = i;
            }
        }

        let cpu_speed_0 = make_selector(
            SCREEN_WIDTH/4, SCREEN_HEIGHT * 3/4 + 2*TEXT_SIZE,
            cpu_speed_indexes[0], cpu_speeds ,function(choice){
                global_game_state.cpu_speed[0] = cpu_speeds[choice];
            });
        for (let button of cpu_speed_0) {
            button.setVisible(player_index[0]);
        }
        let cpu_speed_1 = make_selector(
            SCREEN_WIDTH * 3/4, SCREEN_HEIGHT * 3/4 + 2*TEXT_SIZE,
            cpu_speed_indexes[1], cpu_speeds ,function(choice){
                global_game_state.cpu_speed[1] = cpu_speeds[choice];
            });
        for (let button of cpu_speed_1) {
            button.setVisible(player_index[1]);
        }

        make_selector(
            SCREEN_WIDTH/4, SCREEN_HEIGHT * 3/4 + TEXT_SIZE,
            player_index[0], player_type,function(choice){
                let is_cpu = choice === 1;
                global_game_state.cpu[0] = is_cpu;
                for (let button of cpu_speed_0) {
                    button.setVisible(is_cpu);
                }
            });
        make_selector(
            SCREEN_WIDTH * 3/4, SCREEN_HEIGHT * 3/4 + TEXT_SIZE,
            player_index[1], player_type,function(choice){
                let is_cpu = choice === 1;
                global_game_state.cpu[1] = is_cpu;
                for (let button of cpu_speed_1) {
                    button.setVisible(is_cpu);
                }
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
        };

        let life_x = SCREEN_WIDTH/2;
        let life_x_offset = 32;
        let life_y = 64;
        let life_w = SCREEN_WIDTH/2 - 128;
        let life_h = 32;
        let pinstripe = 4;

        let damage = function(index)
        {
            players[index].play(players[index].data.values.name + '_hit')
                .once("animationcomplete-" + players[index].data.values.name + "_hit", function() {
                    if (INPUTS.prompt_keys[INPUTS.current_prompt].visible) {
                        players[index].setData('ready',true);
                    }
                    players[index].play(players[index].data.values.name + '_idle');
                });
            health[index] = Phaser.Math.Clamp(
                health[index] -  GAME_CONSTANTS.damage_on_attack, 0, 100);
            scene.cameras.main.shake(250, 0.015, true);
            if (health[index] === 0)
            {
                if (game_state === STATES.OVER) {
                    return
                }
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

        let life_bg = [];
        let life = [];

        for (let i = 0; i < 2; i++) {
            let name = GAME_CONSTANTS.avatars.options[global_game_state.avatars[i]];
            let flipX = [false, true][i];
            let xOffset = [-1, 1][i];
            let xOrigin = [1, 0][i];
            players.push(
                scene.add.sprite(SCREEN_WIDTH/2 + xOffset * 128, SCREEN_HEIGHT, name, 0)
                    .setOrigin(0.5, 1)
                    .setScale(4)
                    .setFlipX(flipX)
                    .setData('index', i)
                    .setData('name', name)
                    .play(name +'_idle'));
            players[i].on('animationcomplete-' + name + '_pre_attack', function() {
                players[i].play(name + '_post_attack');
                damage((players[i].data.values.index + 1) % 2);
            });
            players[i].on('animationcomplete-' + name + '_post_attack', function() {
                players[i].play(name + '_idle');
            });
            players[i].setData('ready',false);

            scene.add.rectangle(life_x + (xOffset * life_x_offset) + (-xOffset * pinstripe/2), life_y,
                life_w + pinstripe, life_h + pinstripe, 0xffff00,0)
                .setOrigin(xOrigin,0.5)
                .setStrokeStyle(pinstripe,0xffffff,1);
            life_bg.push(
                scene.add.rectangle(life_x + (xOffset * life_x_offset), life_y,
                    life_w, life_h, 0xff0000)
                    .setOrigin(xOrigin,0.5));
            life.push(
                scene.add.rectangle(life_x + (xOffset * life_x_offset), life_y,
                    life_w, life_h, 0xffff00)
                    .setOrigin(xOrigin,0.5));
        }

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
            if (STATES.OVER === game_state)
            {
                return;
            }

            if (INPUTS.current_prompt === input &&
                INPUTS.prompt_keys[INPUTS.current_prompt].visible) {
                INPUTS.prompt_keys[INPUTS.current_prompt].setVisible(false);
                players[player_index].play(players[player_index].data.values.name + '_pre_attack');
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
            for (let cpu_id = 0; cpu_id < global_game_state.cpu.length; cpu_id++)
            {
                if (global_game_state.cpu[cpu_id]) {
                    scene.time.delayedCall(global_game_state.cpu_speed[cpu_id], function() {
                        handle_key_press(cpu_id, INPUTS.current_prompt);
                    });
                }
            }
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

        if (!global_game_state.cpu[1]){
            scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
            bind_key(scene.m_cursor_keys.down,
                function(event) {handle_key_press(1,INPUTS.DOWN)});
            bind_key(scene.m_cursor_keys.up,
                function(event) {handle_key_press(1,INPUTS.UP)});
            bind_key(scene.m_cursor_keys.left,
                function(event) {handle_key_press(1,INPUTS.LEFT)});
            bind_key(scene.m_cursor_keys.right,
                function(event) {handle_key_press(1,INPUTS.RIGHT)});
        }
        if (!global_game_state.cpu[0])
        {
            bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                function() {handle_key_press(0,INPUTS.UP)});
            bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                function() {handle_key_press(0,INPUTS.LEFT)});
            bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                function() {handle_key_press(0,INPUTS.DOWN)});
            bind_key(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                function() {handle_key_press(0,INPUTS.RIGHT)});
        }

        scene.input.addPointer(5);
        let locations = [ [128, SCREEN_HEIGHT - 128], [SCREEN_WIDTH - 128, SCREEN_HEIGHT - 128]];
        for(let i = 0; i < locations.length; i++) {
            if (global_game_state.cpu[i]) {
                continue;
            }
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
