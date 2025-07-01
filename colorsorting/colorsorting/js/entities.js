
let addLogo =  (scene) => {
    scene.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - GRID_SIZE,
        "made with",
        getLogoFont()
    ).setOrigin(0.5, 0.5);
    let current_frame = 0;
    let logo = scene.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
        "phaser_logo"
    ).setOrigin(0.5, 0.5)
        .setScale(2);
    scene.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
        "phaser_logo"
    ).setOrigin(0.5, 0.5)
        .setScale(2)
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