

let addMainLight = (scene) => {
    let x = SCREEN_WIDTH/2;
    let y = SCREEN_HEIGHT/2;
    scene.add.sprite(x,y,'bg_prison',7)
        .setScale(SPRITE_SCALE)
        .setDepth(DEPTHS.FG+1);
    scene.add.rectangle(
        x-SPRITE_SCALE/2,
        y-GRID_SIZE*5-SPRITE_SCALE*3,
        SPRITE_SCALE*3,
        SPRITE_SCALE*3,
        0xffffff,
        1)
        .setOrigin(0.5,0.5)
        .setDepth(DEPTHS.FG-1);
    let light = scene.lights.addLight(x, y, SCREEN_WIDTH, 0xffffff, 1);
    let setIntensity = (intensity) => {
        //console.log(" " + light.intensity + "->" + intensity);
        light.intensity = intensity;
    }
    let enterLightBlinkShort = (handler) => {
        let light_blinks = 0;
        handler.addEvent({
            delay: 150,
            loop: true,
            callback: () => {
                light_blinks++;
                if (light_blinks > 5) {
                    handler.changeState(LIGHT_STATES.LIGHT_WAIT);
                    return;
                }
                setIntensity(0.25);
                handler.addDelayedCall(75, () => {
                    setIntensity(0.50);
                })
            }
        });
    };

    let enterLightBlinkPermanent = (handler) => {
        handler.addEvent({
            delay: 150,
            loop: true,
            callback: () => {
                setIntensity(0.25);
                handler.addDelayedCall(75, () => {
                    setIntensity(0.50);
                })
            }
        });
    }

    let enterLightWait = (handler) => {
        setIntensity(1);
        let delay = Phaser.Utils.Array.GetRandom([15,30,45,60]);
        delay *= 1000
        handler.addDelayedCall(delay, () => {
            handler.changeState(LIGHT_STATES.LIGHT_BLINK_SHORT);
        })
    };

    let LIGHT_STATES = {
        LIGHT_BLINK_SHORT: {
            enter: enterLightBlinkShort
        },
        LIGHT_WAIT: {
            enter: enterLightWait,
        },
        LIGHT_BLINK_PERMANENT: {
            enter: enterLightBlinkPermanent,
        },
    }
    let lightStateHandler = stateHandler(scene,LIGHT_STATES.LIGHT_WAIT);
    return {
        setMainLightToFlicker: () => {
            lightStateHandler.changeState(LIGHT_STATES.LIGHT_BLINK_PERMANENT);
        }
    }
};

let addSubPanels = (scene) => {
    let x = SCREEN_WIDTH/2;
    let y = SCREEN_HEIGHT/2;
    let PANEL_FIX_TIME = 100;
    let get_sub_panel_info = () => {
        let current_panel = null;
        let panel_light_red = scene.lights.addLight(
            x-GRID_SIZE*4 - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            GRID_SIZE,
            0xff0000,
            1);
        let panel_light_green = scene.lights.addLight(
            x-GRID_SIZE*4 - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            GRID_SIZE,
            0x00ff00,
            1);
        let panel = scene.add.sprite(x,y,'bg_prison',8)
            .setPipeline('Light2D')
            .setScale(SPRITE_SCALE)
            .setDepth(DEPTHS.BG+1);
        let panel_highlight = scene.add.sprite(x,y,'bg_prison',9)
            .setScale(SPRITE_SCALE)
            .setDepth(DEPTHS.BG+2)
            .setVisible(false);
        let panel_light_pixel_red = scene.add.rectangle(
            x-GRID_SIZE*4 - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            SPRITE_SCALE, SPRITE_SCALE, 0xff0000)
            .setOrigin(0.5,0.5)
            .setDepth(DEPTHS.BG+1);
        let panel_light_pixel_green = scene.add.rectangle(
            x-GRID_SIZE*4 - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            SPRITE_SCALE, SPRITE_SCALE, 0x00ff00)
            .setOrigin(0.5,0.5)
            .setDepth(DEPTHS.BG+2);
        return {
            current_panel: current_panel,
            panel_light_red: panel_light_red,
            panel_light_green: panel_light_green,
            panel: panel,
            panel_highlight: panel_highlight,
            panel_light_pixel_red: panel_light_pixel_red,
            panel_light_pixel_green: panel_light_pixel_green
        }
    };
    let sub_panel_info = get_sub_panel_info();

    let get_main_panel_info = () => {
        let current_panel = null;
        let panel_light_red = scene.lights.addLight(
            x + 8*GRID_SIZE - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            GRID_SIZE,
            0xff0000,
            1);
        let panel_light_green = scene.lights.addLight(
            x + 8*GRID_SIZE - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            GRID_SIZE,
            0x00ff00,
            1);
        let panel = {setVisible:()=>{}}
        let panel_highlight = scene.add.sprite(x,y,'bg_prison',15)
            .setScale(SPRITE_SCALE)
            .setDepth(DEPTHS.BG+2)
            .setVisible(false);
        let panel_light_pixel_red = scene.add.rectangle(
            x + 8*GRID_SIZE - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            SPRITE_SCALE, SPRITE_SCALE, 0xff0000)
            .setOrigin(0.5,0.5)
            .setDepth(DEPTHS.BG+1);
        let panel_light_pixel_green = scene.add.rectangle(
            x + 8*GRID_SIZE - SPRITE_SCALE/2,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE,
            SPRITE_SCALE, SPRITE_SCALE, 0x00ff00)
            .setOrigin(0.5,0.5)
            .setDepth(DEPTHS.BG+2);
        return {
            current_panel: current_panel,
            panel_light_red: panel_light_red,
            panel_light_green: panel_light_green,
            panel: panel,
            panel_highlight: panel_highlight,
            panel_light_pixel_red: panel_light_pixel_red,
            panel_light_pixel_green: panel_light_pixel_green
        }
    };
    let main_panel_info = get_main_panel_info();

    let get_panel_states = (panel_info) => {
        let PANEL_STATES = {
            'OFF': {
                enter: (handler) => {
                    panel_info.current_panel.status = panel_info.PANEL_STATUS.OFF;
                    panel_info.panel_light_red.setVisible(false);
                    panel_info.panel_light_pixel_red.setVisible(false);
                    panel_info.panel_light_pixel_green.setVisible(false);
                    panel_info.panel_light_green.setVisible(false);
                }
            },
            'BROKEN': {
                enter: (handler) => {
                    panel_info.current_panel.status = panel_info.PANEL_STATUS.BROKEN;
                    panel_info.panel_light_red.setVisible(true);
                    panel_info.panel_light_pixel_red.setVisible(true);
                    panel_info.panel_light_pixel_green.setVisible(false);
                    panel_info.panel_light_green.setVisible(false);
                    handler.changeState(current_intensity ?
                        PANEL_STATES.BROKEN_OFF : PANEL_STATES.BROKEN_ON)
                }
            },
            'BROKEN_OFF': {
                enter: () => {
                    panel_info.panel_light_red.intensity = 0;
                    panel_info.panel_light_pixel_red.setAlpha(0);
                },
            },
            'BROKEN_ON': {
                enter: () => {
                    panel_info.panel_light_red.intensity = 1;
                    panel_info.panel_light_pixel_red.setAlpha(1);
                },
            },
            'FIXED': {
                enter: () => {
                    panel_info.current_panel.fixing = false;
                    panel_info.current_panel.progress = 0;
                    panel_info.current_panel.status = panel_info.PANEL_STATUS.FIXED;
                    panel_info.panel_light_red.setVisible(false);
                    panel_info.panel_light_pixel_red.setVisible(false);
                    panel_info.panel_light_pixel_green.setVisible(true);
                    panel_info.panel_light_green.setVisible(true);
                }
            },
            'OFF_SCREEN': {
                enter: () => {
                    panel_info.panel.setVisible(false);
                    panel_info.panel_light_red.setVisible(false);
                    panel_info.panel_light_pixel_red.setVisible(false);
                    panel_info.panel_light_pixel_green.setVisible(false);
                    panel_info.panel_light_green.setVisible(false);
                    if (panel_info.current_panel) {
                        panel_info.current_panel.fixing = false;
                    }
                },
            },
            'ON_SCREEN': {
                enter: (handler) => {
                    panel_info.panel.setVisible(true);
                    panel_info.panel_light_red.setVisible(false);
                    panel_info.panel_light_pixel_red.setVisible(false);
                    panel_info.panel_light_pixel_green.setVisible(false);
                    panel_info.panel_light_green.setVisible(false);
                    handler.changeState(panel_info.current_panel.status.state);
                },
            }
        };
        return PANEL_STATES;
    };
    sub_panel_info.PANEL_STATES = get_panel_states(sub_panel_info);
    main_panel_info.PANEL_STATES = get_panel_states(main_panel_info);
    main_panel_info.trigger = () => {
        scene.events.emit(CELL_BLOCK_EVENTS.MAINPANEL_FIXED);
        for (let sub_panel of sub_panels) {
            sub_panel.status = sub_panel_info.PANEL_STATUS.BROKEN;
        }
    };
    sub_panel_info.trigger = () => {
        scene.events.emit(CELL_BLOCK_EVENTS.SUBPANEL_FIXED);
    };

    sub_panel_info.panel_state_handler = stateHandler(scene,
        sub_panel_info.PANEL_STATES.OFF_SCREEN);
    main_panel_info.panel_state_handler = stateHandler(scene,
        main_panel_info.PANEL_STATES.OFF_SCREEN);
    let decorate_panel_status = (panel_info) => {
        panel_info.PANEL_STATUS = {
            'BROKEN': {state: panel_info.PANEL_STATES.BROKEN},
            'FIXED': {state: panel_info.PANEL_STATES.FIXED},
            'OFF': {state: panel_info.PANEL_STATES.OFF},
        };
    };
    decorate_panel_status(sub_panel_info);
    decorate_panel_status(main_panel_info);

    let sub_panels = [
        {x: 2, y: 1, status:sub_panel_info.PANEL_STATUS.OFF, fixing: false, progress: 0},
        {x: 3, y: 2, status:sub_panel_info.PANEL_STATUS.OFF, fixed: false, fixing: false, progress: 0},
        {x: 1, y: 2, status:sub_panel_info.PANEL_STATUS.OFF, fixing: false, progress: 0},
    ];
    let get_current_sub_panel = (player_x, player_y) => {
        for (let panel of sub_panels) {
            if (panel.x === player_x && panel.y === player_y) {
                return sub_panel_info.current_panel = panel;
            }
        }
        return sub_panel_info.current_panel = null;
    };

    let main_panel=
        {x: 0, y: 0, status:main_panel_info.PANEL_STATUS.BROKEN, fixing: false, progress: 0};


    let current_intensity = 1;
    let set_intensity = (panel_info) => {
        if(panel_info.current_panel) {
            if (panel_info.current_panel.status === panel_info.PANEL_STATUS.BROKEN) {
                panel_info.panel_state_handler.changeState(
                    panel_info.PANEL_STATES.BROKEN);
            }
        }
    }
    scene.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            current_intensity = current_intensity ? 0 : 1;
            set_intensity(sub_panel_info);
            set_intensity(main_panel_info);
        }
    });
    let update_interactive = (panel_info) => {
        if(panel_info.current_panel) {
            if (panel_info.current_panel.fixing) {
                panel_info.current_panel.progress += 1;
                if (panel_info.current_panel.progress > PANEL_FIX_TIME) {
                    panel_info.panel_state_handler.changeState(panel_info.PANEL_STATES.FIXED);
                    if (panel_info.trigger) {
                        panel_info.trigger();
                        console.log('trigger!');
                    }
                }
            }
        }
    }
    scene.time.addEvent({
        delay: 50,
        loop: true,
        callback: () => {
            update_interactive(sub_panel_info);
            update_interactive(main_panel_info);
        }
    });

    let sub_panel_state = (room_group, interactives, player_x, player_y, player_state_handler, solid_box, PLAYER_STATES) => {
        let new_current_panel = get_current_sub_panel(player_x, player_y);
        if (!new_current_panel) {
            sub_panel_info.panel_state_handler.changeState(
                sub_panel_info.PANEL_STATES.OFF_SCREEN);
            sub_panel_info.current_panel = new_current_panel;
            return;
        }

        sub_panel_info.current_panel = new_current_panel;

        let progress_bar = scene.add.rectangle(
            x -GRID_SIZE*4 - SPRITE_SCALE/2 - 2*GRID_SIZE,
            y-GRID_SIZE*4 - 7/2*SPRITE_SCALE - GRID_SIZE,
            4*GRID_SIZE, GRID_SIZE/4, 0xFFFFFFF)
            .setOrigin(0, 0.5)
            .setDepth(DEPTHS.BG+2)
            .setScale(sub_panel_info.current_panel.progress/PANEL_FIX_TIME,1)
            .setVisible(false);
        room_group.add(progress_bar);

        sub_panel_info.panel_state_handler.changeState(
            sub_panel_info.PANEL_STATES.ON_SCREEN);
        let interact_zone = scene.add.zone(
            x-4*GRID_SIZE,
            3*2*GRID_SIZE+2*GRID_SIZE/8,
            2*GRID_SIZE,
            GRID_SIZE)
            .setOrigin(0.5, 0);
        scene.physics.world.enable(interact_zone);
        room_group.add(interact_zone);
        interact_zone.__interact = () => {
            //console.log('clicked!');
        };
        interact_zone.update = () => {
            let interaction_possible = sub_panel_info.current_panel &&
                sub_panel_info.current_panel.status ===
                    sub_panel_info.PANEL_STATUS.BROKEN &&
                player_state_handler.getState().player_control_enabled &&
                scene.physics.overlap(interact_zone, solid_box);
            sub_panel_info.panel_highlight.setVisible(interaction_possible);
            progress_bar.setVisible(sub_panel_info.panel_highlight.visible);
            sub_panel_info.current_panel.fixing = false;
            if (!interaction_possible) {
                return;
            }
            if (player_state_handler.getState() !== PLAYER_STATES.INTERACTING) {
                return;
            }
            sub_panel_info.current_panel.fixing = true;
            progress_bar.setScale(sub_panel_info.current_panel.progress/PANEL_FIX_TIME,1);
        };
        interactives.add(interact_zone);
    }
    let set_panel_state = (room_group, interactives, player_x, player_y, player_state_handler, solid_box, PLAYER_STATES, activate_keypad_screen, open_door) => {
        //sets current_panel

        sub_panel_state(room_group, interactives, player_x, player_y, player_state_handler, solid_box, PLAYER_STATES);

        if (player_x !== 0 || player_y !== 0 ) {
            main_panel_info.panel_state_handler.changeState(
                main_panel_info.PANEL_STATES.OFF_SCREEN);
            main_panel_info.current_panel = null;
            return;
        }

        if (player_x === 0 && player_y === 0) {
            main_panel_info.current_panel = main_panel;
            main_panel_info.panel_state_handler.changeState(
                main_panel_info.PANEL_STATES.ON_SCREEN);

            //special handling for the exit room
            (() => {
                let interact_zone = scene.add.zone(
                    x,
                    3 * 2 * GRID_SIZE + 2 * GRID_SIZE / 8,
                    7 * GRID_SIZE,
                    GRID_SIZE)
                    .setOrigin(0.5, 0);
                scene.physics.world.enable(interact_zone);
                let highlight = scene.add.sprite(x, y, 'bg_prison', 16)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BG + 2)
                    .setVisible(false);
                room_group.add(interact_zone);

                interact_zone.__interact = () => {
                    if (open_door) { return; }
                    activate_keypad_screen();
                };
                interact_zone.update = () => {
                    let interaction_possible = //current_panel &&
                        !open_door &&
                        player_state_handler.getState().player_control_enabled &&
                        scene.physics.overlap(interact_zone, solid_box);
                    highlight.setVisible(interaction_possible);
                };
                interactives.add(interact_zone);
            })();
            (() => {
                let progress_bar = scene.add.rectangle(
                    x + 8*GRID_SIZE - SPRITE_SCALE/2 - 2*GRID_SIZE,
                    y-GRID_SIZE*4 - 7/2*SPRITE_SCALE - GRID_SIZE,
                    4*GRID_SIZE, GRID_SIZE/4, 0xFFFFFFF)
                    .setOrigin(0, 0.5)
                    .setDepth(DEPTHS.BG+2)
                    .setScale(main_panel_info.current_panel.progress/PANEL_FIX_TIME,1)
                    .setVisible(false);
                room_group.add(progress_bar);

                let interact_zone = scene.add.zone(
                    x + 8*GRID_SIZE,
                    3 * 2 * GRID_SIZE + 2 * GRID_SIZE / 8,
                    2 * GRID_SIZE,
                    GRID_SIZE)
                    .setOrigin(0.5, 0);
                scene.physics.world.enable(interact_zone);
                let highlight = scene.add.sprite(x, y, 'bg_prison', 15)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BG + 2)
                    .setVisible(false);
                room_group.add(interact_zone);

                interact_zone.__interact = () => {
                    //console.log('panel dialogue');
                    /*
                    for (let sub_panel of sub_panels) {
                        sub_panel.status = sub_panel_info.PANEL_STATUS.BROKEN;
                    }

                    main_panel_info.panel_state_handler.changeState(
                        main_panel_info.PANEL_STATES.FIXED);
                    */
                };
                interact_zone.update = () => {
                    let interaction_possible = main_panel_info.current_panel &&
                        main_panel_info.current_panel.status ===
                        main_panel_info.PANEL_STATUS.BROKEN &&
                        player_state_handler.getState().player_control_enabled &&
                        scene.physics.overlap(interact_zone, solid_box);
                    main_panel_info.panel_highlight.setVisible(interaction_possible);
                    progress_bar.setVisible(main_panel_info.panel_highlight.visible);
                    main_panel_info.current_panel.fixing = false;
                    if (!interaction_possible) {
                        return;
                    }
                    if (player_state_handler.getState() !== PLAYER_STATES.INTERACTING) {
                        return;
                    }
                    main_panel_info.current_panel.fixing = true;
                    progress_bar.setScale(main_panel_info.current_panel.progress/PANEL_FIX_TIME,1);
                };
                interactives.add(interact_zone);
            })();
        }




    };

    return set_panel_state;
};

//look at all the saved lines