const GRID_SIZE = 128;
const SCREEN_WIDTH = 16 * GRID_SIZE;
const SCREEN_HEIGHT = 9 * GRID_SIZE;
const DEPTHS = {
    BG: 0 * SCREEN_HEIGHT,
    MG: 2 * SCREEN_HEIGHT,
    FG: 4 * SCREEN_HEIGHT,
};
const PLAYER_SPEED = 90*GRID_SIZE/16;

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
            "0%", { font: GRID_SIZE/2 + 'px PressStart2P', fill: '#FFF' })
            .setOrigin(0.5, 0.5);


        scene.load.audio('bg_music', ['assets/PG_In_Game.mp3']);
        scene.load.audio('bg_music_slow', ['assets/PG_In_Game_Slow_Motion.mp3']);
        scene.load.audio('blip_sound', ['assets/Countdown_Blip.wav']);
        scene.load.audio('enemy_death_sound', ['assets/Enemy_Death.wav']);
        scene.load.audio('slash_sound', ['assets/Slash_Attack.wav']);
        scene.load.audio('player_hit', ['assets/Player_Hit_v2.wav']);
        scene.load.audio('player_death', ['assets/Player_Death.wav']);
        this.load.spritesheet('static', 'assets/display_static_strip.png',
            { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('BWKnight', 'assets/BWKnight.png',
            { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('slash', 'assets/slash.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('sword', 'assets/sword.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('sword', 'assets/sword.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('turret', 'assets/turret.png',
            { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('charge', 'assets/charge.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy', 'assets/enemy.png',
            { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('arrow', 'assets/arrow.png',
            { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('life', 'assets/life.png',
            { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('spawn', 'assets/spawn.png',
            { frameWidth: 60, frameHeight: 60 });

        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once(Phaser.Loader.Events.COMPLETE,  function() {
            scene.scene.start('TitleScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'slash_anim',
            frames: scene.anims.generateFrameNumbers('slash',
                { start: 0, end: 2 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });
        scene.anims.create({
            key: 'hero_run_anim',
            frames: scene.anims.generateFrameNumbers('BWKnight',
                { start: 1, end: 2 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'charge_anim',
            frames: scene.anims.generateFrameNumbers('charge',
                { start: 0, end: 3 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 3
        });
        scene.anims.create({
            key: 'enemy_run_anim',
            frames: scene.anims.generateFrameNumbers('enemy',
                { start: 3, end: 4 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 3
        });
        scene.anims.create({
            key: 'arrow_anim',
            frames: scene.anims.generateFrameNumbers('arrow',
                { start: 0, end: 1 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'static_anim',
            frames: scene.anims.generateFrameNumbers('static',
                { start: 0, end: 8 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'spawn_anim',
            frames: scene.anims.generateFrameNumbers('spawn',
                { start: 0, end: 5 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, ['PROTOTYPE','GLITCH'],
            { font: GRID_SIZE + 'px PressStart2P', fill: '#FFF', align: 'center'})
            .setOrigin(0.5, 0.5);

        addButton(
            scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 2*GRID_SIZE, 'START',
                { font: GRID_SIZE/2 + 'px PressStart2P', fill: '#FFF', align: 'center' })
                .setOrigin(0.5, 0.5),
            () => {
                scene.scene.start('ControllerScene', {run_tutorial: false});
            }
        )
        addButton(
            scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 3*GRID_SIZE, 'TUTORIAL',
                { font: GRID_SIZE/2 + 'px PressStart2P', fill: '#FFF', align: 'center' })
                .setOrigin(0.5, 0.5),
            () => {
                scene.scene.start('ControllerScene', {run_tutorial: true});
            }
        )
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let ControllerScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ControllerScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;
        scene.scene.launch('GameScene', data);
        let bg_music = scene.sound.add('bg_music', {loop: true});
        bg_music.play();
        let bg_music_slow = scene.sound.add('bg_music_slow', {loop: true, volume: 0});
        bg_music_slow.play();
        let player_death = scene.sound.add('player_death');

        scene.__setBulletTime = (on) => {
            if (on) {
                static_screen.setAlpha(0);
                scene.tweens.add({
                    targets: static_screen,
                    alpha: 0.5,
                    duration: 50,
                    yoyo: true
                });
            }
            bg_music.setVolume(on ? 0 : 1);
            bg_music_slow.setVolume(on ? 1 : 0);
        };

        let static_screen = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'static', 0)
            .setScale(SCREEN_WIDTH/56)
            .play('static_anim')
            .setAlpha(0);

        let dead_text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'DEAD',
            { font: GRID_SIZE*3 + 'px PressStart2P', fill: '#FFF' })
            .setOrigin(0.5, 0.5)
            .setAngle(Phaser.Math.Between(-8, 8))
            .setVisible(false)
            .setStroke('#000000', GRID_SIZE/8);

        scene.__death = function () {
            scene.tweens.add({
                targets: static_screen,
                alpha: 1,
                duration: 2500
            });
            player_death.play();
            dead_text.setScale(0);
            dead_text.setVisible(true);
            let timeline = scene.tweens.createTimeline()
            timeline.add({
                targets: dead_text,
                scale: 1.2,
                duration: 150,
            });
            timeline.add({
                targets: dead_text,
                scale: 1,
                duration: 150,
            });
            timeline.play();
            scene.scene.pause('GameScene');
            let game_scene = scene.scene.get('GameScene');
            scene.time.delayedCall(3000, () => {
                game_scene.scene.restart({run_tutorial: false});
            });
        };

        scene.__death_callback = () => {
            static_screen.setAlpha(0);
            dead_text.setVisible(false);
        }

        scene.__pause_action = function () {
            return;
            scene.scene.pause('GameScene')
            scene.time.delayedCall(100, () => {
                scene.scene.resume('GameScene');
            });
        };

    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let LayoutManager = {
    align_physics_object: function(object, x,y) {
        object.body.x = x - object.body.width/2;
        object.body.y = y - object.body.height/2;
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

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    __addCharacter: function(scene) {
        let CHARACTER_SPRITE_SIZE = 8;
        let CHARACTER_SPRITE_SCALE = 8;
        let character_width = CHARACTER_SPRITE_SIZE * CHARACTER_SPRITE_SCALE;
        let character_height = CHARACTER_SPRITE_SIZE * CHARACTER_SPRITE_SCALE;
        let player_vulnerable = true;
        let player_life = 3;
        let life_icons = [];
        let offset = SCREEN_WIDTH - 1 * character_width;
        for(let i = 0; i < player_life; i++) {
            life_icons.push(
                scene.scene.get('ControllerScene').add.sprite(offset, SCREEN_HEIGHT - character_height, 'life', 0)
                    .setScrollFactor(0)
                    .setScale(8)
                    .setDepth(DEPTHS.FG)
            )
            offset -= 1.5 * character_width;
        }

        let character_sprite_offset = new Phaser.Math.Vector2(
            0, 0
        );
        let character_sprite = scene.add.sprite(0,0,
            'BWKnight', 0)
            .setScale(CHARACTER_SPRITE_SCALE)
            .setDepth(DEPTHS.MG);
        let sprite_overlay = scene.add.sprite(0,0,
            'BWKnight', 0)
            .setScale(CHARACTER_SPRITE_SCALE)
            .setTintFill(0xff0000)
            .setDepth(DEPTHS.MG)
            .setAlpha(0);

        let hit_box_offset = new Phaser.Math.Vector2(
            0 * character_width, 0 * character_height
        );
        let hit_box = scene.add.rectangle(0, 0,
            character_width/2,character_height,0x00ff00, 0);
        scene.__player_group.add(hit_box);

        let solid_box_offset = new Phaser.Math.Vector2(
            0 * character_width, 0 * character_height
        );
        let solid_box = scene.add.rectangle(0, 0,
            character_width/2,character_height,0x0000ff, 0);
        scene.physics.add.existing(solid_box);

        let ready_to_fire = true;
        let strike_box_offset = new Phaser.Math.Vector2(
            2.5 * character_width, 0*character_height);
        let strike_box = scene.add.sprite(0,0, 'slash', 0)
            .setScale(CHARACTER_SPRITE_SCALE)
            .setVisible(false)
            .setDepth(DEPTHS.MG);

        let hurt_box_offset = new Phaser.Math.Vector2(
            2.5 * character_width, 0 * character_height);
        let hurt_box = scene.add.rectangle(0,0, 3.5*character_width, 3.5*character_height,
            0xffffff, 0);
        scene.__player_attack_group.add(hurt_box);

        hurt_box.__is_attacking = () => {
            return !ready_to_fire;
        };

        let sword_sprite_offset = new Phaser.Math.Vector2(
            1.25 * character_width, 1.25 * character_height);
        let sword_sprite = scene.add.sprite(0,0, 'sword', 0)
            .setScale(CHARACTER_SPRITE_SCALE/2)
            .setDepth(DEPTHS.MG);

        character_sprite.update = function () {
            let center_x = solid_box.body.x + solid_box.width / 2;
            let center_y = solid_box.body.y + solid_box.height / 2;

            character_sprite.setPosition(center_x + character_sprite_offset.x,
                center_y + character_sprite_offset.y);
            sprite_overlay.setPosition(center_x + character_sprite_offset.x,
                center_y + character_sprite_offset.y);

            LayoutManager.align_physics_object(hit_box,
                center_x + hit_box_offset.x,
                center_y + hit_box_offset.y);

            let rotation_center_x = character_sprite.x;
            let rotation_center_y = character_sprite.y;

            strike_box.setPosition(rotation_center_x + strike_box_offset.x,
                rotation_center_y + strike_box_offset.y);

            LayoutManager.align_physics_object(hurt_box,
                rotation_center_x + hurt_box_offset.x,
                rotation_center_y + hurt_box_offset.y);

            sword_sprite.setPosition(rotation_center_x + sword_sprite_offset.x,
                rotation_center_y + sword_sprite_offset.y);
            align_to_mouse_angle();
        };

        let mouse_vector = new Phaser.Math.Vector2(1, 0);
        let sword_vector = new Phaser.Math.Vector2(1, 0);
        let offset_angle = 180;
        let align_to_mouse_angle = () => {
            if (ready_to_fire) {
                sword_vector.x = mouse_vector.x;
                sword_vector.y = mouse_vector.y;
            }
            let angle = sword_vector.angle();
            strike_box_offset.setAngle(angle);
            strike_box.setAngle(Phaser.Math.RadToDeg(angle));
            hurt_box_offset.setAngle(angle);
            sword_sprite_offset.setAngle(angle + Phaser.Math.DegToRad(offset_angle));
            let correction_angle = sword_sprite.flipY ? 45: - 45;
            sword_sprite.setAngle(Phaser.Math.RadToDeg(angle) + correction_angle + offset_angle);
            character_sprite.setFlipX(sword_vector.x < 0);
            sprite_overlay.setFlipX(sword_vector.x < 0);
        };
        character_sprite.__pointer_move = (pointer) => {
            let rotation_center_x = character_sprite.x;
            let rotation_center_y = character_sprite.y;
            let dx = pointer.worldX - rotation_center_x;
            let dy = pointer.worldY - rotation_center_y;
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            mouse_vector.normalize();
            if (!ready_to_fire) {
                align_to_mouse_angle();
            }
        };

        let external_force = new Phaser.Math.Vector2(0, 0);
        let external_force_tween = null;
        let addForce = (dx, dy) => {
            if (external_force_tween) {
                external_force_tween.remove();
            }
            external_force.x += dx;
            external_force.y += dy;
            external_force_tween = scene.tweens.add({
                targets: external_force,
                x: 0,
                y: 0,
                duration: 150
            });
        };

        let damage_vector = new Phaser.Math.Vector2(0, 0);
        hit_box.__damage = (dx, dy) => {
            if (!player_vulnerable) {
                return;
            }
            player_vulnerable = false;

            player_life--;
            scene.__player_hit.play();
            let life_icon = life_icons.pop();
            life_icon.destroy();
            if (player_life === 0) {
                sprite_overlay.setVisible(false);
                character_sprite.setVisible(false);
                strike_box.setVisible(false);
                sword_sprite.setVisible(false);
                scene.scene.get('ControllerScene').__death();
                return;
            }

            damage_vector.x = dx;
            damage_vector.y = dy;
            damage_vector.normalize();
            addForce(damage_vector.x * 20*GRID_SIZE,
                damage_vector.y * 20*GRID_SIZE);
            scene.tweens.add({
                targets: sprite_overlay,
                alpha: 1,
                yoyo: true,
                repeat: 1,
                duration: 50,
                onComplete: () => {
                    player_vulnerable = true;
                }
            });
            scene.cameras.main.shake(50, 0.01, true);
        };

        let character_direction = new Phaser.Math.Vector2(0,0);
        let player_moving = false;
        let player_movement_allowed = true;
        character_sprite.__input = (input) => {
            if (!player_movement_allowed) {
                return;
            }
            character_direction.x = 0;
            character_direction.y = 0;
            if (input.left) {
                character_direction.x -= 1;
            }
            if (input.right) {
                character_direction.x += 1;
            }
            if (input.up) {
                character_direction.y -= 1;
            }
            if (input.down) {
                character_direction.y += 1;
            }
            if (input.fire) {
                if (ready_to_fire) {
                    scene.__slash_sound.play();
                    ready_to_fire = false;
                    strike_box.play('slash_anim');
                    strike_box.setVisible(true);
                    let polarity = strike_box.flipY ? -1: 1;
                    sword_sprite.setFlipY(!sword_sprite.flipY);
                    let sword_tween = scene.tweens.add({
                        targets: {offset_angle: -polarity * 180},
                        props: {offset_angle: polarity * 180},
                        onUpdate: () => {
                            offset_angle = sword_tween.getValue();
                        },
                        duration: 150,
                    });
                    addForce(mouse_vector.x * 0*GRID_SIZE,
                        mouse_vector.y * 0*GRID_SIZE);
                    scene.cameras.main.shake(50, 0.005, true);
                    strike_box.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        strike_box.setVisible(false);
                        ready_to_fire = true;
                        align_to_mouse_angle();
                        strike_box.setFlipY(!strike_box.flipY);
                    });
                }
            }
            //normalize
            character_direction.setLength(PLAYER_SPEED);

            if (!player_moving && character_direction.length() > 0) {
                player_moving = true;
                character_sprite.play('hero_run_anim');
                sprite_overlay.play('hero_run_anim');
            } else if (player_moving && character_direction.length() === 0) {
                player_moving = false;
                character_sprite.anims.stop();
                sprite_overlay.anims.stop();
                character_sprite.setFrame(0);
                sprite_overlay.setFrame(0);
            }
            solid_box.body.setVelocity(external_force.x + character_direction.x,
                external_force.y + character_direction.y);
            character_sprite.update();
        };

        solid_box.body.setCollideWorldBounds();
        return character_sprite;
    },

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;
        scene.scene.bringToTop('ControllerScene');
        scene.scene.get('ControllerScene').__death_callback();
        scene.__slash_sound = scene.sound.add('slash_sound');
        scene.__enemy_death_sound = scene.sound.add('enemy_death_sound');
        scene.__blip_sound = scene.sound.add('blip_sound');
        scene.__player_hit = scene.sound.add('player_hit');

        scene.__updateables = scene.add.group({
            runChildUpdate: true,
        });
        scene.__player_group = scene.physics.add.group();
        scene.__player_attack_group = scene.physics.add.group();
        scene.__bullets = scene.physics.add.group();
        scene.__attackables = scene.physics.add.group();

        scene.physics.add.overlap(scene.__player_group, scene.__bullets,
            (character_hit_box, bullet) => {
                character_hit_box.__damage(bullet.body.velocity.x, bullet.body.velocity.y);
                bullet.__destroy();
            });

        scene.physics.add.overlap(scene.__player_attack_group, scene.__attackables,
            (character_hurt_box, attackable) => {
                if(!character_hurt_box.__is_attacking()){
                    return;
                }
                attackable.__destroy();
            });


        scene.__addbullet = (() => {
            let bullet_pool = [];
            let retire_bullet = (bullet) => {
                bullet.visible(false);
            };

            let recover_bullet = (x, y) => {
                let bullet = bullet_pool.pop();
                return bullet;
            };

            return function(x, y, dx, dy) {
                if (bullet_pool.length === 0) {
                    let bullet = scene.add.circle(x, y, GRID_SIZE / 4, 0xFFFFFF).setDepth(DEPTHS.MG);
                    let hit_box = scene.add.rectangle(x, y, GRID_SIZE / 8, GRID_SIZE/8, 0x0000000, 0.0);
                    scene.__bullets.add(hit_box);
                    scene.__updateables.add(hit_box);
                    hit_box.body.setVelocity(dx, dy);
                    hit_box.update = () => {
                        let center_x = hit_box.body.x + hit_box.width / 2;
                        let center_y = hit_box.body.y + hit_box.height / 2;
                        bullet.setPosition(center_x, center_y);
                    };
                    let delayed_call = scene.time.delayedCall(100000, hit_box.__destroy);
                    hit_box.__destroy = () => {
                        bullet.destroy();
                        hit_box.destroy();
                        delayed_call.remove(false);
                    };

                }
             };
        }) ();

        scene.__getOffsetToPlayer = (x,y) => {
            return {dx: scene.__character_sprite.x - x,
                dy: scene.__character_sprite.y - y};
        };

        scene.__spawn_wave = (() => {
            let major = 4;
            let minor = 0;
            return () => {
                if(Phaser.Utils.Array.GetRandom([true, false])) {
                    let temp = major;
                    major = minor;
                    minor = temp;
                }
                for (let i = 0; i < major; i++) {
                    let point = get_random_enemy_spawn();
                    addEnemySpawn(scene, point.x, point.y, addRunningEnemy);
                }
                for (let i = 0; i < minor; i++) {
                    let point = get_random_enemy_spawn();
                    addEnemySpawn(scene, point.x, point.y, addBulletSpawner);
                }
                if(Phaser.Utils.Array.GetRandom([true, false])) {
                    major++;
                } else {
                    minor++;
                }
            };
        })();

        let grid = scene.add.grid(0, 0,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0x606060)
            .setAltFillStyle(0x808080)
            .setOutlineStyle();

        scene.input.addPointer(5);

        scene.__character_sprite = scene.__addCharacter(scene);

        let bind_event = (key, event, handler) => {
            key.on(event, handler);

            scene.events.once(Phaser.Scenes.Events.SHUTDOWN, function() {
                key.off(event);
            })
        };
        bind_event(scene.input, Phaser.Input.Events.POINTER_MOVE, scene.__character_sprite.__pointer_move);

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        scene.__toggleBulletTime = (() => {

            let on = false;
            let time_scale = 0.5;
            let time_left = scene.scene.get('ControllerScene').add.rectangle(GRID_SIZE/2, SCREEN_HEIGHT - .25*GRID_SIZE,
                GRID_SIZE/4, 1.5*GRID_SIZE, 0xffffff, 0.5)
                .setScrollFactor(0)
                .setOrigin(0.5, 1)
                .setDepth(DEPTHS.FG);
            scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
                console.log('SHUTDOWN');
                time_left.destroy();
                scene.scene.get('ControllerScene').__setBulletTime(false);
            });
            let async_handler = asyncHandler(scene);
            let overlay = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
                SCREEN_WIDTH+GRID_SIZE, SCREEN_HEIGHT+GRID_SIZE, 0xffffff)
                .setScrollFactor(0)
                .setDepth(DEPTHS.FG)
                .setAlpha(0);
            async_handler.addTween({
                targets: time_left,
                scaleY: 1,
                duration: 50000 * (1-time_left.scaleY)
            });
            return () => {
                on = !on;
                if (time_left.scaleY < 0.05) {
                    on = false;
                }
                scene.scene.get('ControllerScene').__setBulletTime(on);
                if (on) {
                    scene.__run_tutorial.handle_bullet_time_on();
                    async_handler.clear();
                    async_handler.addTween({
                        targets: time_left,
                        scaleY: 0,
                        duration: 10000 * time_scale * time_left.scaleY,
                        onComplete: scene.__toggleBulletTime
                    });
                    scene.cameras.main.zoomTo(1.1, 1000, 'Linear', true);
                    async_handler.addTween({
                        targets: overlay,
                        alpha: 0.25,
                        duration: 1000
                    });
                    scene.tweens.timeScale = time_scale;
                    scene.anims.globalTimeScale = time_scale;
                    scene.physics.world.timeScale = 1/time_scale;
                    scene.time.timeScale = time_scale;
                } else {
                    scene.__run_tutorial.handle_bullet_time_off();
                    async_handler.clear();
                    scene.cameras.main.zoomTo(1, 150, 'Linear', true);
                    async_handler.addTween({
                        targets: overlay,
                        alpha: 0,
                        duration: 150
                    });
                    async_handler.addTween({
                        targets: time_left,
                        scaleY: 1,
                        duration: 50000 * (1 - time_left.scaleY)
                    });
                    scene.tweens.timeScale = 1;
                    scene.anims.globalTimeScale = 1;
                    scene.physics.world.timeScale = 1;
                    scene.time.timeScale = 1;
                }
            };
        })();
        bind_event(scene.__cursor_keys.letter_one, Phaser.Input.Keyboard.Events.DOWN,
            scene.__toggleBulletTime);

        let world_bounds = new Phaser.Geom.Rectangle(0,0,0,0);
        scene.cameras.main.setBounds(-SCREEN_WIDTH, -SCREEN_HEIGHT, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        scene.cameras.main.getBounds(world_bounds);
        scene.cameras.main.startFollow(scene.__character_sprite, true, 1, 1, 0, 0);
        scene.physics.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.width, world_bounds.height);
        scene.physics.world.setBoundsCollision();

        let get_random_enemy_spawn = (() => {
            let safe_zone = new Phaser.Geom.Rectangle(0,0,4*GRID_SIZE,4*GRID_SIZE);
            let overlap_zone = new Phaser.Geom.Rectangle(0,0,0,0);
            let spawn_zone = new Phaser.Geom.Rectangle(0,0,0,0);
            let display1 = scene.add.rectangle(0, 0, 0, 0, 0xff0000, 0.25);
            let display2 = scene.add.rectangle(0, 0, 0, 0, 0x00ff00, 0.25);
            let display3 = scene.add.rectangle(0, 0, 0, 0, 0x0000ff, 0.25);
            Phaser.Geom.Rectangle.CopyFrom(world_bounds, spawn_zone);
            Phaser.Geom.Rectangle.Inflate(spawn_zone, -GRID_SIZE, -GRID_SIZE);

            let show_display_rectangle = (geom_rect, display_rect) => {
                display_rect
                    .setDepth(DEPTHS.FG)
                    .setOrigin(0,0)
                    .setPosition(geom_rect.x, geom_rect.y)
                display_rect.width = geom_rect.width;
                display_rect.height = geom_rect.height;
            };

            let show_debugs = () => {
                show_display_rectangle(safe_zone, display1);
                show_display_rectangle(overlap_zone, display2);
                show_display_rectangle(spawn_zone, display3);
            };

            let point = new Phaser.Geom.Point();
            return () => {
                Phaser.Geom.Rectangle.CenterOn(safe_zone, scene.__character_sprite.x, scene.__character_sprite.y);
                if (Phaser.Geom.Rectangle.Overlaps(safe_zone, spawn_zone)) {
                    Phaser.Geom.Rectangle.Random(spawn_zone, point);
                    let tries = 0;
                    while(Phaser.Geom.Rectangle.Contains(safe_zone, point.x, point.y)) {
                        Phaser.Geom.Rectangle.Random(spawn_zone, point);
                        if (tries++ > 100) {
                            break;
                        }
                    }
                } else {
                    overlap_zone.x = 0;
                    overlap_zone.y = 0;
                    overlap_zone.width = 0;
                    overlap_zone.height = 0;
                    Phaser.Geom.Rectangle.Random(spawn_zone, point);
                }
                //show_debugs();
                return point;
            }
        })();

        let score_text = scene.scene.get('ControllerScene').add.text(GRID_SIZE*2,GRID_SIZE*0.5,"00000000", { font: GRID_SIZE*2/4 + 'px PressStart2P', fill: '#FFF' })
            .setOrigin(0.5,0.5)
            .setScrollFactor(0)
            .setAngle(7.5)
            .setDepth(DEPTHS.FG);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            score_text.destroy();
        });
        scene.tweens.add({
            targets: score_text,
            angle: -7.5,
            yoyo: true,
            repeat: -1,
            duration: 2000
        });
        scene.__wave_text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, ["ENEMY WAVE IN", "3"],
            { font: GRID_SIZE*3/4 + 'px PressStart2P', fill: '#FFF' })
            .setOrigin(0.5,0.5)
            .setScrollFactor(0)
            .setAngle(7.5)
            .setDepth(DEPTHS.FG)
            .setAlpha(0.75)
            .setVisible(false);
        scene.__update_score_text = ((delta, x, y) => {
            let async_handler = asyncHandler(scene);
            let displayed_score = 0;
            let true_score = 0;
            return (delta, x, y) => {
                let bonus_text = scene.add.text(x, y - GRID_SIZE/2, "+" + delta, { font: GRID_SIZE*2/4 + 'px PressStart2P', fill: '#FFF' })
                    .setOrigin(0.5, 0.5)
                    .setAngle(Phaser.Math.Between(-8, 8))
                    .setDepth(DEPTHS.FG);
                scene.tweens.add({
                    targets: bonus_text,
                    duration: 250,
                    scale: 1.2,
                    yoyo: true,
                });
                scene.tweens.add({
                    targets: bonus_text,
                    duration: 1000,
                    alpha: 0,
                    y: y - GRID_SIZE,
                });
                true_score += delta;
                let true_delta = true_score - displayed_score;
                async_handler.clear();
                score_text.setScale(1);
                async_handler.addTween({
                    targets:score_text,
                    scale: 1.2,
                    yoyo: true,
                    duration: 250,
                });
                async_handler.addTween({
                    targets: {score: displayed_score},
                    props: {score: true_score},
                    duration: true_delta,
                    onUpdate: function() {
                        displayed_score = Math.round(this.getValue());
                        let score_string = '' + displayed_score;
                        score_text.setText(score_string.padStart(8,'0'));
                    }
                });
            }
        })();

        scene.__spawn_happening = data.run_tutorial;
        scene.__run_tutorial = (() => {
            if (!data.run_tutorial) {
                return {
                    handle_move: () =>{},
                    handle_attack: () =>{},
                    handle_bullet_time_on: () =>{},
                    handle_bullet_time_off: () =>{},
                };
            }

            let text_read_time = 5000;
            let waiting_for_move = false;
            let move_received = false;
            let waiting_for_attack = false;
            let attack_received = false;
            let waiting_for_bullet_time_on = false;
            let bullet_time_on_received = false;
            let waiting_for_bullet_time_off = false;
            let bullet_time_off_received = false;
            let ui_scene = scene.scene.get('ControllerScene');
            let tutorial_text = ui_scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT + GRID_SIZE, ["WASD (OR ARROWS)", "TO MOVE"],
                { font: GRID_SIZE/4 + 'px PressStart2P', fill: '#FFF', align: 'center' })
                .setOrigin(0.5,0.5)
                .setScrollFactor(0)
                .setAngle(0)
                .setDepth(DEPTHS.FG);

            ui_scene.tweens.add({
                targets: tutorial_text,
                y: SCREEN_HEIGHT - GRID_SIZE,
                duration: 250,
                onComplete: () => {
                    ui_scene.time.delayedCall(text_read_time, () => {
                        waiting_for_move = true;
                        sword_swing();
                    });
                },
            });
            let sword_swing = () => {
                if (!waiting_for_move || !move_received) {
                    return;
                }
                waiting_for_move  = false;
                let timeline = ui_scene.tweens.createTimeline()
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT + GRID_SIZE,
                    duration: 250,
                    onComplete: () => {
                        tutorial_text.setText(["MOUSE TO AIM","LEFT CLICK TO ATTACK"])
                    },
                });
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT - GRID_SIZE,
                    duration: 250,
                    onComplete: () => {
                        ui_scene.time.delayedCall(text_read_time, () => {
                            waiting_for_attack = true;
                            bullet_time();
                        });
                    },
                });
                timeline.play();
            };

            let bullet_time = () => {
                if (!waiting_for_attack || !attack_received) {
                    return;
                }
                waiting_for_attack = false;
                let timeline = ui_scene.tweens.createTimeline()
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT + GRID_SIZE,
                    duration: 250,
                    onComplete: () => {
                        tutorial_text.setText(["SPACE TO ACTIVATE","SLOW MOTION"])
                    },
                });
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT - GRID_SIZE,
                    duration: 250,
                    onComplete: () => {
                        ui_scene.time.delayedCall(text_read_time, () => {
                            waiting_for_bullet_time_on = true;
                            bullet_time_off();
                        });
                    },
                });
                timeline.play();
            };
            let bullet_time_off = () => {
                if (!waiting_for_bullet_time_on || !bullet_time_on_received) {
                    return;
                }
                waiting_for_bullet_time_on = false;
                let timeline = ui_scene.tweens.createTimeline()
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT + GRID_SIZE,
                    duration: 250,
                    onComplete: () => {
                        tutorial_text.setText(["SPACE AGAIN TO EXIT","SLOW MOTION"])
                    },
                });
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT - GRID_SIZE,
                    duration: 250,
                    onComplete: () => {
                        ui_scene.time.delayedCall(text_read_time, () => {
                            waiting_for_bullet_time_off = true;
                            outro();
                        });
                    },
                });
                timeline.play();
            };
            let outro = () => {
                if (!waiting_for_bullet_time_off || !bullet_time_off_received) {
                    return;
                }
                waiting_for_bullet_time_off = false;
                let timeline = ui_scene.tweens.createTimeline()
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT + GRID_SIZE,
                    duration: 250,
                    onComplete: () => {
                        tutorial_text.setText(["< SLOW MOTION DRAINS ENERGY","ENERGY REPLENISHES WITH TIME"])
                    },
                });
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT - GRID_SIZE,
                    duration: 250,
                });
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT + GRID_SIZE,
                    delay: text_read_time,
                    duration: 250,
                    onComplete: () => {
                        tutorial_text.setText(["GETTING HIT BY ENEMIES","OR BULLETS COSTS LIVES >"])
                    },
                });
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT - GRID_SIZE,
                    duration: 250,
                });
                timeline.add({
                    targets: tutorial_text,
                    y: SCREEN_HEIGHT + GRID_SIZE,
                    delay: text_read_time,
                    duration: 250,
                    onComplete: () => {
                        scene.__spawn_happening = false;
                    }
                });
                timeline.play();
            };

            let handle_move = () => {
                move_received = true;
                sword_swing();
            };
            let handle_attack = () => {
                attack_received = true;
                bullet_time();
            };
            let handle_bullet_time_on = () => {
                bullet_time_on_received = true;
                bullet_time_off();
            };
            let handle_bullet_time_off = () => {
                bullet_time_off_received = true;
                outro();
            };

            return {
                handle_move: handle_move,
                handle_attack: handle_attack,
                handle_bullet_time_on: handle_bullet_time_on,
                handle_bullet_time_off: handle_bullet_time_off,
            };
        })();
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let input = {
            up: false,
            down: false,
            left: false,
            right: false,
            fire: false,
        };

        if (scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown) {
            input.left = true;
            scene.__run_tutorial.handle_move();
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            input.right = true;
            scene.__run_tutorial.handle_move();
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            input.up = true;
            scene.__run_tutorial.handle_move();
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            input.down = true;
            scene.__run_tutorial.handle_move();
        }

        if (scene.input.activePointer.leftButtonDown()) {
            input.fire = true;
            scene.__run_tutorial.handle_attack();
        }

        scene.__character_sprite.__input(input);

        if (!scene.__spawn_happening && scene.__attackables.getLength() === 0) {
            scene.__spawn_happening = true;
            scene.time.delayedCall(1000, () => {
                scene.__wave_text.setText(['ENEMY WAVE', 'INCOMING!']);
                scene.__wave_text.setVisible(true);
                scene.__wave_text.setScale(1);
                scene.__wave_text.setAngle(Phaser.Math.Between(-8, 8));
            });
            scene.time.delayedCall(2000, () => {
                scene.__wave_text.setText(['3']);
                scene.__blip_sound.play();
                scene.__wave_text.setScale(1.2);
                scene.__wave_text.setAngle(Phaser.Math.Between(-8, 8));
                scene.cameras.main.shake(50, 0.01, true);
            });
            scene.time.delayedCall(3000, () => {
                scene.__wave_text.setText(['2']);
                scene.__blip_sound.play();
                scene.__wave_text.setScale(1.4);
                scene.__wave_text.setAngle(Phaser.Math.Between(-8, 8));
                scene.cameras.main.shake(50, 0.01, true);
            });
            scene.time.delayedCall(4000, () => {
                scene.__wave_text.setText(['1']);
                scene.__blip_sound.play();
                scene.__wave_text.setScale(1.6);
                scene.__wave_text.setAngle(Phaser.Math.Between(-8, 8));
                scene.cameras.main.shake(50, 0.01, true);
            });
            scene.time.delayedCall(5000, () => {
                scene.__wave_text.setText(['GO!']);
                scene.__blip_sound.play();
                scene.__wave_text.setScale(1.8);
                scene.__wave_text.setAngle(Phaser.Math.Between(-8, 8));
                scene.cameras.main.shake(50, 0.01, true);
            });
            scene.time.delayedCall(6000, () => {
                scene.__wave_text.setVisible(false);
                scene.__spawn_wave();
            });
            scene.time.delayedCall(8000, () => {
                scene.__spawn_happening = false;
            });

        }

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
    /*
    plugins: {
        global: [
            { key: 'SceneWatcher', plugin: PhaserSceneWatcherPlugin, start: true }
        ]
    },
     */
    scene: [ LoadScene, TitleScene, ControllerScene, GameScene ]
};

game = new Phaser.Game(config);
