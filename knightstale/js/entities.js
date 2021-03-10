let asyncHandler = function(scene) {
    let self = this;
    let m_tweens = [];
    let m_timelines = [];
    let m_delayedCalls = [];

    //clear async calls
    let clear = function () {
        Phaser.Utils.Array.Each(m_tweens, function(tween) { tween.remove(); }, self);
        Phaser.Utils.Array.Each(m_timelines, function(timeline) { timeline.stop(); }, self);
        Phaser.Utils.Array.Each(m_delayedCalls, function(delayedCall) { delayedCall.remove(false); }, self);
        m_tweens = [];
        m_timelines = [];
        m_delayedCalls = [];
    };

    let addTween = function(tween) {
        m_tweens.push(scene.tweens.add(tween));
    };

    let addTweenSequence = function(tweens) {
        let timeline = scene.tweens.createTimeline();
        m_timelines.push(timeline);
        for (let tween of tweens) {
            timeline.add(tween);
        }
        timeline.play();
    };

    let addTweenParallel = function(tweens, onComplete) {
        let target_rendevous = tweens.length;
        let current_rendevous = 0;
        let check_rendevous = function() {
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

    let addDelayedCall = function(delay, callback, args, scope) {
        m_delayedCalls.push(scene.time.delayedCall(delay, callback, args, scope));
    };

    return {
        clear: clear,
        addTween: addTween,
        addTweenParallel: addTweenParallel,
        addTweenSequence: addTweenSequence,
        addDelayedCall: addDelayedCall
    };
};

let stateHandler = function(scene, states, start_state) {
    let async_handler = asyncHandler(scene);
    let current_state = start_state;

    let enter_state = function() {
        if(current_state.enter) {
            current_state.enter();
        }
    };

    let exit_state = function() {
        if(current_state.exit) {
            current_state.exit();
        }
    };

    let changeState = function(new_state) {
        //clear async calls
        async_handler.clear();

        exit_state();
        current_state = new_state;
        enter_state();
    };

    let getState = function () {
        return current_state;
    }

    //do the initial state enter
    let start = function () {
        enter_state();
    }

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

let addHealthBar = function(scene, scale, x, y, hide_on_full) {
    let m_x = x;
    let m_y = y;
    let health_bar_frame = scene.add.sprite(0, 0,
        'health_bars',2)
        .setDepth(DEPTHS.UI)
        .setScale(scale)
        .setVisible(!hide_on_full);
    let health_bar_under = scene.add.sprite(0, 0,
        'health_bars',3)
        .setDepth(DEPTHS.UI)
        .setScale(scale)
        .setTintFill(0xffffff)
        .setAlpha(0.95)
        .setVisible(!hide_on_full);
    let health_bar = scene.add.sprite(0, 0,
        'health_bars',3)
        .setDepth(DEPTHS.UI)
        .setScale(scale)
        .setVisible(!hide_on_full);


    let display_life = 1;
    let life = 1;
    let health_bar_tween = null;
    let updateLife = function(new_total) {
        if (new_total < 1) {
            health_bar_frame.setVisible(true);
            health_bar_under.setVisible(true);
            health_bar.setVisible(true);
        }
        life = new_total;
        health_bar.setX(barX(life));
        health_bar.setScale(calculate_scale(life), scale);
        if (health_bar_tween) {
            health_bar_tween.remove();
        }
        health_bar_tween = scene.tweens.add({
            targets: {d : display_life},
            props: {d: life},
            duration: 350,
            delay: 500,
            onUpdate: function() {
                display_life = health_bar_tween.getValue();
                health_bar_under.setX(barX(display_life));
                health_bar_under.setScale(calculate_scale(display_life), scale);
            },
            onComplete: function() {
                health_bar_tween = null;
            }
        });
    };

    let barX = function(metric) {
        return scene.__gridX(m_x) - 32 * scale * (1 - (metric));
    };

    let calculate_scale = function(metric) {
        return scale*metric;
    };

    let updatePosition = function(x, y) {
        m_x = x;
        m_y = y;
        health_bar.setPosition(barX(life),scene.__gridY(m_y));
        health_bar_under.setPosition(barX(display_life), scene.__gridY(m_y));
        health_bar_frame.setPosition(scene.__gridX(m_x), scene.__gridY(m_y))
    };

    let destroy = function() {
        if (health_bar_tween) {
            health_bar_tween.remove();
        }
        health_bar_frame.destroy();
        health_bar_under.destroy();
        health_bar.destroy();
    };

    updatePosition(x, y)

    return {
        updateLife: updateLife,
        updatePosition: updatePosition,
        destroy: destroy
    }
};

let addPawn = function(scene, x,y) {

    let enter_idle = function() {
        state_handler.addDelayedCall(1000, state_handler.changeState, [STATES.MOVING]);
    };

    let enter_post_attack_idle = function() {
        state_handler.addDelayedCall(1000, state_handler.changeState, [STATES.MOVING]);
    };

    let enter_pre_attack = function() {
        state_handler.addTween({
            targets: {z : 0},
            props: {z: -8},
            yoyo: true,
            repeat: 1,
            duration: 100,
            onUpdate: function() {
                m_z = this.getValue();
            },
            onComplete: function () {
                state_handler.changeState(STATES.ATTACK);
            },
        });
    };

    let exit_pre_attack = function() {
        m_z = 0;
    };

    let enter_attack = function() {
        let deltaX = Math.round(scene.__character.data.values.x)
            - Math.round(m_x);
        let deltaY = Math.round(scene.__character.data.values.y)
            - Math.round(m_y);
        if ((deltaX === -1 && deltaY === -1) ||
            (deltaX === 1 && deltaY === 1) ||
            (deltaX === 1 && deltaY === -1) ||
            (deltaX === -1 && deltaY === 1)) {
            if (scene.__isGridPassable(m_x + deltaX, m_y + deltaY) &&
                scene.__isGridMobFree(m_x + deltaX, m_y + deltaY)) {
                m_dx = deltaX;
                m_dy = deltaY;
                m_targetx = m_x + m_dx;
                m_targety = m_y + m_dy;
                state_handler.addTweenParallel(
                    [{
                        targets: { x: m_x},
                        props: { x: m_targetx },
                        duration: 100,
                        onUpdate: function() {
                            m_x = this.getValue();
                        },
                    },{
                        targets: { y: m_y},
                        props: { y: m_targety },
                        duration: 100,
                        onUpdate: function() {
                            m_y = this.getValue();
                        },
                    }],
                    function() { state_handler.changeState(STATES.POST_ATTACK_IDLE); }
                );
                return;
            }
        }
        //so we didn't do it, return to idle
        state_handler.changeState(STATES.IDLE);
    };

    let exit_attack = function () {
        m_dx = 0;
        m_dy = 0;
        m_targetx = m_x;
        m_targety = m_y;
    };

    let enter_stunned = function() {
        m_z = 0;
        m_y = Math.round(m_y);
        m_x = Math.round(m_x);
        pawn.alpha = 0.75;
        health_bar.updateLife(life/full_life);
        let directions = [
            {d:DIRECTIONS.UP, m:0},
            {d:DIRECTIONS.LEFT, m:0},
            {d:DIRECTIONS.RIGHT, m:0},
            {d:DIRECTIONS.DOWN, m:0}
        ];
        for(let direction of directions) {
            direction.m = direction.d.dx * m_impact_x +
                direction.d.dy * m_impact_y;
        }
        directions.sort(function(a,b) {
            if(a.m > b.m) {
                return -1;
            }
            if (a.m < b.m) {
                return 1;
            }
            return 0;
        });
        for(let direction of directions) {
            if (scene.__isGridPassable(m_x+direction.d.dx, m_y+direction.d.dy) &&
                scene.__isGridMobFree(m_x+direction.d.dx, m_y+direction.d.dy) &&
                !scene.__checkPlayerCollision(m_x+direction.dx, m_y+direction.dy)) {
                m_dx = direction.d.dx;
                m_dy = direction.d.dy;
                m_x += m_dx;
                m_y += m_dy;
                break;
            }
        }
        state_handler.addTween({
            targets: pawn_overlay,
            alpha: 1,
            yoyo: true,
            repeat: 1,
            duration: 50
        });
        state_handler.addTween({
            targets: pawn,
            alpha: 0.25,
            yoyo: true,
            duration: 50,
            repeat: -1,
        });
        state_handler.addDelayedCall(2000, state_handler.changeState, [STATES.MOVING]);
    };

    let exit_stunned = function() {
        pawn_overlay.alpha = 0;
        pawn.alpha = 1;
        m_dx = 0;
        m_dy = 0;
    };

    let enter_dead = function() {
        pawn.destroy();
        shadow.destroy();
        bounding_box.destroy();
        move_box.destroy();
        health_bar.destroy();
    };

    let swap_direction = function(directions, a, b) {
        let temp = directions[a];
        directions[a] =
            directions[b];
        directions[b] = temp;
    };

    let general_move_ai = function(deltaX, deltaY, directions) {
        if (Phaser.Math.Between(0, 99) < 80) {
            m_prefer_horizontal = !m_prefer_horizontal;
        }
        let primary_vertical_index = 0;
        let primary_horizontal_index = 1;
        let secondary_vertical_index = 2;
        let secondary_horizontal_index = 3;
        directions = [
            DIRECTIONS.UP,
            DIRECTIONS.LEFT,
            DIRECTIONS.DOWN,
            DIRECTIONS.RIGHT];
        if (m_prefer_horizontal) {
            primary_horizontal_index = 0;
            primary_vertical_index = 1;
            secondary_horizontal_index = 2;
            secondary_vertical_index = 3;
            directions = [
                DIRECTIONS.LEFT,
                DIRECTIONS.UP,
                DIRECTIONS.RIGHT,
                DIRECTIONS.DOWN];
        }
        if (deltaX > 0 || (deltaX === 0 && Phaser.Math.Between(0, 99) < 50)) {
            //swap horizontals
            swap_direction(directions, primary_horizontal_index,
                secondary_horizontal_index);
        }
        if (deltaY > 0 || (deltaY === 0 && Phaser.Math.Between(0, 99) < 50)) {
            //swap vertical
            swap_direction(directions, primary_vertical_index,
                secondary_vertical_index);
        }
        return directions;
    };

    let enter_move = function() {
        let directions = [
            DIRECTIONS.UP,
            DIRECTIONS.LEFT,
            DIRECTIONS.DOWN,
            DIRECTIONS.RIGHT];
        let deltaX = Math.round(scene.__character.data.values.x)
            - Math.round(m_x);
        let deltaY = Math.round(scene.__character.data.values.y)
            - Math.round(m_y);
        if (deltaX === 0 && deltaY === 0) {
            //on top movement AI
            Phaser.Utils.Array.Shuffle(directions);
        } else if (Math.abs(deltaX)+Math.abs(deltaY) === 1) {
            //adjacent movement AI
            //[x]   [x]
            //   [p]
            //[x]   [x]
            //target those squares around player
            if(deltaY === 0) {
                directions = [
                    DIRECTIONS.UP,
                    DIRECTIONS.DOWN,
                    DIRECTIONS.LEFT,
                    DIRECTIONS.RIGHT
                ];
            } else if(deltaX === 0) {
                directions = [
                    DIRECTIONS.LEFT,
                    DIRECTIONS.RIGHT,
                    DIRECTIONS.UP,
                    DIRECTIONS.DOWN
                ];
            }
            //now randomize
            if (Phaser.Math.Between(0,99) < 50) {
                swap_direction(directions, 0, 1);
            }
            if (Phaser.Math.Between(0,99) < 50) {
                swap_direction(directions, 2, 3);
            }
        } else {
            directions = general_move_ai(deltaX,  deltaY, directions);
        }

        m_dx = 0;
        m_dy = 0;
        for (let direction of directions) {
            if (scene.__isGridPassable(m_x+direction.dx, m_y+direction.dy) &&
                scene.__isGridMobFree(m_x+direction.dx, m_y+direction.dy) &&
                !scene.__checkPlayerCollision(m_x+direction.dx, m_y+direction.dy)) {
                m_dx = direction.dx;
                m_dy = direction.dy;
                m_targetx = m_x+m_dx;
                m_targety = m_y+m_dy;
                state_handler.addTweenParallel(
                    [{
                        targets: { x: m_x},
                        props: { x: m_targetx },
                        duration: 200,
                        onUpdate: function() {
                            m_x = this.getValue();
                        },
                    },{
                        targets: { y: m_y},
                        props: { y: m_targety },
                        duration: 200,
                        onUpdate: function() {
                            m_y = this.getValue();
                        },
                    }],
                    function() { state_handler.changeState(STATES.IDLE); }
                );
                return; //<------ RETURN to end function
            }
        }
        //no direction worked?
        state_handler.changeState(STATES.IDLE);
    };

    let exit_move = function() {
        m_dx = 0;
        m_dy = 0;
        m_targetx = m_x;
        m_targety = m_y;
    };

    //----------------------------------------------------------------------
    //SETUP STATES AND OBJECTS
    //----------------------------------------------------------------------

    let STATES = {
        MOVING: {enter: enter_move, exit: exit_move},
        IDLE: {enter: enter_idle, exit: null},
        PRE_ATTACK: {enter: enter_pre_attack, exit: exit_pre_attack},
        ATTACK: {enter: enter_attack, exit: exit_attack},
        POST_ATTACK_IDLE: {enter: enter_post_attack_idle, exit: null},
        STUNNED: {enter: enter_stunned, exit: exit_stunned},
        DEAD: {enter: enter_dead, exit: null}
    };
    let state_handler = stateHandler(scene, STATES, STATES.IDLE);

    let m_x = x;
    let m_y = y;
    let m_z = 0;
    let m_dx = 0;
    let m_dy = 0;
    let m_targetx = 0;
    let m_targety = 0;
    let full_life = 2;
    let life = full_life;
    let m_impact_x = 0;
    let m_impact_y = 0;
    let m_prefer_horizontal = Phaser.Math.Between(0,99) < 50;

    let pawn = scene.add.sprite(scene.__gridX(0), scene.__characterY(0), 'white_pieces', 12);
    let pawn_overlay = scene.add.sprite(scene.__gridX(0), scene.__characterY(0), 'white_pieces', 12)
        .setTintFill(0xffffff)
        .setAlpha(0);
    let bounding_box = scene.add.rectangle(0,0,GRID_SIZE/2,GRID_SIZE/2,0x00ff00, 0.0);
    let move_box = scene.add.rectangle(0,0,GRID_SIZE/2,GRID_SIZE/2,0x00ff00, 0.0).setDepth(DEPTHS.SURFACE);
    scene.__hittables.add(bounding_box);
    scene.__mobs.add(bounding_box);
    scene.__mobs.add(move_box);
    scene.__dangerous_touchables.add(bounding_box);
    scene.__updateables.add(pawn);
    bounding_box.setData('onHit',function(dx, dy) {
        if (state_handler.getState() !== STATES.STUNNED) {
            m_impact_x = dx;
            m_impact_y = dy;
            if (--life <= 0) {
                state_handler.changeState(STATES.DEAD);
                return;
            }
            state_handler.changeState(STATES.STUNNED);
        }
    });
    bounding_box.setData('registerDangerousTouch',function() {
        return {dx: m_dx, dy: m_dy};
    });
    bounding_box.setData('isDangerous',function() {
        return state_handler.getState() !== STATES.STUNNED;
    });

    let shadow = scene.add.ellipse(0, 0,
        GRID_SIZE*.70,GRID_SIZE*.57,0x000000, 0.5);

    let health_bar = addHealthBar(scene, 1, 0, 0, true);

    pawn.setData('update', function() {
        let deltaX = Math.round(scene.__character.data.values.x)
            - Math.round(m_x);
        let deltaY = Math.round(scene.__character.data.values.y)
            - Math.round(m_y);
        if (state_handler.getState() === STATES.IDLE &&
            scene.__character.data.values.isVulnerable()) {
            if ((deltaX === -1 && deltaY === -1) ||
                (deltaX === 1 && deltaY === 1) ||
                (deltaX === 1 && deltaY === -1) ||
                (deltaX === -1 && deltaY === 1)) {
                state_handler.changeState(STATES.PRE_ATTACK);
            }
        }
        pawn.setPosition(scene.__gridX(m_x),scene.__characterY(m_y) + m_z);
        pawn_overlay.setPosition(scene.__gridX(m_x),scene.__characterY(m_y) + m_z);
        shadow.setPosition(scene.__gridX(m_x),scene.__gridY(m_y));
        shadow.setVisible(m_z < 0);
        pawn.setDepth(DEPTHS.ENTITIES + m_y);
        pawn_overlay.setDepth(DEPTHS.ENTITIES + m_y);
        scene.__setPhysicsBodyPosition(move_box, Math.round(m_targetx), Math.round(m_targety));
        scene.__setPhysicsBodyPosition(bounding_box, Math.round(m_x), Math.round(m_y));
        health_bar.updatePosition(m_x, m_y - 1);
    });

    state_handler.start();
    pawn.data.values.update();
    return pawn;
};

let addBishop = function(scene, x, y) {
    let m_x = x;
    let m_y = y;
    let m_z = 0;
    let m_dx = 0;
    let m_dy = 0;
    let m_impact_x = 0;
    let m_impact_y = 0;
    let full_life = 5;
    let life = full_life;

    let enter_stunned = function() {
        m_z = 0;
        m_y = Math.round(m_y);
        m_x = Math.round(m_x);
        sprite.alpha = 0.75;
        health_bar.updateLife(life/full_life);
        let directions = [
            {d:DIRECTIONS.UP_LEFT, m:0},
            {d:DIRECTIONS.UP_RIGHT, m:0},
            {d:DIRECTIONS.DOWN_LEFT, m:0},
            {d:DIRECTIONS.DOWN_RIGHT, m:0}
        ];
        for(let direction of directions) {
            direction.m = direction.d.dx * m_impact_x +
                direction.d.dy * m_impact_y;
        }
        directions.sort(function(a,b) {
            if(a.m > b.m) {
                return -1;
            }
            if (a.m < b.m) {
                return 1;
            }
            return 0;
        });
        for(let direction of directions) {
            if (scene.__isGridPassable(m_x+direction.d.dx, m_y+direction.d.dy) &&
                scene.__isGridMobFree(m_x+direction.d.dx, m_y+direction.d.dy) &&
                !scene.__checkPlayerCollision(m_x+direction.dx, m_y+direction.dy)) {
                m_dx = direction.d.dx;
                m_dy = direction.d.dy;
                m_x += m_dx;
                m_y += m_dy;
                break;
            }
        }
        state_handler.addTween({
            targets: sprite_overlay,
            alpha: 1,
            yoyo: true,
            repeat: 1,
            duration: 50
        });
        state_handler.addTween({
            targets: sprite,
            alpha: 0.25,
            yoyo: true,
            duration: 50,
            repeat: -1,
        });
        state_handler.addDelayedCall(2000, state_handler.changeState, [STATES.IDLE]);
    };

    exit_stunned = function() {
        sprite_overlay.alpha = 0;
        sprite.alpha = 1;
        m_dx = 0;
        m_dy = 0;
    };

    let enter_dead = function() {
        sprite.destroy();
        sprite_overlay.destroy();
        bounding_box.destroy();
        move_box.destroy();
        health_bar.destroy();
    };

    let STATES = {
        IDLE: {enter: null, exit: null},
        STUNNED: {enter: enter_stunned, exit: exit_stunned},
        DEAD: {enter: enter_dead, exit: null}
    };
    let state_handler = stateHandler(scene, STATES, STATES.IDLE);

    let sprite = scene.add.sprite(scene.__gridX(0), scene.__characterY(0), 'white_pieces', 2);
    let sprite_overlay = scene.add.sprite(scene.__gridX(0), scene.__characterY(0), 'white_pieces', 2)
        .setAlpha(0)
        .setTintFill(0xffffff);
    let bounding_box = scene.add.rectangle(0,0,GRID_SIZE/2,GRID_SIZE/2,0x00ff00, 0.0);
    let move_box = scene.add.rectangle(0,0,GRID_SIZE/2,GRID_SIZE/2,0x00ff00, 0.0).setDepth(DEPTHS.SURFACE);
    let health_bar = addHealthBar(scene, 1, 0, 0, true);
    bounding_box.setData('onHit',function(dx, dy) {
        if (state_handler.getState() !== STATES.STUNNED) {
            m_impact_x = dx;
            m_impact_y = dy;
            if (--life <= 0) {
                state_handler.changeState(STATES.DEAD);
                return;
            }
            state_handler.changeState(STATES.STUNNED);
        }
    });
    bounding_box.setData('registerDangerousTouch',function() {
        return {dx: m_dx, dy: m_dy};
    });
    bounding_box.setData('isDangerous',function() {
        return true;
    });
    scene.__hittables.add(bounding_box);
    scene.__mobs.add(bounding_box);
    scene.__mobs.add(move_box);
    scene.__dangerous_touchables.add(bounding_box);
    scene.__updateables.add(bounding_box);
    bounding_box.setData('update', function() {
        sprite.setPosition(scene.__gridX(m_x),scene.__characterY(m_y) + m_z);
        sprite.setDepth(DEPTHS.ENTITIES + m_y);
        sprite_overlay.setPosition(scene.__gridX(m_x),scene.__characterY(m_y) + m_z);
        sprite_overlay.setDepth(DEPTHS.ENTITIES + m_y);
        scene.__setPhysicsBodyPosition(move_box, Math.round(m_x + m_dx), Math.round(m_y + m_dy));
        scene.__setPhysicsBodyPosition(bounding_box, Math.round(m_x), Math.round(m_y));
        health_bar.updatePosition(m_x, m_y - 1);
    });
    return bounding_box;
}

let addPlayer = function(scene, x,y) {
    let character = scene.add.rectangle(0,0,GRID_SIZE/2,GRID_SIZE/2,0x00ff00,0.0);
    let full_life = 10;
    let life = full_life;
    let health_bar = addHealthBar(scene, 3, 2, 0, false);
    character.setData('x',x);
    character.setData('dx',0);
    character.setData('y',y);
    character.setData('dy',0);
    character.setData('z',-1000);

    character.setData('update', function() {
        let x = character.data.values.x;
        let y = character.data.values.y;
        let z = character.data.values.z;
        sprite.setPosition(scene.__gridX(x), scene.__characterY(y)+z);
        sprite.setDepth(DEPTHS.ENTITIES + y);
        sprite_overlay.setPosition(scene.__gridX(x), scene.__characterY(y)+z);
        sprite_overlay.setDepth(DEPTHS.ENTITIES + y);
        shadow.setPosition(scene.__gridX(x),scene.__gridY(y));
        shadow.setVisible(z < 0);
        scene.__setPhysicsBodyPosition(character, Math.round(x), Math.round(y));
        for (let i = 0; i < frames.length; i++) {
            let frame = frames[i];
            let frame_x = x + frame.data.values.dx;
            let frame_y = y + frame.data.values.dy;
            frame.setPosition(scene.__gridX(frame_x),
                scene.__gridY(frame_y));
            frame.setVisible(playerMoveAllowed &&
                scene.__isGridPassable(frame_x,frame_y));
        }
    });

    let impact = function() {
        impact_sprite.setPosition(
            scene.__gridX(Math.round(character.data.values.x)),
            scene.__gridY(Math.round(character.data.values.y)));
        impact_sprite.play('impact_anim');
    };

    let movePlayer = function(x, y) {
        character.setData('dx', x - character.data.values.x);
        character.setData('dy', y - character.data.values.y);
        if (character.data.values.dx === 2) {
            setOrientation(orientation.RIGHT);
        }
        if (character.data.values.dy === -2) {
            setOrientation(orientation.UP);
        }
        if (character.data.values.dy === 2) {
            setOrientation(orientation.DOWN);
        }
        if (character.data.values.dx === -2) {
            setOrientation(orientation.LEFT);
        }

        playerMoveAllowed = false;
        let z_height = -64;
        let tweenX = scene.tweens.add({
            targets: { x: character.data.values.x},
            props: { x: x },
            duration: 100,
            onUpdate: function() {
                character.setData('x',tweenX.getValue());
            }
        });
        let tweenY = scene.tweens.add({
            targets: { y: character.data.values.y},
            props: { y: y },
            duration: 100,
            onUpdate: function() {
                character.setData('y',tweenY.getValue());
            }
        });
        let timeline = scene.tweens.createTimeline();
        timeline.add({
            targets: { z: character.data.values.z},
            props: { z: z_height },
            duration: 100,
            onUpdate: function() {
                character.setData('z',this.getValue());
            },
            onComplete: function() {
                playerDangerous = true;
            }
        });
        timeline.add({
            targets: { z: z_height},
            props: { z: 0 },
            duration: 50,
            onUpdate: function() {
                character.setData('z',this.getValue());
            },
            onComplete: function()
            {
                impact();
                playerMoveAllowed = true;
                playerDangerous = false;
            }
        });
        timeline.play();
    };

    let orientation = {
        RIGHT: 0,
        UP: 1,
        DOWN: 2,
        LEFT: 3
    };
    let setOrientation = function(orientation) {
        sprite.setTexture('black_pieces', 4 + orientation);
        sprite_overlay.setTexture('black_pieces', 4 + orientation);
    }

    let tryMovePlayer = function(x, y) {
        if (!playerMoveAllowed) {
            return;
        }
        if (x !== character.data.values.x &&
            y !== character.data.values.y &&
            3 === Phaser.Math.Distance.Snake(x, y,
                character.data.values.x, character.data.values.y) ) {
            movePlayer(x, y);
        }
    };

    let playerMoveAllowed = false;
    let playerDangerous = false;
    let playerGracePeriod = false;
    let tweenZ = scene.tweens.add({
        targets: { z: character.data.values.z},
        props: { z: 0 },
        duration: 1000,
        onUpdate: function() {
            character.setData('z', tweenZ.getValue());
        },
        onComplete: function() {
            impact();
            playerMoveAllowed = true;
        }
    });

    character.setData('isHitting', function() {
        return playerDangerous;
    });

    character.setData('isVulnerable', function() {
        return !playerGracePeriod && playerMoveAllowed ;
    });

    character.setData('onHit', function(impact_x, impact_y) {
        life = Math.max(--life, 0);
        health_bar.updateLife(life/full_life);
        character.setData('z', 0);
        character.setData('y', Math.round(character.data.values.y));
        character.setData('x', Math.round(character.data.values.x));
        let directions = [
            {d:DIRECTIONS.UP, m:0},
            {d:DIRECTIONS.UP_LEFT, m:0},

            {d:DIRECTIONS.LEFT, m:0},
            {d:DIRECTIONS.DOWN_LEFT, m:0},

            {d:DIRECTIONS.DOWN, m:0},
            {d:DIRECTIONS.DOWN_RIGHT, m:0},

            {d:DIRECTIONS.RIGHT, m:0},
            {d:DIRECTIONS.UP_RIGHT, m:0},

        ];
        Phaser.Utils.Array.Shuffle(directions);
        for(let direction of directions) {
            direction.m = direction.d.dx * impact_x +
                direction.d.dy * impact_y;
        }
        directions.sort(function(a,b) {
            if(a.m > b.m) {
                return -1;
            }
            if (a.m < b.m) {
                return 1;
            }
            return 0;
        });
        for(let direction of directions) {
            if (scene.__isGridPassable(character.data.values.x+direction.d.dx,
                character.data.values.y+direction.d.dy) &&
                scene.__isGridMobFree(character.data.values.x+direction.d.dx,
                    character.data.values.y+direction.d.dy)) {
                character.setData('x', character.data.values.x += direction.d.dx);
                character.setData('y', character.data.values.y += direction.d.dy);
                character.setData('dx', direction.d.dx);
                character.setData('dy', direction.d.dy);
                break;
            }
        }
        scene.cameras.main.shake(50, 0.005, true);
        sprite.setAlpha(0.75);
        playerGracePeriod = true;
        scene.tweens.add({
            targets: sprite_overlay,
            alpha: 1,
            yoyo: true,
            repeat: 1,
            duration: 50
        });
        scene.tweens.add({
            targets: sprite,
            alpha: 0.25,
            yoyo: true,
            duration: 50,
            repeat: 1500/50,
            onComplete: function() {
                sprite.alpha = 1;
                scene.time.delayedCall(500, function() {
                    playerGracePeriod = false;
                });
            }
        });
    });

    let moves = [
        {dx: -2, dy: -1},
        {dx: -2, dy: 1},
        {dx: 2, dy: -1},
        {dx: 2, dy: 1},
        {dx: -1, dy: -2},
        {dx: 1, dy: -2},
        {dx: -1, dy: 2},
        {dx: 1, dy: 2}
    ];
    let frames = [];
    for (let i = 0; i < moves.length; i++) {
        let frame = scene.add.sprite(0,0,'frame').setScale(2);
        frames.push(frame);
        frame.setData('dx', moves[i].dx);
        frame.setData('dy', moves[i].dy);
        frame.setInteractive();
        frame.setDepth(DEPTHS.SURFACE);
        frame.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
            function () {
                tryMovePlayer(character.data.values.x + frame.data.values.dx,
                    character.data.values.y + frame.data.values.dy);
            }
        );
    }
    let sprite = scene.add.sprite(0, 0, 'black_pieces', 4);
    let sprite_overlay = scene.add.sprite(0, 0, 'black_pieces', 4).setTintFill(0xffffff).setAlpha(0);
    scene.physics.add.existing(character);
    let impact_sprite = scene.add.sprite(0,0, 'impact', 5).setVisible(true).setScale(2);
    let shadow = scene.add.ellipse(0, 0,
        GRID_SIZE*.70,GRID_SIZE*.57,0x000000, 0.5);
    shadow.setDepth(DEPTHS.SURFACE);

    character.data.values.update();
    return character;
};