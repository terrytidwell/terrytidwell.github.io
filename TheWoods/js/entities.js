let getRelativePositionToCanvas = (gameObject, camera) => {
    return {
        x: (gameObject.x - camera.worldView.x) * camera.zoom,
        y: (gameObject.y - camera.worldView.y) * camera.zoom
    }
};

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

let stateHandler = function (scene, states, start_state) {
    let async_handler = asyncHandler(scene);
    let current_state = start_state;

    let enter_state = function () {
        if (current_state.enter) {
            current_state.enter();
        }
    };

    let exit_state = function () {
        if (current_state.exit) {
            current_state.exit();
        }
    };

    let changeState = function (new_state) {
        //no-op on self transition
        if (current_state === new_state) {
            return;
        }

        //clear async calls
        async_handler.clear();

        exit_state();
        current_state = new_state;
        enter_state();
    };

    let getState = function () {
        return current_state;
    };

    //do the initial state enter
    let start = function () {
        enter_state();
    };

    return {
        changeState: changeState,
        getState: getState,
        start: start,
        addTween: async_handler.addTween,
        addTweenParallel: async_handler.addTweenParallel,
        addTweenSequence: async_handler.addTweenSequence,
        addDelayedCall: async_handler.addDelayedCall
    };
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

let addDog = (scene, x, y) => {
    let dog_sprite =  scene.add.sprite(0, -24 * LEGACY_SCALE, 'dog')
        .setScale(2*LEGACY_SCALE);
/*
    addButton(
        scene.add.text(
            GRID_SIZE/2, 0,
            "HEEL", { font: GRID_SIZE/2 + FONT, fill: '#000' })
            .setOrigin(0, 0),
        () => state_handler.changeState(STATES.HEEL_MOVE)
    );
    addButton(
        scene.add.text(
            GRID_SIZE/2, GRID_SIZE,
            "CHASE", { font: GRID_SIZE/2 + FONT, fill: '#000' })
            .setOrigin(0, 0),
        () => state_handler.changeState(STATES.CHASE)
    );
    addButton(
        scene.add.text(
            GRID_SIZE/2, 2*GRID_SIZE,
            "IDLE", { font: GRID_SIZE/2 + FONT, fill: '#000' })
            .setOrigin(0, 0),
        () => state_handler.changeState(STATES.IDLE)
    );
    addButton(
        scene.add.text(
            GRID_SIZE/2, 3*GRID_SIZE,
            "SIT", { font: GRID_SIZE/2 + FONT, fill: '#000' })
            .setOrigin(0, 0),
        () => state_handler.changeState(STATES.SIT)
    );
    addButton(
        scene.add.text(
            GRID_SIZE/2, 4*GRID_SIZE,
            "RUN_OFF", { font: GRID_SIZE/2 + FONT, fill: '#000' })
            .setOrigin(0, 0),
        () => state_handler.changeState(STATES.RUN_OFF)
    );
 */

    let solid_box = scene.add.container(x, y, [dog_sprite]);
    solid_box.setSize(16*LEGACY_SCALE,16*LEGACY_SCALE)
        .setDepth(DEPTHS.ENTITY);
    scene.physics.world.enable(solid_box);

    let enter_chase = () => {
        decide_chase_direction(0);
        dog_sprite.play('dog_move_anim');
    };

    let exit_chase = () => {
        dog_sprite.anims.stop();
        dog_sprite.setTexture('dog', 5);;
        solid_box.body.setVelocity(0,0);
    };

    let decide_heel_action = () => {
        let target = scene.__playerCharacter.__get_heel_position();
        let distance = target - solid_box.x;
        if (Math.abs(distance) > GRID_SIZE/16) {
            character_direction.x = Math.sign(distance);
        } else {
            character_direction.x = Math.sign(scene.__playerCharacter.body.velocity.x);
        }
        character_direction.setLength(PLAYER_SPEED*LEGACY_SCALE*.95);

        solid_box.body.setVelocity(character_direction.x,
            character_direction.y);
        if (Math.abs(character_direction.x) > 0) {
            dog_sprite.setFlipX(character_direction.x < 0);
            state_handler.changeState(STATES.HEEL_MOVE);
        } else {
            dog_sprite.setFlipX(scene.__playerCharacter.x - solid_box.x < 0);
            state_handler.changeState(STATES.HEEL_IDLE);
        }
    };

    let enter_heel_move = () => {
        dog_sprite.play('dog_move_anim');

    };

    let enter_heel_idle = () => {
        dog_sprite.play('dog_idle_anim');

    };

    let enter_idle = () => {
        dog_sprite.setTexture('dog', 5);
        dog_sprite.play('dog_idle_anim');
    };

    let exit_idle = () => {
        dog_sprite.anims.stop();
        dog_sprite.setTexture('dog', 5);;
    };

    let enter_sit = () => {
        dog_sprite.setTexture('dog2', 0);
        dog_sprite.play('dog_spin_anim');
        dog_sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            dog_sprite.anims.stop();
            dog_sprite.play('dog_sit_anim');
            state_handler.addDelayedCall(5000, () => {
                state_handler.changeState(STATES.IDLE);
            });
        });
    };

    let exit_sit = () => {
        dog_sprite.anims.stop();
        dog_sprite.setTexture('dog', 5);
    };

    let enter_runoff = () => {
        dog_sprite.setFlipX(false);
        dog_sprite.play('dog_move_anim');
        character_direction.x = 1;
        character_direction.setLength(PLAYER_SPEED*LEGACY_SCALE*2);
        solid_box.body.setVelocity(character_direction.x,
            character_direction.y);
        scene.__playerCharacter.__surprise();
    };

    let STATES = {
        CHASE: {enter: enter_chase, exit: exit_chase},
        HEEL_MOVE: {enter: enter_heel_move, exit: exit_chase},
        HEEL_IDLE: {enter: enter_heel_idle, exit: exit_chase},
        IDLE: {enter: enter_idle, exit: exit_idle},
        SIT: {enter: enter_sit, exit: exit_sit},
        RUN_OFF: {enter: enter_runoff, exit: null},
    };
    let state_handler = stateHandler(scene, STATES, STATES.HEEL_MOVE);

    let character_direction = new Phaser.Math.Vector2(0,0);
    let decide_chase_direction = (threshold) => {
        let distance = scene.__playerCharacter.x - solid_box.x;
        if (Math.abs(distance) >= threshold) {
            character_direction.x = Math.sign(distance);
        }
        character_direction.setLength(PLAYER_SPEED*LEGACY_SCALE);
        dog_sprite.setFlipX(character_direction.x < 0);
        solid_box.body.setVelocity(character_direction.x,
            character_direction.y);
    };
    solid_box.update = () => {
        if (state_handler.getState() === STATES.CHASE) {
            decide_chase_direction(GRID_SIZE * 2 * LEGACY_SCALE);
        }
        if (state_handler.getState() === STATES.HEEL_MOVE ||
            state_handler.getState() === STATES.HEEL_IDLE) {
            decide_heel_action();
        }
    };

    state_handler.start();

    scene.__updateables.add(solid_box);

    return solid_box;
};

let addPlayer = (scene, x, y) => {
    let object_running_offset = [-11, -12, -11, -9, -11, -12, -11, -9];
    let object_idle_offset = -10;
    let character_sprite = scene.add.sprite(0, -12 * SPRITE_SCALE, 'character', 8)
        .setScale(SPRITE_SCALE);
    let object = scene.add.sprite(0, object_idle_offset*SPRITE_SCALE, 'objects', 0)
        .setScale(SPRITE_SCALE)
        .setOrigin(0.5, 1)
        .setVisible(false);
    let ui_icon = scene.add.sprite(16*SPRITE_SCALE, -17*SPRITE_SCALE, 'ui', 1)
        .setScale(SPRITE_SCALE)
        .setVisible(false)
        .setDepth(DEPTHS.UI);


    let solid_box = scene.add.container(x, y, [character_sprite, object, ui_icon]);
    solid_box.setSize(8*SPRITE_SCALE, 8*SPRITE_SCALE)
        .setDepth(DEPTHS.PLAYER);
    scene.physics.world.enable(solid_box);

    let enter_move = () => {
        character_sprite.play('character_move_anim');
        object.setY(object_running_offset[0]*SPRITE_SCALE);
        character_sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, (animation, frame, gameObject, frameKey) => {
            object.setY(object_running_offset[frame.index-1]*SPRITE_SCALE);
        });
    };

    let exit_move = () => {
        character_sprite.anims.stop();
        character_sprite.setFrame(8);
        solid_box.body.setVelocity(0, 0);
        character_sprite.off(Phaser.Animations.Events.ANIMATION_UPDATE);
    };

    let enter_idle = () => {
        //character_sprite.play('character_idle_anim');
        object.y = object_idle_offset*SPRITE_SCALE;
    };

    let exit_idle = () => {
        character_sprite.anims.stop();
        character_sprite.setFrame(0);
    };

    let enter_surprise = () => {
        character_sprite.setFrame(8);
        character_sprite.setFlipX(false);
        let text = scene.add.text(
            solid_box.x, solid_box.y - 16 *SPRITE_SCALE,
            "!", {font: GRID_SIZE/4 * SPRITE_SCALE + FONT, fill: '#FFF'})
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTHS.PLAYER);
        text.scaleY = 0;
        state_handler.addTweenSequence([
            {
                targets: [text],
                scaleY: 1,
                duration: 100,
            },
            {
                targets: [text],
                scaleY: 0,
                delay: 1000,
                duration: 100,
                onComplete: () => {
                    text.destroy();
                    state_handler.changeState(STATES.IDLE);
                }
            }
        ]);
    };

    let STATES = {
        MOVE: {enter: enter_move, exit: exit_move},
        IDLE: {enter: enter_idle, exit: null},
        SURPRISE: {enter: enter_surprise, exit: null},
    };
    let state_handler = stateHandler(scene, STATES, STATES.IDLE);


    let enter_hide_locked = () => {
        enter_hide_interact();
        ui_icon.setFrame(0);
    };

    let enter_show_locked = () => {
        enter_show_interact();
        ui_icon.setFrame(0);
        ui_state_handler.addDelayedCall(1000, () => {
            ui_state_handler.changeState(UI_STATES.HIDE_LOCKED);
        });
    };

    let enter_hide_interact = () => {
        ui_state_handler.addTweenSequence([
            {
                targets: [ui_icon],
                scale: 0,
                duration: 100,
                onComplete : () => {
                    ui_icon.setVisible(false);
                    ui_icon.setScale(SPRITE_SCALE);
                }
            }
        ]);
    };

    let enter_show_interact = () => {
        ui_icon.setFrame(1);
        ui_icon.setVisible(true);
        ui_icon.setScale(0.8*SPRITE_SCALE, 0);
        ui_state_handler.addTweenSequence([
            {
                targets: [ui_icon],
                scaleY: SPRITE_SCALE*1.2,
                duration: 100
            },
            {
                targets: [ui_icon],
                scaleX: SPRITE_SCALE*1.2,
                scaleY: 0.8*SPRITE_SCALE,
                duration: 100
            },
            {
                targets: [ui_icon],
                scaleX: SPRITE_SCALE,
                scaleY: SPRITE_SCALE,
                duration: 100
            }
        ]);
    };

    let UI_STATES = {
        HIDE_INTERACT: {enter: enter_hide_interact, exit: null},
        SHOW_INTERACT: {enter: enter_show_interact, exit: null},
        HIDE_LOCKED: {enter: enter_hide_locked, exit: null},
        SHOW_LOCKED: {enter: enter_show_locked, exit: null},
    };
    let ui_state_handler = stateHandler(scene, UI_STATES, UI_STATES.HIDE_INTERACT);
    ui_state_handler.start();

    let character_direction = new Phaser.Math.Vector2(0, 0);
    let external_force = new Phaser.Math.Vector2(0, 0);
    let player_movement_allowed = () => {
        let current_state = state_handler.getState();
        return current_state === STATES.MOVE ||
            current_state === STATES.IDLE;
    };
    let interact_possible = true;
    solid_box.__input = (input) => {
        if (current_interactable && !scene.physics.overlap(current_interactable, solid_box)) {
            ui_state_handler.changeState(UI_STATES.HIDE_INTERACT);
            current_interactable = null;
        }
        if (!player_movement_allowed()) {
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
            //character_direction.y -= 1;
        }
        if (input.down) {
            //character_direction.y += 1;
        }
        if (input.interact && interact_possible) {
            interact_possible = false;
            if (object_state_handler.getState() == OBJECT_STATES.SHOW_OBJECT) {
                object_state_handler.changeState(OBJECT_STATES.HIDE_OBJECT);
                if (current_object === 2 && current_interactable && current_interactable === scene.__hut) {
                    current_interactable.__unlock();
                    return;
                }
                let dx = PLAYER_SPEED * LEGACY_SCALE * (character_sprite.flipX ? -1 : 1);
                let spawned_object = scene.__addObject(
                    solid_box.x, solid_box.y + 2*object_idle_offset*LEGACY_SCALE,
                    dx + 0.5 * solid_box.body.velocity.x, -PLAYER_SPEED * LEGACY_SCALE, object.frame.name);
                spawned_object.y -= spawned_object.displayHeight/2
                return;
            }
            if (current_interactable && current_interactable.__interact) {
                current_interactable.__interact();
            }
        }
        if (!input.interact) {
            interact_possible = true;
        }
        //normalize
        character_direction.setLength(PLAYER_SPEED * LEGACY_SCALE);

        if (character_direction.length() > 0) {
            state_handler.changeState(STATES.MOVE);
        } else {
            state_handler.changeState(STATES.IDLE);
        }
        if (state_handler.getState() === STATES.MOVE) {
            character_sprite.setFlipX(character_direction.x < 0);
        }
        solid_box.body.setVelocity(external_force.x + character_direction.x,
            external_force.y + character_direction.y);
    };

    state_handler.start();

    solid_box.__surprise = () => {
        state_handler.changeState(STATES.SURPRISE);
    };

    solid_box.__get_heel_position = () => {
        return solid_box.x + (character_sprite.flipX ? -GRID_SIZE : GRID_SIZE);
    };

    let enter_hide_object = () => {
        object.setVisible(false);
    };
    let enter_show_object = () => {
        object.setVisible(true);
        object.setScale(1.2*SPRITE_SCALE, 0.8*SPRITE_SCALE);
        object_state_handler.addTweenSequence([
            {
                targets: [object],
                scaleX: SPRITE_SCALE*0.8,
                scaleY: SPRITE_SCALE*1.2,
                duration: 100
            },
            {
                targets: [object],
                scaleX: SPRITE_SCALE,
                scaleY: SPRITE_SCALE,
                duration: 100
            }
        ]);
    };

    let OBJECT_STATES = {
        HIDE_OBJECT: {enter: enter_hide_object, exit: null},
        SHOW_OBJECT: {enter: enter_show_object, exit: null},
    };
    let object_state_handler = stateHandler(scene, OBJECT_STATES, OBJECT_STATES.HIDE_OBJECT);
    object_state_handler.start();

    let current_object = null;
    solid_box.__pick_up = (frame) => {
        object.setFrame(frame);
        current_object = frame;
        object_state_handler.changeState(OBJECT_STATES.SHOW_OBJECT);
    };

    solid_box.__show_locked = (frame) => {
        ui_state_handler.changeState(UI_STATES.SHOW_LOCKED);
    };

    solid_box.__get_current_object = () => {
        if (object.visible) {
            return object.frame;
        }
        return null;
    };

    let current_interactable = null;
    solid_box.__register_interactable = (interactable) => {
        if (ui_state_handler.getState() === UI_STATES.SHOW_LOCKED) {
            return;
        }
        ui_state_handler.changeState(UI_STATES.SHOW_INTERACT);
        current_interactable = interactable;
    };

    solid_box.__get_current_interactable = () => {
        return current_interactable;
    };

    return solid_box;
};

let addParkObject = (scene, floor_height, x, index) => {
    scene.add.sprite(x, floor_height - 8 * SPRITE_SCALE, 'park_objects', index)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG_ENTITY);
};
let addBench = (scene, floor_height, x) => {
    addParkObject(scene, floor_height, x - 8 * SPRITE_SCALE, 8);
    addParkObject(scene,floor_height, x + 8 * SPRITE_SCALE, 9);
};

let addBackground = (scene, floor_height) => {
    scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg', 0)
        .setScrollFactor(0, 1)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG);
    scene.add.sprite(SCREEN_WIDTH/2-SCREEN_WIDTH, SCREEN_HEIGHT/2, 'bg', 1)
        .setScrollFactor(0.25, 1)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG);
    scene.add.sprite(SCREEN_WIDTH/2+SCREEN_WIDTH, SCREEN_HEIGHT/2, 'bg', 1)
        .setScrollFactor(0.25, 1)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG);
    scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg', 1)
        .setScrollFactor(0.25, 1)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG);
    scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg', 2)
        .setScrollFactor(0.5, 1)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG);
    scene.add.sprite(SCREEN_WIDTH/2+SCREEN_WIDTH, SCREEN_HEIGHT/2, 'bg', 2)
        .setScrollFactor(0.5, 1)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG);
    scene.add.sprite(SCREEN_WIDTH/2-SCREEN_WIDTH, SCREEN_HEIGHT/2, 'bg', 2)
        .setScrollFactor(0.5, 1)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.BG);
    scene.add.rectangle(SCREEN_WIDTH/2, floor_height, SCREEN_WIDTH*3, SCREEN_HEIGHT - floor_height,
        0x322523)
        .setOrigin(0.5, 0)
        .setDepth(DEPTHS.BG);
};

let addMazeInterior = (area_name, exit_left_area, exit_left_entrance, exit_right_area, exit_right_entrance) => {
    AREAS[area_name] = {};
    AREAS[area_name].setup = (scene) => {
        scene.__playerCharacter = addPlayer(scene, SCREEN_WIDTH / 2, GRID_SIZE * 12 - 4 * SPRITE_SCALE);
        scene.__dog = addDog(scene, SCREEN_WIDTH / 2 - GRID_SIZE, GRID_SIZE * 12 - 4 * SPRITE_SCALE);

        let floor_height = GRID_SIZE * 12;

        addBackground(scene, floor_height);

        scene.cameras.main.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__playerCharacter, true, 1, 1, 0, 0);

        scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH, GRID_SIZE * 13 - 9 * SPRITE_SCALE,
            SCREEN_WIDTH * 2, 29 * LEGACY_SCALE,
            0xff00ff, 0.00)
            .setDepth(DEPTHS.FG));
        scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH/2 - GRID_SIZE*7, SCREEN_HEIGHT / 2,
            32, SCREEN_HEIGHT,
            0xff00ff, 0.00)
            .setDepth(DEPTHS.FG));
        scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH/2 + GRID_SIZE*7, SCREEN_HEIGHT / 2,
            32, SCREEN_HEIGHT,
            0xff00ff, 0.00)
            .setDepth(DEPTHS.FG));

        let addTree = (x, image) => {
            let tree = scene.add.sprite(x, floor_height, image)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG_TERRAIN)
                .setOrigin(0.5, 1);
            return tree;
        };

        let addInnerMaze = (x) => {
            let add_sprite = (offset, frame, flipX, depths = DEPTHS.BG_TERRAIN) => {
                return scene.add.sprite(x + GRID_SIZE*offset, floor_height, 'maze_objects',frame)
                    .setScale(SPRITE_SCALE)
                    .setFlipX(flipX)
                    .setDepth(depths)
                    .setOrigin(0.5,1);
            };

            addTree(x - 8*GRID_SIZE, 'tree1');
            add_sprite(-7, 2, false, DEPTHS.FG);
            add_sprite(-6, 3, false);
            add_sprite(-5, 0, false);
            let entrance = add_sprite(-4, 5, false);
            scene.__interactables.add(entrance);
            entrance.__interact = () => {
                scene.scene.get('ControllerScene').__change_scene(
                    exit_left_area, exit_left_entrance);
            };

            add_sprite(-3, 4, false);
            add_sprite(-2, 3, false);
            add_sprite(-1, 3, false);
            add_sprite(0, 3, false);
            add_sprite(1, 3, false);
            add_sprite(2, 3, false);
            add_sprite(3, 0, false);
            entrance =  add_sprite(4, 5, false);
            scene.__interactables.add(entrance);
            entrance.__interact = () => {
                scene.scene.get('ControllerScene').__change_scene(
                    exit_right_area, exit_right_entrance);
            };
            add_sprite(5, 4, false);
            add_sprite(6, 3, false);
            add_sprite(7, 1, false, DEPTHS.FG);
        };
        addInnerMaze(SCREEN_WIDTH/2);

        for (let x = 0; x < SCREEN_WIDTH + 32; x += 32 * LEGACY_SCALE) {
            scene.add.image(x, GRID_SIZE * 13 - 18 * LEGACY_SCALE, 'ground')
                .setScale(LEGACY_SCALE)
                .setDepth(DEPTHS.FLOOR);
        }
    };
    AREAS[area_name].entrance = {
        'default' : (scene) => {
            scene.__playerCharacter.x = SCREEN_WIDTH / 2;
            scene.__dog.x = scene.__playerCharacter.x - GRID_SIZE;
        }
    };
}