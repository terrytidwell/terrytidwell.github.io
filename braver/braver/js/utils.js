let getRelativePositionToCanvas = (gameObject, camera) => {
    return {
        x: (gameObject.x - camera.worldView.x) * camera.zoom,
        y: (gameObject.y - camera.worldView.y) * camera.zoom
    }
};

let add_loading_bar = (scene) => {
    scene.add.rectangle(
        SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
        SCREEN_WIDTH/2, SCREEN_HEIGHT / 72,
        0xFFFFFF, 0.5)
        .setOrigin(0, 0.5);
    let loading_bar = scene.add.rectangle(
        SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
        SCREEN_WIDTH/2, SCREEN_HEIGHT / 72,
        0xFFFFFF, 1)
        .setOrigin(0, 0.5)
        .setScale(0,1);
    scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
        loading_bar.setScale(percentage,1);
    });

    scene.load.on(Phaser.Loader.Events.COMPLETE, function() {
        scene.scene.start('ControllerScene');
    });
};

let TiledHelper = {
    get_rectangle_coordinates: (object) => {
        return {
            width: object.width,
            height: object.height,
            x: object.x + object.width / 2,
            y: object.y + object.height / 2,
        };
    },
    get_image_coordinates: (object) => {
        return {
            width: object.width,
            height: object.height,
            x: object.x + object.width / 2,
            y: object.y - object.height / 2,
        };
    },
    get_coordinates: (object) => {
        return {
            width: 0,
            height: 0,
            x: object.x,
            y: object.y,
        };
    },
    load_object_layer: (scene, tilemap_key, object_layer_key, object_loader_map) => {
        let objects = {};
        let tilemap = scene.make.tilemap({ key: tilemap_key});
        tilemap.getObjectLayer(object_layer_key).objects.forEach((object) => {
            let value = object_loader_map?.object_map?.[object.name]?.handler?.(object);
            if (value) {
                objects[object.name] = value;
            }
        });
        return objects;
    },
    get_object_loader_map : (name = null, handler = null) => {
        let value = {
            add : (name, handler) => {
                value.object_map[name] = {
                    handler: handler,
                };
                return value;
            },
            add_coordinates : (name) => {
                return value.add(name, (object) => {
                    return TiledHelper.get_coordinates(object);
                })
            },
            add_image_coordinates: (name) => {
                return value.add(name, (object) => {
                    return TiledHelper.get_image_coordinates(object);
                })
            },
            add_rectangle_coordinates: (name) => {
                return value.add(name, (object) => {
                    return TiledHelper.get_rectangle_coordinates(object);
                })
            },
            object_map: {},
            load : (scene, tilemap_key, object_layer_key) => {
                return TiledHelper.load_object_layer(scene, tilemap_key, object_layer_key, value);
            }
        };
        if (name && handler) {
            value.add(name, handler)
        }
        return value;
    }
};

let bind_event = (scene, key, event, handler) => {
    //console.log('on '+ event);
    key.on(event, handler);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, function() {
        console.log('off '+ event);
        key.off(event, handler);
    })
};

let bind_once_event = (scene, key, event, handler) => {
    console.log('once '+ event);
    key.once(event, handler);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, function() {
        console.log('off '+ event);
        key.off(event, handler);
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
    let m_delayedCalls = [];
    let m_events = [];

    //clear async calls
    let clear = function () {
        Phaser.Utils.Array.Each(m_tweens, function (tween) {
            if (!tween) return;
            if (!tween.remove) return;
            tween.destroy();
        }, self);
        Phaser.Utils.Array.Each(m_delayedCalls, function (delayedCall) {
            delayedCall.remove(false);
        }, self);
        Phaser.Utils.Array.Each(m_events, (event) => {
            event.remove(false);
        }, self);
        m_tweens = [];
        m_delayedCalls = [];
        m_events = [];
    };

    let pause = function () {
        Phaser.Utils.Array.Each(m_tweens, (tween) => tween.pause(), self);
        Phaser.Utils.Array.Each(m_delayedCalls, (delayedCall) => delayedCall.paused = true, self);
        Phaser.Utils.Array.Each(m_events, (event) => tween.pause(), self);
    };

    let resume = function () {
        Phaser.Utils.Array.Each(m_tweens, (tween) => tween.resume(), self);
        Phaser.Utils.Array.Each(m_delayedCalls, (delayedCall) => delayedCall.paused = false, self);
        Phaser.Utils.Array.Each(m_events, (event) => event.resume(), self);
    };

    let addTween = function (tween) {
        m_tweens.push(scene.tweens.add(tween));
    };

    let addTweenSequence = function (tweens, onComplete) {
        if (tweens.length === 0) {
            return;
        }
        for (let index = 1; index < tweens.length; index++) {
            tweens[index-1].onComplete = () => {
                m_tweens.push(scene.tweens.add(tweens[index]));
            }
        }
        m_tweens.push(scene.tweens.add(tweens[0]));
        tweens[tweens.length - 1].onComplete = onComplete;
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
    addButtonWithZone(object, object, handler);
};

let addButtonWithZone = (display_object, zone, handler) => {
    display_object.setAlpha(0.65);
    zone.setInteractive();
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        display_object.setAlpha(1);
    });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        display_object.setAlpha(0.65);
    });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        handler();
    });
};

let addButtonWithShadowAndZone = (display_shadow, zone, handler) => {
    display_shadow.setAlpha(0.35);
    zone.setInteractive();
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        display_shadow.setAlpha(0);
    });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        display_shadow.setAlpha(0.35);
    });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        handler();
    });
};