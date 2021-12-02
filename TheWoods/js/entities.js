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
    //offsets for a 14x14 object
    let object_running_offset = [-18, -19, -18, -16, -18, -19, -18, -16];
    let object_idle_offset = -17;
    let character_sprite = scene.add.sprite(0, -12 * SPRITE_SCALE, 'character', 8)
        .setScale(SPRITE_SCALE);
    let object = scene.add.sprite(0, object_idle_offset*SPRITE_SCALE, 'objects', 0)
        .setScale(SPRITE_SCALE)
        .setVisible(false);

    let solid_box = scene.add.container(x, y, [character_sprite, object]);
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

    let character_direction = new Phaser.Math.Vector2(0, 0);
    let external_force = new Phaser.Math.Vector2(0, 0);
    let player_movement_allowed = () => {
        let current_state = state_handler.getState();
        return current_state === STATES.MOVE ||
            current_state === STATES.IDLE;
    };
    let interact_possible = true;
    solid_box.__input = (input) => {
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
            if (object.visible) {
                object.setVisible(false);
                let dx = PLAYER_SPEED * LEGACY_SCALE * (character_sprite.flipX ? -1 : 1);
                scene.__addObject(solid_box.x, solid_box.y + 2*object_idle_offset*LEGACY_SCALE,
                    dx + 0.5 * solid_box.body.velocity.x, -PLAYER_SPEED * LEGACY_SCALE, object.frame.name);
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

    solid_box.__pick_up = (frame) => {
        object.setFrame(frame);
        object.setVisible(true);
    };

    let current_interactable = null;
    solid_box.__register_interactable = (interactable) => {
        current_interactable = interactable;
    };

    return solid_box;
};