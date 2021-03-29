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
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.spritesheet('floor', 'assets/Wood 1 TD 64x72.png', { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('white_pieces', 'assets/White - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('black_pieces', 'assets/Black - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('impact', 'assets/Impact.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('health_bars', 'assets/health_bars.png', { frameWidth: 80, frameHeight: 9 });
        this.load.spritesheet('fire', 'assets/fire_column_medium_1.png', { frameWidth: 40, frameHeight: 80 });
        this.load.spritesheet('death_effect','assets/death_effect.png', { frameWidth: 128,  frameHeight: 128});
        this.load.spritesheet('frame', 'assets/frame.png', { frameWidth: 32,  frameHeight: 32});
        this.load.spritesheet('laser_column', 'assets/laser_column.png', { frameWidth: 32,  frameHeight: 96});
        this.load.spritesheet('laser_column_cont', 'assets/laser_column_cont.png', { frameWidth: 32,  frameHeight: 64});
        this.load.spritesheet('button', 'assets/buttons.png', { frameWidth: 80,  frameHeight: 80});

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
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
    create: function () {
        let scene = this;

        scene.__gridX = function(x) {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        scene.__gridY = function(y) {
            return y * GRID_SIZE + GRID_SIZE/2;
        };

        scene.__player_status = {
            orientation: 0,
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
            isVulnerable : () => {
                return !scene.__player_status.playerGracePeriod &&
                    scene.__player_status.playerMoveAllowed
            },
        };
        scene.__world_info = {
            current_room: 'entrance_room',
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
            new_scene.__player_group.add(new_scene.__character);
            new_scene.scene.pause();


            let shift_x = direction.dx * SCREEN_WIDTH - GRID_SIZE * 2 * direction.dx;
            let shift_y = direction.dy * SCREEN_HEIGHT - GRID_SIZE * 2 * direction.dy;
            new_scene.cameras.main.x = shift_x;
            new_scene.cameras.main.y = shift_y;
            scene.add.tween({
                targets: new_scene.cameras.main,
                x: 0,
                y: 0,
                onComplete: function() {
                    new_scene.scene.resume();
                    old_scene.scene.sleep();
                }
            });
            scene.add.tween({
                targets: scene.__world_info.current_scene.cameras.main,
                x: -shift_x,
                y: -shift_y,
            });
            scene.__world_info.current_scene = new_scene;
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

        scene.__transition = function() {
            let scene = this;

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
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

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

        scene.__gridX = function(x) {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        scene.__gridY = function(y) {
            return y * GRID_SIZE + GRID_SIZE/2;
        };

        scene.__characterY = function(y) {
            return scene.__gridY(y - .5);
        };

        scene.__setPhysicsBodyPosition = function(object, x, y) {
            object.setPosition(scene.__gridX(x),  scene.__gridX(y));
            object.body.x = scene.__gridX(x) - GRID_SIZE/2 + (GRID_SIZE - object.body.width) / 2;
            object.body.y = scene.__gridY(y) - GRID_SIZE/2 + (GRID_SIZE - object.body.height) / 2;
        };

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
            scene.__setPhysicsBodyPosition(mobChecker, x, y);
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

        let index_image = Phaser.Utils.Array.NumberArray(0,3);
        let room_info = scene.scene.get('ControllerScene').__world_info.current_info;
        for (let x = 0; x < GRID_COLS; x++)
        {
            grid.push([]);
            for (let y = 0; y < GRID_ROWS; y++)
            {
                let offset = 4 * ((x + y) % 2);
                let tile = Phaser.Utils.Array.GetRandom(index_image) + offset;
                let square = scene.add.sprite(scene.__gridX(x), scene.__gridY(y), 'floor', tile);
                square.setDepth(DEPTHS.BOARD+y);
                square.setVisible(room_info.map[y][x] === '0');
                grid[x].push(square);
            }
        }

        if (data.parent) {
            scene.scene.get('ControllerScene').__transitionCallback(scene, data.parent_direction);
        } else {
            //HACK!!!
            scene.__character = addPlayer(scene,5,7);
            scene.__player_group.add(scene.__character);
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
    scene: [ LoadScene, ControllerScene ]
};

let game = new Phaser.Game(config);
