const GRID_SIZE = 32;
const SCREEN_COLUMNS = 16;
const SCREEN_ROWS = 9;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
const DEPTHS =
{
    BG_SHADOW : 0,
    BG : 500,
    LIGHT_CIRCLE : 750,
    GRID: 1000,
    ENTITY: 1250,
    PLAYER: 1500,
    GUESS: 2000,
    FG: 4000,
    UI: 5000
};

let world = {
    map: [
        [1, 1, 0, 0, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 1, 1, 1, 0, 1],
        [0, 1, 0, 1, 1, 1, 0, 1, 0],
        [1, 1, 0, 1, 1, 1, 1, 1, 0]],
    room_height: 11,
    room_width: 11,
    start_room_x: 2,
    start_room_y: 4,
};

let DOOR = {
    UNDEFINED: 0,
    OPEN: 1,
    CLOSED: 2
};
let DIRECTION = {
    N: 0,
    S: 1,
    W: 2,
    E: 3
};
let create_world = () => {
    let world_template = [];
    world.map = [];

    let directions = [DIRECTION.N,DIRECTION.S,DIRECTION.W,DIRECTION.E];
    let opposite = [DIRECTION.S, DIRECTION.N, DIRECTION.E, DIRECTION.W];
    let offset = [
        {dx:0, dy:-1},
        {dx:0, dy:1},
        {dx:-1, dy:0},
        {dx:1, dy:0},
    ];
    let max_map_size = 7;
    world.start_room_x = Math.round((max_map_size - 1)/2);
    world.start_room_y = Math.round((max_map_size - 1)/2);

    for (let x = 0; x < max_map_size; x++) {
        let world_column = [];
        let world_map_column = [];
        for (let y = 0; y < max_map_size; y++) {
            world_map_column.push(0);
            world_column.push({
                x: x,
                y: y,
                doors: [
                y === 0 ? DOOR.CLOSED :  DOOR.UNDEFINED,
                y === max_map_size-1 ? DOOR.CLOSED :  DOOR.UNDEFINED,
                x === 0 ? DOOR.CLOSED :  DOOR.UNDEFINED,
                x === max_map_size-1 ? DOOR.CLOSED :  DOOR.UNDEFINED],
            });
        }
        world.map.push(world_map_column);
        world_template.push(world_column);
    };
    world.world_template = world_template;

    let rooms_to_randomize = [];

    let randomize_room = (room, randomizer) => {
        for (let d of directions) {
            if (room.doors[d] === DOOR.UNDEFINED) {
                room.doors[d] = randomizer() ? DOOR.OPEN : DOOR.CLOSED;
                let delta = offset[d];
                let adjacent_room = world_template[room.x + delta.dx][room.y + delta.dy];
                adjacent_room.doors[opposite[d]] = room.doors[d];
                if (room.doors[d] === DOOR.OPEN) {
                    rooms_to_randomize.push(adjacent_room);
                }
            }
        }
    };

    randomize_room(world_template[world.start_room_x][world.start_room_y], () => {
        return true;
    });

    while(rooms_to_randomize.length > 0) {
        randomize_room(rooms_to_randomize.pop(), () => {
            return Phaser.Utils.Array.GetRandom([true, false])});
    }

    let room_value = (room) => {
        let open_count = 0;
        for (let d of room.doors) {
            if (d === DOOR.UNDEFINED) {
                return 0;
            }
            if (d === DOOR.OPEN) {
                open_count++;
            }
        }
        return open_count > 0 ? 1 : 0;
    }

    for (let column of world_template) {
        for (let room of column) {
            world.map[room.x][room.y] = room_value(room);
        }
    }

    let calculate_distance = (x, y) => {
        let distance = [];
        for (let column of world_template) {
            let distance_column = [];
            for (let room of column) {
                distance_column.push(-1);
            }
            distance.push(distance_column);
        }

        distance[x][y] = 0;
        let max_distance = 0;
        let max_x = x;
        let max_y = y;
        let rooms_to_explore = [world.world_template[x][y]];
        while (rooms_to_explore.length > 0) {
            let room = rooms_to_explore.pop();
            for (let d of directions) {
                if (room.doors[d] === DOOR.OPEN) {
                    let current_distance = distance[room.x][room.y]
                    let delta = offset[d];
                    let next_room =
                        world.world_template[room.x + delta.dx]
                            [room.y + delta.dy];
                    if (distance[next_room.x][next_room.y] === -1 ||
                        current_distance + 1 < distance[next_room.x][next_room.y]) {
                        distance[next_room.x][next_room.y] = current_distance + 1;
                        rooms_to_explore.push(next_room);
                    }
                }
            }
        }

        let array = [];
        for (let x = 0; x < distance.length; x++) {
            for (let y = 0; y < distance[x].length; y++) {
                array.push({x: x, y: y});
            }
        }
        for (let a of array) {
            if (distance[a.x][a.y] >= max_distance) {
                max_distance = distance[a.x][a.y];
                max_x = a.x;
                max_y = a.y;
            }
        }

        return {distance: distance, max:max_distance, x: max_x, y: max_y};
    };
    let combine_distances = (result1, result2) => {
        let distance1 = result1.distance;
        let distance2 = result2.distance;
        let max_distance = 0;
        let max_x = -1;
        let max_y = -1;
        let array = [];
        for (let x = 0; x < distance1.length; x++) {
            for (let y = 0; y < distance1[x].length; y++) {
                array.push({x: x, y: y});
            }
        }
        Phaser.Utils.Array.Shuffle(array);
        for (let a of array) {
            distance1[a.x][a.y] = Math.min(distance1[a.x][a.y], distance2[a.x][a.y]);
            if (distance1[a.x][a.y] >= max_distance) {
                max_distance = distance1[a.x][a.y];
                max_x = a.x;
                max_y = a.y;
            }
        }

        return {distance: distance1, max:max_distance, x: max_x, y: max_y};
    };
    let lights = [[world.start_room_x,world.start_room_y]];
    let result = calculate_distance(world.start_room_x,world.start_room_y);
    world.exit_x = result.x;
    world.exit_y = result.y;
    let result2 = calculate_distance(result.x, result.y);
    result = combine_distances(result, result2);
    while (result.max > 2) {
        lights.push([result.x, result.y]);
        let result2 = calculate_distance(result.x, result.y);
        result = combine_distances(result, result2);
    }

    world.lights = lights;
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

        scene.__lamp_attack = scene.sound.add('lamp_attack', {loop: true});
        scene.__lamp_damage = scene.sound.add('lamp_damage');
        scene.__lamp_left_footstep = scene.sound.add('lamp_left_footstep');
        scene.__lamp_right_footstep = scene.sound.add('lamp_right_footstep');
        scene.__lamp_refill = scene.sound.add('lamp_refill', {loop: true});
        scene.__enemy_wake = scene.sound.add('enemy_wake');
        scene.__enemy_death = scene.sound.add('enemy_death');
        scene.__ambiance = scene.sound.add('ambiance', {loop: true});

        scene.__ambiance.play();
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.__ambiance.stop();
            scene.__lamp_attack.stop();
            scene.__lamp_refill.stop();
        });

        create_world();

        scene.__updateables = scene.add.group({
            runChildUpdate: true,
        });
        scene.__player_group = scene.physics.add.group();
        scene.__mob_group = scene.physics.add.group();
        scene.__wall_group = scene.physics.add.staticGroup();
        scene.__spring_group = scene.physics.add.group();
        scene.__exit_group = scene.physics.add.group();

        scene.physics.add.collider(scene.__player_group, scene.__wall_group);
        scene.physics.add.collider(scene.__mob_group, scene.__wall_group);

        scene.physics.add.overlap(scene.__spring_group, scene.__player_group, (spring, player) => {
            player.__overlap_spring(spring);
        });
        scene.physics.add.overlap(scene.__exit_group, scene.__player_group, (exit, player) => {
            scene.scene.pause();
            scene.scene.launch('LevelChangeScene',
                getRelativePositionToCanvas(player,scene.cameras.main));
        });

        scene.physics.add.overlap(scene.__mob_group, scene.__player_group, (mob, player) => {
            if (mob.__is_dangerous && mob.__is_dangerous()) {
                player.__take_damage(mob);
            }
        });

        let is_solid = (world_x, world_y, room_x, room_y) => {
            if (world.map[world_x][world_y] === 0) {
                return true;
            }
            let buffer = 2;
            if (
                (room_x < buffer && room_y < buffer) ||
                (room_x < buffer && room_y >= world.room_height - buffer) ||
                (room_x >= world.room_width - buffer && room_y < buffer) ||
                (room_x >= world.room_width - buffer && room_y >= world.room_height - buffer)) {
                return true;
            }
            let exits =  world.world_template[world_x][world_y].doors;
            if (room_x < buffer && exits[DIRECTION.W] === DOOR.CLOSED ||
                room_y < buffer && exits[DIRECTION.N] === DOOR.CLOSED ||
                room_x >= world.room_width - buffer && exits[DIRECTION.E] === DOOR.CLOSED ||
                room_y >= world.room_height - buffer && exits[DIRECTION.S] === DOOR.CLOSED) {
                return true;
            }
            return false;
        };

        let world_grid = [];
        world.max_world_x = world.map.length * world.room_width;
        world.max_world_y = 0;
        for (let x = 0; x < world.max_world_x; x++) {
            let world_column = [];
            let world_x = Math.floor(x/world.room_width);
            let room_x = x % world.room_width;
            let max_y = world.map[world_x].length * world.room_height;
            world.max_world_y = Math.max(world.max_world_y, max_y);
            for (let y = 0; y < max_y; y++) {

                let world_y = Math.floor(y/world.room_height);
                let room_y = y % world.room_height;
                world_column.push({
                    x: x,
                    y: y,
                    solid: is_solid(world_x,world_y,room_x, room_y),
                });
            }
            world_grid.push(world_column);
        }
        let world_bounds = new Phaser.Geom.Rectangle(0,0,0,0);
        scene.cameras.main.setBounds(0, 0,  world.max_world_x * GRID_SIZE,  world.max_world_y * GRID_SIZE);
        scene.cameras.main.getBounds(world_bounds);
        scene.physics.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.width, world_bounds.height);
        scene.physics.world.setBoundsCollision();

        let xPixel = (x) => {
            return x*GRID_SIZE + GRID_SIZE/2
        };

        let yPixel = (y) => {
            return y*GRID_SIZE + GRID_SIZE/2
        };

        for(let world_column of world_grid) {
            for (let square of world_column) {

                if (square.solid) {
                    let wall = scene.add.rectangle(
                        xPixel(square.x), yPixel(square.y), GRID_SIZE, GRID_SIZE, 0x000000);
                    scene.__wall_group.add(wall);
                    if (square.y > 0 &&
                        world_grid[square.x][square.y-1].solid)
                    {
                        wall.body.checkCollision.up = false;
                    }
                    if (square.x > 0 &&
                        world_grid[square.x-1][square.y].solid)
                    {
                        wall.body.checkCollision.left = false;
                    }
                    if (square.x + 1 < world_grid.length &&
                        world_grid[square.x+1][square.y].solid)
                    {
                        wall.body.checkCollision.right = false;
                    }
                    if (square.y + 1 < world_grid[square.x].length &&
                        world_grid[square.x][square.y+1].solid)
                    {
                        wall.body.checkCollision.down = false;
                    }
                } else {
                    scene.add.sprite(xPixel(square.x), yPixel(square.y), 'tiles',
                        Phaser.Utils.Array.GetRandom([0,1,4,5,8,9]))
                        .setPipeline('Light2D')
                        .setDepth(DEPTHS.BG);
                }
            }
        }
        scene.lights.enable().setAmbientColor(0x101010);

        let add_mini_map = (scene) => {
            let width = world.max_world_x / world.room_width;
            let height = world.max_world_y / world.room_height;
            let minimap = scene.add.rectangle(SCREEN_WIDTH - width*4, SCREEN_HEIGHT - height*4, width * 8, height * 8, 0x000000, 0.5)
                .setDepth(DEPTHS.UI)
                .setScrollFactor(0);
            let start_x = SCREEN_WIDTH - width*8;
            let start_y = SCREEN_HEIGHT - height*8;
            let map = [];
            let room_to_icon = [];
            for (let n of [DOOR.CLOSED, DOOR.OPEN, DOOR.UNDEFINED]) {
                let n_direction = [];
                for (let s of [DOOR.CLOSED, DOOR.OPEN, DOOR.UNDEFINED]) {
                    let s_direction = [];
                    for (let e of [DOOR.CLOSED, DOOR.OPEN, DOOR.UNDEFINED]) {
                        let e_direction = [];
                        for (let w of [DOOR.CLOSED, DOOR.OPEN, DOOR.UNDEFINED]) {
                            e_direction.push(0);
                        }
                        s_direction.push(e_direction);
                    }

                    n_direction.push(s_direction);
                }
                room_to_icon.push(n_direction);
            };
            //n s e w
            room_to_icon[DOOR.OPEN][DOOR.OPEN][DOOR.OPEN][DOOR.OPEN] = 2;

            room_to_icon[DOOR.OPEN][DOOR.CLOSED][DOOR.OPEN][DOOR.OPEN] = 3;
            room_to_icon[DOOR.OPEN][DOOR.OPEN][DOOR.OPEN][DOOR.CLOSED] = 4;
            room_to_icon[DOOR.CLOSED][DOOR.OPEN][DOOR.OPEN][DOOR.OPEN] = 5;
            room_to_icon[DOOR.OPEN][DOOR.OPEN][DOOR.CLOSED][DOOR.OPEN] = 6;

            room_to_icon[DOOR.OPEN][DOOR.CLOSED][DOOR.CLOSED][DOOR.OPEN] = 7;
            room_to_icon[DOOR.OPEN][DOOR.CLOSED][DOOR.OPEN][DOOR.CLOSED] = 8;
            room_to_icon[DOOR.CLOSED][DOOR.OPEN][DOOR.OPEN][DOOR.CLOSED] = 9;
            room_to_icon[DOOR.CLOSED][DOOR.OPEN][DOOR.CLOSED][DOOR.OPEN] = 10;

            room_to_icon[DOOR.OPEN][DOOR.OPEN][DOOR.CLOSED][DOOR.CLOSED] = 11;
            room_to_icon[DOOR.CLOSED][DOOR.CLOSED][DOOR.OPEN][DOOR.OPEN] = 12;

            room_to_icon[DOOR.CLOSED][DOOR.CLOSED][DOOR.OPEN][DOOR.CLOSED] = 13;
            room_to_icon[DOOR.CLOSED][DOOR.OPEN][DOOR.CLOSED][DOOR.CLOSED] = 14;
            room_to_icon[DOOR.CLOSED][DOOR.CLOSED][DOOR.CLOSED][DOOR.OPEN] = 15;
            room_to_icon[DOOR.OPEN][DOOR.CLOSED][DOOR.CLOSED][DOOR.CLOSED] = 16;

            for (let x = 0; x < width; x++) {
                let map_column = [];
                for (let y = 0; y < height; y++) {
                    let room_icon = scene.add.sprite(start_x + x * 8 + 4, start_y + y * 8 + 4,
                        'minimap_icon',
                        room_to_icon
                            [world.world_template[x][y].doors[DIRECTION.N]]
                            [world.world_template[x][y].doors[DIRECTION.S]]
                            [world.world_template[x][y].doors[DIRECTION.E]]
                            [world.world_template[x][y].doors[DIRECTION.W]])
                        .setDepth(DEPTHS.UI+1)
                        .setScrollFactor(0)
                        .setVisible(false);
                    map_column.push(room_icon);
                }
                map.push(map_column);
            }
            minimap.update = () => {
                let room_x = Math.floor(scene.__player.x / world.room_width / GRID_SIZE);
                let room_y = Math.floor(scene.__player.y / world.room_height / GRID_SIZE);
                map[room_x][room_y].setVisible(true);
                for (let map_column of map) {
                    for(let map_room of map_column) {
                        if (map_room.visible) {
                            map_room.setAlpha(0.5);
                        }
                    }
                }
                map[room_x][room_y].setAlpha(1);
            };
            scene.__updateables.add(minimap);
        };
        add_mini_map(scene);

        let add_mote = (scene,x, y) => {
            let mote_sprite = scene.add.sprite(0, 0, 'mote',0)
                .setDepth(DEPTHS.ENTITY)
                .setPipeline('Light2D');
            let mote = scene.add.container(x,y, [mote_sprite])
                .setDepth(DEPTHS.ENTITY);
            mote.setSize(16, 16);
            scene.__updateables.add(mote);
            scene.__mob_group.add(mote);
            let enter_wake = () => {
                scene.__enemy_wake.play();
                mote_sprite.anims.stop();
                mote_sprite.play('mote_wake');
                mote_sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    mote.__state_handler.changeState(STATES.ATTACK);
                })
            };


            let enter_idle = () => {
                mote_sprite.anims.stop();
                mote_sprite.play('mote_idle');
            };

            let enter_attack = () => {
                mote_sprite.anims.stop();
                mote_sprite.play('mote_attack');
            };


            let enter_die = () => {
                scene.__enemy_death.play();
                mote_sprite.anims.stop();
                mote_sprite.play('mote_die');
                mote_sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    mote.destroy();
                })
            };

            let update_idle = (state) => {
                if (state.l < GRID_SIZE*4) {
                    mote.__state_handler.changeState(STATES.WAKE);
                }
            };

            mote.__is_dangerous = () => {
                return mote.__state_handler.getState() === STATES.ATTACK;
            };

            let acceleration = new Phaser.Math.Vector2(0,0);
            let update_attack = (state) => {
                state.d.setLength(GRID_SIZE*4);
                acceleration.x = state.d.x - mote.body.velocity.x;
                acceleration.y = state.d.y - mote.body.velocity.y;
                acceleration.setLength(GRID_SIZE*4);
                mote.body.setAcceleration(acceleration.x, acceleration.y);
                mote.body.setMaxSpeed(GRID_SIZE*4);
                if (state.l < GRID_SIZE && scene.__player.__is_attacking()) {
                    state.d.setLength(GRID_SIZE*-0.5)
                    mote.body.setVelocity(state.d.x,state.d.y);
                    mote.body.setAcceleration(0,0);
                    mote.__state_handler.changeState(STATES.DIE);
                }
            };

            let STATES = {
                WAKE: {enter: enter_wake, exit: null},
                IDLE: {enter: enter_idle, exit: null, update: update_idle},
                ATTACK: {enter: enter_attack, exit: null, update: update_attack},
                DIE: {enter: enter_die, exit: null, },
            };
            mote.__state_handler = stateHandler(scene, STATES, STATES.IDLE);
            mote.__state_handler.start();

            let update_state = {
                d: new Phaser.Math.Vector2(0, 0),
                l: 0,
            };
            mote.update = () => {
                update_state.d.x = scene.__player.x - mote.x;
                update_state.d.y = scene.__player.y - mote.y;
                update_state.l = update_state.d.length();
                if (mote.__state_handler.getState().update) {
                    mote.__state_handler.getState().update(update_state);
                }
            }
        };
        let add_motes_to_rooms = () => {
            for(let x=0; x < world.map.length; x++) {
                for (let y = 0; y < world.map[x].length; y++) {
                    if (world.map[x][y] === 1 &&
                        (x !== world.start_room_x || y !== world.start_room_y)) {
                        for (let n = 0; n < 14; n++) {
                            add_mote(scene,
                                x * world.room_width * GRID_SIZE
                                + Phaser.Math.Between(2.5*GRID_SIZE, world.room_width * GRID_SIZE-2.5*GRID_SIZE),
                                y * world.room_width * GRID_SIZE
                                + Phaser.Math.Between(2.5*GRID_SIZE, world.room_height * GRID_SIZE-2.5*GRID_SIZE))
                        }
                    }
                }
            }
        };
        add_motes_to_rooms();

        let add_player = (scene,x,y) => {
            let LIGHT_LEVEL = {
                LOW: {radius: 250, intensity: 2},
                HIGH: {radius: 250, intensity: 3}
            };
            let set_light_level = (level) => {
                light.intensity = level.intensity;
                light.radius = level.radius;
            }
            let light = scene.lights.addLight(xPixel(x), yPixel(y));
            set_light_level(LIGHT_LEVEL.LOW);
            let player_sprite = scene.add.sprite(0,0, 'lamp', 0)
                .setDepth(DEPTHS.PLAYER);
            let sprites = [
                player_sprite
            ];
            let player = scene.add.container(xPixel(x), yPixel(y), sprites)
                .setDepth(DEPTHS.PLAYER);
            player.setSize(16, 32);
            player_sprite.play('lamp_idle');
            scene.__player_group.add(player);
            scene.__updateables.add(player);
            scene.cameras.main.startFollow(player, true, 1, 1, 0, 0);

            let attack_circle = scene.add.circle(player.x, player.y, GRID_SIZE, 0xffffff)
                .setAlpha(0)
                .setDepth(DEPTHS.LIGHT_CIRCLE);


            scene.add.sprite(8,SCREEN_HEIGHT-8,'lifebar',0)
                .setAlpha(0.5)
                .setOrigin(0,1)
                .setDepth(DEPTHS.UI)
                .setScrollFactor(0);
            let health_bar = scene.add.sprite(8,SCREEN_HEIGHT-8,'lifebar',0)
                .setOrigin(0,1)
                .setDepth(DEPTHS.UI)
                .setScrollFactor(0);
            let splash = scene.add.sprite(8,SCREEN_HEIGHT-8,'lifebar',2)
                .setOrigin(0,1)
                .setScrollFactor(0)
                .setVisible(false);
            splash.play('splash');
            let mask = splash.createBitmapMask();
            health_bar.setMask(mask);
            let max_health = 120000;
            let current_health = 120000;
            let timer = scene.time.addEvent({
                delay: 100,                //
                callback: () => {
                    let delta = -100;
                    if (player.__is_attacking()) {
                       delta = -400;
                    }
                    if (current_spring) {
                        delta = 2400;
                    }
                    current_health = Phaser.Math.Clamp(current_health + delta, 0, max_health);
                },
                loop: true
            });

            let footstep_left = true;
            let time_footstep = null;
            let enter_walk = () => {
                player_sprite.anims.stop();
                player_sprite.play('lamp_walk');
                time_footstep = scene.time.addEvent({
                    delay: 500,                //
                    callback: () => {
                        footstep_left = !footstep_left;
                        footstep_left ? scene.__lamp_left_footstep.play() :
                            scene.__lamp_right_footstep.play()
                    },
                    loop: true
                });
            };

            let exit_walk = () => {
                if (time_footstep) {
                    time_footstep.remove();
                }
            };

            let enter_idle = () => {
                player_sprite.anims.stop();
                player_sprite.play('lamp_idle');
            };

            let enter_attack = () => {
                player_sprite.anims.stop();
                scene.__lamp_attack.play();
                player_sprite.play('lamp_attack_anim');
                set_light_level(LIGHT_LEVEL.HIGH);
                attack_circle.setAlpha(0.1);
            };

            let exit_attack = () => {

                scene.__lamp_attack.stop();
                set_light_level(LIGHT_LEVEL.LOW);
                attack_circle.setAlpha(0);
            };

            let stunned = new Phaser.Math.Vector2(0, 0);
            let enter_stunned = () => {
                scene.cameras.main.shake(50, 0.01, true);
                scene.__lamp_damage.play();
                stunned.setLength(GRID_SIZE*4);
                player.__state_handler.addTween({
                    targets: stunned,
                    x: 0,
                    y: 0,
                    duration: 750,
                    onComplete: () => {
                        player.__state_handler.changeState(STATES.IDLE);
                    }
                });
                player_sprite.anims.stop();
                player_sprite.play('lamp_stunned');
                player_sprite.setFlipX(stunned.x > 0);
            };

            let STATES = {
                WALK: {enter: enter_walk, exit: exit_walk},
                IDLE: {enter: enter_idle, exit: null},
                ATTACK: {enter: enter_attack, exit: exit_attack},
                STUNNED: {enter: enter_stunned, exit: null},
            };
            player.__state_handler = stateHandler(scene, STATES, STATES.IDLE);
            player.__state_handler.start();

            player.__take_damage = (mob) => {
                if (player.__hittable_state_handler.getState() !== HITTABLE_STATES.HITTABLE) {
                    return;
                }
                if (player.__state_handler.getState() === STATES.ATTACK) {
                    return;
                }
                current_health = Phaser.Math.Clamp(current_health - 20000, 0, max_health);
                stunned.x = mob.body.velocity.x;
                stunned.y = mob.body.velocity.y;
                player.__state_handler.changeState(STATES.STUNNED);
                player.__hittable_state_handler.changeState(HITTABLE_STATES.UNHITTABLE);
            };

            let current_spring = null;
            player.__overlap_spring = (spring) => {
                current_spring = spring;
            }

            let HITTABLE_STATES = {
                HITTABLE: {enter: null, exit: null},
                UNHITTABLE: {enter: () => {
                    player_sprite.setAlpha(0.5);
                    player.__hittable_state_handler.addDelayedCall(1500, ()=> {
                        player_sprite.setAlpha(1);
                    });
                    player.__hittable_state_handler.addDelayedCall(2000, ()=> {
                        player.__hittable_state_handler.changeState(
                            HITTABLE_STATES.HITTABLE);
                    });
                }, exit: null}
            };
            player.__hittable_state_handler = stateHandler(scene,
                HITTABLE_STATES, HITTABLE_STATES.HITTABLE);
            player.__hittable_state_handler.start();



            let d = new Phaser.Math.Vector2(0, 0);

            player.update = () => {
                d.x = 0;
                d.y = 0;
                if (current_spring && !scene.physics.overlap(current_spring, player)) {
                    current_spring = null;
                }
                if (player.__state_handler.getState() === STATES.STUNNED) {
                    d.x = stunned.x;
                    d.y = stunned.y;
                } else {
                    if (scene.__input.fire) {
                        player.__state_handler.changeState(STATES.ATTACK);
                    } else {
                        if (scene.__input.left) {
                            d.x += -1;
                        }
                        if (scene.__input.right) {
                            d.x += 1;
                        }
                        if (scene.__input.down) {
                            d.y += 1;
                        }
                        if (scene.__input.up) {
                            d.y -= 1;
                        }
                        d.setLength(3 * GRID_SIZE);
                        if (d.length() > 0) {
                            player.__state_handler.changeState(STATES.WALK);
                        } else if (d.length() === 0) {
                            player.__state_handler.changeState(STATES.IDLE);
                        }
                    }
                }
                player.body.setVelocity(d.x, d.y);
                light.x = player.x;
                light.y = player.y;
                attack_circle.x = player.x;
                attack_circle.y = player.y;
                splash.y = SCREEN_HEIGHT-8 + 25*(1-current_health/max_health);
                if (current_health === 0) {
                    scene.scene.start('GameOverScene',
                        getRelativePositionToCanvas(player,scene.cameras.main));
                }
            };

            player.__is_attacking = () => {
                return STATES.ATTACK === player.__state_handler.getState();
            }
            player.body.setCollideWorldBounds();

            return player;
        };

        let player_x = world.start_room_x * world.room_width + (world.room_width-1)/2;
        let player_y = world.start_room_y * world.room_height + (world.room_height-1)/2-0.5;
        scene.__player = add_player(scene, player_x, player_y);

        let add_spring = (scene, x, y) => {
            let spring = scene.add.sprite(x, y, 'well', 7)
                .setDepth(DEPTHS.BG)
                .setPipeline('Light2D');
            scene.lights.addLight(x, y, GRID_SIZE, 0xffff00, 2);
            scene.__spring_group.add(spring);
            scene.__updateables.add(spring);

            let enter_glow = () => {
                spring.anims.stop();
                spring.play('well_glow');
                scene.__lamp_refill.play();
            };

            let enter_idle = () => {
                spring.anims.stop();
                scene.__lamp_refill.stop();
                spring.setFrame(7);
            };

            let STATES = {
                GLOW: {enter: enter_glow, exit: null},
                IDLE: {enter: enter_idle, exit: null},
            };
            spring.__state_handler = stateHandler(scene, STATES, STATES.IDLE);
            spring.__state_handler.start();

            spring.update = () => {
                if (scene.physics.overlap(spring, scene.__player)) {
                    spring.__state_handler.changeState(STATES.GLOW);
                } else {
                    spring.__state_handler.changeState(STATES.IDLE);
                }
            }

            return spring;
        };
        for (let l of world.lights) {
            let x = l[0] * world.room_width + (world.room_width-1)/2;
            let y = l[1] * world.room_height + (world.room_height-1)/2-0.5;
            add_spring(scene, xPixel(x), yPixel(y+0.25));
        }

        let add_exit = (scene, x, y) => {
            let exit = scene.add.sprite(x, y, 'tiles', 13)
                .setDepth(DEPTHS.BG)
                .setPipeline('Light2D');
            scene.lights.addLight(x, y, GRID_SIZE, 0xffff00, 2);
            scene.__exit_group.add(exit);

            return exit;
        };
        add_exit(scene, xPixel(world.exit_x * world.room_width + (world.room_width-1)/2),
            yPixel(world.exit_y * world.room_height + (world.room_height-1)/2));

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        scene.input.addPointer(5);

        scene.__input = {
            up: false,
            down: false,
            left: false,
            right: false,
            fire: false,
        };

        if (data.callback) {
            data.callback();
        }
    },

    update: function () {
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
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            input.right = true;
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            input.up = true;
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            input.down = true;
        }

        if (scene.input.activePointer.leftButtonDown()) {
            input.fire = true;
        }
        scene.__input = input;

    }
});

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        scene.load.spritesheet('tiles', 'assets/tilemap2.png', { frameWidth: 32, frameHeight: 32});
        scene.load.spritesheet('shatter', 'assets/shatter.png', { frameWidth: 32, frameHeight: 32});
        scene.load.spritesheet('lamp', 'assets/Sprite-0001trans-Sheet.png', { frameWidth: 32, frameHeight: 32});
        scene.load.spritesheet('mote', 'assets/mote_sheet.png', { frameWidth: 32, frameHeight: 32});
        scene.load.spritesheet('minimap_icon', 'assets/minimap_icon.png', { frameWidth: 8, frameHeight: 8});
        scene.load.spritesheet('lifebar', 'assets/lifebar.png', { frameWidth: 32, frameHeight: 32});
        scene.load.spritesheet('well', 'assets/recharge_sheet.png', { frameWidth: 32, frameHeight: 32});
        scene.load.image('play_text','assets/play_text.png');
        scene.load.image('lamplight_text', 'assets/lamplight_text.png');

        scene.load.audio('lamp_attack', ['assets/sfx/lamp - attack.mp3']);
        scene.load.audio('lamp_exit', ['assets/sfx/Lamp - stairs footsteps.mp3']);
        scene.load.audio('lamp_damage', ['assets/sfx/lamp - damage 1.mp3']);
        scene.load.audio('lamp_death', ['assets/sfx/lamp - death 1.mp3']);
        scene.load.audio('lamp_left_footstep', ['assets/sfx/lamp - left footstep.mp3']);
        scene.load.audio('lamp_right_footstep', ['assets/sfx/lamp - right footstep.mp3']);
        scene.load.audio('lamp_refill', ['assets/sfx/lamp - refill.mp3']);
        scene.load.audio('enemy_wake', ['assets/sfx/New - enemy awake.mp3']);
        scene.load.audio('enemy_death', ['assets/sfx/Enemy - death 1.mp3']);
        scene.load.audio('ambiance', ['assets/Ambiance.mp3']);
        scene.load.audio('title_screen', ['assets/title screen - looped.mp3']);
        scene.load.audio('title_screen_piano', ['assets/title screen - looped (piano).mp3']);

        scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 0.5)
            .setOrigin(0, 0.5);
        let loading_bar = scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 1)
            .setOrigin(0, 0.5)
            .setScale(0,1);
        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            loading_bar.setScale(percentage,1);
        });

        scene.load.on('complete', function() {
            scene.scene.start('TitleScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'lamp_walk',
                frames: scene.anims.generateFrameNumbers('lamp',
                    { start: 18, end: 25 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'shatter_anim',
            frames: scene.anims.generateFrameNumbers('shatter',
                { start: 2, end: 7 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });

        scene.anims.create({
            key: 'well_glow',
            frames: scene.anims.generateFrameNumbers('well',
                { start: 0, end: 7 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });
        scene.anims.create({
            key: 'lamp_idle',
            frames: scene.anims.generateFrameNumbers('lamp',
                { start: 0, end: 9 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'lamp_attack_anim',
            frames: scene.anims.generateFrameNumbers('lamp',
                { start: 12, end: 14 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'lamp_stunned',
            frames: scene.anims.generateFrameNumbers('lamp',
                { start: 15, end: 16 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'mote_idle',
            frames: scene.anims.generateFrameNumbers('mote',
                { start: 0, end: 2 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'mote_wake',
            frames: scene.anims.generateFrameNumbers('mote',
                { start: 6, end: 13 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'mote_attack',
            frames: scene.anims.generateFrameNumbers('mote',
                { start: 18, end: 21 }),
            skipMissedFrames: false,
            frameRate: 7,
            repeat: 0
        });
        scene.anims.create({
            key: 'mote_die',
            frames: scene.anims.generateFrameNumbers('mote',
                { start: 24, end: 29 }),
            skipMissedFrames: false,
            frameRate: 7,
            repeat: 0
        });
        scene.anims.create({
            key: 'splash',
            frames: scene.anims.generateFrameNumbers('lifebar',
                { start: 1, end: 8 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1,
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
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;

        scene.__title_song = scene.sound.add('title_screen_piano')
        scene.__title_song.play();
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.__title_song.stop();
        });

        scene.lights.enable().setAmbientColor(0x000000);

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'lamplight_text')
            .setPipeline('Light2D');
        let play = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 1.5*GRID_SIZE, 'play_text')
            .setPipeline('Light2D');
        let light = scene.lights.addLight(SCREEN_WIDTH/2+2, SCREEN_HEIGHT/2, SCREEN_HEIGHT)
            .setIntensity(0);
        scene.tweens.add({
            targets: light,
            y: SCREEN_HEIGHT/2,
            intensity: 2,
            delay: 500,
            duration: 4000
        });
        scene.tweens.add({
            targets: light,
            x: SCREEN_WIDTH/2 - 2,
            duration: 100,
            repeat: -1,
            yoyo: true,
        })
        addButton(play, () => {
            scene.scene.start('GameScene');
        })
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let LevelChangeScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LevelChangeScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;

        scene.__lamp_exit = scene.sound.add('lamp_exit');
        scene.__lamp_exit.play();

        let transition = ((data) => {

            let shape = this.make.graphics();

            shape.fillStyle(0xffffff);

            shape.beginPath();

            shape.moveTo(0, 0);
            shape.arc(0, 0, SCREEN_WIDTH, 0, Math.PI * 2);

            shape.fillPath();

            let bg_plate = scene.add.rectangle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
                SCREEN_WIDTH, SCREEN_HEIGHT,
                0x000000, 1)
                .setVisible(false);
            let mask = shape.createGeometryMask();
            mask.setInvertAlpha();
            bg_plate.setMask(mask);

            shape.x = data.x;
            shape.y = data.y;

            bg_plate.__outro = (onComplete) => {
                shape.x = SCREEN_WIDTH/2;
                shape.y = SCREEN_HEIGHT/2;
                bg_plate.setVisible(true);
                let timeline = scene.tweens.createTimeline();
                timeline.add({
                    targets: shape,
                    scale: 0.125,
                    duration: 500
                });
                timeline.add({
                    targets: shape,
                    scale: 0.125*1.1,
                    duration: 100
                });
                timeline.add({
                    targets: shape,
                    scale: 0,
                    delay: 250,
                    duration: 250,
                    onComplete: () => {
                        onComplete();
                    }});
                timeline.play();
            };

            bg_plate.__intro = (onComplete) => {
                scene.scene.pause('GameScene');
                bg_plate.setVisible(true);
                shape.setScale(0);
                scene.tweens.add({
                    targets: shape,
                    scale: 1,
                    duration: 500,
                    onComplete: () => {
                        shape.setScale(1);
                        bg_plate.setVisible(false);
                        scene.scene.resume('GameScene');
                        onComplete();
                    }
                });
                scene.scene.sendToBack('GameScene');
            };

            return bg_plate;
        })(data);

        scene.scene.bringToTop('LevelChangeScene');
        transition.__outro(() => {
            scene.scene.stop('GameScene');
            scene.scene.launch('GameScene',{callback:()=>{
                transition.__intro(() => {
                    scene.scene.stop('LevelChangeScene');
                })
            }})
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let GameOverScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameOverScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;

        scene.__lamp_death = scene.sound.add('lamp_death');

        scene.scene.bringToTop('GameOverScene');
        let matte = scene.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 1);
        let death = scene.add.sprite(data.x, data.y, 'shatter', 0);
        scene.time.delayedCall(1000, () => {
            scene.cameras.main.shake(50, 0.01, true);
            scene.__lamp_death.play();
            death.setFrame(1);
        })
        scene.time.delayedCall(2000, () => {
            death.play('shatter_anim');
            death.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                death.destroy();
                scene.time.delayedCall(1000, () => {
                    scene.scene.start('TitleScene');
                })
            })
        })
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
    scene: [ LoadScene, TitleScene, GameScene, GameOverScene, LevelChangeScene ]
};

game = new Phaser.Game(config);
