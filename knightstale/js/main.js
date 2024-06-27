const GRID_SIZE = 64;
const GRID_COLS = 12;
const GRID_ROWS = 12;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS;
const DEPTHS = {
    BOARD: 0,
    SURFACE: 1000,
    ENTITIES: 2000,
    UI: 3000,
    DIAG: 4000,
};
const DIRECTIONS = {
    NONE: {dx: 0, dy: 0},

    RIGHT: {dx: 1, dy: 0},
    LEFT: {dx: -1, dy: 0},
    UP: {dx: 0, dy: -1},
    DOWN: {dx: 0, dy: 1},

    UP_LEFT : {dx: -1, dy: -1},
    UP_RIGHT : {dx: 1, dy: -1},
    DOWN_LEFT : {dx: -1, dy: 1},
    DOWN_RIGHT : {dx: 1, dy: 1},
    turnClockwise : function(direction) {
        return {dx: -direction.dy, dy: direction.dx};
    },
    turnCounterClockwise : function (direction) {
        return {dx: direction.dy, dy: -direction.dx}
    },
    opposite : function(direction) {
        return {dx: -direction.dx, dy: -direction.dy}
    },
    equals : function(directionA, directionB) {
        return directionA.dx === directionB.dx &&
            directionA.dy === directionB.dy;
    },
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
            "0%", { font: GRID_SIZE/2 + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        scene.load.audio('fight_music', ['assets/CrunkKnight.mp3']);
        scene.load.spritesheet('floor', 'assets/Wood 1 TD 64x72.png', { frameWidth: 80, frameHeight: 80 });
        scene.load.spritesheet('white_pieces', 'assets/White - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        scene.load.spritesheet('black_pieces', 'assets/Black - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        scene.load.spritesheet('impact', 'assets/Impact.png', { frameWidth: 64, frameHeight: 64 });
        scene.load.spritesheet('health_bars', 'assets/health_bars.png', { frameWidth: 80, frameHeight: 9 });
        scene.load.spritesheet('fire', 'assets/fire_column_medium_1.png', { frameWidth: 40, frameHeight: 80 });
        scene.load.spritesheet('death_effect','assets/death_effect.png', { frameWidth: 128,  frameHeight: 128});
        scene.load.spritesheet('frame', 'assets/frame.png', { frameWidth: 32,  frameHeight: 32});
        scene.load.spritesheet('laser_column', 'assets/laser_column.png', { frameWidth: 32,  frameHeight: 96});
        scene.load.spritesheet('laser_column_cont', 'assets/laser_column_cont.png', { frameWidth: 32,  frameHeight: 64});
        scene.load.spritesheet('button', 'assets/buttons.png', { frameWidth: 80,  frameHeight: 80});
        scene.load.spritesheet('statue_pieces', 'assets/Black - Marble 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        scene.load.spritesheet('gems', 'assets/gems.png', { frameWidth: 16, frameHeight: 16 });
        scene.load.spritesheet('keys', 'assets/keys.png', { frameWidth: 16, frameHeight: 16 });
        scene.load.spritesheet('keyhole', 'assets/keyhole.png', { frameWidth: 16, frameHeight: 16 });
        scene.load.spritesheet('lava', 'assets/lava.png', { frameWidth: 64, frameHeight: 64 });
        scene.load.spritesheet('speech_bubbles','assets/ImanorBalloon.png', { frameWidth: 16, frameHeight: 16 })
        scene.load.audio('player_stomp', ['assets/impactWood_heavy_000.ogg']);

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('TitleScene');
            scene.scene.start('ControllerScene');
            scene.scene.stop('LoadScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.anims.create({
            key: 'impact_anim',
            frames: scene.anims.generateFrameNumbers('impact',
                { start: 0, end: 5 }),
            skipMissedFrames: false,
            frameRate: 24,
            repeat: 0
        });
        scene.anims.create({
            key: 'fire_anim',
            frames: scene.anims.generateFrameNumbers('fire',
                { start: 0, end: 12 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'death_effect_anim',
            frames: scene.anims.generateFrameNumbers('death_effect',
                { start: 0, end: 11 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });

        scene.anims.create({
            key: 'speech_bubbles_anim',
            frames: scene.anims.generateFrameNumbers('speech_bubbles',
                { start: 9, end: 15 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeatDelay: 5000,
            repeat: -1
        });

        scene.anims.create({
            key: 'laser_effect_anim',
            frames: scene.anims.generateFrameNumbers('laser_column',
                { start: 0, end: 12 }),
            skipMissedFrames: false,
            yoyo: true,
            frameRate: 12,
            repeat: 0
        });

        scene.anims.create({
            key: 'laser_effect_cont_anim',
            frames: scene.anims.generateFrameNumbers('laser_column_cont',
                { start: 0, end: 12 }),
            skipMissedFrames: false,
            yoyo: true,
            frameRate: 12,
            repeat: 0
        });

        for (let i = 0; i < 4; i++) {
           scene.anims.create({
                key: 'gem_' + i + '_anim',
                frames: scene.anims.generateFrameNumbers('gems',
                    {start: i*6, end: i*6 + 5}),
                skipMissedFrames: false,
                frameRate: 12,
                repeatDelay: 1000,
                repeat: -1
            });
        }
    },

    //--------------------------------------------------------------------------
    update: function() {},
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
        let backdrop = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 1.0);
        let title_text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/3, "Knight's Tale",
            { font: GRID_SIZE + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(0.5, 0.5)
            .setAlpha(0);
        /*let intro_text = scene.add.text(SCREEN_WIDTH*5/6, SCREEN_HEIGHT*5/6 - (GRID_SIZE/2 * 2.5), "Introduction",
            { font: GRID_SIZE/2 + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(1, 0.5)
            .setAlpha(0);
		*/
        let start_text = scene.add.text(SCREEN_WIDTH*5/6, SCREEN_HEIGHT*5/6 - (GRID_SIZE/2 * 1.25), "Start",
            { font: GRID_SIZE/2 + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(1, 0.5)
            .setAlpha(0);
        let credits_text = scene.add.text(SCREEN_WIDTH*5/6, SCREEN_HEIGHT*5/6, "Credits",
            { font: GRID_SIZE/2 + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(1, 0.5)
            .setAlpha(0);
        let back_text = scene.add.text(SCREEN_WIDTH*5/6, SCREEN_HEIGHT*5/6, "Back",
            { font: GRID_SIZE/2 + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(1, 0.5)
            .setAlpha(0.75)
            .setVisible(false);
        let credit_text = scene.add.text(2*GRID_SIZE,2*GRID_SIZE,[
                'Game By: CricketHunter',
                '',
                '"Crunk Knight"',
                'Kevin MacLeod (incompetech.com)',
                'Licensed under Creative Commons: By Attribution 3.0',
                'http://creativecommons.org/licenses/by/3.0/'],
            { font: GRID_SIZE/4 + 'px Eczar-Regular', fill: '#FFF' })
            .setVisible(false)
            .setOrigin(0, 0);

        scene.scene.bringToTop('TitleScene');
        scene.tweens.add({
            targets: title_text,
            alpha: 1,
            duration: 4000,
            delay: 1000,
            onComplete: () => {
				/*
                scene.tweens.add({
                    targets: intro_text,
                    alpha: 0.75,
                    duration: 250,
                });
				*/
                scene.tweens.add({
                    targets: start_text,
                    alpha: 0.75,
                    duration: 250,
                    delay: 250
                });
                scene.tweens.add({
                    targets: credits_text,
                    alpha: 0.75,
                    duration: 250,
                    delay: 500,
                });
            }
        });
        let make_button = function(text, handler) {
            text.setInteractive();
            text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => text.setAlpha(1));
            text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => text.setAlpha(0.75));
            text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, handler);
        }
        scene.tweens.add({
            targets: backdrop,
            alpha: 0.75,
            duration: 4000,
            delay: 1000,
        });
		/*
        make_button(intro_text, () => {
            PAUSE_SCENE = false;
            scene.scene.resume('chess_room');
            scene.scene.stop('TitleScene');
        });
		*/
        make_button(start_text, () => {
            START_SCENE = 'entrance_room';
            PAUSE_SCENE = false;
            scene.scene.stop('chess_room');
            scene.scene.stop('ControllerScene');
            scene.scene.start('ControllerScene');
            scene.scene.stop('TitleScene');
        });
        make_button(credits_text, () => {
            title_text.setVisible(false);
            //intro_text.setVisible(false);
            start_text.setVisible(false);
            credits_text.setVisible(false);
            credit_text.setVisible(true);
            back_text.setVisible(true);
        });
        make_button(back_text, () => {
            title_text.setVisible(true);
            //intro_text.setVisible(true);
            start_text.setVisible(true);
            credits_text.setVisible(true);
            credit_text.setVisible(false);
            back_text.setVisible(false);
        });
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let START_SCENE = 'chess_room';
let PAUSE_SCENE = true;

let ControllerScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ControllerScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.__player_status = {
            orientation: PIECE_SPRITES.KNIGHT_RIGHT,
            full_life: 10,
            life: 10,
            health_bar: addHealthBar(scene, 3, 2, 0, false),
            do_enter_animation: true,
            x: 5,
            y: 7,
            dx: 0,
            dy: 0,
            z: 0,
            parity : 1,
            playerMoveAllowed : true,
            playerDangerous : false,
            playerGracePeriod : true,
            characterFalling : true,
            inventory: [],
            isVulnerable : () => {
                return !scene.__player_status.playerGracePeriod &&
                    scene.__player_status.playerMoveAllowed
            },
            removeInventory : (key) => {
                let realign = function () {
                    for (let [v, item] of scene.__player_status.inventory.entries()) {
                        LayoutManager.__setItemPosition(v,item.sprite);
                        LayoutManager.__setItemPosition(v,item.bg_rectangle);
                        LayoutManager.__setItemTextPosition(v,item.text);
                    }
                };

                for (let [v, item] of scene.__player_status.inventory.entries()) {
                    if (item.key === key) {
                        item.count--;
                        item.text.setText('' + item.count);
                        if (item.count === 0) {
                            item.bg_rectangle.destroy();
                            item.sprite.destroy();
                            item.text.destroy();
                            scene.__player_status.inventory.splice(v, 1);
                            realign();
                        }
                        return true;
                    }
                }
                return false;
            },
            addInventory : (key, description, sprite) => {
                for (let item of scene.__player_status.inventory) {
                    if (item.key === key) {
                        item.count++;
                        item.text.setText('' + item.count);
                        sprite.destroy();
                        return;
                    }
                }
                let index = scene.__player_status.inventory.length;
                let bg_rectangle = scene.add.rectangle(0, 0, GRID_SIZE - GRID_SIZE/4, GRID_SIZE - GRID_SIZE/4, 0x000000, 0.8)
                    .setDepth(DEPTHS.UI);
                /*
                bg_rectangle.setInteractive();
                bg_rectangle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                    addDialogue(scene.__world_info.current_scene, [description]);
                });
                // */
                LayoutManager.__setItemPosition(index, bg_rectangle);
                LayoutManager.__setItemPosition(index, sprite)
                    .setDepth(DEPTHS.UI + 1);
                let text = scene.add.text(0, 0, ''+ 1, { font: GRID_SIZE/2 + 'px Eczar-Regular', fill: '#FFF' });
                LayoutManager.__setItemTextPosition(index, text)
                    .setDepth(DEPTHS.UI + 2);
                scene.__player_status.inventory.push({
                    key: key,
                    description: description,
                    sprite: sprite,
                    count: 1,
                    text: text,
                    bg_rectangle: bg_rectangle,
                });
            },
        };
        scene.__world_info = {
            current_room: START_SCENE,
            current_info: null,
            current_scene: null,
        };
        let get_current_room_info = () => {
            scene.__world_info.current_info =
                WORLD[scene.__world_info.current_room];
        };
        get_current_room_info();

        scene.__world_info.current_scene = scene.scene.add(
            scene.__world_info.current_room,
            GameScene, true);

        scene.__transitionCallback = function(new_scene, direction) {
            scene.scene.bringToTop('ControllerScene');
            let old_scene = scene.__world_info.current_scene;
            scene.scene.sendToBack(old_scene.scene.key);
            new_scene.__character =
                addPlayer(new_scene, scene.__player_status.x, scene.__player_status.y);
            new_scene.scene.pause();

            let finish = function() {
                new_scene.scene.resume();
                old_scene.scene.sleep();
            };
            scene.__world_info.current_scene = new_scene;

            if (direction.dx === 0 && direction.dy === 0) {
                finish();
                return;
            }

            let shift_x = direction.dx * SCREEN_WIDTH - GRID_SIZE * 2 * direction.dx;
            let shift_y = direction.dy * SCREEN_HEIGHT - GRID_SIZE * 2 * direction.dy;
            new_scene.cameras.main.x = shift_x;
            new_scene.cameras.main.y = shift_y;
            scene.add.tween({
                targets: new_scene.cameras.main,
                x: 0,
                y: 0,
                onComplete: function() {
                    finish();
                }
            });
            scene.add.tween({
                targets: old_scene.cameras.main,
                x: -shift_x,
                y: -shift_y,
            });

        };

        let next_scene = (direction) => {
            if (DIRECTIONS.equals(direction, DIRECTIONS.UP)) {
                return scene.__world_info.current_info.north_exit;
            }
            if (DIRECTIONS.equals(direction, DIRECTIONS.DOWN)) {
                return scene.__world_info.current_info.south_exit;
            }
            if (DIRECTIONS.equals(direction, DIRECTIONS.LEFT)) {
                return scene.__world_info.current_info.west_exit;
            }
            if (DIRECTIONS.equals(direction, DIRECTIONS.RIGHT)) {
                return scene.__world_info.current_info.east_exit;
            }
            return null;
        };

        let common_transition = function(direction) {
            get_current_room_info();

            let new_scene = scene.scene.get(scene.__world_info.current_room);
            if (!new_scene) {
                scene.scene.add(scene.__world_info.current_room, GameScene, true,
                    {
                        parent: scene.__world_info.current_scene,
                        parent_direction: direction
                    });
            } else {
                new_scene.scene.wake();
                scene.__transitionCallback(new_scene, direction);
            }
        };

        scene.__fade_transition = function(next_room) {
            scene.__world_info.current_scene.scene.pause();
            scene.__world_info.current_room = next_room;

            common_transition(DIRECTIONS.NONE);
        };

        scene.__transition = function() {
            scene.__world_info.current_scene.scene.pause();

            let player_x = scene.__player_status.x;
            let player_y = scene.__player_status.y;
            let direction = scene.__world_info.current_scene.__getTransitionDireciton(
                player_x, player_y);
            scene.__player_status.x -= (GRID_COLS - 2) * direction.dx;
            scene.__player_status.y -= (GRID_ROWS - 2) * direction.dy;
            scene.__world_info.world_x += direction.dx;
            scene.__world_info.world_y += direction.dy;

            scene.__world_info.current_room = next_scene(direction);

            common_transition(direction);
        };
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let LayoutManager = {

    __setItemPosition: function(index, item) {
        let x = index % 2;
        let y = Math.floor(index / 2);
        x = x + 10;
        y = y;
        item.setPosition(LayoutManager.__gridX(x), LayoutManager.__gridY(y));
        return item
    },

    __setItemTextPosition: function(index, item) {
        let x = index % 2;
        let y = Math.floor(index / 2);
        x = x + 10 + .5 - .125;
        y = y + .5 - .125;
        item.setOrigin(1, 1)
            .setPosition(LayoutManager.__gridX(x), LayoutManager.__gridY(y));
        return item;
    },

    __gridX: function(x) {
        return x * GRID_SIZE + GRID_SIZE/2;
    },

    __gridY: function(y) {
    return y * GRID_SIZE + GRID_SIZE/2;
    },

    __characterY: function(y) {
        return LayoutManager.__gridY(y - .5);
    },

    __setPhysicsBodyPosition: function(object, x, y) {
        object.setPosition(LayoutManager.__gridX(x),  LayoutManager.__gridX(y));
        object.body.x = LayoutManager.__gridX(x) - GRID_SIZE/2 + (GRID_SIZE - object.body.width) / 2;
        object.body.y = LayoutManager.__gridY(y) - GRID_SIZE/2 + (GRID_SIZE - object.body.height) / 2;
    },
};

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function () {
        Phaser.Scene.call(this);
    },

    //--------------------------------------------------------------------------
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;

        //----------------------------------------------------------------------
        //FUNCTIONS
        //----------------------------------------------------------------------

        scene.__isGridPassable = function(x,y) {
            return x >= 0 && x < GRID_COLS &&
                y >= 0 && y < GRID_ROWS &&
                grid[x][y].visible;
        };

        scene.__isGridMobPassable = function(x,y) {
            return scene.__isGridPassable(x,y) && !scene.__shouldTransition(x,y);
        };

        scene.__shouldTransition = function(x,y) {
            return x < 2 || x > 9 || y < 2 || y > 9;
        };

        scene.__toggleGrid = function(x,y) {
            grid[x][y].setVisible(!grid[x][y].visible);
        };

        scene.__getGridSquare = function(x,y) {
            return grid[x][y];
        };

        scene.__getTransitionDireciton = function(x,y) {
            let direction = {dx: 0, dy: 0};
            if (x < 2) {
                direction.dx = -1;
            }
            if (x > 9) {
                direction.dx = 1;
            }
            if (y < 2) {
                direction.dy = -1;
            }
            if (y > 9) {
                direction.dy = 1;
            }
            return direction;
        };

        let removed_exits = [];
        scene.__removeExits = function() {
           for (let x = 0; x < GRID_COLS; x++) {
               for (let y = 0; y < GRID_ROWS; y++) {
                   if (scene.__isGridPassable(x,y) && scene.__shouldTransition(x,y)) {
                       removed_exits.push({x: x, y: y});
                       grid[x][y].setVisible(false);
                   }
               }
           }
        };

        scene.__restoreExits = function() {
            for (let exit of removed_exits) {
                grid[exit.x][exit.y].setVisible(true);
            }
        };

        let mobChecker = scene.add.rectangle(0, 0,
            GRID_SIZE/2,GRID_SIZE/2,0x00ff00,0).setDepth(DEPTHS.SURFACE);
        scene.physics.add.existing(mobChecker);
        scene.__isGridMobFree = function(x,y) {
            //physics body origins are 0,0 as opposed to sprites which are 0.5,0.5
            LayoutManager.__setPhysicsBodyPosition(mobChecker, x, y);
            return !scene.physics.overlap(mobChecker, scene.__mob_collision_boxes);
        };

        scene.__checkPlayerCollision = function(x,y) {
            let player_status = scene.scene.get('ControllerScene').__player_status;
            return Math.round(player_status.x) ===
                Math.round(x) &&
                Math.round(player_status.y) ===
                Math.round(y);
        };

        //----------------------------------------------------------------------
        //GAME SETUP
        //----------------------------------------------------------------------

        let grid = [];
        scene.__player_group = scene.physics.add.group();
        scene.__mob_collision_boxes = scene.physics.add.group();
        scene.__hittables = scene.physics.add.group();
        scene.__dangerous_touchables = scene.physics.add.group();
        scene.__touchables = scene.physics.add.group();
        scene.__mob_touchables = scene.physics.add.group();
        scene.__updateables = scene.add.group({
            runChildUpdate: true,
        });
        scene.__mobs = scene.add.group();

        let room_info = scene.scene.get('ControllerScene').__world_info.current_info;
        for (let x = 0; x < GRID_COLS; x++)
        {
            grid.push([]);
            for (let y = 0; y < GRID_ROWS; y++)
            {
                let square = addGroundSquare(scene, x, y);
                square.setVisible(room_info.map[y][x] === '0');
                grid[x].push(square);
            }
        }

        if (data.parent) {
            scene.scene.get('ControllerScene').__transitionCallback(scene, data.parent_direction);
        } else {
            if (room_info.init) {
                room_info.init(scene);
            }
            scene.scene.sendToBack(scene);
            if (PAUSE_SCENE) {
                scene.time.delayedCall(50, () => {
                    scene.scene.pause();
                });
            }
        }

        room_info.create(scene);

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

        //----------------------------------------------------------------------
        //SETUP PHYSICS
        //----------------------------------------------------------------------

        scene.physics.add.overlap(scene.__player_group, scene.__hittables,
            function(character, hittable) {
                let player_status = scene.scene.get('ControllerScene').__player_status;
                if (character.data.values.isHitting()) {
                    hittable.data.values.onHit(player_status.dx,
                        player_status.dy);
                }
            });
        scene.physics.add.overlap(scene.__player_group, scene.__dangerous_touchables,
            function(character, dangerous_touchable) {
                let player_status = scene.scene.get('ControllerScene').__player_status;
                if (player_status.isVulnerable() &&
                    dangerous_touchable.data.values.isDangerous()) {
                    let touch_info = dangerous_touchable.data.values.registerDangerousTouch();
                    character.data.values.onHit(
                        touch_info.dx,
                        touch_info.dy);
                }
            });
        scene.physics.add.overlap(scene.__player_group, scene.__touchables,
            function(character, touchable) {
                if (character.data.values.isTouching()) {
                    touchable.data.values.onTouch();
                }
            });
        scene.physics.add.overlap(scene.__mobs, scene.__mob_touchables,
            function(mob, mob_touchable) {
                mob_touchable.data.values.onTouch();
            });
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let config = {
    backgroundColor: '#202020',
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
    scene: [ LoadScene, TitleScene, ControllerScene ]
};

let game = new Phaser.Game(config);
