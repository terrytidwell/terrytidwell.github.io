
const GRID_SIZE = 16*5
const SCREEN_HEIGHT = 1080;
const SCREEN_WIDTH = 1920;

const DEPTHS = {
    CARD: 1000,
    SELECTED_CARD: 1500,
    UI: 2000,
};


let get_new_gamestate = () => {
    return {
        current_page: 0,
        collected_lantern: false,
        lantern_in_wood: false,
    }
};

let getFont = (align = "left", fontSize = GRID_SIZE) => {
    let color = '#000000'; //'#8ae234';
    return {font: '' + fontSize + 'px IMFellDWPica-Regular', fill: color, align: align,
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

        let page_objects = scene.add.group();

        let fade_in_page_objects = () => {
            for(let page_object of page_objects.children.entries) {
                page_object.setAlpha(0);
            }
            scene.tweens.add({
                targets: page_objects.children.entries,
                alpha: 1,
                duration: 500,
            });
        };
        let delete_page_objects = () => {
            page_objects.clear(true,true);
        };

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;

        let x = SCREEN_WIDTH/2;
        let y = SCREEN_HEIGHT/2;

        let BOOK_SCALE = 8;
        let ILLUSTRATION_SCALE = 0.375;
        let TITLE_X_OFFSET = 42 * BOOK_SCALE;
        let LEFT_X_OFFSET = -38 * BOOK_SCALE;
        let RIGHT_X_OFFSET = 37 * BOOK_SCALE;
        let ILLUSTRATION_WIDTH = 1080 * ILLUSTRATION_SCALE;
        let ILLUSTRATION_HEIGHT = 1920 * ILLUSTRATION_SCALE;
        let Y_OFFSET = -6 * BOOK_SCALE;
        let LEFT_PAGE_NUM_X_OFFSET = LEFT_X_OFFSET - ILLUSTRATION_WIDTH/2;
        let RIGHT_PAGE_NUM_X_OFFSET = RIGHT_X_OFFSET + ILLUSTRATION_WIDTH/2;
        let PAGE_NUM_Y_OFFSET = Y_OFFSET + ILLUSTRATION_HEIGHT / 2;
        let book = scene.add.sprite(x,y,'book',0)
            .setScale(BOOK_SCALE);

        let allow_press = true;
        let game_state = get_new_gamestate();

        let arrows = [];
        arrows.push(scene.add.image(x+(190*BOOK_SCALE/2),y,'arrow')
            .setOrigin(0,0.5));
        arrows.push(scene.add.image(x-(190*BOOK_SCALE/2),y,'arrow')
            .setOrigin(1,0.5)
            .setFlipX(true));
        arrows[0].setInteractive();
        arrows[1].setInteractive();


        let page_nums = []
        page_nums.push(scene.add.text(
            x + LEFT_PAGE_NUM_X_OFFSET,
            y + PAGE_NUM_Y_OFFSET, ['0'],
            getFont('right',GRID_SIZE/2))
            .setOrigin(1,0));
        page_nums.push(scene.add.text(
            x + RIGHT_PAGE_NUM_X_OFFSET,
            y + PAGE_NUM_Y_OFFSET, ['0'],
            getFont('left',GRID_SIZE/2))
            .setOrigin(0,0));

        let page_num_init = () => {
            book.setFrame(game_state.current_page === 0 ? 0 : 3);

            page_nums[0].setAlpha(game_state.current_page === 0 ? 0 : 1);
            page_nums[1].setAlpha(game_state.current_page === 0 ? 0 : 1);
            page_nums[0].setText(''+((game_state.current_page * 2)-1)+'');
            page_nums[1].setText(''+((game_state.current_page * 2))+'');
        }
        let page_nums_enter = () => {
            scene.tweens.add({
                targets: arrows,
                alpha: 1,
                duration: 500,
                onComplete : () => {
                    allow_press = true;
                }
            });
            if (game_state.current_page === 0) { return; }
            page_nums[0].setText(''+((game_state.current_page * 2)-1)+'');
            page_nums[1].setText(''+((game_state.current_page * 2))+'');
            scene.tweens.add({
                targets: page_nums,
                alpha: 1,
                duration: 500,
            });
        }

        let page_nums_exit = () => {
            page_nums[0].setAlpha(0);
            page_nums[1].setAlpha(0);
            arrows[0].setAlpha(0);
            arrows[1].setAlpha(0);
        }
        page_num_init();

        let pages = {};
        pages[0] = (() => {
            let init_func = () => {
                scene.cameras.main.scrollX = RIGHT_X_OFFSET;
                let title = scene.add.text(x + TITLE_X_OFFSET, y-(48*BOOK_SCALE), ['','untitled'], getFont('center',GRID_SIZE*1.5))
                    .setOrigin(0.5,0)
                let metrics = title.getTextMetrics();
                page_objects.add(title);
                page_objects.add(
                    scene.add.rectangle(
                        x + TITLE_X_OFFSET,
                        y-(48*BOOK_SCALE) + metrics.fontSize,
                        ILLUSTRATION_WIDTH,
                        BOOK_SCALE,
                        0x000000)
                        .setOrigin(0.5,0.5)
                );
                page_objects.add(
                    scene.add.rectangle(
                        x + TITLE_X_OFFSET,
                        y-(48*BOOK_SCALE) + metrics.fontSize * 2,
                        ILLUSTRATION_WIDTH,
                        BOOK_SCALE,
                        0x000000)
                        .setOrigin(0.5,0.5)
                );
            }

            return {
                init: init_func,
                enter: () => {
                    init_func();
                    fade_in_page_objects();
                },
                exit: () => {
                    delete_page_objects();
                }
            }

        })();
        pages[1] = (() => {
            let text_offset = y-(48*BOOK_SCALE)-GRID_SIZE;

            let init_func = () => {
                if (!game_state.collected_lantern) {
                    let lantern = scene.add.sprite(
                        x + RIGHT_X_OFFSET, y, 'lamp_item', 0)
                        .setScale(ILLUSTRATION_SCALE);
                    page_objects.add(
                        lantern
                    );
                    lantern.setInteractive();
                    lantern.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                        if (game_state.collected_lantern) { return; }
                        lantern.setAlpha(0);
                        game_state.collected_lantern = true;
                    });
                }
                let title_text = scene.add.text(
                    x + RIGHT_X_OFFSET,
                    text_offset,
                    ['','untitled'],
                    getFont('center', GRID_SIZE*1.5))
                    .setOrigin(0.5,0);
                let metrics = title_text.getTextMetrics();
                page_objects.add(
                    title_text
                );
                page_objects.add(
                    scene.add.rectangle(
                        x + RIGHT_X_OFFSET,
                        text_offset + metrics.fontSize,
                        ILLUSTRATION_WIDTH,
                        BOOK_SCALE,
                        0x000000)
                        .setOrigin(0.5,0.5)
                );
                page_objects.add(
                    scene.add.rectangle(
                        x + RIGHT_X_OFFSET,
                        text_offset + metrics.fontSize * 2,
                        ILLUSTRATION_WIDTH,
                        BOOK_SCALE,
                        0x000000)
                        .setOrigin(0.5,0.5)
                );
                page_objects.add(
                    scene.add.text(x + RIGHT_X_OFFSET,
                        y + 512*ILLUSTRATION_SCALE/2,
                        ['lantern publishing',
                        'copyright',
                        'MDCCCXXXIV'],
                        getFont('center', GRID_SIZE*0.5))
                    .setOrigin(0.5,0)
                );
                page_objects.add(
                    scene.add.text(x + LEFT_X_OFFSET - ILLUSTRATION_WIDTH/2,
                        y - (48*BOOK_SCALE),
                        [
                            '',
                            '',
                            '',
                            'All the world\'s a stage,',
                            'And all the men and women merely players;',
                            'They have their exits and their entrances,',
                            'And one man in his time plays many parts.'
                        ],
                        getFont('left', GRID_SIZE*0.25))
                    .setOrigin(0,0)
                );
                page_objects.add(
                    scene.add.text(x + LEFT_X_OFFSET + ILLUSTRATION_WIDTH/2,
                        y - (48*BOOK_SCALE),
                        [
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '-William Shakespeare'
                        ],
                        getFont('right', GRID_SIZE*0.25))
                        .setOrigin(1,0)
                );
            }

            return {
                init: init_func,
                enter: () => {
                    init_func();
                    fade_in_page_objects();
                },
                exit: () => {
                    delete_page_objects();
                }
            }
        })();
        pages[2] = (() => {
            let init_func = () => {
                let illustration = scene.add.sprite(
                    x + LEFT_X_OFFSET,
                    y + Y_OFFSET,
                    'illustration_woods'
                    ,0)
                    .setScale(ILLUSTRATION_SCALE);
                page_objects.add(
                    illustration
                );

                let add_lantern = () => {
                    let lamp_shadow = scene.add.sprite(
                        x + LEFT_X_OFFSET - 5 * BOOK_SCALE,
                        y + Y_OFFSET + 28 * BOOK_SCALE,
                        'lamp_item', 1)
                        .setScale(ILLUSTRATION_SCALE/2);
                    page_objects.add(
                        lamp_shadow
                    );
                    page_objects.add(
                        scene.add.sprite(
                            x + LEFT_X_OFFSET - 5 * BOOK_SCALE,
                            y + Y_OFFSET + 28 * BOOK_SCALE,
                            'lamp_item', 0)
                            .setScale(ILLUSTRATION_SCALE/2)
                    );
                };
                if (game_state.lantern_in_wood) {
                    add_lantern();
                }

                illustration.setInteractive();
                illustration.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                    if (game_state.lantern_in_wood) { return; }

                    if (!game_state.collected_lantern) { return; }

                    game_state.lantern_in_wood = true;
                    add_lantern();

                });

                page_objects.add(
                    scene.add.text(
                        x + RIGHT_X_OFFSET - ILLUSTRATION_WIDTH/2,
                        y-(48*BOOK_SCALE),
                        [
                            '',
                            '',
                            '',
                            '',
                            'A man wandered the',
                            'woods alone.'
                        ], getFont('left', GRID_SIZE/2))
                    .setOrigin(0,0)
                );
                page_objects.add(
                    scene.add.text(
                        x + RIGHT_X_OFFSET,
                        y-(48*BOOK_SCALE),
                        [
                            'chapter 1',
                            'the woods'
                        ], getFont('center', GRID_SIZE/2))
                    .setOrigin(0.5,0)
                );
            }

            return {
                init: init_func,
                enter: () => {
                    init_func();
                    fade_in_page_objects();
                },
                exit: () => {
                    delete_page_objects();
                }
            }
        })();
        pages[3] = (() => {
            let init_func = () => {
                if (game_state.lantern_in_wood) {
                    page_objects.add(scene.add.text(x + RIGHT_X_OFFSET - ILLUSTRATION_WIDTH/2, y-(48*BOOK_SCALE),
                        [
                            '',
                            '',
                            '',
                            '',
                            '...and guided by the lantern',
                            'light the man found a cabin.',
                            '',
                            '(end of content)'
                        ], getFont('left', GRID_SIZE/2))
                    .setOrigin(0,0));
                    return;
                }

                page_objects.add(scene.add.sprite(x + LEFT_X_OFFSET,y + Y_OFFSET,'illustration_wolf',0)
                    .setScale(ILLUSTRATION_SCALE));
                page_objects.add(scene.add.text(x + RIGHT_X_OFFSET - ILLUSTRATION_WIDTH/2, y-(48*BOOK_SCALE),
                    [
                        '',
                        '',
                        '',
                        '',
                        '...but it was dark, and the',
                        'man was eaten by wolves.'],
                    getFont('left', GRID_SIZE/2))
                    .setOrigin(0,0));
                page_objects.add(scene.add.text(x + RIGHT_X_OFFSET + ILLUSTRATION_WIDTH/2, y-(48*BOOK_SCALE),
                    [
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        'the end.'],
                    getFont('right', GRID_SIZE/2))
                    .setOrigin(1,0));
            }

            return {
                init: init_func,
                enter: () => {
                    init_func();
                    fade_in_page_objects();
                },
                exit: () => {
                    delete_page_objects();
                }
            }

        })();
        pages[game_state.current_page].init();

        let trigger_animation = (prev, next, onComplete) => {
            if(prev === 0) {
                book.play('open');
                scene.tweens.add({
                    targets: scene.cameras.main,
                    scrollX: 0,
                    duration: 250,
                    ease: 'Quad.EaseOut'
                });
            } else if (next === 0) {
                book.play('close');
                scene.tweens.add({
                    targets: scene.cameras.main,
                    scrollX: RIGHT_X_OFFSET,
                    duration: 250,
                    ease: 'Quad.EaseOut'
                });
            } else if (next > prev) {
                book.play('turn');
            } else {
                book.play('turn-reverse');
            }
            book.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                onComplete();
            });
        }

        let next_page = (delta) => {
            if (!allow_press) { return; }
            allow_press = false;
            let prev = game_state.current_page;
            let next = game_state.current_page + delta;
            if (next < 0) { return; }
            game_state.current_page = next;
            let exit = prev in pages && 'exit' in pages[prev] ?
                pages[prev].exit : () => {};
            let page_enter = game_state.current_page in pages && 'enter' in pages[game_state.current_page] ?
                pages[game_state.current_page].enter : () => {};
            let enter = () => {
                page_enter();
                page_nums_enter();
            };
            page_nums_exit()
            exit();

            trigger_animation(prev, game_state.current_page, enter);
        };

        arrows[0].on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            next_page(1);
        });
        arrows[1].on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            next_page(-1);
        });

        scene.__update = () => {
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


let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        scene.load.spritesheet('illustration_woods', 'assets/WoodsNoBg.png',
            { frameWidth: 1080, frameHeight: 1920});
        scene.load.spritesheet('illustration_wolf', 'assets/WolfNoBg.png',
            { frameWidth: 1080, frameHeight: 1920});
        scene.load.spritesheet('lamp_item', 'assets/LampNoBg.png',
            { frameWidth: 256, frameHeight: 512});
        scene.load.spritesheet('book', 'assets/RADL_Edit.png',
            { frameWidth: 190, frameHeight: 160 });
        scene.load.svg('arrow', 'assets/arrow.svg', { scale: 10 });


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
            key: 'open',
            frames: scene.anims.generateFrameNumbers('book',
                { start: 0, end: 3 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });

        scene.anims.create({
            key: 'close',
            frames: scene.anims.generateFrameNumbers('book', { frames: [3, 2, 1, 0] }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });

        scene.anims.create({
            key: 'turn',
            frames: scene.anims.generateFrameNumbers('book',
                { start: 3, end: 7 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
        scene.anims.create({
            key: 'turn-reverse',
            frames: scene.anims.generateFrameNumbers('book', { frames: [7, 6, 5, 4, 3] }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: 0x202020,
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
            debug: false
        }
    },
    scene: [ LoadScene, ControllerScene, GameScene]
};

game = new Phaser.Game(config);
