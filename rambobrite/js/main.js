const GRID_SIZE = 64;
const SPRITE_SCALE = 2;
const SCREEN_WIDTH = 8 * GRID_SIZE; //512
const SCREEN_HEIGHT = 8 * GRID_SIZE; //512
const DEPTHS = {
    BG: 0,
    FLOOR: 10000,
    MOBS: 20000,
    WALLS: 30000,
    CHAR: 40000,
    FG: 50000
};
const COLORS = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    random: function() { return Phaser.Math.Between(0, 2); },
    color: function(color) { return [0x800000, 0x008000, 0x000080][color]; },
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
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);


        this.load.image('assault_rifle', 'assets/assault_rifle.png');
        this.load.image('shotgun', 'assets/shotgun.png');
        this.load.image('crate', 'assets/Crate.png');
        this.load.spritesheet('old_hero', 'assets/Adventurer Female Sprite Sheet.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('hero', 'assets/RGB.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('small_blob', 'assets/small_blob.png',
            { frameWidth: 8, frameHeight: 8 });
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

        scene.anims.create({
            key: 'slash_effect',
            frames: [
                { key: 'slash', frame: 2 },
                { key: 'slash', frame: 3 },
                { key: 'slash', frame: 4 },
                { key: 'slash', frame: 5 },
            ],
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });

        scene.anims.create({
            key: 'slime_medium_move',
            frames: [
                { key: 'slime_medium', frame: 0 },
                { key: 'slime_medium', frame: 1 },
                { key: 'slime_medium', frame: 2 },
                { key: 'slime_medium', frame: 3 },
                { key: 'slime_medium', frame: 4 },
                { key: 'slime_medium', frame: 5 },
                { key: 'slime_medium', frame: 6 },
                { key: 'slime_medium', frame: 7 },
                { key: 'slime_medium', frame: 8 },
                { key: 'slime_medium', frame: 9 },
                { key: 'slime_medium', frame: 10 },
                { key: 'slime_medium', frame: 11 },
                { key: 'slime_medium', frame: 12 },
                { key: 'slime_medium', frame: 13 },
                { key: 'slime_medium', frame: 14 },
                { key: 'slime_medium', frame: 15 }
            ],
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
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
        let CHARACTER_SPRITE_SIZE = 1;

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle()
            .setDepth(DEPTHS.BG);

        let platforms = scene.physics.add.staticGroup();
        let shootables = scene.physics.add.group();
        let mobs = scene.physics.add.group();
        scene.__updateables = scene.physics.add.group();
        for (let n = 0; n < 15; n++) {
            let x = Phaser.Math.Between(0, 8);
            let y = Phaser.Math.Between(0, 8);
            let obstacle = scene.add.sprite((x) * GRID_SIZE, (y - 0.5) * GRID_SIZE, 'crate')
                .setOrigin(0)
                .setScale(4)
                .setDepth(DEPTHS.WALLS);
            platforms.add(obstacle);
        }

        let create_small_blob = function(scene) {
            let x = Phaser.Math.Between(0, 8);
            let y = Phaser.Math.Between(0, 8);
            let color = COLORS.random();
            let small_blob = scene.add.sprite((x) * GRID_SIZE, (y - 0.5) * GRID_SIZE, 'small_blob', color)
                .setOrigin(0)
                .setScale(CHARACTER_SPRITE_SIZE*2)
                .setDepth(DEPTHS.MOBS);
            small_blob.setData('color',color);
            shootables.add(small_blob);
            mobs.add(small_blob);
            small_blob.setData('onShot', function(bullet) {
                if (bullet.data.values.color === small_blob.data.values.color)
                {
                    let radius = 4 * CHARACTER_SPRITE_SIZE * 2;
                    let circle = new Phaser.Geom.Circle(
                        small_blob.x + radius,
                        small_blob.y + radius,
                        radius)
                    for (let n = 0; n < 15; n++)
                    {
                        let point = circle.getRandomPoint();
                        let splatter = scene.add.circle(point.x, point.y, radius/4,
                            COLORS.color(small_blob.data.values.color))
                            .setDepth(DEPTHS.FLOOR);
                        scene.physics.add.existing(splatter);
                        scene.tweens.add({
                            targets: splatter,
                            radius: radius/4,
                            alpha : 0,
                            onComplete : function() {
                                splatter.destroy();
                            }
                        });
                        splatter.body.setVelocity(bullet.body.velocity.x / GRID_SIZE,
                            bullet.body.velocity.y / GRID_SIZE);
                    }
                    small_blob.destroy();
                }
            });
            scene.__updateables.add(small_blob);
            small_blob.setData('update', function() {
                let target_x = scene.__character.x;
                let target_y = scene.__character.y;
                let dx = target_x - small_blob.x;
                let dy = target_y - small_blob.y;
                let d = Math.sqrt(dx * dx + dy * dy);
                dx = dx / d * GRID_SIZE/SPRITE_SCALE/2;
                dy = dy / d * GRID_SIZE/SPRITE_SCALE/2;
                small_blob.body.setVelocity(dx,dy);
            });
            //small_blob.body.setVelocity(x,y);
        };
        for (let n = 0; n < 8; n++) {
            create_small_blob(scene);
        }


        scene.__character = scene.add.sprite(0,0,
            'hero', 0)
            .setScale(CHARACTER_SPRITE_SIZE)
            .setDepth(DEPTHS.CHAR);

        scene.__hitbox_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__hitbox_y_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__hitbox = scene.add.rectangle(0, 0,
            GRID_SIZE/2,GRID_SIZE/2,0x00ff00, 0.0);

        scene.__solidbox = scene.add.rectangle(4*GRID_SIZE, 4*GRID_SIZE,
            GRID_SIZE/2,GRID_SIZE/2,0xff0000, 0.0);
        scene.physics.add.existing(scene.__solidbox);

        scene.__align_player_group = function () {
            let center_x = scene.__solidbox.body.x + scene.__solidbox.width / 2;
            let center_y = scene.__solidbox.body.y + scene.__solidbox.height / 2;

            scene.__character.x = center_x;
            scene.__character.y =  center_y;
            scene.__hitbox.x = center_x + scene.__hitbox_x_offset;
            scene.__hitbox.y =  center_y + scene.__hitbox_y_offset;
        };
        scene.__align_player_group();

        scene.input.addPointer(5);
        //scene.input.setPollAlways();

        let mouse_vector = new Phaser.Math.Vector2(0, 0);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, function(pointer) {
            let dx = pointer.worldX - scene.__character.x;
            let dy = pointer.worldY - scene.__character.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            dx = dx / d * GRID_SIZE/SPRITE_SCALE/2;
            dy = dy / d * GRID_SIZE/SPRITE_SCALE/2;
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            //scene.__character.setFlipX(dx < 0);
            scene.__character.setAngle(Phaser.Math.RadToDeg(mouse_vector.angle()));
        });

        let allow_fire = true;
        scene.__generate_bullet = function(pointer) {
            if (!allow_fire) {
                return;
            }
            allow_fire = false;
            scene.time.delayedCall(100, function () {
                allow_fire = true;
            });
            let x = scene.__character.x;
            let y = scene.__character.y;
            mouse_vector.x = GRID_SIZE/4;
            mouse_vector.y = 0;
            mouse_vector.rotate(Phaser.Math.DegToRad(scene.__character.angle));
            let bullet = scene.add.rectangle(x + mouse_vector.x, y + mouse_vector.y,
                2, 2, 0x000000)
                .setDepth(DEPTHS.MOBS);
            bullet.setData('color',scene.__character_color);
            scene.physics.add.existing(bullet);
            bullet.body.setVelocity(mouse_vector.x * GRID_SIZE, mouse_vector.y * GRID_SIZE);
            scene.physics.add.overlap(bullet, platforms, function(bullet, platform) {
                bullet.destroy();
                //platform.destroy();
            });
            scene.physics.add.overlap(bullet, shootables, function(bullet, shootable) {
                shootable.data.values.onShot(bullet);
                bullet.destroy();
            });
            scene.time.delayedCall(1000, function() {
                bullet.destroy();
            });
            scene.cameras.main.shake(50, 0.005, true);
            let casing = scene.add.rectangle(
                x + mouse_vector.x,
                y + mouse_vector.y, 4, 2,
                COLORS.color(scene.__character_color))
                .setDepth(DEPTHS.FLOOR)
                .setAngle(scene.__character.angle);
            scene.physics.add.existing(casing);
            scene.physics.add.collider(casing, platforms);
            mouse_vector.normalizeRightHand();
            let percent = Phaser.Math.Between(50,100);
            casing.body.setVelocity(
                mouse_vector.x * GRID_SIZE/16 * percent/100,
                mouse_vector.y * GRID_SIZE/16 * percent/100);
            scene.tweens.add({
                targets: casing.body.velocity,
                x: 0,
                y: 0,
                duration: 1000
            });
            percent = Phaser.Math.Between(160,200)
            let target_angle = scene.__character.angle + percent;
            scene.tweens.add({
                targets: casing,
                angle: target_angle,
                duration: 1000
            })
            scene.time.delayedCall(10000, function() {
                casing.destroy();
            })
        };

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey("ONE");
        scene.__cursor_keys.letter_two = scene.input.keyboard.addKey("TWO");
        scene.__cursor_keys.letter_three = scene.input.keyboard.addKey("THREE");

        scene.__moving = false;

        scene.cameras.main.setBounds(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__character, true, 1, 1, 0, 0);

        scene.physics.add.collider(scene.__solidbox, platforms);
        scene.physics.add.collider(shootables, platforms);
        scene.physics.add.collider(mobs, mobs);

        scene.__character_color = 0;
        let set_color = function(color) {
            color = color % 3;
            scene.__character_color = color;
            scene.__character.setTexture('hero', scene.__character_color);
        };
        set_color(0);
        scene.__cursor_keys.letter_one.on(Phaser.Input.Keyboard.Events.UP, function() {
            set_color(0)
        });
        scene.__cursor_keys.letter_two.on(Phaser.Input.Keyboard.Events.UP, function() {
            set_color(1)
        });
        scene.__cursor_keys.letter_three.on(Phaser.Input.Keyboard.Events.UP, function() {
            set_color(2)
        });
        scene.input.on(Phaser.Input.Events.POINTER_WHEEL, function(pointer, objects, dx, dy) {
            console.log(dx + ' ' + dy);
            if (dy > 0) {
                set_color(scene.__character_color + 1);
            } if (dy < 0 ) {
                set_color( scene.__character_color + 2);
            }}
        );
        /*
        let platforms = scene.physics.add.staticGroup();
        let overlaps = scene.physics.add.staticGroup();

        scene.G.player.data.values.addCollider(scene.physics, platforms);
        scene.G.player.data.values.addOverlap(scene.physics, overlaps);d
         */
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let dx = 0;
        let dy = 0;
        if (scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown) {
            dx -= 1;
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            dx += 1;
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            dy -= 1;
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            dy += 1;
        }
        //normalize
        let d = Math.sqrt(dx * dx + dy * dy);
        let v = 90*GRID_SIZE/16;
        if (d !== 0) {
            dx = dx / d * v;
            dy = dy / d * v;
        }

        let moving = false;
        if (dx !== 0 || dy !== 0) {
            moving = true;
        }
        if (moving !== scene.__moving) {
            scene.__moving = moving;
            if (moving) {
                //scene.__character.play('hero_run');
            } else {
                //scene.__character.anims.stop();
                //scene.__character.setTexture('hero', 0);
            }
        }
        /*if (dx < 0) {
            scene.__character.setFlipX(true);
        } else if (dx > 0) {
            scene.__character.setFlipX(false);
        }*/
        scene.__solidbox.body.setVelocity(dx,dy);
        scene.__align_player_group();
        if (scene.input.activePointer.leftButtonDown()) {
            scene.__generate_bullet();
        }

        scene.__updateables.children.each(function(updatable) {
            updatable.data.values.update();
        }, this);
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
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
