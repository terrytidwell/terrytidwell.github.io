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

let addBulletSpawner = (scene, x,y) => {

    let spiral_vector = new Phaser.Math.Vector2(PLAYER_SPEED/4,0);
    let displacement_vector = new Phaser.Math.Vector2(GRID_SIZE/2,0);
    let enemy = scene.add.sprite(x, y, 'turret', 1)
        .setScale(8)
        .setDepth(DEPTHS.MG);
    let enemy_charge = scene.add.sprite(x,y, 'charge', 0)
        .setScale(8)
        .setVisible(false)
        .setDepth(DEPTHS.MG);

    let enter_dead = () => {
        let x_polarity = enemy.flipX ? -1: 1;
        let starting_offset = GRID_SIZE/16;
        let ending_offset = GRID_SIZE*3/8;
        let enemy_shadow_1 = scene.add.sprite(
            x + (x_polarity * starting_offset),
            y - starting_offset, 'turret', 2)
            .setScale(8)
            .setAlpha(1)
            .setDepth(DEPTHS.MG)
            .setFlipX(enemy.flipX);
        let enemy_shadow_2 = scene.add.sprite(
            x - (x_polarity * starting_offset),
            y + starting_offset, 'turret', 3)
            .setScale(8)
            .setAlpha(1)
            .setDepth(DEPTHS.MG)
            .setFlipX(enemy.flipX);
        state_handler.addTweenParallel([{
            targets: enemy_shadow_1,
            x: x + (x_polarity * ending_offset),
            y: y - ending_offset,
            alpha: 0,
            scale: 16
        }, {
            targets: enemy_shadow_2,
            x: x - (x_polarity * ending_offset),
            y: y + ending_offset,
            alpha: 0,
            scale: 16,
        }], () => {
            enemy_shadow_2.destroy();
            enemy_shadow_2.destroy();
        });
        enemy.destroy();

        scene.scene.get('ControllerScene').__pause_action();
    };

    let enter_pre_attack = () => {
        enemy_charge
            .setVisible(true)
            .play('charge_anim');
        enemy_charge.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            state_handler
                .changeState(STATES.ATTACK)
        });
    };

    let exit_pre_attack = () => {
        enemy_charge
            .setVisible(false);
        enemy_charge.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    };

    let enter_idle = () => {
        state_handler.addDelayedCall(500, () => {
           state_handler.changeState(STATES.PRE_ATTACK);
        });
    };

    let enter_attack = () => {
        let shot_count = 10;
        let generate_bullet_toward_player = () => {
            shot_count--;
            let delta = scene.__getOffsetToPlayer(x, y);
            spiral_vector.x = delta.dx;
            spiral_vector.y = delta.dy;
            spiral_vector.setLength(PLAYER_SPEED/4);
            spiral_vector.rotate(Phaser.Math.DegToRad(
                Phaser.Math.Between(-20,20)
            ));
            displacement_vector.setAngle(spiral_vector.angle());
            scene.__addbullet(x + displacement_vector.x, y + displacement_vector.y,
                spiral_vector.x, spiral_vector.y);
            if (shot_count === 0) {
                state_handler.changeState(STATES.IDLE);
            } else {
                state_handler.addDelayedCall(200, generate_bullet_toward_player);
            }
        }
        generate_bullet_toward_player();
    };

    let STATES = {
        IDLE: {enter: enter_idle, exit: null},
        PRE_ATTACK: {enter: enter_pre_attack, exit: exit_pre_attack},
        ATTACK: {enter: enter_attack, exit: null},
        DEAD: {enter: enter_dead, exit: null}
    };
    let state_handler = stateHandler(scene, STATES, STATES.IDLE);
    state_handler.start();


/*
    let generate_bullet_in_spiral = () => {
        spiral_vector.rotate(Phaser.Math.DegToRad(10));
        displacement_vector.rotate(Phaser.Math.DegToRad(10));
        enemy.setFlipX(displacement_vector.x < 0);
        scene.__addbullet(x + displacement_vector.x, y + displacement_vector.y,
            spiral_vector.x, spiral_vector.y);
        generate_next_bullet = scene.time.delayedCall(200, generate_bullet_in_spiral);
    };
    generate_bullet_in_spiral();
*/
    enemy.update = () => {
        enemy.setFlipX(scene.__getOffsetToPlayer(x, y).dx < 0);
    };

    scene.__attackables.add(enemy);
    scene.__updateables.add(enemy);
    enemy.__destroy = () => {
        state_handler.changeState(STATES.DEAD);
    };
};