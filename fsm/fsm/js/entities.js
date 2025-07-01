let GAME_INPUT = {
    'interact_event': "GAME_INPUT.interact_event",
};

let addDialogue = (scene_state, dialogue_array, onComplete) => {
    let scene = scene_state.scene;
    let coordinates = scene_state.text_coordinates;

    let font_size = GRID_SIZE/2;
    let max_lines = 4;

    let lines = (string) => {
        return Array.from({ length: max_lines }, () => string);
    }

    let blank_lines = () => {
        return lines("");
    }

    let text_object = scene.add.text(
        coordinates.x - coordinates.width/2 + font_size/2,
        coordinates.y + font_size/2,
        lines("M"),
        getTextFont(coordinates.width - font_size, font_size))
        .setOrigin(0,0)
        .setDepth(DEPTHS.DIALOGUE+1);
    let fitted_height = text_object.height + font_size;
    text_object.setText(blank_lines());
    text_object.y -= fitted_height/2;

    let text_box = scene.add.rectangle(coordinates.x, coordinates.y,
        coordinates.width, fitted_height,
        0x000000, 0.75)
        .setDepth(DEPTHS.DIALOGUE);

    let zone = scene.add.zone(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
        SCREEN_WIDTH, SCREEN_HEIGHT)
        .setDepth(DEPTHS.DIALOGUE+2);
    zone.setInteractive();
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer, localX, localY, event) => {
        scene.events.emit(GAME_INPUT.interact_event);
    });

    let dialogue_lines = dialogue_array;
    let displayed_text = blank_lines();

    let breakDialogue = (text_object, dialogue_lines, max_lines) => {
        let text_sections = [];
        for (let line of dialogue_lines) {
            text_object.setText(line);
            let text_lines = text_object.getWrappedText();
            let current_section = [];
            text_sections.push(current_section);
            for (let text_line of text_lines) {
                if (current_section.length === max_lines) {
                    current_section = [];
                    text_sections.push(current_section);
                }
                current_section.push(text_line);
            }
            while (current_section.length < max_lines) {
                current_section.push('');
            }
        }
        text_object.setText("")
        return text_sections;
    };
    let text_array = breakDialogue(text_object, dialogue_lines, max_lines);

    let current_section_index = 0;

    let enterStartDialogue = (handler) => {
        text_box.setAlpha(0.5);
        handler.addDelayedCall(250, () => {
            handler.changeState(DIALOGUE_STATES.ADD_CHARACTER)
        });
    };

    let find_line_to_add_character = () => {
        let current_section = text_array[current_section_index];
        for(let x = 0; x < current_section.length; x++) {
            if(displayed_text[x].length < current_section[x].length) {
                return x;
            }
        }
        return displayed_text.length;
    };
    let addCharacter = (line) => {
        let current_line = text_array[current_section_index][line];
        //console.log(current_line)
        let displayed_line_length = displayed_text[line].length;
        displayed_text[line] += current_line[displayed_line_length];
        text_object.setText(displayed_text);
    };

    let enterAddCharacter = (handler) => {
        let line = find_line_to_add_character();
        if (line >= displayed_text.length) {
            handler.changeState(DIALOGUE_STATES.SECTION_FINISH)
            return;
        }
        addCharacter(line);
        handler.changeState(DIALOGUE_STATES.INTRA_CHACTER)
    };

    let enterSectionFinish = (handler) => {
        text_object.setText(text_array[current_section_index]);
        current_section_index += 1;
        if (current_section_index >= text_array.length)
        {
            handler.changeState(DIALOGUE_STATES.FINISH_DIALOGUE_WAIT);
        } else {
            handler.changeState(DIALOGUE_STATES.INTRA_SECTION_WAIT);
        }
    };

    let enterIntraSectionWait = (handler) => {
        handler.addDelayedCall(5000, () => {
            handler.changeState(DIALOGUE_STATES.ADD_CHARACTER);
        })
    };
    let exitIntraSectionWait = () => {
        text_object.setText('')
        displayed_text = blank_lines();
    };

    let enterIntraCharacter = (handler) => {
        handler.addDelayedCall(50, () => {
            handler.changeState(DIALOGUE_STATES.ADD_CHARACTER);
        })
    };

    let enterCloseDialogue = () => {
        text_box.destroy();
        text_object.destroy();
        zone.destroy();
        scene.events.off(GAME_INPUT.interact_event, advanceText);
        onComplete();
    };

    let enterFinishDialogueWait = (handler) => {
        handler.addDelayedCall(5000, () => {
            handler.changeState(DIALOGUE_STATES.CLOSE_DIALOGUE);
        })
    }

    let DIALOGUE_STATES = {
        START_DIALOGUE: {
            enter: enterStartDialogue
        },
        ADD_CHARACTER: {
            enter: enterAddCharacter,
        },
        INTRA_CHACTER: {
            enter: enterIntraCharacter,
        },
        SECTION_FINISH: {
            enter: enterSectionFinish,
        },
        INTRA_SECTION_WAIT: {
            enter: enterIntraSectionWait,
            exit: exitIntraSectionWait,
        },
        FINISH_DIALOGUE_WAIT: {
            enter: enterFinishDialogueWait,
        },
        CLOSE_DIALOGUE: {
            enter: enterCloseDialogue,
        }
    };

    let advanceText = () => {
        if (textStateHandler.getState() === DIALOGUE_STATES.FINISH_DIALOGUE_WAIT) {
            textStateHandler.changeState(DIALOGUE_STATES.CLOSE_DIALOGUE);
            return;
        }
        if (textStateHandler.getState() === DIALOGUE_STATES.INTRA_SECTION_WAIT) {
            textStateHandler.changeState(DIALOGUE_STATES.ADD_CHARACTER);
            return;
        }
        textStateHandler.changeState(DIALOGUE_STATES.SECTION_FINISH);
    };
    scene.events.on(GAME_INPUT.interact_event, advanceText);

    let textStateHandler = stateHandler(scene,DIALOGUE_STATES.START_DIALOGUE);
};


let getLogoFont = (align = "center", fontSize = 36, color="#000000", wrap_length= SCREEN_WIDTH/2) => {
    return {font: '' + fontSize + 'px m5x7', fill: color, align: align,
        wordWrap: {width: wrap_length, useAdvancedWrap: true}};
};

let addLogo =  (scene) => {
    scene.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - (48),
        "made with",
        getLogoFont()
    ).setOrigin(0.5, 0.5);
    let current_frame = 0;
    let logo = scene.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
        "phaser_logo"
    ).setOrigin(0.5, 0.5)
        .setScale(3);
    scene.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
        "phaser_logo"
    ).setOrigin(0.5, 0.5)
        .setScale(3)
        .setAlpha(0.25);

    let logo_states = {
        IDLE: {
            enter: (handler) => {
                current_frame = 0;
                logo.setFrame(0)
                handler.addDelayedCall(2000, () => {
                    handler.changeState(logo_states.FLICKER);
                })
            }
        },
        FLICKER: {
            enter: (handler) => {
                handler.addEvent({
                    delay: 50,
                    loop: true,
                    callback: () => {
                        current_frame = current_frame ? 0 : 1;
                        logo.setFrame(current_frame);
                    }
                });
                handler.addDelayedCall(350, () => {
                    handler.changeState(logo_states.OFF);
                })
            },
        },
        OFF: {
            enter: (handler) => {
                current_frame = 1;
                logo.setFrame(1);
                handler.addDelayedCall(500, () => {
                    handler.changeState(logo_states.FLICKER_ON);
                })
            }
        },
        FLICKER_ON: {
            enter: (handler) => {
                handler.addEvent({
                    delay: 50,
                    loop: true,
                    callback: () => {
                        current_frame = current_frame ? 0 : 1;
                        logo.setFrame(current_frame);
                    }
                });
                handler.addDelayedCall(150, () => {
                    handler.changeState(logo_states.IDLE);
                })
            },
        },
    };
    stateHandler(scene, logo_states.OFF);
};