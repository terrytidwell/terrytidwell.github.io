let getRelativePositionToCanvas = (gameObject, camera) => {
    return {
        x: (gameObject.x - camera.worldView.x) * camera.zoom,
        y: (gameObject.y - camera.worldView.y) * camera.zoom
    }
};

let bind_event = (scene, key, event, handler) => {
    console.log('on '+ event);
    key.on(event, handler);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, function() {
        console.log('off '+ event);
        key.off(event);
    })
};

let repeat = (count, event) => {
    for (let i = 0; i < count; i++) {
        event();
    }
};

let asyncHandler = function (scene) {
    let self = this;
    let m_tweens = [];
    let m_timelines = [];
    let m_delayedCalls = [];
    let m_events = [];

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
        Phaser.Utils.Array.Each(m_events, (event) => {
            event.remove(false);
        }, self);
        m_tweens = [];
        m_timelines = [];
        m_delayedCalls = [];
        m_events = [];
    };

    let pause = function () {
        Phaser.Utils.Array.Each(m_tweens, (tween) => tween.pause(), self);
        Phaser.Utils.Array.Each(m_timelines, (timeline) => timeline.pause(), self);
        Phaser.Utils.Array.Each(m_delayedCalls, (delayedCall) => delayedCall.paused = true, self);
        Phaser.Utils.Array.Each(m_events, (event) => tween.pause(), self);
    };

    let resume = function () {
        Phaser.Utils.Array.Each(m_tweens, (tween) => tween.resume(), self);
        Phaser.Utils.Array.Each(m_timelines, (timeline) => timeline.resume(), self);
        Phaser.Utils.Array.Each(m_delayedCalls, (delayedCall) => delayedCall.paused = false, self);
        Phaser.Utils.Array.Each(m_events, (event) => event.resume(), self);
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

    let addEvent = (event) => {
        m_events.push(scene.time.addEvent(event));
    };

    return {
        clear: clear,
        pause: pause,
        resume: resume,
        addTween: addTween,
        addTweenParallel: addTweenParallel,
        addTweenSequence: addTweenSequence,
        addDelayedCall: addDelayedCall,
        addEvent: addEvent
    };
};

let stateHandler = function (scene, start_state) {
    let async_handler = asyncHandler(scene);
    let current_state = start_state;
    let handler = null;

    let enter_state = function () {
        if (current_state.enter) {
            current_state.enter(handler);
        }
    };

    let exit_state = function () {
        if (current_state.exit) {
            current_state.exit(handler);
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

    let update = () => {
        if(current_state.update) {
            current_state.update(handler);
        }
    }

    let getHandler = () => {
        return handler;
    }

    handler = {
        changeState: changeState,
        getState: getState,
        update: update,
        start: start,
        getHandler: getHandler,
        addTween: async_handler.addTween,
        addTweenParallel: async_handler.addTweenParallel,
        addTweenSequence: async_handler.addTweenSequence,
        addDelayedCall: async_handler.addDelayedCall,
        addEvent: async_handler.addEvent
    };

    handler.start();

    return handler;
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