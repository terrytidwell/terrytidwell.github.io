

const SCREEN_HEIGHT = 720;
const SCREEN_WIDTH = 1280;
const SPRITE_SCALE = 6;
/*
const SCREEN_HEIGHT = 1080;
const SCREEN_WIDTH = 1920;
const SPRITE_SCALE = 9;

const SCREEN_HEIGHT = 720;
const SCREEN_WIDTH = 1280;
const SPRITE_SCALE = 6;
 */
const GRID_SIZE = 16*SPRITE_SCALE/2
const DEPTHS = {
    BG: 0,
    MG: 3000,
    FG: 6000,
    UI: 9000,
};

let CELL_BLOCK_EVENTS = {
    SUBPANEL_FIXED: 'suppanel_activated',
    MAINPANEL_FIXED: 'mainpanel_activated',
};


let get_new_gamestate = () => {
    return {
        current_page: 0,
        collected_lantern: false,
        lantern_in_wood: false,
    }
};

let getFont = (align = "left", fontSize = GRID_SIZE, color="#000000") => {
    return {font: '' + fontSize + 'px m5x7', fill: color, align: align,
        wordWrap: {width: SCREEN_WIDTH, useAdvancedWrap: false}};
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
    create: function () {
        let scene = this;

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;


        let x = SCREEN_WIDTH/2;
        let y = SCREEN_HEIGHT/2;

        scene.lights.enable().setAmbientColor(0x606060);
        let main_light = addMainLight(scene);

        let scene_group = scene.add.group();
        let scene_lights = [];
        let scene_light_clear = () => {
            for (let scene_light of scene_lights) {
                scene.lights.removeLight(scene_light);
            }
            scene_lights = [];
        }
        let walls = scene.physics.add.staticGroup();
        let interactives = scene.physics.add.group({runChildUpdate: true});
        let text = null;
        //TODO: this probably needs to be wrapped up as a player state
        let room_letter = 1;
        let room_number = 2;
        let room_letters = ['A','B','C','D'];
        let player_state_handler = null;
        let solid_box = null;
        let PLAYER_STATES = null;
        let main_panel_triggered = false;
        let total_subpanel_count = 3;
        let current_subpanel_count = 0;
        let allow_keypad = false;
        let open_door = false;
        bind_event(scene, scene.events, CELL_BLOCK_EVENTS.SUBPANEL_FIXED, () => {
            console.log('subpanel_listener_triggered');
            current_subpanel_count+= 1
            if (current_subpanel_count === total_subpanel_count)
            {
                allow_keypad = true;
            }
        });
        bind_event(scene, scene.events, CELL_BLOCK_EVENTS.MAINPANEL_FIXED, () => {
            console.log('mainpanel_listener_triggered');
            main_panel_triggered = true;
            add_indicator_lights();
        });

        let add_indicator_lights = () => {
            if (room_letter !== 0 || room_number !== 1) { return; }
            if (!main_panel_triggered) { return; }
            let positions = [
                {x: x + 7*GRID_SIZE - SPRITE_SCALE*5/2,
                 y: y -GRID_SIZE*5 - 9/2*SPRITE_SCALE},
                {x: x + 7*GRID_SIZE - SPRITE_SCALE*17/2,
                    y: y -GRID_SIZE*5 - 9/2*SPRITE_SCALE},
                {x: x + 7*GRID_SIZE - SPRITE_SCALE*29/2,
                    y: y -GRID_SIZE*5 - 9/2*SPRITE_SCALE},
            ];
            for (const [index, position] of positions.entries()) {
                let color = current_subpanel_count > index ? 0x00ff00 : 0xff0000;
                let panel_light_pixel_red = scene.add.rectangle(
                    position.x,
                    position.y,
                    3*SPRITE_SCALE, SPRITE_SCALE, color)
                    .setOrigin(0.5,0.5)
                    .setDepth(DEPTHS.BG+1);
                let panel_light_green = scene.lights.addLight(
                    position.x,
                    position.y,
                    GRID_SIZE,
                    color,
                    1);
                scene_group.add(panel_light_pixel_red);
                scene_lights.push(panel_light_green);
            }
        };

        let set_text = () => {
            let new_text = room_letters[room_letter]+room_number;
            if (room_letter === 0 && room_number === 1) {
                new_text = "";
            }
            text.setText(new_text);
        }
        let scene_bg = null;
        let scene_fg = null;
        let activate_keypad_screen = null;
        let exit_box_y_offset = -14 * SPRITE_SCALE;
        let exits = scene.physics.add.staticGroup();

        let set_panel_state = addSubPanels(scene);

        let set_up_room = () =>
        {
            scene_group.clear(true,true);
            scene_light_clear();
            walls.clear(true,true);

            add_indicator_lights();

            set_panel_state(scene_group, interactives,
                room_number-1, room_letter,
                player_state_handler, solid_box, PLAYER_STATES,
                activate_keypad_screen, open_door);

            let bg_frame = room_letter === 0 ? 5 : 1;
            if (room_letter === 0 && room_number === 1) {
                bg_frame = 13;
            }

            let fg_frame = 2;
            let fg_flip = false;
            if (room_letter === 3) {
                fg_frame = 6;
                if (room_number === 1) {
                    fg_frame = 4;
                }
                if (room_number === 4) {
                    fg_frame = 4;
                    fg_flip = true;
                }
            } else if (room_number === 1 || room_number === 4) {
                fg_flip = room_number === 4;
                fg_frame = room_letter === 0 ? 14 : 3;
            }

            if (open_door && room_letter === 0 && room_number === 1) {
                bg_frame = 17;
                fg_frame = 18;
            }
            scene_fg = scene.add.sprite(x,y,'bg_prison',fg_frame)
                .setPipeline('Light2D')
                .setScale(SPRITE_SCALE)
                .setFlipX(fg_flip)
                .setDepth(DEPTHS.FG);
            scene_bg = scene.add.sprite(x,y,'bg_prison',bg_frame)
                .setPipeline('Light2D')
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG);

            let text_x = room_number !== 4 ?
                x+GRID_SIZE*4+SPRITE_SCALE :
                GRID_SIZE * 1.25;
            text = scene.add.text(text_x, y-GRID_SIZE*3,
                'Z9',getFont('center',GRID_SIZE*2,"#ffff00"))
                .setOrigin(0.5,0.5)
                .setDepth(DEPTHS.BG)
                .setPipeline('Light2D');
            set_text();
            scene_group.add(text);
            scene_group.add(scene_bg);
            scene_group.add(scene_fg);

            let WALLS_ENUM = {
                NW: {create: () => {
                    walls.add(
                        scene.add.zone(0,0,
                            5*2*GRID_SIZE+2*GRID_SIZE/6,
                            3*2*GRID_SIZE+2*GRID_SIZE/8)
                            .setOrigin(0,0)
                    );
                }},
                NE: {create: () => {
                    walls.add(
                        scene.add.zone(SCREEN_WIDTH,0,
                            5*2*GRID_SIZE+2*GRID_SIZE/6,
                            3*2*GRID_SIZE+2*GRID_SIZE/8)
                            .setOrigin(1,0)
                    );
                }},
                SW: {create: () => {
                    walls.add(
                        scene.add.zone(0,6*2*GRID_SIZE+2*GRID_SIZE/8,
                            5*2*GRID_SIZE+2*GRID_SIZE/6,
                            3*2*GRID_SIZE)
                            .setOrigin(0,0)
                    );
                }},
                SE: {create: () => {
                    walls.add(
                        scene.add.zone(SCREEN_WIDTH,6*2*GRID_SIZE+2*GRID_SIZE/8,
                            5*2*GRID_SIZE+2*GRID_SIZE/6,
                            3*2*GRID_SIZE)
                            .setOrigin(1,0)
                    );
                }},
                N: {create: () => {
                    walls.add(
                        scene.add.zone(0,0,
                            SCREEN_WIDTH,
                            3*2*GRID_SIZE+2*GRID_SIZE/8)
                            .setOrigin(0,0)
                    );
                }},
                W: {create: () => {
                    walls.add(
                        scene.add.zone(0,-GRID_SIZE,
                            5*2*GRID_SIZE+2*GRID_SIZE/6,
                            SCREEN_HEIGHT*2*GRID_SIZE)
                            .setDepth(DEPTHS.FG)
                            .setOrigin(0,0)
                    );
                }},
                S: {create: () => {
                    walls.add(
                        scene.add.zone(0,SCREEN_HEIGHT,
                            SCREEN_WIDTH,
                            2.75*GRID_SIZE)
                            .setOrigin(0,1)
                    );
                }},
                E: {create: () => {
                    walls.add(
                        scene.add.zone(SCREEN_WIDTH,-GRID_SIZE,
                            5*2*GRID_SIZE+2*GRID_SIZE/6,
                            SCREEN_HEIGHT*2*GRID_SIZE)
                            .setOrigin(1,0)
                    );
                }},
            };

            if (room_letter !== 0 && room_number !== 1) {
                WALLS_ENUM.NW.create();
            }

            if (room_letter !== 0 && room_number !== 4) {
                WALLS_ENUM.NE.create();
            }

            if (room_letter !== 3 && room_number !== 1) {
                WALLS_ENUM.SW.create();
            }

            if (room_letter !== 3 && room_number !== 4) {
                WALLS_ENUM.SE.create();
            }
            if (room_letter === 0) {
                if (room_number == 1 && open_door) {
                    walls.add(
                        scene.add.zone(SCREEN_WIDTH,0,
                            5*2*GRID_SIZE+2*GRID_SIZE/6+11*SPRITE_SCALE,
                            3*2*GRID_SIZE+2*GRID_SIZE/8)
                            .setOrigin(1,0)
                    );
                    walls.add(
                        scene.add.zone(0,0,
                            5*2*GRID_SIZE+2*GRID_SIZE/6+10*SPRITE_SCALE,
                            3*2*GRID_SIZE+2*GRID_SIZE/8)
                            .setOrigin(0,0)
                    );
                } else {
                    WALLS_ENUM.N.create();
                }
            }
            if (room_number === 1) {
                WALLS_ENUM.W.create();
            }
            if (room_letter === 3) {
                WALLS_ENUM.S.create();
            }
            if (room_number === 4) {
                WALLS_ENUM.E.create();
            }
        };
        set_up_room();

        let disabled_exit = null;
        exits.add(
            scene.add.zone(0,0,SCREEN_WIDTH,2*GRID_SIZE)
                .setOrigin(0,1)
                .setData('direction',{dx: 0, dy: -1, reset: (player) => {
                        player.setY(SCREEN_HEIGHT - exit_box_y_offset - 2*SPRITE_SCALE);
                    }})
        );
        exits.add(
            scene.add.zone(0,SCREEN_HEIGHT,SCREEN_WIDTH,2*GRID_SIZE)
                .setOrigin(0,0)
                .setData('direction',{dx: 0, dy: 1, reset: (player) => {
                        player.setY(2*SPRITE_SCALE-exit_box_y_offset);
                    }})
        );
        exits.add(
            scene.add.zone(0,0,2*GRID_SIZE,SCREEN_HEIGHT)
                .setOrigin(1,0)
                .setData('direction',{dx: -1, dy: 0, reset: (player) => {
                        player.setX(SCREEN_WIDTH - 2*GRID_SIZE);
                    }})
        );
        exits.add(
            scene.add.zone(SCREEN_WIDTH,0,2*GRID_SIZE,SCREEN_HEIGHT)
                .setOrigin(0,0)
                .setData('direction',{dx: 1, dy: 0, reset: (player) => {
                        player.setX(2*GRID_SIZE);
                    }})
        );

        let sam_shadow = scene.add.sprite(0,-14*SPRITE_SCALE,'samantha',0)
            .setPipeline('Light2D')
            .setScale(SPRITE_SCALE)
            .setAlpha(0.5);
        let sam = scene.add.sprite(0,-14*SPRITE_SCALE, 'samantha', 1)
            .setPipeline('Light2D')
            .setScale(SPRITE_SCALE);

        let exit_box = scene.add.zone(0,exit_box_y_offset, 4*SPRITE_SCALE,4*SPRITE_SCALE);
        scene.physics.world.enable(exit_box);
        solid_box = scene.add.container(x, y+14*SPRITE_SCALE, [sam_shadow, sam, exit_box]);
        solid_box.setSize(14*SPRITE_SCALE, 4*SPRITE_SCALE)
            .setDepth(DEPTHS.MG);
        scene.physics.world.enable(solid_box);
        scene.physics.add.collider(solid_box, walls);
        scene.physics.add.overlap(exit_box, exits, (exit_box, exit) => {
            if (exit === disabled_exit) {
                //console.log('exit squashed');
                return;
            }
            disabled_exit = exit;
            let direction = exit.getData('direction');
            room_number += direction.dx;
            room_letter += direction.dy;
            direction.reset(solid_box);
            if (room_letter < 0) {
                player_state_handler.changeState(PLAYER_STATES.ANIMATION);
                scene.cameras.main.resetFX(1000, 0, true);
                scene.add.rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000)
                    .setOrigin(0, 0)
                    .setDepth(DEPTHS.UI + 100)
                    .setScrollFactor(0);
                scene.add.text(x, y, "escaped", getFont("center", GRID_SIZE * 2, "#ffffff"))
                    .setOrigin(0.5, 0.5)
                    .setDepth(DEPTHS.UI + 100)
                    .setScrollFactor(0);

                addButton(scene.add.text(
                    x,
                    y + GRID_SIZE*2,
                    'retry', getFont("center", GRID_SIZE * 2, "#ffffff"))
                    .setOrigin(0.5,0.5)
                    .setDepth(DEPTHS.UI + 100)
                    .setScrollFactor(0), () => { scene.scene.restart(); } );
                return;
            }
            scene.time.delayedCall(500, () => {disabled_exit = null;})
            set_up_room();

        });

        let ghost_shadow = scene.add.sprite(x,y,'samantha',0)
            .setPipeline('Light2D')
            .setScale(SPRITE_SCALE)
            .setAlpha(0.5)
            .setVisible(false)
            .setDepth(DEPTHS.BG+1);
        let ghost = scene.add.sprite(x, y - 8*SPRITE_SCALE,'ghost',0)
            .setPipeline('Light2D')
            .setScale(SPRITE_SCALE)
            .setAlpha(0.75)
            .setVisible(false)
            .setDepth(DEPTHS.MG + (y+14*SPRITE_SCALE));
        ghost.play('ghost-float');

        let cursor_keys = scene.input.keyboard.createCursorKeys();
        cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        cursor_keys.interact = scene.input.keyboard.addKey("e");
        cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        PLAYER_STATES={
            'MOVING': {
                player_ui_enabled: true,
                player_idle_enabled: false,
                player_control_enabled: true,
                enter: () => {
                    sam.play('sam-walk');
                },
                exit: () => {
                    solid_box.body.setVelocity(0);
                    sam.anims.stop()
                    sam.setFrame(1);
                }
            },
            'MOVING_TO_IDLE': {
                player_ui_enabled: true,
                player_idle_enabled: false,
                player_control_enabled: true,
                enter: (handler) => {
                    sam.play('sam-lookaround');
                    sam.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        handler.changeState(PLAYER_STATES.IDLE);
                    });
                },
                exit:() => {
                    sam.anims.stop();
                    sam.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
                }
            },
            'IDLE': {
                player_ui_enabled: true,
                player_idle_enabled: true,
                player_control_enabled: true,
                enter: (handler) => {
                    sam.setFrame(1);
                    player_state_handler.addEvent({
                        delay: 5000,
                        loop: true,
                        callback: () => {
                            if (!handler.getState().player_idle_enabled) { return; }
                            let animation = Phaser.Utils.Array.GetRandom([
                                'sam-blink',
                                'sam-blink',
                                'sam-blink',
                                'sam-lookaround',
                            ]);
                            sam.play(animation);
                        }
                    });
                },
                exit: () => {
                    sam.anims.stop();
                }
            },
            'UI': {
                player_ui_enabled: true,
                player_idle_enabled: true,
                player_control_enabled: false,
            },
            'ANIMATION': {
                player_ui_enabled: false,
                player_idle_enabled: false,
                player_control_enabled: false,
            },
            'INTERACTING' : {
                player_ui_enabled: true,
                player_idle_enabled: false,
                player_control_enabled: true,
                enter: () => {
                    //edge triggered interact
                    //console.log('Enter Interact');
                    scene.physics.overlap(solid_box, interactives, (solid_box, interactive) => {
                        if (interactive.__interact) {
                            interactive.__interact();
                        }
                    });
                },
                update: () => {
                    //continuous triggered interact
                },
                exit: () => {
                    //console.log('Exit Interact');
                }
            }
        }
        player_state_handler = stateHandler(scene, PLAYER_STATES.MOVING_TO_IDLE);

        let monsters = [
            {x: 0, y: 0, visible: false, moving: false},
            {x: 2, y: 3, visible: false, moving: false},
            //{x: 3, y: 1, visible: false, moving: false},
        ];
        let monster_trigger = (monster) => {
            let delay = Phaser.Utils.Array.GetRandom([1000,2000,3000,4000,5000]);
            let duration = Phaser.Utils.Array.GetRandom([250,500,750]);
            scene.time.delayedCall(delay, () => {
                monster.visible = true;
                monster_trigger(monster);
                scene.time.delayedCall(duration, () => {
                    monster.visible = false;
                })
            })
        };
        let monster_trigger_move = (monster) => {
            let delay = Phaser.Utils.Array.GetRandom([5000, 6000, 7000, 8000, 9000, 10000]);
            let duration = Phaser.Utils.Array.GetRandom([250,500,750]);
            scene.time.delayedCall(delay, () => {
                let possible_moves = [];
                if (monster.x !== 0) {
                    possible_moves.push({dx: -1, dy: 0})
                }
                if (monster.x !== 3) {
                    possible_moves.push({dx: 1, dy: 0})
                }
                if (monster.y !== 0) {
                    possible_moves.push({dx: 0, dy: -1})
                }
                if (monster.y !== 3) {
                    possible_moves.push({dx: 0, dy: 1})
                }
                if (monster.x !== room_number - 1 ||
                    monster.y !== room_letter) {
                    let move = Phaser.Utils.Array.GetRandom(possible_moves);
                    monster.x += move.dx;
                    monster.y += move.dy;
                    monster.moving = true;
                }
                monster_trigger_move(monster);
                scene.time.delayedCall(duration, () => {
                    monster.moving = false;
                })
            })
        };
        for (let monster of monsters) {
            monster_trigger(monster);
            monster_trigger_move(monster);
        }

        let ghost_offset = -8*GRID_SIZE;

        let reception = 10;
        let reception_change_trigger = () => {
            let delay = Phaser.Utils.Array.GetRandom([1,2,3]);
            delay *= 1000
            scene.time.delayedCall(delay, () => {
                let change = [0];
                if (reception > 10) { change.push(-1); }
                if (reception < 12) { change.push(1); }
                reception += Phaser.Utils.Array.GetRandom(change)
                reception_change_trigger();
            })
        };
        reception_change_trigger();

        let keypad = scene.add.sprite(x,y,'keypad',0)
            .setAlpha(0)
            .setScale(SPRITE_SCALE)
            .setDepth(DEPTHS.UI+2);
        let keypad_numbers = [
            scene.add.sprite(x-13*SPRITE_SCALE,y,'keypad',1)
                .setAlpha(0)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI+3),
            scene.add.sprite(x,y,'keypad',1)
                .setAlpha(0)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI+3),
            scene.add.sprite(x+13*SPRITE_SCALE,y,'keypad',1)
                .setAlpha(0)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI+3)];
        for (let keypad_number of keypad_numbers) {
            keypad_number.__set = false;
            keypad_number.__value = 0;
            keypad_number.__last = false;
        }
        keypad_numbers[2].__last = true;
        let phone_icons = scene.add.group({runChildUpdate: true});
        let phone_ui_icon = scene.add.sprite(
            SCREEN_WIDTH - 4 * SPRITE_SCALE,
            SCREEN_HEIGHT - 4 * SPRITE_SCALE,
            'ui', 0)
            .setDepth(DEPTHS.UI)
            .setScale(SPRITE_SCALE)
            .setOrigin(1,1);
        let phone = scene.add.sprite(x,y,'phone',0)
            .setAlpha(0)
            .setScale(SPRITE_SCALE)
            .setDepth(DEPTHS.UI+2);

        let screen_shade = scene.add.rectangle(x,y,SCREEN_WIDTH,SCREEN_HEIGHT,0x000000)
            .setAlpha(0)
            .setDepth(DEPTHS.UI+1);
        screen_shade.setInteractive();

        activate_keypad_screen = () => {
            if (!player_state_handler.getState().player_ui_enabled) { return; }

            phone_icons.add(scene.add.sprite(
                x+3*GRID_SIZE,y-6*GRID_SIZE, 'ui', 1)
                .setDepth(DEPTHS.UI+2)
                .setScale(SPRITE_SCALE)
                .setOrigin(0,1))
            let buttons = [
                {x:-1, y:-1, value: 1},
                {x:0, y:-1, value: 2},
                {x:1, y:-1, value: 3},
                {x:-1, y:0, value: 4},
                {x:0, y:0, value: 5},
                {x:1, y:0, value: 6},
                {x:-1, y:1, value: 7},
                {x:0, y:1, value: 8},
                {x:1, y:1, value: 9},
            ];
            let combination = Phaser.Utils.Array.Shuffle([1,5,8]);
            for (let button of buttons) {
                let keypad_button = scene.add.zone(
                    x - 0.5*SPRITE_SCALE + 13*SPRITE_SCALE*button.x,
                    y + 10.5*SPRITE_SCALE + 12*SPRITE_SCALE*button.y,
                    11*SPRITE_SCALE,
                    11*SPRITE_SCALE)
                    .setDepth(DEPTHS.UI+3)
                    //.setScale(SPRITE_SCALE)
                    .setOrigin(0.5,0.5);
                keypad_button.setInteractive();
                keypad_button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                    if (!allow_keypad) { return false; }
                    for (let keypad_number of keypad_numbers) {
                        if (keypad_number.__set) { continue; }
                        keypad_number.__set = true;
                        keypad_number.__value = button.value;
                        keypad_number.setFrame(button.value);
                        keypad_number.setAlpha(1);
                        if (keypad_number.__last) {
                            let combination_found = true;
                            for (let x = 0; x < 3; x++) {
                                combination_found &&=
                                    keypad_numbers[0].__value === combination[0];
                            }
                            if (!combination_found) {
                                scene.time.delayedCall(500, () => {
                                    for (let keypad_number of keypad_numbers) {
                                        keypad_number.__set = false;
                                        keypad_number.setAlpha(0);
                                    }
                                });
                            } else {
                                open_door = true;
                                set_up_room()
                            }
                        }
                        break;
                    }
                });
                phone_icons.add(keypad_button);
            }

            keypad.setAlpha(1);
            for (let keypad_number of keypad_numbers) {
                keypad_number.setAlpha(
                    keypad_number.__set ? 1 : 0);
            }
            screen_shade.setAlpha(0.75);

            player_state_handler.changeState(PLAYER_STATES.UI);
        };
        keypad.setInteractive();
        keypad.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            //nothing
        });

        let clear_ui_screen = () => {
            keypad.setAlpha(0);
            for(let keypad_number of keypad_numbers) {
                keypad_number.setAlpha(0);
            }
            phone.setAlpha(0);
            screen_shade.setAlpha(0);

            phone_icons.clear(true,true);
        };
        let activate_ui_screen = () => {
            phone.setAlpha(1);
            screen_shade.setAlpha(0.75);
            let x_offset = (room_number - 1) * 8 * SPRITE_SCALE;
            let y_offset = room_letter * 8 * SPRITE_SCALE;
            phone_icons.add(scene.add.sprite(
                x+3*GRID_SIZE,y-6*GRID_SIZE, 'ui', 1)
                .setDepth(DEPTHS.UI+2)
                .setScale(SPRITE_SCALE)
                .setOrigin(0,1))
            phone_icons.add(scene.add.sprite(x + x_offset,y + y_offset,'phone',8)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI+4));
            for(let monster of monsters) {
                let monster_icon = scene.add.sprite(
                    x + monster.x*8*SPRITE_SCALE,
                    y + monster.y*8*SPRITE_SCALE,'phone',9)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.UI+3);
                monster_icon.play('motion_trigger');
                monster_icon.update = () => {
                    monster_icon.setPosition(
                        x + monster.x*8*SPRITE_SCALE,
                        y + monster.y*8*SPRITE_SCALE,);
                    monster_icon.setAlpha(monster.visible || monster.moving ? 1 : 0);
                }
                phone_icons.add(monster_icon);
            }
            let reception_icon = scene.add.sprite(x, y, 'phone', reception)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI+3);
            reception_icon.update = () => {
                reception_icon.setFrame(reception);
            }
            phone_icons.add(reception_icon);
        }
        screen_shade.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            if (!player_state_handler.getState().player_ui_enabled) { return; }
            clear_ui_screen();
            player_state_handler.changeState(PLAYER_STATES.IDLE);
        });
        phone.setInteractive();
        phone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            //nothing
        });
        phone_ui_icon.setInteractive();
        phone_ui_icon.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            if (!player_state_handler.getState().player_ui_enabled) { return; }
            activate_ui_screen();
            player_state_handler.changeState(PLAYER_STATES.UI);
        });

        let death_triggered = false;
        let ghost_attack = () => {
            player_state_handler.changeState(PLAYER_STATES.ANIMATION);
            clear_ui_screen();
            sam.setFrame(1);
            ghost_offset = sam.flipX ? 8 * GRID_SIZE : -8 * GRID_SIZE;
            main_light.setMainLightToFlicker();
            let ghost_attack_charge = () => {
                sam.play('sam-backup');

                let ghost_blink = scene.time.addEvent({
                    delay: 50,
                    loop: true,
                    callback: () => {
                        ghost.setVisible(!ghost.visible);
                        ghost_shadow.setVisible(ghost.visible);
                    }
                });

                scene.cameras.main.shake(5000, 0.002, true);
                solid_box.body.setVelocity(sam.flipX ? GRID_SIZE : -GRID_SIZE, 0);
                sam.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    ghost_blink.remove();
                    ghost.setVisible(true);
                    ghost_shadow.setVisible(ghost.visible);
                    solid_box.body.setVelocity(0);
                    sam.setFrame(30);
                    ghost_offset = sam.flipX ? -1.5 * GRID_SIZE : 1.5 * GRID_SIZE;
                    ghost.setY(solid_box.y - 22 * SPRITE_SCALE);
                    ghost_shadow.setY(solid_box.y - 14 * SPRITE_SCALE);
                    scene.time.delayedCall(750, () => {
                        scene.cameras.main.resetFX(1000, 0, true);
                        scene.add.rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000)
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.UI + 100)
                            .setScrollFactor(0);
                        scene.add.text(x, y, "game over", getFont("center", GRID_SIZE * 2, "#ffffff"))
                            .setOrigin(0.5, 0.5)
                            .setDepth(DEPTHS.UI + 100)
                            .setScrollFactor(0);

                        addButton(scene.add.text(
                            x,
                            y + GRID_SIZE*2,
                            'retry', getFont("center", GRID_SIZE * 2, "#ffffff"))
                            .setOrigin(0.5,0.5)
                            .setDepth(DEPTHS.UI + 100)
                            .setScrollFactor(0), () => { scene.scene.restart(); } );
                    });
                });
            };

            sam.play('sam-turnaround');
            sam.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                sam.setFlipX(!sam.flipX);
                sam.setFrame(20);
            });
            let ghost_blinks = 0;
            let ghost_blink = () => {
                ghost.setVisible(true);
                ghost_shadow.setVisible(ghost.visible);
                scene.time.delayedCall(100, () => {
                    ghost.setVisible(false);
                    ghost_shadow.setVisible(ghost.visible);
                });
                ghost_blinks++
                if (ghost_blinks < 3) {
                    scene.time.delayedCall(1000, ghost_blink);
                } else {
                    ghost_attack_charge();
                }
            }
            ghost_blink();
        }
        let initiate_ghost_attack = () => {
            if (death_triggered) { return; }
            death_triggered = true;
            ghost_attack();
        };
        let delayed_ghost_attack = () => {
            if (death_triggered) { return; }
            death_triggered = true;
            scene.time.delayedCall(1000, ghost_attack);
        }

        let vector = new Phaser.Math.Vector2();
        scene.__update = () => {
            let monster_in_room = false;
            for (let monster of monsters) {
                if (monster.x === room_number - 1 &&
                    monster.y === room_letter) {
                    monster_in_room = true;
                }
            }
            if (monster_in_room) {
                delayed_ghost_attack();
            }

            let input = {
                up: false,
                down: false,
                left: false,
                right: false,
                interact: false,
            };

            vector.x = 0;
            vector.y = 0;
            if (player_state_handler.getState().player_control_enabled) {
                if (cursor_keys.left.isDown ||
                    cursor_keys.letter_left.isDown) {
                    input.left = true;
                    vector.x += -1;
                }
                if (cursor_keys.right.isDown ||
                    cursor_keys.letter_right.isDown) {
                    input.right = true;
                    vector.x += 1;
                }
                if (cursor_keys.up.isDown ||
                    cursor_keys.letter_up.isDown) {
                    input.up = true;
                    vector.y -= 1;
                }
                if (cursor_keys.down.isDown ||
                    cursor_keys.letter_down.isDown) {
                    input.down = true;
                    vector.y += 1;
                }
                if (cursor_keys.interact.isDown) {
                    input.interact = true;
                    //initiate_ghost_attack();
                }

                let moving = vector.x !== 0 || vector.y !== 0;

                if (moving) {
                    if (input.left) { sam.setFlipX(true); }
                    if (input.right) { sam.setFlipX(false); }
                    vector.setLength(GRID_SIZE*5)
                    solid_box.body.setVelocity(vector.x, vector.y);
                    if (player_state_handler.getState() !== PLAYER_STATES.MOVING) {
                        player_state_handler.changeState(PLAYER_STATES.MOVING);
                    }
                }
                else if (!moving && input.interact) {
                    player_state_handler.changeState(PLAYER_STATES.INTERACTING);
                } else {
                    if (player_state_handler.getState() === PLAYER_STATES.MOVING) {
                        player_state_handler.changeState(PLAYER_STATES.MOVING_TO_IDLE);
                    } else if (player_state_handler.getState() === PLAYER_STATES.MOVING_TO_IDLE ||
                        player_state_handler.getState() === PLAYER_STATES.IDLE) {
                        //no-op
                    } else {
                        player_state_handler.changeState(PLAYER_STATES.IDLE);
                    }
                }
            }

            solid_box.setDepth(DEPTHS.MG+solid_box.y);
            ghost.setX(solid_box.x + ghost_offset);
            ghost_shadow.setX(solid_box.x + ghost_offset);
            ghost.setDepth(DEPTHS.MG + (y+14*SPRITE_SCALE));
            ghost.setFlipX(ghost.x > solid_box.x);
        };
    },

    update: function () {
        let scene = this;
        scene.__update();
    },
});

let ControllerScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ControllerScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function (data) {
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
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
    create: function () {
        let scene = this;

        let x = SCREEN_WIDTH/2;
        let y = SCREEN_HEIGHT/2;
        scene.add.sprite(x,y,'logo',1)
            .setScale(SPRITE_SCALE*1.1)
            .setAlpha(0.25);
        scene.add.sprite(x,y,'logo',1)
            .setScale(SPRITE_SCALE*1.05)
            .setAlpha(0.5);
        scene.add.sprite(x,y,'logo',1)
            .setScale(SPRITE_SCALE);
        scene.add.rectangle(x, y + (44*SPRITE_SCALE),
            SCREEN_WIDTH, GRID_SIZE*2+4*SPRITE_SCALE,
            0xFFFFFF)
            .setOrigin(0.5, 0.5);
        scene.add.text(x, y + (42*SPRITE_SCALE), 'GHOSTS, INC.',
            getFont('center', GRID_SIZE*4, "#00acff"))
            .setOrigin(0.5,0.5);
    },

    //--------------------------------------------------------------------------
    update: function () {
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

        scene.load.spritesheet('samantha', 'assets/Samantha.png',
            { frameWidth: 16, frameHeight: 32 });
        scene.load.spritesheet('logo', 'assets/Logo.png',
            { frameWidth: 192, frameHeight: 96 });
        scene.load.spritesheet('ghost', 'assets/Ghost.png',
            { frameWidth: 16, frameHeight: 48 });
        scene.load.spritesheet('bg_prison', 'assets/Prison.png',
            { frameWidth: 15*16, frameHeight: 9*16 });
        scene.load.spritesheet('phone', 'assets/Phone.png',
            { frameWidth: 48, frameHeight: 96 });
        scene.load.spritesheet('keypad', 'assets/Keypad.png',
            { frameWidth: 64, frameHeight: 96 });
        scene.load.spritesheet('ui', 'assets/UI.png',
            { frameWidth: 16, frameHeight: 16 });

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
            scene.scene.start('ControllerScene');
            scene.scene.start('GameScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.anims.create({
            key: 'motion_trigger',
            frames: scene.anims.generateFrameNumbers('phone', { frames: [7,9] }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'sam-walk',
            frames: scene.anims.generateFrameNumbers('samantha',
                { frames: [12, 13, 14, 15, 16, 17, 18, 7, 8, 9, 10, 11] }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'sam-lookaround',
            frames: scene.anims.generateFrameNumbers('samantha',
                { frames: [1, 1, 1, 1, 2, 3, 2, 2, 2, 6, 2, 2, 2, 1, 4, 1, 1, 1, 1, 5, 1] }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });

        scene.anims.create({
            key: 'sam-turnaround',
            frames: scene.anims.generateFrameNumbers('samantha',
                { frames: [1, 1, 1, 1, 2, 3, 2, 2, 2] }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });

        scene.anims.create({
            key: 'sam-backup',
            frames: scene.anims.generateFrameNumbers('samantha',
                { frames: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] }),
            skipMissedFrames: false,
            frameRate: 4,
            repeat: 0
        });

        scene.anims.create({
            key: 'sam-blink',
            frames: scene.anims.generateFrameNumbers('samantha',
                { frames: [5, 1] }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });

        scene.anims.create({
            key: 'ghost-float',
            frames: scene.anims.generateFrameNumbers('ghost',
                { frames: [0,1,2,1] }),
            skipMissedFrames: false,
            frameRate: 4,
            repeat: -1
        })
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: 0x000000,
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
            debug: false,
        }
    },
    scene: [ LoadScene, TitleScene, ControllerScene, GameScene]
};

game = new Phaser.Game(config);
