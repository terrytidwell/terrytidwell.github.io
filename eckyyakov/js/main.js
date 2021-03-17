const GRID_SIZE = 96;
const SPRITE_SCALE = GRID_SIZE/32;
const SCREEN_COLS = 17;
const SCREEN_ROWS = 9;
const SCREEN_WIDTH = SCREEN_COLS * GRID_SIZE; //1025
const SCREEN_HEIGHT = SCREEN_ROWS * GRID_SIZE; //576
const COLORS = {
    PLAYER : [0x00ff00, 0xff8000],
    DARK_PLAYER : [0x008000, 0x804000],
    TEXT_PLAYER : ['#008000', '#804000']
};
let game_options = {
    goal_height : 2*GRID_SIZE,
    capture_time : 3000,
    fire_delay : 100,
    jump_strength : GRID_SIZE * -8.6,
    jump_deadening : 0.75,
    ball_bounce : 0.75,
    gravity : GRID_SIZE * 14.0625,
    ammo_value : 3,
    starting_ammo : 3,
};
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
            "0%", { font: GRID_SIZE/2 + 'px SigmarOne-Regular', fill: '#FFF' })
            .setOrigin(0.5, 0.5);


        this.load.image('assault_rifle', 'assets/assault_rifle.png');
        this.load.image('shotgun', 'assets/shotgun.png');
        this.load.image('ammo', 'assets/ammo.png');

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
    addPlayer: function (player) {
        let scene = this;

        let x_offset = 0.5;
        let y_offset = 8.5;
        let color = COLORS.PLAYER[player];
        let ammo_text_x_offset = 0;
        let ammo_text_x_origin = 0;
        if (player === 1) {
            x_offset = SCREEN_COLS - x_offset;
            ammo_text_x_offset = SCREEN_COLS - ammo_text_x_offset;
            ammo_text_x_origin = 1;
        }

        let character = scene.add.rectangle(x_offset * GRID_SIZE, y_offset * GRID_SIZE
            ,GRID_SIZE/4,GRID_SIZE*3/4,color, 1.0);
        character.setData('player', player);

        character.setData('onShot', () => {
           console.log('Player ' + player + ' shot');
        });

        //character.play('hero_run');
        let current_gun_index = 0;
        let gun_array = ['assault_rifle','shotgun'];
        let gun = scene.add.sprite(0, 0, gun_array[current_gun_index])
            .setScale(SPRITE_SCALE)
            .setVisible(true);
        character.setData('gun', gun);

        scene.__players.add(character);
        character.body.gravity.y = game_options.gravity;
        character.setData('ammo', game_options.starting_ammo);

        let align_player_group = function () {
            let center_x = character.body.x + character.width / 2;
            let center_y = character.body.y + character.height / 2;

            character.data.values.gun.x = center_x;
            character.data.values.gun.y = center_y;
        };
        align_player_group();

        let mouse_vector = new Phaser.Math.Vector2(0, 0);
        character.setData('setAngle', function(dx, dy) {
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            character.data.values.gun.setFlipY(dx < 0);
            character.data.values.gun.setAngle(
                Phaser.Math.RadToDeg(mouse_vector.angle()));
        });

        character.setData('ammo_text',
            scene.add.text(ammo_text_x_offset * GRID_SIZE,SCREEN_HEIGHT,
                "" + character.data.values.ammo + "",
                { font: '' + GRID_SIZE/2 + 'px SigmarOne-Regular', fill: COLORS.TEXT_PLAYER[player] })
                .setOrigin(ammo_text_x_origin,1));
        character.setData('addAmmo',function(ammount) {
            character.data.values.ammo += ammount;
            character.data.values.ammo_text.setText("" + character.data.values.ammo + "" );
        });

        let allow_fire = true;
        let generate_bullet = function() {
            if (!allow_fire || character.data.values.ammo === 0) {
                return;
            }
            character.data.values.addAmmo(-1);
            allow_fire = false;
            scene.time.delayedCall(game_options.fire_delay, function () {
                allow_fire = true;
            });
            let x = character.x;
            let y = character.y;
            mouse_vector.x = GRID_SIZE/8;
            mouse_vector.y = 0;
            mouse_vector.rotate(Phaser.Math.DegToRad(
                character.data.values.gun.angle));
            let bullet = scene.add.rectangle(x + mouse_vector.x, y + mouse_vector.y,
                GRID_SIZE/32, GRID_SIZE/32, 0x000000);
            bullet.setData('player', character.data.values.player);
            //.setDepth(DEPTHS.MOBS);
            scene.__bullets.add(bullet);
            bullet.body.setVelocity(mouse_vector.x * GRID_SIZE, mouse_vector.y * GRID_SIZE);
            scene.time.delayedCall(1000, () => bullet.destroy() );
            //scene.cameras.main.shake(50, 0.005, true);
            return;
        };
        character.setData('generateBullet', generate_bullet);

        character.setData('toggleGun', function() {
            current_gun_index = (current_gun_index + 1) % gun_array.length;
            character.data.values.gun.setTexture(gun_array[current_gun_index]);
        });

        character.setData('moving', false);
        character.setData('left', false);
        character.setData('right', false);
        character.setData('up', false);
        character.setData('down', false);
        character.setData('fire', false);

        character.setData('update', function () {
            let dx = 0;
            let dy = 0;
            if (character.data.values.left) {
                dx -= 1;
            }
            if (character.data.values.right) {
                dx += 1;
            }
            if (character.data.values.up) {
                if (character.body.blocked.down) {
                    character.body.setVelocityY(
                        game_options.jump_strength
                    );
                }
            }
            if (!character.data.values.up)
            {
                if (character.body.velocity.y < 0)
                {
                    character.body.setVelocityY(character.body.velocity.y *
                        game_options.jump_deadening);
                }
            }
            if (character.data.values.down)
            {
                if (character.body.blocked.down &&
                    scene.physics.overlap(scene.__capture_points, character)) {
                    character.body.y += 8;
                }
            }

            //normalize
            let d = Math.sqrt(dx * dx + dy * dy);
            let v = 90*GRID_SIZE/16;
            if (d !== 0) {
                dx = dx / d * v;
                dy = dy / d * v;
            }

            let moving = false;
            if (dx !== 0) {
                moving = true;
            }
            if (moving !== character.data.values.moving) {
                character.data.values.moving = moving;
                if (moving) {
                    //character.play('hero_run');
                } else {
                    //character.anims.stop();
                    //character.setTexture('hero', 0);
                }
            }
            /*if (dx < 0) {
                character.setFlipX(true);
            } else if (dx > 0) {
                character.setFlipX(false);
            }*/
            character.body.setVelocityX(dx);
            align_player_group();

            if (character.data.values.fire) {
                character.data.values.generateBullet();
            }
        });

        return character;
    },

    addBall: function () {
        let scene = this;

        let ball = scene.add.circle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, GRID_SIZE/4,0xff00ff, 1.0);
        scene.__shootables.add(ball);

        let working_vector = new Phaser.Math.Vector2(0, 0);
        let bullet_velocity_trajectory = new Phaser.Math.Vector2(0,0);
        let bullet_trajectory_line = new Phaser.Geom.Line(0,0,0,0);
        let bullet_trajectory_nearest_point = new Phaser.Geom.Point(0,0);
        let ball_center_point = new Phaser.Geom.Point(0,0);
        ball.setData('onShot', function(bullet) {

            let impact = bullet.body.velocity.length()/10;
            let ball_x = ball.body.x + ball.width/2;
            let ball_y = ball.body.y + ball.height/2;
            let bullet_x = bullet.body.x + bullet.width/2;
            let bullet_y = bullet.body.y + bullet.height/2;

            ball_center_point.setTo(ball_x, ball_y);
            bullet_trajectory_line.setTo(bullet_x, bullet_y,
                bullet_x + bullet.body.velocity.x, bullet_y + bullet.body.velocity.y);
            Phaser.Geom.Line.GetNearestPoint(bullet_trajectory_line, ball_center_point,
                bullet_trajectory_nearest_point);

            working_vector.x = ball_center_point.x - bullet_trajectory_nearest_point.x;
            working_vector.y = ball_center_point.y - bullet_trajectory_nearest_point.y;
            let distance_from_center = working_vector.length();
            let distance_along_trajectory = Math.sqrt(ball.width/2 * ball.width/2-
                distance_from_center * distance_from_center);
            bullet_velocity_trajectory.x = - bullet.body.velocity.x;
            bullet_velocity_trajectory.y = - bullet.body.velocity.y;
            bullet_velocity_trajectory.setLength(distance_along_trajectory);
            let impact_x = bullet_trajectory_nearest_point.x + bullet_velocity_trajectory.x;
            let impact_y = bullet_trajectory_nearest_point.y + bullet_velocity_trajectory.y;
            working_vector.x = ball_center_point.x - impact_x;
            working_vector.y = ball_center_point.y - impact_y;
            working_vector.setLength(impact);

            ball.body.velocity.x += working_vector.x;
            ball.body.velocity.y += working_vector.y;

            working_vector.negate();
            working_vector.rotate(-Math.PI/4);
            for (let n = 0; n < 10; n++) {
                let casing = scene.add.rectangle(
                    impact_x, impact_y, bullet.body.width, bullet.body.height,
                    0xff00ff);
                scene.physics.add.existing(casing);
                working_vector.rotate(Math.PI/2/10);
                casing.body.setVelocity(
                    working_vector.x/1,
                    working_vector.y/1);
                scene.tweens.add({
                    targets: casing,
                    alpha: 0,
                    duration: 200
                });
                scene.time.delayedCall(400, function() {
                    casing.destroy();
                })
            }
        });
        ball.body.setBounce(game_options.ball_bounce);

        return ball;
    },

    setupField : function() {
        let scene = this;

        let addWallToPhysics = function(platform) {
            scene.__platforms.add(platform);
            scene.__ball_platforms.add(platform);
        };

        let platform_size = GRID_SIZE/4;
        let floor = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT + platform_size/2,
            SCREEN_WIDTH, platform_size, 0xff0000, 1.0);
        addWallToPhysics(floor);

        floor = scene.add.rectangle(SCREEN_WIDTH/2, - platform_size/2,
            SCREEN_WIDTH, platform_size, 0xff0000, 1.0);
        addWallToPhysics(floor);

        let wall = scene.add.rectangle(SCREEN_WIDTH + platform_size/2, SCREEN_HEIGHT/2,
            platform_size, SCREEN_HEIGHT, 0xff0000, 1.0);
        addWallToPhysics(wall);
        wall = scene.add.rectangle(- platform_size/2, SCREEN_HEIGHT/2,
            platform_size, SCREEN_HEIGHT, 0xff0000, 1.0);
        addWallToPhysics(wall);

        let ammo_randomizer = function() {
            return Phaser.Math.Between(1000,30000);
        };
        let add_ammo = function(x,y, length) {
            let rx = Phaser.Math.Between((x - length/2) * GRID_SIZE,
                (x + length/2)*GRID_SIZE);
            let ammo = scene.add.sprite(rx, y*GRID_SIZE, 'ammo').setScale(2);
            scene.__touchables.add(ammo);
            scene.__ammos.add(ammo);
            ammo.body.gravity.y = game_options.gravity;
            ammo.body.velocity.y = -GRID_SIZE * 2.5;
            ammo.setData('onTouch', function(character, ammo) {
                let x_target = character.data.values.ammo_text.x;
                let y_target = character.data.values.ammo_text.y;
                let start_y = ammo.body.y + ammo.body.height/2;
                let text = scene.add.text(ammo.body.x + ammo.body.width/2,
                    start_y,"+3", { font: GRID_SIZE/2 + 'px SigmarOne-Regular',
                    fill: COLORS.TEXT_PLAYER[character.data.values.player] })
                    .setOrigin(0.5,1);

                let timeline = scene.tweens.createTimeline();
                timeline.add({
                    targets: text,
                    y: start_y-GRID_SIZE/2,
                    duration: 500});
                timeline.add({
                    targets: text,
                    alpha: 0.5,
                    scale: 0.5,
                    x : x_target,
                    y : y_target,
                    duration: 500,
                    onComplete: function () {
                        text.destroy();
                        character.data.values.addAmmo(game_options.ammo_value);
                    }
                });
                timeline.play();
                ammo.destroy();
            });
            scene.time.delayedCall(ammo_randomizer(), add_ammo, [x,y, length]);
        };

        let createPlatforms = function(x, y, width, height, color, alpha) {
            let player_platform = scene.add.rectangle(x, y,
                width, height, alpha, 0);
            let visible_platform = scene.add.rectangle(x, y,
                width, height, color, alpha);
            scene.__platforms.add(player_platform);
            player_platform.body.checkCollision.down = false;
            player_platform.body.checkCollision.left = false;
            player_platform.body.checkCollision.right = false;
            scene.__ball_platforms.add(visible_platform);
            return visible_platform;
        };

        let add_platform = function(x, y, length) {
            let platform = createPlatforms(x*GRID_SIZE, y*GRID_SIZE,
                length * GRID_SIZE, GRID_SIZE/8,
                0x000000, 1.0);
            let capture_point = scene.add.rectangle(x*GRID_SIZE, y*GRID_SIZE-GRID_SIZE/8,
                length * GRID_SIZE, GRID_SIZE/8, 0x000000, 0.0);
            scene.__touchables.add(capture_point);
            scene.__capture_points.add(capture_point);
            let CAPTURE_STATUS = {
                PLAYER0 : 0,
                PLAYER1 : 1,
                NONE: 2,
            };
            capture_point.setData('capture_status', CAPTURE_STATUS.NONE);
            let capture_tween = null;
            capture_point.setData('onTouch', function(character, capture_point) {
                if (capture_tween || character.data.values.player === capture_point.data.values.capture_status) {
                    //already being captured or is already captured by player
                    return;
                }
                let capture_rectangle = scene.add.rectangle(x*GRID_SIZE, y*GRID_SIZE,
                length * GRID_SIZE, GRID_SIZE/8, COLORS.DARK_PLAYER[character.data.values.player], 1.0).setScale(0,1);
                let capture_text = scene.add.text(x*GRID_SIZE,y*GRID_SIZE,"0%",
                    { font: GRID_SIZE/2 + 'px SigmarOne-Regular',
                    fill: COLORS.TEXT_PLAYER[character.data.values.player] })
                    .setOrigin(0.5,1);
                let text_tween = scene.tweens.add({
                    targets: capture_text,
                    y: y*GRID_SIZE - GRID_SIZE*3/4,
                    duration: game_options.capture_time
                });
                let capture_rectangle_tween = scene.tweens.add({
                    targets: capture_rectangle,
                    scaleX: 1,
                    duration: game_options.capture_time
                });
                capture_tween = scene.tweens.add({
                    targets: {progress: 0},
                    props: {progress: 100},
                    duration: game_options.capture_time,
                    onUpdate: function() {

                        if(!scene.physics.overlap(character, capture_point)) {
                            text_tween.remove();
                            capture_rectangle_tween.remove();
                            capture_tween.remove();
                            capture_tween = null;
                            capture_text.destroy();
                            capture_rectangle.destroy();
                            return;
                        }
                        capture_text.setText('' + Math.round(capture_tween.getValue()) + "%");
                    },
                    onComplete: function() {
                        text_tween.remove();
                        capture_rectangle_tween.remove();
                        capture_text.destroy();
                        scene.add.tween({
                            targets: capture_rectangle,
                            alpha: 0,
                            scaleX: 1.25,
                            scaleY: 3,
                            duration: 150,
                            onComplete: () => capture_rectangle.destroy()
                        });
                        platform.setFillStyle(COLORS.DARK_PLAYER[character.data.values.player], 1.0);
                        capture_tween = null;
                        capture_point.setData('capture_status', character.data.values.player);
                    }
                })
            });
            scene.time.delayedCall(ammo_randomizer(), add_ammo, [x,y-1, length]);
        };

        let add_left_platform= function(x, y, length) {
            add_platform(x,y,length);
            add_platform(SCREEN_COLS - x,y,length);
        };

        add_left_platform(3.5, 7, 3);
        add_left_platform(3.5, 2, 3);
        add_left_platform(4.25, 4.5, 1.5);
        add_left_platform(6.75, 3.25, 1.5);
        add_left_platform(6.75, 5.75, 1.5);

        let addGoal = function (player) {
            let x_offset = 1.5;
            let x_back_offset = - GRID_SIZE/8 - GRID_SIZE/16;
            if (player === 1) {
                x_offset = SCREEN_COLS - x_offset;
                x_back_offset = -x_back_offset;
            }

            let goal_exterior = scene.add.rectangle(
                x_offset * GRID_SIZE + x_back_offset, SCREEN_HEIGHT / 2,
                GRID_SIZE/8, game_options.goal_height - GRID_SIZE/4,
                0x000080, 1.0);
            scene.__ball_platforms.add(goal_exterior);
            goal_exterior = scene.add.rectangle(x_offset * GRID_SIZE,
                SCREEN_HEIGHT / 2 + game_options.goal_height/2 - GRID_SIZE/8/2,
                GRID_SIZE/2, GRID_SIZE/8,
                0x000080, 1.0);
            scene.__ball_platforms.add(goal_exterior);
            goal_exterior = scene.add.rectangle(x_offset * GRID_SIZE,
                SCREEN_HEIGHT / 2 - game_options.goal_height/2 + GRID_SIZE/8/2,
                GRID_SIZE/2, GRID_SIZE/8,
                0x000080, 1.0);
            scene.__ball_platforms.add(goal_exterior);
            let goal = scene.add.rectangle(x_offset * GRID_SIZE,
                SCREEN_HEIGHT / 2, GRID_SIZE/2 - GRID_SIZE/4, game_options.goal_height - GRID_SIZE/4,
                0x0000ff, 1.0);
            goal.setData('player', player);

            scene.__goals.add(goal);
        };

        addGoal(0);
        addGoal(1);
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle();

        //SETUP PHYSICS GROUPS

        scene.__touchables = scene.physics.add.group();
        scene.__capture_points = scene.physics.add.group();
        scene.__platforms = scene.physics.add.staticGroup();
        scene.__ball_platforms = scene.physics.add.staticGroup();
        scene.__bullets = scene.physics.add.group();
        scene.__shootables = scene.physics.add.group();
        scene.__goals = scene.physics.add.group();
        scene.__players = scene.physics.add.group();
        scene.__ammos = scene.physics.add.group();

        scene.setupField();
        scene.__player_objects = [
            scene.addPlayer(0),
            scene.addPlayer(1)
        ];
        let ball = scene.addBall();

        //SETUP INPUTS

        scene.input.addPointer(5);

        scene.input.on(Phaser.Input.Events.POINTER_MOVE, function(pointer) {
            let dx = pointer.worldX - scene.__player_objects[0].data.values.gun.x;
            let dy = pointer.worldY - scene.__player_objects[0].data.values.gun.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            dx = dx / d * GRID_SIZE/SPRITE_SCALE/2;
            dy = dy / d * GRID_SIZE/SPRITE_SCALE/2;
            scene.__player_objects[0].data.values.setAngle(dx, dy);
        });

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey("q");

        scene.__cursor_keys.letter_one.on(Phaser.Input.Keyboard.Events.UP,
            scene.__player_objects[0].data.values.toggleGun);

        //SETUP PHYSICS INTERACTIONS

        scene.physics.add.collider(scene.__players, scene.__platforms);
        scene.physics.add.overlap(scene.__players, scene.__touchables,
            (character, touchable) => touchable.data.values.onTouch(character, touchable));
        scene.physics.add.overlap(scene.__players, scene.__bullets,
            function(character, bullet) {
                if (bullet.data.values.player !== character.data.values.player) {
                    character.data.values.onShot();
                    bullet.destroy();
                }
            });
        scene.physics.add.overlap(scene.__bullets, scene.__shootables, function(bullet, shootable) {
            shootable.data.values.onShot(bullet);
            bullet.destroy();
        });
        scene.physics.add.collider(scene.__bullets, scene.__ball_platforms, function(bullet, platform) {
            bullet.destroy();
        });
        scene.physics.add.collider(ball, scene.__ball_platforms);
        scene.physics.add.collider(scene.__ammos, scene.__ball_platforms)
        scene.physics.add.collider(scene.__ammos, scene.__ammos);
        scene.physics.add.overlap(scene.__ammos, scene.__capture_points, function(ammo, capture_point) {
            if (capture_point.data.values.capture_status !== 0 &&
                capture_point.data.values.capture_status !== 1)
            {
                return;
            }
            ammo.data.values.onTouch(scene.__player_objects[capture_point.data.values.capture_status], ammo);
        });
        scene.physics.add.overlap(ball, scene.__goals, function(ball, goal) {
            ball.body.x = SCREEN_WIDTH / 2 - ball.width/2;
            ball.body.y = SCREEN_HEIGHT / 2 - ball.height/2;
            ball.body.setVelocity(0,0);
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let gamepad_input = {
            left : false,
            right : false,
            up : false,
            down : false,
            fire : false
        };
        if (scene.input.gamepad.total !== 0) {
            let pad = scene.input.gamepad.gamepads[0];

            gamepad_input.left = pad.buttons[14].value === 1;
            gamepad_input.right = pad.buttons[15].value === 1;
            gamepad_input.up = pad.buttons[12].value === 1;
            gamepad_input.down = pad.buttons[13].value === 1;
            gamepad_input.fire = pad.buttons[5].value === 1 ||
                pad.buttons[7].value === 1;

            let dx = pad.axes[2].getValue();
            let dy = pad.axes[3].getValue();
            let tolerance = 0.5;
            if (dx * dx + dy * dy > tolerance * tolerance) {
                scene.__player_objects[1].data.values.setAngle(pad.axes[2].getValue(),
                    pad.axes[3].getValue());
            }
            dx = pad.axes[0].getValue();
            dy = pad.axes[1].getValue();
            gamepad_input.left = dx < -tolerance;
            gamepad_input.right = dx > tolerance;
            gamepad_input.up = dy < -tolerance;
            gamepad_input.down = dy > tolerance;
        }

        scene.__player_objects[0].data.values.left = scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown;
        scene.__player_objects[1].data.values.left = gamepad_input.left;

        scene.__player_objects[0].data.values.right = scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown;
        scene.__player_objects[1].data.values.right = gamepad_input.right;

        scene.__player_objects[0].data.values.up = scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown;
        scene.__player_objects[1].data.values.up = gamepad_input.up;

        scene.__player_objects[0].data.values.down = scene.__cursor_keys.letter_down.isDown ||
            scene.__cursor_keys.down.isDown;
        scene.__player_objects[1].data.values.down = gamepad_input.down;

        scene.__player_objects[0].data.values.fire = scene.input.activePointer.leftButtonDown();
        scene.__player_objects[1].data.values.fire = gamepad_input.fire;

        scene.__player_objects[0].data.values.update();
        scene.__player_objects[1].data.values.update();
    },
});

let config = {
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    render: {
        pixelArt: true
    },
    input: {
        gamepad: true
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

game = new Phaser.Game(config);
