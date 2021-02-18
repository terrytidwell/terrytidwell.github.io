const GRID_SIZE = 64;
const SPRITE_SCALE = GRID_SIZE/32;
const SCREEN_COLS = 17;
const SCREEN_ROWS = 9;
const SCREEN_WIDTH = SCREEN_COLS * GRID_SIZE; //1025
const SCREEN_HEIGHT = SCREEN_ROWS * GRID_SIZE; //576

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
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);


        this.load.image('assault_rifle', 'assets/assault_rifle.png');
        this.load.image('shotgun', 'assets/shotgun.png');
        this.load.spritesheet('hero', 'assets/Adventurer Female Sprite Sheet.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('slash', 'assets/slash.png',
            { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('slime_medium', 'assets/Slime_Medium_Blue.png',
            { frameWidth: 32, frameHeight: 32 });

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
        let scene = this;
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
        let color = 0x00ff00;
        let ammo_text_x_offset = 0;
        let ammo_text_x_origin = 0;
        if (player === 1) {
            x_offset = SCREEN_COLS - x_offset;
            ammo_text_x_offset = SCREEN_COLS - ammo_text_x_offset;
            color = 0xff8000;
            ammo_text_x_origin = 1;
        }

        let character = scene.add.rectangle(x_offset * GRID_SIZE, 8.5 * GRID_SIZE
            ,16,48,color, 1.0);

        //character.play('hero_run');
        let current_gun_index = 0;
        let gun_array = ['assault_rifle','shotgun'];
        let gun = scene.add.sprite(0, 0, gun_array[current_gun_index])
            .setScale(2)
            .setVisible(true);
        character.setData('gun', gun);

        scene.__players.add(character);
        character.body.gravity.y = 900;
        character.setData('jump_strength', -550);
        character.setData('jump_deadening', 0.75);
        character.setData('ammo', 3);

        let align_player_group = function () {
            let center_x = character.body.x + character.width / 2;
            let center_y = character.body.y + character.height / 2;

            character.data.values.gun.x = center_x;
            character.data.values.gun.y =  center_y;
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

        let ammo_text =
            scene.add.text(ammo_text_x_offset * GRID_SIZE,SCREEN_HEIGHT,
                "" + character.data.values.ammo + "",
                { fontSize: GRID_SIZE/2 + 'px', fill: '#000' })
                .setOrigin(ammo_text_x_origin,1);
        character.setData('addAmmo',function(ammount) {
            character.data.values.ammo += ammount;
            ammo_text.setText("" + character.data.values.ammo + "" );
        });

        let allow_fire = true;
        let generate_bullet = function() {
            if (!allow_fire || character.data.values.ammo === 0) {
                return;
            }
            character.data.values.addAmmo(-1);
            allow_fire = false;
            scene.time.delayedCall(100, function () {
                allow_fire = true;
            });
            let x = character.x;
            let y = character.y;
            mouse_vector.x = GRID_SIZE/4;
            mouse_vector.y = 0;
            mouse_vector.rotate(Phaser.Math.DegToRad(
                character.data.values.gun.angle));
            let bullet = scene.add.rectangle(x + mouse_vector.x, y + mouse_vector.y,
                2, 2, 0x000000);
            //.setDepth(DEPTHS.MOBS);
            scene.physics.add.existing(bullet);
            bullet.body.setVelocity(mouse_vector.x * GRID_SIZE, mouse_vector.y * GRID_SIZE);
            scene.physics.add.overlap(bullet, scene.__platforms, function(bullet, platform) {
                bullet.destroy();
                //platform.destroy();
            });
            scene.physics.add.overlap(bullet, scene.__shootables, function(bullet, shootable) {
                shootable.data.values.onShot(bullet);
                bullet.destroy();
            });
            scene.time.delayedCall(1000, function() {
                bullet.destroy();
            });
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
                        character.data.values.jump_strength
                    );
                }
            }
            if (!character.data.values.up)
            {
                if (character.body.velocity.y < 0)
                {
                    character.body.setVelocityY(character.body.velocity.y *
                        character.data.values.jump_deadening);
                }
            }
            if (character.data.values.down)
            {
                if (character.body.blocked.down) {
                    //character.body.y += 8;
                }
            }
            /*
            if (scene.__cursor_keys.down.isDown ||
                scene.__cursor_keys.letter_down.isDown) {
                dy += 1;
            }
            */

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
        let ball_center_point = new Phaser.Geom.Point(0,0)
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
            working_vector.rotate(-Math.PI/4)
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
        ball.body.setBounce(0.75);

        return ball;
    },

    setupField : function() {
        let scene = this;

        let floor = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT + 8,
            SCREEN_WIDTH, 16, 0xff0000, 1.0);
        scene.__platforms.add(floor);
        scene.__ball_platforms.add(floor);

        floor = scene.add.rectangle(SCREEN_WIDTH/2, - 8,
            SCREEN_WIDTH, 16, 0xff0000, 1.0);
        scene.__platforms.add(floor);
        scene.__ball_platforms.add(floor);

        let wall = scene.add.rectangle(SCREEN_WIDTH + 8, SCREEN_HEIGHT/2,
            16, SCREEN_HEIGHT, 0xff0000, 1.0)
        scene.__platforms.add(wall);
        scene.__ball_platforms.add(wall);
        wall = scene.add.rectangle(- 8, SCREEN_HEIGHT/2,
            16, SCREEN_HEIGHT, 0xff0000, 1.0)
        scene.__platforms.add(wall);
        scene.__ball_platforms.add(wall);

        let add_ammo = function(x,y) {
            let ammo = scene.add.rectangle(x*GRID_SIZE, y*GRID_SIZE, GRID_SIZE/8, GRID_SIZE/8,
                0xff8000, 1.0);
            scene.__touchables.add(ammo);
            ammo.setData('onTouch', function(character, ammo) {
                character.data.values.addAmmo(3);
                ammo.destroy();
            });
        };

        let add_left_platform= function(x, y, length) {
            let platform = scene.add.rectangle(x*GRID_SIZE, y*GRID_SIZE,
                length * GRID_SIZE, 8,
                0x000000, 1.0);
            scene.__platforms.add(platform);
            scene.__ball_platforms.add(platform);


            platform = scene.add.rectangle((SCREEN_COLS - x)*GRID_SIZE, y*GRID_SIZE,
                length * GRID_SIZE, 8,
                0x000000, 1.0);
            scene.__platforms.add(platform);
            scene.__ball_platforms.add(platform);

            add_ammo(x,y-1);
            add_ammo(SCREEN_COLS - x, y-1);
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
                GRID_SIZE/8, GRID_SIZE - GRID_SIZE/4,
                0x000080, 1.0);
            scene.__ball_platforms.add(goal_exterior);
            goal_exterior = scene.add.rectangle(x_offset * GRID_SIZE,
                SCREEN_HEIGHT / 2 + GRID_SIZE/2 - GRID_SIZE/8/2,
                GRID_SIZE/2, GRID_SIZE/8,
                0x000080, 1.0);
            scene.__ball_platforms.add(goal_exterior);
            goal_exterior = scene.add.rectangle(x_offset * GRID_SIZE,
                SCREEN_HEIGHT / 2 - GRID_SIZE/2 + GRID_SIZE/8/2,
                GRID_SIZE/2, GRID_SIZE/8,
                0x000080, 1.0);
            scene.__ball_platforms.add(goal_exterior);
            let goal = scene.add.rectangle(x_offset * GRID_SIZE,
                SCREEN_HEIGHT / 2, GRID_SIZE/2 - GRID_SIZE/4, GRID_SIZE - GRID_SIZE/4,
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
        scene.__platforms = scene.physics.add.staticGroup();
        scene.__ball_platforms = scene.physics.add.staticGroup();
        scene.__shootables = scene.physics.add.group();
        scene.__goals = scene.physics.add.group();
        scene.__players = scene.physics.add.group();

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
            function(character, touchable) {
                touchable.data.values.onTouch(character, touchable);
        });
        scene.physics.add.collider(ball, scene.__ball_platforms);
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
            gamepad_input.fire = pad.buttons[5].value === 1;

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
