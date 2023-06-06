let addLetterArray = (scene, text, x, y) => {
    let letters = [];
    for (let i = 0; i < text.length; i++) {
        let char_spacing = GRID_SIZE/5;
        let offset = text.length/2 * char_spacing;
        let letter = scene.add.text(x - offset + i*char_spacing,
            y,
            text.charAt(i),
            {
                color: COLORS.HEX_BLACK,
                font: GRID_SIZE / 4 + 'px CourierPrime',
                align: 'center'
            })
            .setAlpha(0)
            .setOrigin(0.5, 0.5);

        letters.push(letter);

        let enter_appearance_fast = () => {
            letter.autoRound = true;
            scene.tweens.add({
                targets: letter,
                alpha: 1,
                duration: 800,
                onComplete: () => {
                    letter.__state_handler.changeState(STATES.GLITCH);
                }
            });
        };
        let enter_appearance = () => {
            letter.autoRound = true;
            scene.tweens.add({
                targets: letter,
                alpha: 1,
                duration: Phaser.Math.Between(1600,2400),
                delay: Phaser.Math.Between(800,1800),
            });
        };

        let enter_glitch = () => {
            let glitch = [
                (delay) => {
                    letter.__state_handler.addTweenSequence(
                        [{
                            targets: letter,
                            duration: delay,
                            alpha: 1,
                        },
                            {
                                targets: letter,
                                duration: 50,
                                alpha: 0.25,
                                yoyo: true
                            },
                            {
                                targets: letter,
                                duration: 50,
                                alpha: 0.25,
                                yoyo: true
                            },
                            {
                                targets: letter,
                                duration: 50,
                                alpha: 0.25,
                                yoyo: true,
                                onComplete: schedule_glitch
                            }]);
                },
                (delay) => {
                    letter.__state_handler.addDelayedCall(delay, () => {
                        letter.flipX = true;
                    });
                    letter.__state_handler.addDelayedCall(delay+100, () => {
                        letter.flipX = false;
                        schedule_glitch();
                    });
                },
                (delay) => {
                    letter.__state_handler.addDelayedCall(delay, () => {
                        letter.flipY = true;
                    });
                    letter.__state_handler.addDelayedCall(delay+100, () => {
                        letter.flipY = false;
                        schedule_glitch();
                    });
                }
            ];

            let schedule_glitch = () => {
                let func = Phaser.Utils.Array.GetRandom(glitch);
                func(Phaser.Utils.Array.GetRandom([3000, 5000, 8000]));
            };
            schedule_glitch();
        };

        let exit_glitch = () => {
            letter.flipY = false;
            letter.flipX = false;
            letter.alpha = 1;
        };

        let enter_fade_out = () => {
            letter.__state_handler.addTween({
                targets: letter,
                duration: 100,
                alpha: 0.25
            });
        };

        let exit_fade_out = () => {
            letter.setAlpha(0.25)
        };

        let enter_fade_in = () => {
            letter.__state_handler.addTween({
                targets: letter,
                duration: 100,
                alpha: 1
            });
        };

        let exit_fade_in = () => {
            letter.setAlpha(1)
        };

        let enter_visible = () => {
            letter.setAlpha(1)
        };

        let STATES = {
            INVISIBLE: {enter: null, exit: null},
            APPEARANCE: {enter: enter_appearance, exit: null},
            APPEARANCE_FAST: {enter: enter_appearance_fast, exit: null},
            GLITCH: {enter: enter_glitch, exit: exit_glitch},
            FADE_OUT: {enter: enter_fade_out, exit: exit_fade_out},
            FADE_IN: {enter: enter_fade_in, exit: exit_fade_in},
            VISIBLE: {enter: enter_visible, exit: null},
        };
        letter.__state_handler = stateHandler(scene, STATES, STATES.INVISIBLE);
        letter.__state_handler.start();
        letter.__STATES = STATES;
    }
    return letters;
};