const GRID_SIZE = 32;
const GRID_ROWS = 15;
const GRID_COLS = 27;
const SCREEN_WIDTH = GRID_COLS * GRID_SIZE;
const SCREEN_HEIGHT = GRID_ROWS * GRID_SIZE;
const FONT = 'px PressStart2P';
const PLAYER_SPEED = GRID_SIZE*4;
const LEGACY_SCALE = 1;
const SPRITE_SCALE = 2;
const DEPTHS = {
    BG: 0,
    FLOOR: 500,
    BG_TERRAIN: 625,
    BG_ENTITY: 750,
    ENTITY: 1000,
    PLAYER: 2000,
    FG: 3000,
    UI: 4000
}

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        let loading_text = scene.add.text(
            SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
            "0%", { font: GRID_SIZE + FONT, fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        scene.load.path = "assets/";
        scene.load.spritesheet('character', 'Parkgirl.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('dog', 'Parkdog.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('dog2', 'Dog2.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('dog3', 'Dog3.png',
            { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('objects', 'objects.png',
            { frameWidth: 14, frameHeight: 14 });
        scene.load.spritesheet('park_objects', 'parkObjects.png',
            { frameWidth: 16, frameHeight: 16 });
        scene.load.spritesheet('maze_objects', 'maze.png',
            { frameWidth: 16, frameHeight: 32 });
        scene.load.spritesheet('hut', 'Hut.png',
            { frameWidth: 98, frameHeight: 64 });
        scene.load.spritesheet('ui', 'UI.png',
            { frameWidth: 15, frameHeight: 15 });
        scene.load.spritesheet('note', 'Note.png',
            { frameWidth: 64, frameHeight: 64 });
        scene.load.spritesheet('bg', 'Amara_background.png',
            { frameWidth: 432, frameHeight: 240 });

        scene.load.image('tree1', 'Tree1.png');
        scene.load.image('tree2', 'Tree2.png');
        scene.load.image('ground', 'ground.png');

        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once(Phaser.Loader.Events.COMPLETE,  function() {
            scene.time.delayedCall(500, () => {
                scene.scene.start('ControllerScene');
            });
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'character_move_anim',
            frames: scene.anims.generateFrameNumbers('character',
                { start: 0, end: 7 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'character_idle_anim',
            frames: scene.anims.generateFrameNumbers('character',
                { start: 8, end: 14 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'dog_move_anim',
            frames: scene.anims.generateFrameNumbers('dog',
                { start: 0, end: 3 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'dog_idle_anim',
            frames: scene.anims.generateFrameNumbers('dog',
                { start: 8, end: 10 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'dog_spin_anim',
            frames: scene.anims.generateFrameNumbers('dog2',
                { start: 0, end: 7 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 2
        });
        scene.anims.create({
            key: 'dog_sit_anim',
            frames: scene.anims.generateFrameNumbers('dog3',
                { start: 0, end: 1 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'hut_open_anim',
            frames: scene.anims.generateFrameNumbers('hut',
                { start: 1, end: 5 }),
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let AREAS = {
    'PARK1': {
        setup : (scene) => {
            scene.__playerCharacter = addPlayer(scene, SCREEN_WIDTH / 2, GRID_SIZE * 12 - 4 * SPRITE_SCALE);
            scene.__dog = addDog(scene, SCREEN_WIDTH / 2 - GRID_SIZE, GRID_SIZE * 12 - 4 * SPRITE_SCALE);

            let floor_height = GRID_SIZE * 12;

            addBackground(scene, floor_height);

            scene.cameras.main.setBounds(-SCREEN_WIDTH, 0, 3*SCREEN_WIDTH, SCREEN_HEIGHT);

            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH / 2, GRID_SIZE * 13 - 9 * SPRITE_SCALE,
                SCREEN_WIDTH * 3, 29 * LEGACY_SCALE,
                0xff00ff, 0.00)
                .setDepth(DEPTHS.FG));
            scene.__floor.add(scene.add.rectangle(-SCREEN_WIDTH - 16, SCREEN_HEIGHT / 2,
                32, SCREEN_HEIGHT,
                0xff00ff, 0.80)
                .setDepth(DEPTHS.FG));
            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH * 2 + 16, SCREEN_HEIGHT / 2,
                32, SCREEN_HEIGHT,
                0xff00ff, 0.80)
                .setDepth(DEPTHS.FG));
            scene.physics.add.collider(scene.__interactables, scene.__floor, (interactable, floor) => {
                interactable.body.setVelocityX(0);
            });


            let addTree = (x, y, image) => {
                let tree = scene.add.sprite(x, y, image)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BG_TERRAIN);
                return tree;
            };

            let addMaze = (x) => {
                let add_sprite = (offset, frame, flipX) => {
                    return scene.add.sprite(x + GRID_SIZE*offset, floor_height, 'maze_objects',frame)
                        .setScale(SPRITE_SCALE)
                        .setFlipX(flipX)
                        .setDepth(DEPTHS.BG_TERRAIN)
                        .setOrigin(0.5,1);
                };

                addTree(-SCREEN_WIDTH / 2 + GRID_SIZE * -8, GRID_SIZE * 12 - 24 * SPRITE_SCALE, 'tree1');

                add_sprite(-7, 4, false);
                add_sprite(-6, 3, false);
                add_sprite(-5, 3, false);
                add_sprite(-4, 3, false);
                add_sprite(-3, 3, false);
                add_sprite(-2, 3, false);
                add_sprite(-1, 0, false);
                let entrance = add_sprite(0, 5, false);
                scene.__interactables.add(entrance);
                entrance.__interact = () => {
                    scene.scene.get('ControllerScene').__change_scene('MAZE_1');
                };
                add_sprite(1, 4, false);
                add_sprite(2, 3, false);
                add_sprite(3, 3, false);
                add_sprite(4, 3, false);
                add_sprite(5, 3, false);
                add_sprite(6, 3, false);
                add_sprite(7, 0, false);
                scene.add.sprite(x + GRID_SIZE*3, floor_height, 'maze_objects',6)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BG_ENTITY)
                    .setOrigin(0.5,1);
                addParkObject(scene, floor_height, x + 1 * GRID_SIZE, 0);
                addParkObject(scene, floor_height, x + -1 * GRID_SIZE, 0);
                addBench(scene, floor_height, x - 3.5 * GRID_SIZE);
            };

            let addHut = (x) => {
                let hut = scene.add.sprite(x, floor_height - 32 * SPRITE_SCALE, 'hut', 0)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BG_ENTITY);
                let door = scene.add.rectangle(x - 5 * SPRITE_SCALE, floor_height,
                    15*SPRITE_SCALE, 16*SPRITE_SCALE, 0xff0000, 0.0)
                    .setOrigin(0.5, 1)
                    .setDepth(DEPTHS.FG);
                scene.__interactables.add(door);
                let openable = true;

                door.__interact = () => {
                    if (openable) {
                        scene.__playerCharacter.__show_locked();
                    } else {
                        scene.scene.get('ControllerScene').__change_scene('HUT');
                    }
                };
                door.__unlock = () => {
                    if (!openable) {
                        return;
                    }
                    openable = false;
                    hut.play('hut_open_anim');
                };
                door.__instant_open = () => {
                    openable = false;
                    hut.setFrame(5);
                };
                return door;
            };

            addBench(scene, floor_height,SCREEN_WIDTH / 2);
            addParkObject(scene, floor_height,SCREEN_WIDTH / 2 + GRID_SIZE, 1);
            for (let x of [3, 17, 21, 22, 25, 29, 37, 42]) {
                addParkObject(scene, floor_height,SCREEN_WIDTH / 2 + x * GRID_SIZE, 2);
            }
            for (let x of [7, 12, 20, 27, 31, 44, 49]) {
                addParkObject(scene, floor_height,SCREEN_WIDTH / 2 + x * GRID_SIZE, 3);
            }
            for (let x of [-3, 5, 7, 36, 40]) {
                addParkObject(scene, floor_height,SCREEN_WIDTH / 2 + x * GRID_SIZE, 0);
            }

            scene.__hut = addHut(SCREEN_WIDTH / 2 + GRID_SIZE * 27);

            addTree(SCREEN_WIDTH / 2 + GRID_SIZE * 4, GRID_SIZE * 12 - 24 * SPRITE_SCALE, 'tree1');
            addTree(SCREEN_WIDTH / 2 - GRID_SIZE * 7, GRID_SIZE * 12 - 24 * SPRITE_SCALE, 'tree2');

            addMaze(-SCREEN_WIDTH/2);


            for (let x = 16 * LEGACY_SCALE -SCREEN_WIDTH; x < SCREEN_WIDTH * 2; x += 32 * LEGACY_SCALE) {
                scene.add.image(x, GRID_SIZE * 13 - 18 * LEGACY_SCALE, 'ground')
                    .setScale(LEGACY_SCALE)
                    .setDepth(DEPTHS.FLOOR);
            }

            scene.__addObject = (x, y, dx, dy, frame) => {
                let bottle = scene.add.sprite(x, y, 'objects', frame)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.FG);
                bottle.__interact = () => {
                    if (!scene.physics.overlap(bottle, scene.__playerCharacter)) {
                        return;
                    }
                    bottle.destroy();
                    scene.__playerCharacter.__pick_up(frame);
                };
                scene.__interactables.add(bottle);
                bottle.body.setGravityY(3 * PLAYER_SPEED);
                bottle.body.setVelocity(dx, dy);
                return bottle;
            };

            scene.__addObject(SCREEN_WIDTH / 2 + GRID_SIZE * 7, GRID_SIZE * 12 - 6 * SPRITE_SCALE,
                0, 0, 1);
            scene.__key = scene.__addObject(SCREEN_WIDTH / 2 - GRID_SIZE * 9, GRID_SIZE * 12 - 6 * SPRITE_SCALE,
                0, 0, 2);
        },
        entrance : {
            'default' : (scene) => {
                scene.__playerCharacter.x = SCREEN_WIDTH / 2;
                scene.__dog.x = scene.__playerCharacter.x - GRID_SIZE;
            },
            'maze' : (scene) => {
                scene.__playerCharacter.x = -SCREEN_WIDTH / 2;
                scene.__dog.x = scene.__playerCharacter.x - GRID_SIZE;
            },
            'hut' : (scene) => {
                scene.__playerCharacter.x = SCREEN_WIDTH / 2 + GRID_SIZE * 27;
                scene.__dog.x = scene.__playerCharacter.x - GRID_SIZE;
            }
        },
    },
    'MAZE_CENTER' : {
        setup: (scene) => {
            scene.__playerCharacter = addPlayer(scene, SCREEN_WIDTH / 2, GRID_SIZE * 12 - 4 * SPRITE_SCALE);
            scene.__dog = addDog(scene, SCREEN_WIDTH / 2 - GRID_SIZE, GRID_SIZE * 12 - 4 * SPRITE_SCALE);

            let floor_height = GRID_SIZE * 12;

            addBackground(scene, floor_height);

            scene.cameras.main.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            scene.cameras.main.startFollow(scene.__playerCharacter, true, 1, 1, 0, 0);

            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH, GRID_SIZE * 13 - 9 * SPRITE_SCALE,
                SCREEN_WIDTH * 2, 29 * LEGACY_SCALE,
                0xff00ff, 0.00)
                .setDepth(DEPTHS.FG));
            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH/2 - GRID_SIZE*7, SCREEN_HEIGHT / 2,
                32, SCREEN_HEIGHT,
                0xff00ff, 0.00)
                .setDepth(DEPTHS.FG));
            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH/2 + GRID_SIZE*7, SCREEN_HEIGHT / 2,
                32, SCREEN_HEIGHT,
                0xff00ff, 0.00)
                .setDepth(DEPTHS.FG));

            let addTree = (x, image) => {
                let tree = scene.add.sprite(x, floor_height, image)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BG_TERRAIN)
                    .setOrigin(0.5, 1);
                return tree;
            };

            let addInnerMaze = (x) => {
                let add_sprite = (offset, frame, flipX, depths = DEPTHS.BG_TERRAIN) => {
                    return scene.add.sprite(x + GRID_SIZE*offset, floor_height, 'maze_objects',frame)
                        .setScale(SPRITE_SCALE)
                        .setFlipX(flipX)
                        .setDepth(depths)
                        .setOrigin(0.5,1);
                };

                addTree(x - 8*GRID_SIZE, 'tree1');
                add_sprite(-7, 2, false, DEPTHS.FG);
                add_sprite(-6, 3, false);
                add_sprite(-5, 3, false);
                add_sprite(-4, 3, false);
                add_sprite(-3, 3, false);
                add_sprite(-2, 3, false);
                add_sprite(-1, 3, false);
                add_sprite(0, 3, false);
                add_sprite(1, 3, false);
                add_sprite(2, 3, false);
                add_sprite(3, 0, false);
                let entrance =  add_sprite(4, 5, false);
                scene.__interactables.add(entrance);
                entrance.__interact = () => {
                    scene.scene.get('ControllerScene').__change_scene('PARK1', 'maze');
                };
                add_sprite(5, 4, false);
                add_sprite(6, 3, false);
                add_sprite(7, 1, false, DEPTHS.FG);
            };
            addInnerMaze(SCREEN_WIDTH/2);
            addBench(scene, floor_height, SCREEN_WIDTH/2);

            for (let x = 0; x < SCREEN_WIDTH + 32; x += 32 * LEGACY_SCALE) {
                scene.add.image(x, GRID_SIZE * 13 - 18 * LEGACY_SCALE, 'ground')
                    .setScale(LEGACY_SCALE)
                    .setDepth(DEPTHS.FLOOR);
            }
        },
        entrance : {
            'default' : (scene) => {
                scene.__playerCharacter.x = SCREEN_WIDTH/2 + -5*GRID_SIZE;
                scene.__dog.x = scene.__playerCharacter.x - GRID_SIZE;
            }
        }
    },
    'HUT': {
        setup : (scene) => {
            let floor_height = GRID_SIZE * 12;

            scene.__playerCharacter = addPlayer(scene, SCREEN_WIDTH / 2, GRID_SIZE * 12 - 4 * SPRITE_SCALE);
            scene.__dog = addDog(scene, SCREEN_WIDTH / 2 - GRID_SIZE, GRID_SIZE * 12 - 4 * SPRITE_SCALE);

            scene.cameras.main.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            scene.cameras.main.startFollow(scene.__playerCharacter, true, 1, 1, 0, 0);

            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH, GRID_SIZE * 13 - 9 * SPRITE_SCALE,
                SCREEN_WIDTH * 2, 29 * LEGACY_SCALE,
                0xff00ff, 0.00)
                .setDepth(DEPTHS.FG));
            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH/4 - 16, SCREEN_HEIGHT / 2,
                32, SCREEN_HEIGHT,
                0xff00ff, 0.80)
                .setDepth(DEPTHS.FG));
            scene.__floor.add(scene.add.rectangle(SCREEN_WIDTH*3/4 + 16, SCREEN_HEIGHT / 2,
                32, SCREEN_HEIGHT,
                0xff00ff, 0.80)
                .setDepth(DEPTHS.FG));
            scene.physics.add.collider(scene.__interactables, scene.__floor, (interactable, floor) => {
                interactable.body.setVelocityX(0);
            });

            scene.add.rectangle(SCREEN_WIDTH/8, SCREEN_HEIGHT/2, SCREEN_WIDTH/4, SCREEN_HEIGHT, 0x322523, 1)
                .setDepth(DEPTHS.FG);
            scene.add.rectangle(SCREEN_WIDTH*7/8, SCREEN_HEIGHT/2, SCREEN_WIDTH/4, SCREEN_HEIGHT, 0x322523, 1)
                .setDepth(DEPTHS.FG);
            scene.add.rectangle(SCREEN_WIDTH/2, floor_height, SCREEN_WIDTH/2,
                SCREEN_HEIGHT, 0x322523, 1)
                .setOrigin(0.5,0)
                .setDepth(DEPTHS.FG);
            scene.add.rectangle(SCREEN_WIDTH/2, floor_height-GRID_SIZE*5, SCREEN_WIDTH/2,
                SCREEN_HEIGHT, 0x322523, 1)
                .setOrigin(0.5,1)
                .setDepth(DEPTHS.FG);

            let note =
                scene.add.sprite(SCREEN_WIDTH/2 + 3*GRID_SIZE, floor_height - GRID_SIZE/4, 'objects', 3)
                .setOrigin(0.5, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.BG_ENTITY);
            scene.__interactables.add(note);
            note.__interact = () => {
                scene.scene.get('ControllerScene').__display(scene);
            }

            let door = scene.add.rectangle(SCREEN_WIDTH/2, floor_height, GRID_SIZE*2, GRID_SIZE*3, 0x800000, 1)
                .setOrigin(0.5,1)
                .setDepth(DEPTHS.BG);
            scene.__interactables.add(door);
            door.__interact = () => {
                    scene.scene.get('ControllerScene').__change_scene('PARK1', 'hut');
            };
        },
        entrance : {
            'default' : (scene) => {
                scene.__playerCharacter.x = SCREEN_WIDTH / 2;
                scene.__dog.x = scene.__playerCharacter.x - GRID_SIZE;
            }
        }
    },
};

let current_area = 'PARK1';
let current_entrance = null;
let input = {
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
};

let ControllerScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ControllerScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    __change_scene: function (new_area, entrance = null) {
        let scene = this;

        if (!entrance) {
            current_entrance = 'default';
        } else {
            current_entrance = entrance;
        }
        scene.scene.bringToTop('ControllerScene');
        let current_scene = scene.scene.get(current_area);

        let do_transition = () => {
            if (current_scene) {
                current_scene.scene.sleep();
            }
            current_area = new_area;
            let new_scene = scene.scene.get(current_area);
            if (!new_scene) {
                scene.scene.add(current_area, GameScene, true, {});
            } else {
                AREAS[current_area].entrance[current_entrance](new_scene);
                new_scene.scene.wake();
                scene.__screen_transition.__intro(new_scene);
            }
            scene.scene.bringToTop('ControllerScene');
        }

        if (current_scene)
        {
            scene.__screen_transition.__outro(do_transition);
            current_scene.scene.pause();
        } else {
            do_transition();
        }

    },

    __display: (scene) => {
        let controller_scene = scene.scene.get('ControllerScene');
        let current_scene = scene;
        current_scene.scene.pause();
        controller_scene.__displayed = controller_scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'note')
            .setScale(SPRITE_SCALE);
        controller_scene.__displayed.__state = 0;
    },

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;
        addMazeInterior('MAZE_1',
            'MAZE_RIGHT_1','default',
            'MAZE_WRONG_1','default');
        addMazeInterior('MAZE_RIGHT_1',
            'MAZE_WRONG_2','default',
            'MAZE_RIGHT_2','default');
        addMazeInterior('MAZE_RIGHT_2',
            'MAZE_WRONG_3','default',
            'MAZE_RIGHT_3','default');
        addMazeInterior('MAZE_RIGHT_3',
            'MAZE_RIGHT_4','default',
            'MAZE_WRONG_4','default');
        addMazeInterior('MAZE_RIGHT_4',
            'MAZE_WRONG_5','default',
            'MAZE_CENTER','default');
        addMazeInterior('MAZE_WRONG_1',
            'MAZE_WRONG_2','default',
            'MAZE_WRONG_2','default');
        addMazeInterior('MAZE_WRONG_2',
            'MAZE_WRONG_3','default',
            'MAZE_WRONG_3','default');
        addMazeInterior('MAZE_WRONG_3',
            'MAZE_WRONG_4','default',
            'MAZE_WRONG_4','default');
        addMazeInterior('MAZE_WRONG_4',
            'MAZE_WRONG_5','default',
            'MAZE_WRONG_5','default');
        addMazeInterior('MAZE_WRONG_5',
            'PARK1','maze',
            'PARK1','maze');

        scene.__screen_transition = (() => {

            let shape = this.make.graphics();

            shape.fillStyle(0xffffff);

            shape.beginPath();

            shape.moveTo(0, 0);
            shape.arc(0, 0, SCREEN_WIDTH, 0, Math.PI * 2);

            shape.fillPath();

            let bg_plate = scene.add.rectangle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
                SCREEN_WIDTH, SCREEN_HEIGHT,
                0x000000, 1)
                .setVisible(false);
            let mask = shape.createGeometryMask();
            mask.setInvertAlpha();
            bg_plate.setMask(mask);

            bg_plate.update = () => {
                let current_scene = scene.scene.get(current_area);
                if (current_scene) {
                    let char_position = getRelativePositionToCanvas(current_scene.__playerCharacter,
                        current_scene.cameras.main);
                    shape.x = char_position.x;
                    shape.y = char_position.y;
                }
            };

            bg_plate.__outro = (onComplete) => {
                bg_plate.setVisible(true);
                let timeline = scene.tweens.createTimeline();
                timeline.add({
                    targets: shape,
                    scale: 0.125,
                    duration: 500
                });
                timeline.add({
                    targets: shape,
                    scale: 0.125*1.1,
                    duration: 100
                });
                timeline.add({
                    targets: shape,
                    scale: 0,
                    delay: 250,
                    duration: 250,
                    onComplete: () => {
                        onComplete();
                    }});
                timeline.play();
            };

            bg_plate.__intro = (intro_scene) => {
                intro_scene.scene.pause();
                bg_plate.setVisible(true);
                shape.setScale(0);
                scene.tweens.add({
                    targets: shape,
                    scale: 1,
                    duration: 500,
                    onComplete: () => {
                        shape.setScale(1);
                        bg_plate.setVisible(false);
                        intro_scene.scene.resume();
                    }
                });
                intro_scene.scene.sendToBack();
            };

            return bg_plate;
        })();

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.interact = scene.input.keyboard.addKey("x");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


        scene.scene.get('ControllerScene').__change_scene(current_area);
    },

    //--------------------------------------------------------------------------
    update: function () {
        let scene = this;

        input = {
            up: false,
            down: false,
            left: false,
            right: false,
            interact: false,
        };

        if (scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown) {
            input.left = true;
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            input.right = true;
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            input.up = true;
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            input.down = true;
        }
        if (scene.__cursor_keys.interact.isDown) {
            input.interact = true;
        }

        if (scene.__displayed) {
            if (scene.__displayed.__state === 0) {
                if (!input.interact) {
                    scene.__displayed.__state = 1;
                }
            } else if (scene.__displayed.__state === 1) {
                if (input.interact) {
                    scene.__displayed.destroy();
                    scene.__displayed = null;
                    let current_scene = scene.scene.get(current_area);
                    current_scene.scene.resume();
                }
            }
        }

        scene.__screen_transition.update();
    }
});

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this);
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;

        /*
        let bg_image = scene.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg_image')
            .setDepth(DEPTHS.BG);
         */

        let bind_event = (key, event, handler) => {
            key.on(event, handler);

            scene.events.once(Phaser.Scenes.Events.SHUTDOWN, function() {
                key.off(event);
            })
        };

        scene.__updateables = scene.add.group({
            runChildUpdate: true,
        });
        scene.__interactables = scene.physics.add.group();
        scene.__floor = scene.physics.add.staticGroup();

        AREAS[current_area].setup(scene);
        AREAS[current_area].entrance[current_entrance](scene);

        scene.cameras.main.startFollow(scene.__playerCharacter, true, 1, 1, 0, 0);

        scene.physics.add.overlap(scene.__playerCharacter, scene.__interactables, function(player, interactable) {
            scene.__playerCharacter.__register_interactable(interactable);
        });

        scene.physics.add.collider(scene.__playerCharacter, scene.__floor);
        scene.physics.add.collider(scene.__dog, scene.__floor);

        let controller_scene = scene.scene.get('ControllerScene');
        controller_scene.__screen_transition.__intro(scene);

        /*
        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE, GRID_SIZE, 0x606060)
            .setAltFillStyle(0x808080)
            .setOutlineStyle()
            .setScrollFactor(0)
            .setAlpha(0.5)
            .setDepth(DEPTHS.FG);
         */
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        scene.__playerCharacter.__input(input);
    },
});

let config = {
    backgroundColor: "#bbad7b",
    type: Phaser.WEBGL,
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
    scene: [ LoadScene, ControllerScene ]
};

let game = new Phaser.Game(config);
