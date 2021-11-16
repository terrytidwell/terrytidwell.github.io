const PIECE_SPRITES = {
    BISHOP_RIGHT: 0,
    BISHOP_UP: 1,
    BISHOP_DOWN: 2,
    BISHOP_LEFT: 3,
    KNIGHT_RIGHT: 4,
    KNIGHT_UP: 5,
    KNIGHT_DOWN: 6,
    KNIGHT_LEFT: 7,
    KING_HORIZONTAL: 8,
    KING_VERTICAL: 9,
    QUEEN: 10,
    ROOK: 11,
    PAWN: 12,
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

let addDeathEffect = function (scene, x, y) {
    let death_effect = scene.add.sprite(LayoutManager.__gridX(Math.round(x)),
        LayoutManager.__characterY(Math.round(y)), 'death_effect', 0)
        .setDepth(DEPTHS.ENTITIES + Math.round(y) + .25)
        .play('death_effect_anim')
        .setFlipX(Phaser.Utils.Array.GetRandom([false, true]))
        .once(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            death_effect.destroy();
        });
    return death_effect;
};

let addDialogue = function (scene, dialogue_lines) {
    scene.scene.pause();
    let ui_scene = scene.scene.get('ControllerScene');
    //ui_scene.
    let textStyle = {
        fill: "#FFFFFF",
        font: GRID_SIZE / 2 + "px Eczar-Regular",
        align: "left",
        wordWrap: {width: (GRID_COLS - 2) * GRID_SIZE, useAdvancedWrap: true}
    };
    let text_background = ui_scene.add.rectangle(LayoutManager.__gridX(GRID_COLS / 2 - 0.5), LayoutManager.__gridY(1.5),
        (GRID_COLS - 1) * GRID_SIZE, 3 * GRID_SIZE, 0x000000, 0.75)
        .setDepth(DEPTHS.DIAG);
    let text_object = ui_scene.add.text(LayoutManager.__gridX(0.5), LayoutManager.__gridY(0.125), "",
        textStyle)
        .setOrigin(0, 0)
        .setDepth(DEPTHS.DIAG);
    let text_sections = [];
    for (let dialogue_line of dialogue_lines) {
        text_object.setText(dialogue_line);
        let text_lines = text_object.getWrappedText();
        let current_section = [];
        text_sections.push(current_section);
        for (let text_line of text_lines) {
            if (current_section.length === 5) {
                current_section = [];
                text_sections.push(current_section);
            }
            current_section.push(text_line);
        }
        while (current_section.length < 5) {
            current_section.push('');
        }
    }
    text_object.setText("");
    text_background.setInteractive();
    ui_scene.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (!next_arrow.visible) {
            end_current_text_section();
            return;
        }

        current_dialogue++;
        if (current_dialogue >= text_sections.length) {
            close_dialogue();
            return;
        }
        present_dialogue(text_sections[current_dialogue]);
    });
    let current_dialogue = 0;
    let next_arrow = ui_scene.add.sprite(LayoutManager.__gridX(10.5), LayoutManager.__gridY(2.75), 'frame', 1)
        .setFlipX(true)
        .setScale(2)
        .setDepth(DEPTHS.DIAG)
        .setVisible(false);

    let close_dialogue = function () {
        text_object.setText("");
        next_arrow.setVisible(false);
        ui_scene.tweens.add({
            targets: text_background,
            scaleX: 0,
            duration: 150,
            onComplete : () => {
                text_background.destroy();
                text_object.destroy();
                next_arrow.destroy();
                scene.scene.resume()
            },
        });
        ui_scene.input.off(Phaser.Input.Events.POINTER_DOWN);
    };

    let end_current_text_section = function() {
        text_object.setText(text_sections[current_dialogue]);
        next_arrow.setVisible(true);
        if (next_letter) {
            next_letter.remove();
        }
    };

    let next_letter = null;
    let present_dialogue = function (text_lines) {
        text_object.setText("");
        next_arrow.setVisible(false);
        let actual_lines = ["", "", "", "", ""];
        let current_line = 0;
        let add_text = function () {
            while (text_lines[current_line].length === actual_lines[current_line].length) {
                current_line++;
                if (text_lines.length === current_line || current_line > 4) {
                    end_current_text_section();
                    return;
                }
            }
            if (text_lines[current_line].length > actual_lines[current_line].length) {
                actual_lines[current_line % 5] += text_lines[current_line]
                    [actual_lines[current_line % 5].length];
                next_letter = ui_scene.time.delayedCall(12, add_text);
                text_object.setText(actual_lines);
            }
        };
        next_letter = ui_scene.time.delayedCall(12, add_text);
    };
    present_dialogue(text_sections[current_dialogue]);
};

let addNpc = function (scene, x, y, spritesheet, frame) {
    let square = addGroundSquare(scene, x, y);
    let zone = scene.add.zone(LayoutManager.__gridX(x), LayoutManager.__gridY(y), GRID_SIZE, GRID_SIZE);
    let diag_box = scene.add.sprite(LayoutManager.__gridX(x+.5), LayoutManager.__gridY(y-1), 'speech_bubbles', 8)
        .setScale(2)
        .setDepth(DEPTHS.UI + y)
        .setInteractive()
        .setVisible(false);
    diag_box.play('speech_bubbles_anim');
    scene.add.sprite(LayoutManager.__gridX(x), LayoutManager.__characterY(y), spritesheet, frame)
        .setDepth(DEPTHS.ENTITIES + y);
    let current_dialogue = [];
    let add_diag = function(text) {
        current_dialogue = text;
        zone.setInteractive();
        diag_box.setVisible(true);
        return result;
    };
    let start_dialogue = function() {
        let player_status = scene.scene.get('ControllerScene').__player_status;
        if (!player_status.playerMoveAllowed) {
            return;
        }
        diag_box.setVisible(false);
        addDialogue(scene, current_dialogue);
        scene.time.delayedCall(50, () => {
            diag_box.setVisible(true);
            diag_box.play('speech_bubbles_anim');
        });
    };
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, start_dialogue);
    diag_box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, start_dialogue);
    let result = {
        add_diag: add_diag,
    };
    return result;
};

let addGroundSquare = (function () {
    let index_image = Phaser.Utils.Array.NumberArray(0, 3);

    return function (scene, x, y) {
        let offset = 4 * ((x + y) % 2);
        let tile = Phaser.Utils.Array.GetRandom(index_image) + offset;
        let square = scene.add.sprite(LayoutManager.__gridX(x), LayoutManager.__gridY(y), 'floor', tile);
        square.setDepth(DEPTHS.BOARD + y);
        return square;
    }
}());

let addTeleportAtRandomSpot = function (scene, teleporter) {
    let squares = Phaser.Utils.Array.NumberArray(0, GRID_COLS * GRID_ROWS - 1);
    Phaser.Utils.Array.Shuffle(squares);
    for (let square of squares) {
        let x = Math.floor(square / GRID_COLS);
        let y = Math.floor(square % GRID_COLS);
        if (scene.__isGridMobPassable(x, y) && scene.__isGridMobFree(x, y)) {
            teleporter(scene, x, y);
            return;
        }
    }
    return;
};

let addPawnTeleport = function (scene, x, y) {
    addLaserEffect(scene, x, y, addPawn, 'white_pieces', PIECE_SPRITES.PAWN)
};

let addBishopTeleport = function (scene, x, y) {
    addLaserEffect(scene, x, y, addBishop, 'white_pieces', PIECE_SPRITES.BISHOP_DOWN);
};

let addLaserEffect = function (scene, x, y, create, avatar_sprite, avatar_sprite_frame) {
    let self = this;
    let laser_effects = [];
    let laser_flip = Phaser.Utils.Array.GetRandom([false, true]);
    let bounding_box = scene.add.rectangle(LayoutManager.__gridX(x), LayoutManager.__gridY(y),
        GRID_SIZE / 2, GRID_SIZE / 2, 0xffff00, 0.0);
    scene.__mobs.add(bounding_box);
    scene.__mob_collision_boxes.add(bounding_box);
    LayoutManager.__setPhysicsBodyPosition(bounding_box, x, y);
    laser_effects.push(scene.add.sprite(LayoutManager.__gridX(Math.round(x)),
        LayoutManager.__gridY(Math.round(y - 1)), 'laser_column', 0)
        .setDepth(DEPTHS.ENTITIES + Math.round(y) + .25)
        .play('laser_effect_anim')
        .setAlpha(.75)
        .setScale(2)
        .setFlipX(laser_flip)
        .once(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            Phaser.Utils.Array.Each(laser_effects, function (laser_effect) {
                laser_effect.destroy();
            }, self);
            laser_tween.remove();
            avatar.destroy();
            avatar_tween.remove();
            bounding_box.destroy();
            create(scene, x, y);
        }));
    let y_offset = y - 2.5;
    while (y_offset > -2) {
        laser_effects.push(scene.add.sprite(LayoutManager.__gridX(Math.round(x)),
            LayoutManager.__gridY(Math.round(y_offset - 1)), 'laser_column_cont', 0)
            .setDepth(DEPTHS.ENTITIES + Math.round(y) + .25)
            .play('laser_effect_cont_anim')
            .setAlpha(.75)
            .setScale(2)
            .setFlipX(laser_flip));
        y_offset -= 2;
    }
    let laser_tween = scene.tweens.add({
        targets: laser_effects,
        alpha: .9,
        yoyo: true,
        duration: 300,
        repeat: -1
    });
    let avatar = scene.add.sprite(LayoutManager.__gridX(x), LayoutManager.__characterY(y), avatar_sprite, avatar_sprite_frame)
        .setAlpha(0);
    let avatar_tween = scene.tweens.add({
        targets: avatar,
        alpha: 0.25,
        yoyo: true,
        duration: 50,
        repeat: -1,
        delay: 1000,
        onStart: () => avatar.setAlpha(0.75),
    });
    return laser_effects;
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

let addHealthBar = function (scene, scale, x, y, hide_on_full) {
    let m_x = x;
    let m_y = y;
    let health_bar_frame = scene.add.sprite(0, 0,
        'health_bars', 2)
        .setDepth(DEPTHS.UI)
        .setScale(scale)
        .setVisible(!hide_on_full);
    let health_bar_under = scene.add.sprite(0, 0,
        'health_bars', 3)
        .setDepth(DEPTHS.UI)
        .setScale(scale)
        .setTintFill(0xffffff)
        .setAlpha(0.95)
        .setVisible(!hide_on_full);
    let health_bar = scene.add.sprite(0, 0,
        'health_bars', 3)
        .setDepth(DEPTHS.UI)
        .setScale(scale)
        .setVisible(!hide_on_full);


    let display_life = 1;
    let life = 1;
    let health_bar_tween = null;
    let updateLife = function (new_total) {
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
            targets: {d: display_life},
            props: {d: life},
            duration: 350,
            delay: 500,
            onUpdate: function () {
                display_life = health_bar_tween.getValue();
                health_bar_under.setX(barX(display_life));
                health_bar_under.setScale(calculate_scale(display_life), scale);
            },
            onComplete: function () {
                health_bar_tween = null;
            }
        });
    };

    let barX = function (metric) {
        return LayoutManager.__gridX(m_x) - 32 * scale * (1 - (metric));
    };

    let calculate_scale = function (metric) {
        return scale * metric;
    };

    let updatePosition = function (x, y) {
        m_x = x;
        m_y = y;
        health_bar.setPosition(barX(life), LayoutManager.__gridY(m_y));
        health_bar_under.setPosition(barX(display_life), LayoutManager.__gridY(m_y));
        health_bar_frame.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__gridY(m_y))
    };

    let destroy = function () {
        if (health_bar_tween) {
            health_bar_tween.remove();
        }
        health_bar_frame.destroy();
        health_bar_under.destroy();
        health_bar.destroy();
    };

    let hide = function () {
        health_bar_frame.setVisible(false);
        health_bar_under.setVisible(false);
        health_bar.setVisible(false);
    };

    let show = function () {
        health_bar_frame.setVisible(true);
        health_bar_under.setVisible(true);
        health_bar.setVisible(true);
    };

    updatePosition(x, y);

    return {
        updateLife: updateLife,
        updatePosition: updatePosition,
        destroy: destroy,
        hide: hide,
        show: show,
    }
};

let addPawn = function (scene, x, y) {

    let enter_idle = function () {
        state_handler.addDelayedCall(1000, state_handler.changeState, [STATES.MOVING]);
    };

    let enter_post_attack_idle = function () {
        state_handler.addDelayedCall(1000, state_handler.changeState, [STATES.MOVING]);
    };

    let enter_pre_attack = function () {
        state_handler.addTween({
            targets: {z: 0},
            props: {z: -8},
            yoyo: true,
            repeat: 1,
            duration: 100,
            onUpdate: function () {
                m_z = this.getValue();
            },
            onComplete: function () {
                state_handler.changeState(STATES.ATTACK);
            },
        });
    };

    let exit_pre_attack = function () {
        m_z = 0;
    };

    let enter_attack = function () {
        let player_status = scene.scene.get('ControllerScene').__player_status;
        let deltaX = Math.round(player_status.x)
            - Math.round(m_x);
        let deltaY = Math.round(player_status.y)
            - Math.round(m_y);
        if ((deltaX === -1 && deltaY === -1) ||
            (deltaX === 1 && deltaY === 1) ||
            (deltaX === 1 && deltaY === -1) ||
            (deltaX === -1 && deltaY === 1)) {
            if (scene.__isGridMobPassable(m_x + deltaX, m_y + deltaY) &&
                scene.__isGridMobFree(m_x + deltaX, m_y + deltaY)) {
                m_dx = deltaX;
                m_dy = deltaY;
                change_move_target(m_x + m_dx, m_y + m_dy);
                state_handler.addTweenParallel(
                    [{
                        targets: {x: m_x},
                        props: {x: m_targetx},
                        duration: 100,
                        onUpdate: function () {
                            m_x = this.getValue();
                        },
                    }, {
                        targets: {y: m_y},
                        props: {y: m_targety},
                        duration: 100,
                        onUpdate: function () {
                            m_y = this.getValue();
                        },
                    }],
                    function () {
                        state_handler.changeState(STATES.POST_ATTACK_IDLE);
                    }
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
        change_move_target(m_x, m_y);
    };

    let enter_stunned = function () {
        m_z = 0;
        m_y = Math.round(m_y);
        m_x = Math.round(m_x);
        pawn.alpha = 0.75;
        health_bar.updateLife(life / full_life);
        let directions = [
            {d: DIRECTIONS.UP, m: 0},
            {d: DIRECTIONS.LEFT, m: 0},
            {d: DIRECTIONS.RIGHT, m: 0},
            {d: DIRECTIONS.DOWN, m: 0}
        ];
        for (let direction of directions) {
            direction.m = direction.d.dx * m_impact_x +
                direction.d.dy * m_impact_y;
        }
        directions.sort(function (a, b) {
            if (a.m > b.m) {
                return -1;
            }
            if (a.m < b.m) {
                return 1;
            }
            return 0;
        });
        for (let direction of directions) {
            if (scene.__isGridMobPassable(m_x + direction.d.dx, m_y + direction.d.dy) &&
                scene.__isGridMobFree(m_x + direction.d.dx, m_y + direction.d.dy) &&
                !scene.__checkPlayerCollision(m_x + direction.dx, m_y + direction.dy)) {
                m_dx = direction.d.dx;
                m_dy = direction.d.dy;
                m_x += m_dx;
                m_y += m_dy;
                m_targetx = m_x;
                m_targety = m_y;
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

    let exit_stunned = function () {
        pawn_overlay.alpha = 0;
        pawn.alpha = 1;
        m_dx = 0;
        m_dy = 0;
    };

    let enter_dead = function () {
        addDeathEffect(scene, m_x, m_y);
        pawn.destroy();
        shadow.destroy();
        bounding_box.destroy();
        move_box.destroy();
        health_bar.destroy();
    };

    let change_move_target = function (x, y) {
        m_targetx = x;
        m_targety = y;
        LayoutManager.__setPhysicsBodyPosition(move_box, Math.round(m_targetx), Math.round(m_targety));
    };

    let swap_direction = function (directions, a, b) {
        let temp = directions[a];
        directions[a] =
            directions[b];
        directions[b] = temp;
    };

    let general_move_ai = function (deltaX, deltaY, directions) {
        if (Phaser.Utils.Array.GetRandom(
            [true, true, true, true, false])) {
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
        if (deltaX > 0 || (deltaX === 0 && Phaser.Utils.Array.GetRandom([true, false]))) {
            //swap horizontals
            swap_direction(directions, primary_horizontal_index,
                secondary_horizontal_index);
        }
        if (deltaY > 0 || (deltaY === 0 && Phaser.Utils.Array.GetRandom([true, false]))) {
            //swap vertical
            swap_direction(directions, primary_vertical_index,
                secondary_vertical_index);
        }
        return directions;
    };

    let enter_move = function () {
        let directions = [
            DIRECTIONS.UP,
            DIRECTIONS.LEFT,
            DIRECTIONS.DOWN,
            DIRECTIONS.RIGHT];
        let player_status = scene.scene.get('ControllerScene').__player_status;
        let deltaX = Math.round(player_status.x)
            - Math.round(m_x);
        let deltaY = Math.round(player_status.y)
            - Math.round(m_y);
        if (deltaX === 0 && deltaY === 0) {
            //on top movement AI
            Phaser.Utils.Array.Shuffle(directions);
        } else if (Math.abs(deltaX) + Math.abs(deltaY) === 1) {
            //adjacent movement AI
            //[x]   [x]
            //   [p]
            //[x]   [x]
            //target those squares around player
            if (deltaY === 0) {
                directions = [
                    DIRECTIONS.UP,
                    DIRECTIONS.DOWN,
                    DIRECTIONS.LEFT,
                    DIRECTIONS.RIGHT
                ];
            } else if (deltaX === 0) {
                directions = [
                    DIRECTIONS.LEFT,
                    DIRECTIONS.RIGHT,
                    DIRECTIONS.UP,
                    DIRECTIONS.DOWN
                ];
            }
            //now randomize
            if (Phaser.Utils.Array.GetRandom([true, false])) {
                swap_direction(directions, 0, 1);
            }
            if (Phaser.Utils.Array.GetRandom([true, false])) {
                swap_direction(directions, 2, 3);
            }
        } else {
            directions = general_move_ai(deltaX, deltaY, directions);
        }

        m_dx = 0;
        m_dy = 0;
        for (let direction of directions) {
            if (scene.__isGridMobPassable(m_x + direction.dx, m_y + direction.dy) &&
                scene.__isGridMobFree(m_x + direction.dx, m_y + direction.dy) &&
                !scene.__checkPlayerCollision(m_x + direction.dx, m_y + direction.dy)) {
                m_dx = direction.dx;
                m_dy = direction.dy;
                change_move_target(m_x + m_dx, m_y + m_dy);
                state_handler.addTweenParallel(
                    [{
                        targets: {x: m_x},
                        props: {x: m_targetx},
                        duration: 200,
                        onUpdate: function () {
                            m_x = this.getValue();
                        },
                    }, {
                        targets: {y: m_y},
                        props: {y: m_targety},
                        duration: 200,
                        onUpdate: function () {
                            m_y = this.getValue();
                        },
                    }],
                    function () {
                        state_handler.changeState(STATES.IDLE);
                    }
                );
                return; //<------ RETURN to end function
            }
        }
        //no direction worked?
        state_handler.changeState(STATES.IDLE);
    };

    let exit_move = function () {
        m_dx = 0;
        m_dy = 0;
        change_move_target(m_x, m_y);
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
    let m_targetx = x;
    let m_targety = y;
    let full_life = 2;
    let life = full_life;
    let m_impact_x = 0;
    let m_impact_y = 0;
    let m_prefer_horizontal = Phaser.Utils.Array.GetRandom([true, false]);

    let pawn = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__characterY(0), 'white_pieces', PIECE_SPRITES.PAWN);
    let pawn_overlay = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__characterY(0), 'white_pieces', PIECE_SPRITES.PAWN)
        .setTintFill(0xffffff)
        .setAlpha(0);
    let bounding_box = scene.add.rectangle(0, 0, GRID_SIZE / 2, GRID_SIZE / 2, 0x00ff00, 0.0);
    let move_box = scene.add.rectangle(0, 0, GRID_SIZE / 2, GRID_SIZE / 2, 0x00ff00, 0.0).setDepth(DEPTHS.SURFACE);
    scene.__hittables.add(bounding_box);
    scene.__mobs.add(bounding_box);
    scene.__mob_collision_boxes.add(bounding_box);
    scene.__mob_collision_boxes.add(move_box);
    scene.__dangerous_touchables.add(bounding_box);
    scene.__updateables.add(pawn);
    bounding_box.setData('onHit', function (dx, dy) {
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
    bounding_box.setData('registerDangerousTouch', function () {
        return {dx: m_dx, dy: m_dy};
    });
    bounding_box.setData('isDangerous', function () {
        return state_handler.getState() !== STATES.STUNNED;
    });

    let shadow = scene.add.ellipse(0, 0,
        GRID_SIZE * .70, GRID_SIZE * .57, 0x000000, 0.5);

    let health_bar = addHealthBar(scene, 1, 0, 0, true);

    pawn.update = function () {
        let player_status = scene.scene.get('ControllerScene').__player_status;
        let deltaX = Math.round(player_status.x)
            - Math.round(m_x);
        let deltaY = Math.round(player_status.y)
            - Math.round(m_y);
        if (state_handler.getState() === STATES.IDLE &&
            player_status.isVulnerable()) {
            if ((deltaX === -1 && deltaY === -1) ||
                (deltaX === 1 && deltaY === 1) ||
                (deltaX === 1 && deltaY === -1) ||
                (deltaX === -1 && deltaY === 1)) {
                state_handler.changeState(STATES.PRE_ATTACK);
            }
        }
        pawn.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__characterY(m_y) + m_z);
        pawn_overlay.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__characterY(m_y) + m_z);
        shadow.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__gridY(m_y));
        shadow.setVisible(m_z < 0);
        pawn.setDepth(DEPTHS.ENTITIES + m_y);
        pawn_overlay.setDepth(DEPTHS.ENTITIES + m_y);
        LayoutManager.__setPhysicsBodyPosition(move_box, Math.round(m_targetx), Math.round(m_targety));
        LayoutManager.__setPhysicsBodyPosition(bounding_box, Math.round(m_x), Math.round(m_y));
        health_bar.updatePosition(m_x, m_y - 1);
    };

    pawn.update();
    state_handler.start();

    return pawn;
};

let addFlameWave = function (scene, x, y) {

    let createPoint = function (x, y) {
        if (scene.__shouldTransition(x, y)) {
            return;
        }
        let z_offset = 0;
        if (!scene.__isGridPassable(x, y)) {
            z_offset = 8;
        }
        sprites.push(scene.add.sprite(LayoutManager.__gridX(x), LayoutManager.__characterY(y) + z_offset, 'fire', 0)
            .setScale(2)
            .play('fire_anim')
            .setDepth(DEPTHS.ENTITIES + y - 0.25));
        let bounding_box = scene.add.rectangle(LayoutManager.__gridX(x), LayoutManager.__gridY(y),
            GRID_SIZE / 2, GRID_SIZE / 2, 0xffff00, 0.0);
        scene.__dangerous_touchables.add(bounding_box);
        LayoutManager.__setPhysicsBodyPosition(bounding_box, x, y);
        let dx = x - center_x;
        let dy = y - center_y;
        bounding_box.setData('registerDangerousTouch', function () {
            return {dx: dx, dy: dy};
        });
        bounding_box.setData('isDangerous', function () {
            return true;
        });
        bounding_boxes.push(bounding_box);
    };

    let createPoints = function () {
        if (0 === radius) {
            createPoint(center_x, center_y);
            return;
        }
        let offset = {dx: -radius, dy: 0};
        for (let i = 0; i < radius; i++, offset.dx++, offset.dy++) {
            createPoint(center_x + offset.dx, center_y + offset.dy);
            let rotated_offset = DIRECTIONS.turnClockwise(offset);
            createPoint(center_x + rotated_offset.dx, center_y + rotated_offset.dy);
            rotated_offset = DIRECTIONS.turnClockwise(rotated_offset);
            createPoint(center_x + rotated_offset.dx, center_y + rotated_offset.dy);
            rotated_offset = DIRECTIONS.turnClockwise(rotated_offset);
            createPoint(center_x + rotated_offset.dx, center_y + rotated_offset.dy);
        }
    };

    let old_sprites = [];
    let sprites = [];
    let bounding_boxes = [];
    let radius = 0;
    let center_x = x;
    let center_y = y;

    let start_wave = function () {
        createPoints();
        scene.time.delayedCall(750, update_points);
        scene.time.delayedCall(1000, reap_old_points);
    };

    let reap_old_points = function () {
        for (let old_sprite of old_sprites) {
            old_sprite.destroy();
        }
    };

    let update_points = function () {
        old_sprites = sprites;
        for (let bounding_box of bounding_boxes) {
            bounding_box.destroy();
        }
        bounding_boxes = [];
        sprites = [];
        radius++;
        start_wave();
    };

    start_wave();
};

let addBishop = function (scene, x, y) {
    let m_x = x;
    let m_y = y;
    let m_z = 0;
    let m_targetx = 0;
    let m_targety = 0;
    let m_impact_x = 0;
    let m_impact_y = 0;
    let full_life = 5;
    let life = full_life;
    let current_direction = DIRECTIONS.NONE;
    let max_move_count = 4;
    let current_move_count = 0;
    let max_slide_count = 4;
    let current_slide_count = 0;

    let enter_stunned = function () {
        current_slide_count = 0;
        m_z = 0;
        m_y = Math.round(m_y);
        m_x = Math.round(m_x);
        sprite.alpha = 0.75;
        health_bar.updateLife(life / full_life);
        let directions = [
            {d: DIRECTIONS.UP_LEFT, m: 0},
            {d: DIRECTIONS.UP_RIGHT, m: 0},
            {d: DIRECTIONS.DOWN_LEFT, m: 0},
            {d: DIRECTIONS.DOWN_RIGHT, m: 0}
        ];
        for (let direction of directions) {
            direction.m = direction.d.dx * m_impact_x +
                direction.d.dy * m_impact_y;
        }
        directions.sort(function (a, b) {
            if (a.m > b.m) {
                return -1;
            }
            if (a.m < b.m) {
                return 1;
            }
            return 0;
        });
        for (let direction of directions) {
            if (scene.__isGridMobPassable(m_x + direction.d.dx, m_y + direction.d.dy) &&
                scene.__isGridMobFree(m_x + direction.d.dx, m_y + direction.d.dy) &&
                !scene.__checkPlayerCollision(m_x + direction.dx, m_y + direction.dy)) {
                m_x += direction.d.dx;
                m_y += direction.d.dy;
                m_targetx = m_x;
                m_targety = m_y;
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
        state_handler.addDelayedCall(2000, state_handler.changeState, [STATES.START_SLIDE]);
    };

    let exit_stunned = function () {
        sprite_overlay.alpha = 0;
        sprite.alpha = 1;
        current_direction = DIRECTIONS.NONE;
    };

    let enter_dead = function () {
        addDeathEffect(scene, m_x, m_y);
        sprite.destroy();
        sprite_overlay.destroy();
        bounding_box.destroy();
        move_box.destroy();
        health_bar.destroy();
    };

    let enter_idle = function () {
        current_direction = DIRECTIONS.NONE;
        if (current_slide_count >= max_slide_count) {
            current_slide_count = 0;
            state_handler.changeState(STATES.CAST);
            return;
        }
        current_slide_count++;
        state_handler.addDelayedCall(1000, state_handler.changeState, [STATES.START_SLIDE]);
    };

    let active_sparkles = [];
    let enter_cast = function () {
        current_direction = DIRECTIONS.NONE;
        //state_handler.addDelayedCall(1000, state_handler.changeState, [STATES.START_SLIDE]);
        let add_sparkle = function (delay) {
            let x = Phaser.Math.Between(LayoutManager.__gridX(m_x - 0.25), LayoutManager.__gridX(m_x + 0.25));
            let z = Phaser.Math.Between(-GRID_SIZE * .5, 0);
            let y = Phaser.Utils.Array.GetRandom(
                [LayoutManager.__gridY(m_y + 0.25), LayoutManager.__gridY(m_y - 0.25)]);
            let sparkle = scene.add.ellipse(x, y + z, GRID_SIZE / 8, GRID_SIZE / 4,
                0xffffff, 1.0)
                .setVisible(false)
                .setDepth(DEPTHS.ENTITIES + y);
            state_handler.addDelayedCall(delay, function () {
                sparkle.setVisible(true);
            });
            state_handler.addTween({
                targets: sparkle,
                y: sparkle.y - GRID_SIZE,
                scaleY: 2,
                scaleX: 0,
                delay: delay,
                duration: 500
            });
            active_sparkles.push(sparkle);
        };

        for (let i = 0; i < 3500; i += 100) {
            add_sparkle(i);
        }
        state_handler.addTween({
            targets: sprite_overlay,
            alpha: 0.25,
            yoyo: true,
            repeat: 8,
            duration: 500
        });
        state_handler.addDelayedCall(4000, state_handler.changeState, [STATES.RELEASE]);
    };

    let enter_start_slide = function () {
        current_move_count = 0;
        current_direction = Phaser.Utils.Array.GetRandom([
            DIRECTIONS.DOWN_LEFT,
            DIRECTIONS.UP_RIGHT,
            DIRECTIONS.UP_LEFT,
            DIRECTIONS.DOWN_RIGHT
        ]);
        state_handler.changeState(STATES.MOVE);
    };

    let exit_cast = function () {
        for (let active_sparkle of active_sparkles) {
            active_sparkle.destroy();
        }
        sprite_overlay.setAlpha(0);
    };

    let enter_release = function () {
        addFlameWave(scene, m_x, m_y);
        state_handler.changeState(STATES.START_SLIDE);
    };

    let change_move_target = function (x, y) {
        m_targetx = x;
        m_targety = y;
        LayoutManager.__setPhysicsBodyPosition(move_box, Math.round(m_targetx), Math.round(m_targety));
    };

    let enter_move = function () {
        let directions = [
            current_direction,
            DIRECTIONS.turnCounterClockwise(current_direction),
            DIRECTIONS.turnClockwise(current_direction),
            DIRECTIONS.opposite(current_direction),
        ];
        for (let direction of directions) {
            if (scene.__isGridMobPassable(m_x + direction.dx, m_y + direction.dy) &&
                scene.__isGridMobFree(m_x + direction.dx, m_y + direction.dy)) {
                current_direction = direction;
                change_move_target(m_x + direction.dx, m_y + direction.dy);
                state_handler.addTweenParallel(
                    [{
                        targets: {x: m_x},
                        props: {x: m_targetx},
                        duration: 200,
                        onUpdate: function () {
                            m_x = this.getValue();
                        },
                    }, {
                        targets: {y: m_y},
                        props: {y: m_targety},
                        duration: 200,
                        onUpdate: function () {
                            m_y = this.getValue();
                        },
                    }],
                    function () {
                        current_move_count++;
                        state_handler.changeState(current_move_count < max_move_count ?
                            STATES.MOVE : STATES.IDLE);
                    }
                );
                return; //<------ RETURN to end function
            }
        }
        //no direction worked?
        state_handler.changeState(STATES.IDLE);
    };

    let exit_move = function () {
        change_move_target(m_x, m_y);
    };

    let STATES = {
        IDLE: {enter: enter_idle, exit: null},
        START_SLIDE: {enter: enter_start_slide, exit: null},
        MOVE: {enter: enter_move, exit: exit_move},
        STUNNED: {enter: enter_stunned, exit: exit_stunned},
        DEAD: {enter: enter_dead, exit: null},
        CAST: {enter: enter_cast, exit: exit_cast},
        RELEASE: {enter: enter_release, exit: null}
    };
    let state_handler = stateHandler(scene, STATES, STATES.IDLE);

    let sprite = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__characterY(0), 'white_pieces',  PIECE_SPRITES.BISHOP_DOWN);
    let sprite_overlay = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__characterY(0), 'white_pieces', PIECE_SPRITES.BISHOP_DOWN)
        .setAlpha(0)
        .setTintFill(0xffffff);
    let bounding_box = scene.add.rectangle(0, 0, GRID_SIZE / 2, GRID_SIZE / 2, 0x00ff00, 0.0);
    let move_box = scene.add.rectangle(0, 0, GRID_SIZE / 2, GRID_SIZE / 2, 0x00ff00, 0.0).setDepth(DEPTHS.SURFACE);
    let health_bar = addHealthBar(scene, 1, 0, 0, true);
    bounding_box.setData('onHit', function (dx, dy) {
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
    bounding_box.setData('registerDangerousTouch', function () {
        return {dx: current_direction.dx, dy: current_direction.dy};
    });
    bounding_box.setData('isDangerous', function () {
        return state_handler.getState() !== STATES.STUNNED;
    });
    scene.__hittables.add(bounding_box);
    scene.__mobs.add(bounding_box);
    scene.__mob_collision_boxes.add(bounding_box);
    scene.__mob_collision_boxes.add(move_box);
    scene.__dangerous_touchables.add(bounding_box);
    scene.__updateables.add(bounding_box);
    bounding_box.update = function () {
        sprite.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__characterY(m_y) + m_z);
        sprite.setDepth(DEPTHS.ENTITIES + m_y);
        sprite_overlay.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__characterY(m_y) + m_z);
        sprite_overlay.setDepth(DEPTHS.ENTITIES + m_y);
        LayoutManager.__setPhysicsBodyPosition(move_box, Math.round(m_targetx), Math.round(m_targety));
        LayoutManager.__setPhysicsBodyPosition(bounding_box, Math.round(m_x), Math.round(m_y));
        health_bar.updatePosition(m_x, m_y - 1);
    };

    bounding_box.update();
    state_handler.start();

    return bounding_box;
};

let addRookStatue = function (scene, x, y) {
    return addStatue(scene, x, y, PIECE_SPRITES.ROOK,
        [
            {d: DIRECTIONS.UP, m: 0},
            {d: DIRECTIONS.LEFT, m: 0},
            {d: DIRECTIONS.RIGHT, m: 0},
            {d: DIRECTIONS.DOWN, m: 0}
        ]);
};

let addBishopStatue = function (scene, x, y) {
    return addStatue(scene, x, y, PIECE_SPRITES.BISHOP_DOWN,
        [
            {d: DIRECTIONS.UP_LEFT, m: 0},
            {d: DIRECTIONS.UP_RIGHT, m: 0},
            {d: DIRECTIONS.DOWN_LEFT, m: 0},
            {d: DIRECTIONS.DOWN_RIGHT, m: 0}
        ]);
};

let addStatue = function (scene, x, y, frame, directions) {
    let m_x = x;
    let m_y = y;

    let enter_stunned = function (impact_x, impact_y) {
        m_y = Math.round(m_y);
        m_x = Math.round(m_x);
        sprite.alpha = 0.75;
        for (let direction of directions) {
            direction.m = direction.d.dx * impact_x +
                direction.d.dy * impact_y;
        }
        directions.sort(function (a, b) {
            if (a.m > b.m) {
                return -1;
            }
            if (a.m < b.m) {
                return 1;
            }
            return 0;
        });
        for (let direction of directions) {
            if (scene.__isGridMobPassable(m_x + direction.d.dx, m_y + direction.d.dy) &&
                scene.__isGridMobFree(m_x + direction.d.dx, m_y + direction.d.dy) &&
                !scene.__checkPlayerCollision(m_x + direction.dx, m_y + direction.dy)) {
                m_x += direction.d.dx;
                m_y += direction.d.dy;
                break;
            }
        }
        scene.tweens.add({
            targets: sprite_overlay,
            alpha: 1,
            yoyo: true,
            repeat: 1,
            duration: 50
        });
    };

    let exit_stunned = function () {
        sprite_overlay.alpha = 0;
        sprite.alpha = 1;
    };

    let sprite = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__characterY(0), 'statue_pieces', frame);
    let sprite_overlay = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__characterY(0), 'statue_pieces', frame)
        .setAlpha(0)
        .setTintFill(0xffffff);
    let bounding_box = scene.add.rectangle(0, 0, GRID_SIZE / 2, GRID_SIZE / 2, 0x00ff00, 0.0);
    bounding_box.setData('onHit', function (dx, dy) {
        enter_stunned(dx, dy);
        exit_stunned();
    });
    scene.__hittables.add(bounding_box);
    scene.__mobs.add(bounding_box);
    scene.__mob_collision_boxes.add(bounding_box);
    scene.__updateables.add(bounding_box);
    scene.events.on(Phaser.Scenes.Events.SLEEP, () => {
        m_x = x;
        m_y = y;
        bounding_box.update();
    });
    bounding_box.update = function () {
        sprite.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__characterY(m_y));
        sprite.setDepth(DEPTHS.ENTITIES + m_y);
        sprite_overlay.setPosition(LayoutManager.__gridX(m_x), LayoutManager.__characterY(m_y));
        sprite_overlay.setDepth(DEPTHS.ENTITIES + m_y);
        LayoutManager.__setPhysicsBodyPosition(bounding_box, Math.round(m_x), Math.round(m_y));
    };

    bounding_box.update();

    return bounding_box;
};

let addPlayer = function (scene, x, y) {

    let character = scene.add.rectangle(0, 0, GRID_SIZE / 2, GRID_SIZE / 2, 0x00ff00, 0.0);
    scene.__updateables.add(character);
    let player_stomp = scene.sound.add('player_stomp');
    let player_status = scene.scene.get('ControllerScene').__player_status;
    player_status.x = x;
    player_status.y = y;
    player_status.dx = 0;
    player_status.dy = 0;
    player_status.z = 0;
    player_status.playerMoveAllowed = true;
    player_status.playerDangerous = false;
    player_status.playerGracePeriod = false;
    let move_history = [{x: x, y: y}];

    let tearDown = function () {
        sprite_remnant.setPosition(LayoutManager.__gridX(player_status.x),
            LayoutManager.__characterY(player_status.y) + player_status.z)
            .setVisible(true);
        sprite_remnant.setDepth(DEPTHS.ENTITIES + player_status.y);
        scene.events.once(Phaser.Scenes.Events.SLEEP, () => sprite_remnant.destroy());
        sprite.destroy();
        sprite_overlay.destroy();
        shadow.destroy();
        character.destroy();
        impact_sprite.destroy();
        frame.destroy();
        Phaser.Utils.Array.Each(frames, (frame) => frame.destroy(), self);
    };

    let reset_player_after_fall = function () {
        while (move_history.length !== 0) {
            let prev = move_history.pop();
            if (scene.__isGridPassable(prev.x, prev.y)) {
                player_status.x = prev.x;
                player_status.y = prev.y;
                current_depths = DEPTHS.ENTITIES;
                return;
            }
        }
    };

    let character_fall = function () {
        if (!player_status.playerMoveAllowed) {
            return;
        }

        player_status.playerMoveAllowed = false;
        let fallTween = scene.tweens.add({
            targets: {z: player_status.z},
            props: {z: 1000},
            duration: 1000,
            onUpdate: function () {
                player_status.z = fallTween.getValue();
            },
            onComplete: function () {
                reset_player_after_fall();
                decrement_life();
                player_status.playerMoveAllowed = true;
                fallTween = null;
            }
        });
        current_depths = DEPTHS.BOARD;
    };

    let current_depths = DEPTHS.ENTITIES;
    character.update = function () {
        let x = player_status.x;
        let y = player_status.y;
        let z = player_status.z;
        if (!scene.__isGridPassable(Math.round(x), Math.round(y))) {
            character_fall();
        }
        sprite.setPosition(LayoutManager.__gridX(x), LayoutManager.__characterY(y) + z);
        sprite.setDepth(current_depths + y);
        sprite_overlay.setPosition(LayoutManager.__gridX(x), LayoutManager.__characterY(y) + z);
        sprite_overlay.setDepth(current_depths + y);
        shadow.setPosition(LayoutManager.__gridX(x), LayoutManager.__gridY(y));
        shadow.setVisible(z < 0);
        LayoutManager.__setPhysicsBodyPosition(character, Math.round(x), Math.round(y));
        frame.setPosition(LayoutManager.__gridX(player_status.x),
            LayoutManager.__gridY(player_status.y));
        frame.setVisible(player_status.playerMoveAllowed &&
            scene.__shouldTransition(player_status.x, player_status.y));
        if (frame.visible) {
            let direction = scene.__getTransitionDireciton(player_status.x, player_status.y);
            if (DIRECTIONS.equals(direction, DIRECTIONS.LEFT)) {
                frame.rotation = 0;
            }
            if (DIRECTIONS.equals(direction, DIRECTIONS.RIGHT)) {
                frame.rotation = Math.PI
            }
            if (DIRECTIONS.equals(direction, DIRECTIONS.UP)) {
                frame.rotation = Math.PI / 2
            }
            if (DIRECTIONS.equals(direction, DIRECTIONS.DOWN)) {
                frame.rotation = -Math.PI / 2
            }
        }
        for (let i = 0; i < frames.length; i++) {
            let frame = frames[i];
            let frame_x = x + frame.data.values.dx;
            let frame_y = y + frame.data.values.dy;
            frame.setPosition(LayoutManager.__gridX(frame_x),
                LayoutManager.__gridY(frame_y));
            frame.setVisible(player_status.playerMoveAllowed &&
                scene.__isGridPassable(frame_x, frame_y));
        }
    };

    let impact = function () {
        impact_sprite.setPosition(
            LayoutManager.__gridX(Math.round(player_status.x)),
            LayoutManager.__gridY(Math.round(player_status.y)));
        impact_sprite.setDepth(DEPTHS.SURFACE + player_status.y)
        impact_sprite.play('impact_anim');
    };

    let movePlayer = function (dx, dy) {
        let x = Math.round(player_status.x) + dx;
        let y = Math.round(player_status.y) + dy;
        move_history.push({x: x, y: y});
        player_status.dx = dx;
        player_status.dy = dy;
        if (player_status.dx === 2) {
            setOrientation(PIECE_SPRITES.KNIGHT_RIGHT);
        }
        if (player_status.dy === -2) {
            setOrientation(PIECE_SPRITES.KNIGHT_UP);
        }
        if (player_status.dy === 2) {
            setOrientation(PIECE_SPRITES.KNIGHT_DOWN);
        }
        if (player_status.dx === -2) {
            setOrientation(PIECE_SPRITES.KNIGHT_LEFT);
        }

        player_status.playerMoveAllowed = false;
        let z_height = -64;
        let tweenX = scene.tweens.add({
            targets: {x: player_status.x},
            props: {x: x},
            duration: 100,
            onUpdate: function () {
                player_status.x = tweenX.getValue();
            }
        });
        let tweenY = scene.tweens.add({
            targets: {y: player_status.y},
            props: {y: y},
            duration: 100,
            onUpdate: function () {
                player_status.y = tweenY.getValue();
            }
        });
        let timeline = scene.tweens.createTimeline();
        timeline.add({
            targets: {z: player_status.z},
            props: {z: z_height},
            duration: 100,
            onUpdate: function () {
                player_status.z = this.getValue();
            },
            onComplete: function () {
                player_status.playerDangerous = true;
            }
        });
        timeline.add({
            targets: {z: z_height},
            props: {z: 0},
            duration: 50,
            onUpdate: function () {
                player_status.z = this.getValue();
            },
            onComplete: function () {
                player_status.playerMoveAllowed = true;
                player_status.playerDangerous = false;
                player_stomp.play();
                if (scene.__shouldTransition(player_status.x, player_status.y)) {
                    tearDown();
                    scene.scene.get('ControllerScene').__transition();
                } else {
                    impact();
                }
            }
        });
        timeline.play();
    };

    let setOrientation = function (orientation) {
        player_status.orientation = orientation;
        let sprite_type = player_status.parity ? 'black_pieces' : 'white_pieces';
        sprite.setTexture(sprite_type, orientation);
        sprite_overlay.setTexture(sprite_type, orientation);
        sprite_remnant.setTexture(sprite_type, orientation);
    };

    let tryMovePlayer = function (dx, dy) {
        if (!player_status.playerMoveAllowed) {
            return;
        }
        if (scene.__isGridPassable(Math.round(player_status.x) + dx,
            Math.round(player_status.y) + dy)) {
            movePlayer(dx, dy);
        }
    };

    character.setData('isTouching', function () {
        return player_status.playerMoveAllowed;
    });

    character.setData('isHitting', function () {
        return player_status.playerDangerous;
    });

    let decrement_life = function () {
        player_status.life = Math.max(--player_status.life, 0);
        player_status.health_bar.updateLife(player_status.life / player_status.full_life);
        player_status.z = 0;
        player_status.y = Math.round(player_status.y);
        player_status.x = Math.round(player_status.x);
        sprite.setAlpha(0.75);
        player_status.playerGracePeriod = true;
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
            repeat: 1500 / 50,
            onComplete: function () {
                sprite.alpha = 1;
                scene.time.delayedCall(500, function () {
                    player_status.playerGracePeriod = false;
                });
            }
        });
    };

    let player_knockback = function (impact_x, impact_y) {
        let directions = [
            {d: DIRECTIONS.UP, m: 0},
            {d: DIRECTIONS.UP_LEFT, m: 0},

            {d: DIRECTIONS.LEFT, m: 0},
            {d: DIRECTIONS.DOWN_LEFT, m: 0},

            {d: DIRECTIONS.DOWN, m: 0},
            {d: DIRECTIONS.DOWN_RIGHT, m: 0},

            {d: DIRECTIONS.RIGHT, m: 0},
            {d: DIRECTIONS.UP_RIGHT, m: 0},
        ];
        Phaser.Utils.Array.Shuffle(directions);
        for (let direction of directions) {
            direction.m = direction.d.dx * impact_x +
                direction.d.dy * impact_y;
        }
        directions.sort(function (a, b) {
            if (a.m > b.m) {
                return -1;
            }
            if (a.m < b.m) {
                return 1;
            }
            return 0;
        });
        for (let direction of directions) {
            if (scene.__isGridPassable(player_status.x + direction.d.dx,
                player_status.y + direction.d.dy) &&
                scene.__isGridMobFree(player_status.x + direction.d.dx,
                    player_status.y + direction.d.dy)) {
                player_status.x = player_status.x += direction.d.dx;
                player_status.y = player_status.y += direction.d.dy;
                player_status.dx = direction.d.dx;
                player_status.dy = direction.d.dy;

                break;
            }
        }
        scene.cameras.main.shake(50, 0.005, true);
    };

    character.setData('onHit', function (impact_x, impact_y) {
        decrement_life();
        player_knockback(impact_x, impact_y);
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
    let frame = scene.add.sprite(0, 0, 'frame', 1).setScale(2);
    frame.setData('dx', 0);
    frame.setData('dy', 0);
    frame.setInteractive();
    frame.setDepth(DEPTHS.UI);
    frame.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function () {
        if (scene.__shouldTransition(player_status.x, player_status.y)) {
            tearDown();
            scene.scene.get('ControllerScene').__transition();
        }
    });
    for (let i = 0; i < moves.length; i++) {
        let frame = scene.add.sprite(0, 0, 'frame', 0).setScale(2);
        frames.push(frame);
        frame.setData('dx', moves[i].dx);
        frame.setData('dy', moves[i].dy);
        frame.setInteractive();
        frame.setDepth(DEPTHS.SURFACE);
        frame.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
            function () {
                tryMovePlayer(frame.data.values.dx,
                    frame.data.values.dy);
            }
        );
    }
    let sprite = scene.add.sprite(0, 0, 'black_pieces', 4);
    let sprite_remnant = scene.add.sprite(0, 0, 'black_pieces', 4).setVisible(false);
    let sprite_overlay = scene.add.sprite(0, 0, 'black_pieces', 4).setTintFill(0xffffff).setAlpha(0);
    scene.physics.add.existing(character);
    let impact_sprite = scene.add.sprite(0, 0, 'impact', 5).setVisible(true).setScale(2);
    let shadow = scene.add.ellipse(0, 0,
        GRID_SIZE * .70, GRID_SIZE * .57, 0x000000, 0.5);
    shadow.setDepth(DEPTHS.SURFACE);

    setOrientation(player_status.orientation);

    if (player_status.do_enter_animation) {
        player_status.do_enter_animation = false;
        player_status.z = -1000;
        player_status.playerMoveAllowed = false;
        let tweenZ = scene.tweens.add({
            targets: {z: player_status.z},
            props: {z: 0},
            duration: 1000,
            onUpdate: function () {
                player_status.z = tweenZ.getValue();
            },
            onComplete: function () {
                player_stomp.play();
                impact();
                player_status.playerMoveAllowed = true;
                player_status.playerGracePeriod = false;
            }
        });
    }

    scene.__player_group.add(character);
    character.update();

    return character;
};

let addFightSequence = function (scene, victory_condition) {
    let fight_sequence_events = [];
    let fight_sequence_guards = [];
    let do_next_event = function () {
        fight_sequence_guards.shift();
        fight_sequence_events[0]();
        fight_sequence_events.shift();
        if (fight_sequence_guards.length > 0) {
            fight_sequence_guards[0]();
        }
    };
    let fight_end = function () {
        fight_music.stop();
        victory_condition();
    };
    let fight_music = scene.sound.add('fight_music', {loop: true, volume: 0.25});
    let start = function () {
        addMobCountGuard(0, fight_end);
        fight_music.play();
        fight_sequence_guards[0]();
    };
    let addTimerGuard = function (time, event) {
        fight_sequence_guards.push(() => {
            scene.time.delayedCall(time, do_next_event)
        });
        fight_sequence_events.push(event);
        return result;
    };
    let addMobCountGuard = function (threshold, event) {
        fight_sequence_guards.push(() => {
            addMobWatch(scene, threshold, do_next_event);
        });
        fight_sequence_events.push(event);
        return result;
    };
    let result = {
        addTimerGuard: addTimerGuard,
        addMobCountGuard: addMobCountGuard,
        start: start,
    };
    return result;
};

let addMobWatch = function (scene, threshold, handler) {
    let mob_watch = scene.add.zone(0, 0);
    mob_watch.update = function () {
        if (scene.__mobs.getLength() <= threshold) {
            handler();
            mob_watch.destroy();
        }
    };
    scene.__updateables.add(mob_watch);
    return mob_watch;
};

let addKeyHole = function (scene, points, handler) {
    let player_status = scene.scene.get('ControllerScene').__player_status;
    let keyholes = [];
    for (let point of points) {
        let keyhole = scene.add.sprite(LayoutManager.__gridX(point.x), LayoutManager.__gridY(point.y), 'keyhole')
            .setScale(2)
            .setDepth(DEPTHS.SURFACE);
        scene.__touchables.add(keyhole);
        keyhole.setData('onTouch', function () {
            if (!player_status.removeInventory('key')) {
                return;
            }
            for (let keyhole of keyholes) {
                keyhole.destroy();
            }
            handler();
        });
        keyholes.push(keyhole);
    }
};

let addKey = function (scene, x, y) {
    let key = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__gridY(0), 'keys', 0)
        .setScale(3);
    let handler = function () {
        let ui_scene = scene.scene.get('ControllerScene');
        let player_status = ui_scene.__player_status;
        player_status.addInventory('key','A small key',
            ui_scene.add.sprite(0, 0, 'keys', 0)
            .setScale(3));
    };
    addFallingItem(scene, x, y, -0.4, key, handler);
};

let addGem = function (scene, x, y, flavor) {
    let gem = scene.add.sprite(LayoutManager.__gridX(0), LayoutManager.__gridY(0), 'gems', flavor * 6)
        .setScale(2);
    gem.play('gem_' + flavor + '_anim');
    let handler = function () {
        let ui_scene = scene.scene.get('ControllerScene');
        let player_status = ui_scene.__player_status;
        player_status.addInventory('gem_'+flavor,'A gem',
            ui_scene.add.sprite(0, 0, 'gems', flavor * 6)
                .setScale(2));
    };
    addFallingItem(scene, x, y, -0.25, gem, handler);
};

let addFallingItem = function(scene, x, y, z, sprite, handler) {
    let target_y = y + z;
    let threshold_y = target_y - 1;
    let start_y = target_y - GRID_ROWS;
    let depth = DEPTHS.ENTITIES + y - 0.25;
    let zone_trigger = scene.add.zone(LayoutManager.__gridX(x), LayoutManager.__gridY(y),
        GRID_SIZE - GRID_SIZE / 2, GRID_SIZE - GRID_SIZE / 2);
    let shadow = scene.add.ellipse(LayoutManager.__gridX(x), LayoutManager.__gridY(y),
        GRID_SIZE * .50, GRID_SIZE * .25, 0x000000, 0.5)
        .setDepth(depth)
    sprite.setPosition(LayoutManager.__gridX(x), LayoutManager.__gridY(start_y))
        .setDepth(depth+1);
    scene.tweens.add({
        targets: sprite,
        y: LayoutManager.__gridY(target_y),
        ease: 'Bounce.easeOut',
        duration: 1500,
    });
    scene.__touchables.add(zone_trigger);
    zone_trigger.setData('onTouch', function () {
        if (sprite.y < LayoutManager.__gridY(threshold_y)) {
            return;
        }
        if (handler) {
            handler();
        }
        shadow.destroy();
        sprite.destroy();
        zone_trigger.destroy();
    });
}

let addZoneTrigger = function (scene, x, y, width, height, handler) {
    let zone_trigger = scene.add.zone(LayoutManager.__gridX(x), LayoutManager.__gridY(y),
        width * GRID_SIZE - GRID_SIZE / 2, height * GRID_SIZE - GRID_SIZE / 2);
    scene.__touchables.add(zone_trigger);
    zone_trigger.setData('onTouch', function () {
        handler();
        zone_trigger.destroy();
    });
    return zone_trigger;
};

let addBasicButton = function (scene, x, y) {
    let offset = (x + y) % 2;
    let button_pressed = false;
    let calculate_texture = function () {
        let result = offset * 2 + (button_pressed ? 1 : 0);
        return result;
    };
    let button = scene.add.sprite(LayoutManager.__gridX(x), LayoutManager.__gridY(y),
        'button', calculate_texture())
        .setDepth(DEPTHS.BOARD + y);
    let set_texture = function () {
        button.setTexture('button', calculate_texture());
    };
    button.setData('isPressed', () => button_pressed);
    button.setData('press', () => {
        button_pressed = true;
        set_texture();
    });
    button.setData('unpress', () => {
        button_pressed = false;
        set_texture();
    });
    return button;
};

let addButton = function (scene, points, trigger, reset_delay, reset_trigger, hold_trigger) {
    let buttons = [];

    let delayed_call = null;
    let reset_or_create = function () {
        if (reset_delay === -1) {
            return;
        }

        if (delayed_call) {
            delayed_call.remove();
            if (hold_trigger) {
                hold_trigger();
            }
        }

        delayed_call = scene.time.delayedCall(reset_delay, () => {
            Phaser.Utils.Array.Each(buttons, (button) => button.data.values.unpress(), buttons);
            ;
            if (reset_trigger) {
                reset_trigger();
            }
        });
    };

    for (let point of points) {
        let button = addBasicButton(scene, point.x, point.y);
        buttons.push(button);
        scene.__touchables.add(button);
        scene.__mob_touchables.add(button);
        button.setData('onTouch', function () {
            if (!buttons.some((button) => button.data.values.isPressed())) {
                if (trigger) {
                    trigger();
                }
            }
            Phaser.Utils.Array.Each(buttons, (button) => button.data.values.press(), this);
            reset_or_create();
        });
    }

    return buttons;
};

let addSimultaneousButtonGroup = function (scene, points, complete_trigger) {
    let total_count = points.length;
    let current_count = 0;
    let buttons = [];

    let finalize = function () {
        complete_trigger();
        for (let button of buttons) {
            button.destroy();
        }
        for (let point of points) {
            addBasicButton(scene, point.x, point.y).data.values.press();
        }
    };

    let press = function () {
        current_count++;
        if (total_count === current_count) {
            finalize();
        }
    };

    let unpress = function () {
        current_count--;
    }

    for (let point of points) {
        let button = addButton(scene, [{x: point.x, y: point.y}], press, 200, unpress);
        buttons.concat(button);
    }
    return buttons;
};

let addButtonGroup = function (scene, points, completed_trigger) {
    let buttons = [];
    let pressed_button_count = 0;

    let delayed_call = null;
    let stop_timer = function () {
        if (delayed_call) {
            delayed_call.remove();
        }
    }
    let start_timer = function () {
        stop_timer();

        delayed_call = scene.time.delayedCall(200, () => {
            Phaser.Utils.Array.Each(buttons, (button) => button.data.values.unpress(), buttons);
            pressed_button_count = 0;
        });
    };

    let is_triggered = function () {
        return pressed_button_count === buttons.length
    };

    let maybe_fire_trigger = function () {
        if (is_triggered()) {
            completed_trigger();
            return true;
        }
        return false;
    };

    for (let point of points) {
        let button = addBasicButton(scene, point.x, point.y);
        buttons.push(button);
        scene.__touchables.add(button);
        scene.__mob_touchables.add(button);
        scene.__updateables.add(button);
        let watch_for_release = false;
        button.setData('onTouch', function () {
            if (is_triggered()) {
                return;
            }

            if (button.data.values.isPressed()) {
                return;
            }

            stop_timer();
            pressed_button_count++;
            button.data.values.press();

            if (maybe_fire_trigger()) {
                return;
            }

            watch_for_release = true;
        });
        button.update = function () {
            if (is_triggered()) {
                return;
            }
            if (!watch_for_release) {
                return;
            }

            let touching = scene.physics.overlap(scene.__mobs, button) ||
                scene.physics.overlap(scene.__player_group, button);
            if (touching) {
                return;
            }

            watch_for_release = false;
            start_timer();
        };
    }
};

let addDisappearingPlatform = function (scene, x, y, delay) {
    let square = scene.__getGridSquare(x, y);
    let safety_delay = 1000;
    let tween = null;

    let create_or_reset = function () {
        if (tween) {
            tween.restart();

            return;
        }
        tween = scene.tweens.add({
            targets: square,
            alpha: 0.25,
            yoyo: true,
            delay: Math.max(delay - safety_delay, 0),
            duration: 50,
            repeat: safety_delay / 100,
            onStart: () => {
                square.alpha = 0.75;
            },
            onComplete: () => {
                square.setVisible(false);
                square.alpha = 1;
                tween.remove();
                tween = null;
            }
        });
    };

    square.setData('beginCountdown', () => {
        create_or_reset();
        square.setVisible(true);
        square.alpha = 1;
    });
    return square;
}

let addDisapperaingPlatformSequence = function (scene, point_groups, platform_time, platform_overlap_time, start_delay) {
    let loop_time = point_groups.length * (platform_time - platform_overlap_time);
    let current_delay = start_delay;
    for (let point_group of point_groups) {
        let platform_group = [];
        for (let point of point_group) {
            platform_group.push(addDisappearingPlatform(scene, point.x, point.y, platform_time))
        }
        let reveal_blocks = function () {
            Phaser.Utils.Array.Each(platform_group,
                (platform) => platform.data.values.beginCountdown(), scene)
            scene.time.delayedCall(loop_time, reveal_blocks);
        };
        scene.time.delayedCall(current_delay, reveal_blocks);
        current_delay += platform_time - platform_overlap_time;
    }
};

let addLavaPool = function (scene, x, y, width, height) {
    for (let i = x; i < x + width; i++) {
        for (let j = y; j < y + height; j++) {
            scene.add.sprite(LayoutManager.__gridX(i), LayoutManager.__gridY(j) + 8, 'lava', 0)
                .setDepth(DEPTHS.BOARD + j);
        }
    }
    let delayed_call = null;
    let spawn_flame_wave = function () {
        let rx = x + Phaser.Math.Between(0, width - 1);
        let ry = y + Phaser.Math.Between(0, height - 1);
        addFlameWave(scene, rx, ry);
        delayed_call = scene.time.delayedCall(8000, spawn_flame_wave);
    };

    let start = function () {
        delayed_call = scene.time.delayedCall(1000, spawn_flame_wave);
    };

    let stop = function () {
        if (delayed_call) {
            delayed_call.remove(false);
        }
    };

    start();

    return {
        start: start,
        stop: stop,
    };
};