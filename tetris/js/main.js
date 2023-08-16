const SPRITE_SCALE = 8;
const GRID_SIZE = 4 * SPRITE_SCALE;
const WELL_WIDTH = 10;
const WELL_DEPTH = 20;
const WELL_OFFSET = {x: 2, y: 1};
const RIGHT_PANEL = 6;
const GRID_COLS = 2 + WELL_WIDTH + 2; // + RIGHT_PANEL;
const GRID_ROWS = WELL_DEPTH + 2 + 6; //Math.max(GRID_COLS*2, WELL_DEPTH);
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS;
const FONT = 'px VT323-Regular';

const DEPTHS = {
    BG: 0,
    ACTIVE_SHADOW : 250,
    TOUCH_ANIMATION: 500,
    WELL_PIECES: 750,
    ACTIVE_PIECES: 1000,
    HIGHLIGHT : 1500,
    BORDER: 2000,
};

let json_version = 1;

let player_stats = {
    version: json_version,
    grid_visible: true,
};

let PIECES = {
    O: 0,
    I: 1,
    Z: 2,
    L: 3,
    S: 4,
    T: 5,
    J: 6,
    NONE: 7,
    getBag : () => {
        return [0,1,2,3,4,5,6];
    },
    getRandomBag : () => {
        return Phaser.Utils.Array.Shuffle([0,1,2,3,4,5,6]);
    },
    getBlock : (piece) => {
        return piece * 9;
    },
    getRotation : (piece, rotation) => {
        return piece * 9 + rotation + 1;
    },
    getShadow : (piece) => {
        return piece * 9 + 5;
    },
    getOutline : (piece, frame) => {
        return piece * 9 + 6 + frame;
    },
    getPieceOffset : (piece) => {
        return [
            {dx: 0.5, dy: -0.5},
            {dx: 0.5, dy: 0.5},
            {dx: 0, dy: 0},
            {dx: 0, dy: 0},
            {dx: 0, dy: 0},
            {dx: 0, dy: 0},
            {dx: 0, dy: 0}
        ][piece];
    },
    getPieceBlocks : (piece,rotation) => {
        return [
            //O
            [[0,0],[1,0],[1,-1],[0,-1]],
            [[0,0],[1,0],[1,-1],[0,-1]],
            [[0,0],[1,0],[1,-1],[0,-1]],
            [[0,0],[1,0],[1,-1],[0,-1]],

            //I
            [[-1,0],[0,0],[1,0],[2,0]],
            [[1,0],[1,-1],[1,1],[1,2]],
            [[-1,1],[0,1],[1,1],[2,1]],
            [[0,0],[0,-1],[0,1],[0,2]],

            //Z
            [[-1,-1],[0,-1],[0,0],[1,0]],
            [[1,-1],[1,0],[0,0],[0,1]],
            [[-1,0],[0,0],[0,1],[1,1]],
            [[0,-1],[0,0],[-1,0],[-1,1]],

            //L
            [[-1,0],[0,0],[1,0],[1,-1]],
            [[0,-1],[0,0],[0,1],[1,1]],
            [[-1,1],[-1,0],[0,0],[1,0]],
            [[-1,-1],[0,-1],[0,0],[0,1]],

            //S
            [[1,-1],[0,-1],[0,0],[-1,0]],
            [[1,1],[1,0],[0,0],[0,-1]],
            [[1,0],[0,0],[0,1],[-1,1]],
            [[0,1],[0,0],[-1,0],[-1,-1]],

            //T
            [[-1,0],[0,0],[0,-1],[1,0]],
            [[0,-1],[0,0],[1,0],[0,1]],
            [[-1,0],[0,0],[1,0],[0,1]],
            [[-1,0],[0,0],[0,-1],[0,1]],

            //J
            [[1,0],[0,0],[-1,0],[-1,-1]],
            [[0,-1],[0,0],[0,1],[1,-1]],
            [[1,1],[-1,0],[0,0],[1,0]],
            [[-1,1],[0,-1],[0,0],[0,1]],

        ][piece * 4 + rotation];
    },
    getAnimations: (piece) => {
        //replaced later
    },
};

const ROTATION = {
    getOriginRotation: () => {
        return 0;
    },
    clockwiseRotation: (rotation) => {
        return (rotation + 1) % 4;
    },
    counterClockwiseRotation: (rotation) => {
        return (rotation + 3) % 4;
    },
    getRotationAsRadians: (rotation) => {
        return Phaser.Math.DegToRad(rotation * 90)
    },
};

const SPRITES = {
    BORDER_BLOCK: 63,
    BG_BLOCK: 64,
    HIGHLIGHT_BLOCK: 65
};


let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        scene.load.path = "assets/";

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

        scene.load.spritesheet('sprites', 'tetris-spritesheet.png',
            { frameWidth: 24, frameHeight: 24 });
        scene.load.image('dpad', 'shadedDark04.png');
        scene.load.image('abutton', 'shadedDark36.png');
        scene.load.image('bbutton', 'shadedDark37.png');

        scene.load.on('complete', function() {
            let local_stats = localStorage.getItem('player_stats');

            if (local_stats) {
                local_stats = JSON.parse(local_stats);
                if (local_stats.version &&
                    local_stats.version === json_version) {
                    Object.assign(player_stats, local_stats);
                } else {
                    localStorage.setItem('player_stats', JSON.stringify(player_stats));
                }
            }
            scene.scene.start('GameScene');
        });

    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let animations = PIECES.getBag();
        for (let a of animations) {
            let key = 'block_place_'+a;

            scene.anims.create({
                key: key,
                frames: scene.anims.generateFrameNumbers('sprites',
                    { start: PIECES.getOutline(a,0),
                        end: PIECES.getOutline(a, 2) }),
                skipMissedFrames: false,
                frameRate: 12,
                repeat: 0
            });
            animations[a] = key;
        }
        PIECES.getAnimations = (piece) => {
            return animations[piece];
        }
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

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
    create: function (data) {
        let scene = this;

        let grid_square = (x) => {
            return x*GRID_SIZE;
        };

        let grid_center = (x) => {
            return grid_square(x) + GRID_SIZE/2;
        };

        let setup_well = (well_x, well_y) => {
            for (let x = well_x - 1; x < WELL_WIDTH + well_x + 1; x++) {
                scene.add.sprite(grid_center(x),grid_center(well_y - 1), 'sprites', SPRITES.BORDER_BLOCK)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BORDER);
                scene.add.sprite(grid_center(x),grid_center(WELL_DEPTH + well_y), 'sprites', SPRITES.BORDER_BLOCK)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BORDER);
            }
            for (let y = well_y - 1; y < WELL_DEPTH + well_y; y++) {
                scene.add.sprite(grid_center(well_x - 1),grid_center(y), 'sprites', SPRITES.BORDER_BLOCK)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BORDER);
                scene.add.sprite(grid_center(WELL_WIDTH+well_x),grid_center(y), 'sprites', SPRITES.BORDER_BLOCK)
                    .setScale(SPRITE_SCALE)
                    .setDepth(DEPTHS.BORDER);
            }

            let visible_blocks = [];
            let getVisibleBlock = (x, y) => {
                return visible_blocks[x + y*WELL_WIDTH];
            };
            let setVisibleBlock = (x, y, piece) => {
                let block = getVisibleBlock(x,y);
                if (piece === PIECES.NONE) {
                    block.setVisible(0);
                    return;
                }
                block.setVisible(true);
                block.setFrame(PIECES.getBlock(piece))
            };
            for (let y = well_y; y < WELL_DEPTH + well_y; y++) {
                for (let x = well_x; x < WELL_WIDTH + well_x; x++) {
                    let block = scene.add.sprite(
                        grid_center(x),
                        grid_center(y),
                        'sprites',
                        PIECES.getBlock(PIECES.getRandomBag()[0])
                    )
                        .setVisible(false)
                        .setScale(SPRITE_SCALE)
                        .setDepth(DEPTHS.WELL_PIECES);
                    visible_blocks.push(block);
                }
            };

            let create_row = () => {
                let row = []
                for (let x = 0; x < WELL_WIDTH; x++) {
                    row.push(PIECES.NONE);
                }
                return row;
            };

            let create_well = () => {
                let well = [];
                for (let y = 0; y < WELL_DEPTH * 2; y++) {
                    well.push(create_row());
                }
                return well;
            };

            let well = create_well();

            let check_complete = (line) => {
                for (let l of line) {
                    if (l === PIECES.NONE) {
                        return false;
                    }
                }
                return true;
            };

            let highlights = [];

            let highlight_clear_lines = () => {
                let lines_cleared = false;
                for (let y = 19; y > 19 - well.length; y--) {
                    if (check_complete(getRowAt(y))) {
                        for (let x = 0; x < WELL_WIDTH; x++) {
                            let highlight = scene.add.sprite(
                                grid_center(x + well_x), grid_center(y + well_y),
                                'sprites', SPRITES.HIGHLIGHT_BLOCK)
                                .setDepth(DEPTHS.HIGHLIGHT)
                                .setScale(SPRITE_SCALE)
                                .setVisible(false);
                            highlights.push(highlight);
                        }
                        lines_cleared = true;
                    }
                }
                return lines_cleared;
            };

            let show_highlights = () => {
                for (let h of highlights) {
                    h.setVisible(true);
                }
            };

            let clear_lines = () => {
                let new_well = [];
                for (let w of well) {
                    if (!check_complete(w)) {
                        new_well.push(w);
                    }
                }
                while (new_well.length < WELL_DEPTH * 2) {
                    new_well.push(create_row());
                }
                well = new_well;
                for (let h of highlights) {
                    h.destroy();
                }
            };


            let getRowAt = (y) => {
                //y = 19 should translate to 0
                //y = 0 should translate to 19
                //y = -1 should translate to 20
                return well[(WELL_DEPTH - 1) - y];
            };

            let getBlockAt = (x, y) => {
                //y = 19 should translate to 0
                //y = 0 should translate to 19
                //y = -1 should translate to 20
                return well[(WELL_DEPTH - 1) - y][x];
            };

            let setBlockAt = (x, y, piece) => {
                //y = 19 should translate to 0d
                //y = 0 should translate to 19
                //y = -1 should translate to 20
                well[(WELL_DEPTH - 1) - y][x] = piece;
            };

            let update_visual_blocks = () => {
                for (let x = 0; x < WELL_WIDTH; x++) {
                    for (let y = 0; y < WELL_DEPTH; y++) {
                        setVisibleBlock(x, y, getBlockAt(x, y));
                    }
                }
            };

            return {
                add_block_to_well : (x, y, piece) => {
                    if (y < 0) {
                        scene.scene.restart();
                    }
                    setBlockAt(x, y, piece);
                },
                commit_blocks_to_well : () => {
                    if (highlight_clear_lines()) {
                        update_visual_blocks();
                        scene.time.delayedCall(1000/12*2, () => {
                            show_highlights();
                            scene.time.delayedCall(1000/12*2, () => {
                                clear_lines();
                                update_visual_blocks();
                                drop();
                            });
                        });
                        return;
                    }
                    update_visual_blocks();
                    drop();
                },
                check_blank : (x, y) => {
                    return getBlockAt(x,y) === PIECES.NONE;
                }
            }
        };
        let well = setup_well(WELL_OFFSET.x, WELL_OFFSET.y);



        let add_active_piece = (piece, well_x, well_y) => {
            let spawn = {x: 4, y: -1};
            let offset = PIECES.getPieceOffset(piece);
            let position = {
                x: spawn.x,
                y: spawn.y
            };
            let rotation = ROTATION.getOriginRotation();
            //rotation = ROTATION.clockwiseRotation(rotation);
            let active_piece = scene.add.sprite(
                grid_center(position.x + offset.dx + well_x),
                grid_center(position.y + offset.dy + well_y),
                'sprites',
                PIECES.getRotation(piece, rotation)
            ).setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.ACTIVE_PIECES);

            let run_test = (dx, dy, rotation) => {
                let blocks = PIECES.getPieceBlocks(piece, rotation);
                for (let b of blocks) {
                    let test_x = b[0] + position.x + dx;
                    let test_y = b[1] + position.y + dy;
                    if (test_x < 0 || test_x >= WELL_WIDTH ||
                        test_y >= WELL_DEPTH ||
                        !well.check_blank(test_x, test_y)) {
                        return false;
                    }
                }
                return true;
            };

            let calculate_drop_position = () => {
                let test_passed = true;
                let dy = 0;
                while (test_passed) {
                    test_passed = run_test(0, dy+1, rotation);
                    if(!test_passed) {
                        return dy;
                    }
                    dy++;
                }
            };

            let shadow = scene.add.sprite(
                0, 0, 'sprites', PIECES.getShadow(piece)
            )
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.ACTIVE_SHADOW);

            let updateShadow = () => {
                shadow.setPosition(active_piece.x, active_piece.y);
                shadow.setRotation(ROTATION.getRotationAsRadians(rotation));
                let dy = calculate_drop_position();
                shadow.setPosition(
                    grid_center(position.x + 0 + well_x + offset.dx),
                    grid_center(position.y + dy + well_y + offset.dy));
            };
            updateShadow();

            let hardDrop = () => {
                if (!active_piece) {
                    return;
                }
                let dy = calculate_drop_position();
                position.y += dy;
                active_piece.setPosition(
                    grid_center(position.x + offset.dx + well_x),
                    grid_center(position.y + offset.dy + well_y));
                destroy();
            };



            let drop = () => {
                if (!run_test(0, 1, rotation)) {
                    destroy();
                    return;
                }
                position.y = position.y + 1;
                active_piece.setPosition(
                    grid_center(position.x + offset.dx + well_x),
                    grid_center(position.y + offset.dy + well_y));
                updateShadow();
            };

            let slide = (dx) => {
                if (!active_piece) {
                    return;
                }
                if (!run_test(dx, 0, rotation)) {
                    return;
                }
                position.x = position.x + dx;
                active_piece.setPosition(
                    grid_center(position.x + offset.dx + well_x),
                    grid_center(position.y + offset.dy + well_y));
                updateShadow();
            };

            let activePiece = true;

            let destroy = () => {
                if (!activePiece) {
                    return;
                }
                activePiece = false;
                drop_event.remove();
                active_piece.destroy();
                shadow.play(
                    {key: PIECES.getAnimations(piece),
                    hideOnComplete: true}, false);
                shadow.setRotation(ROTATION.getRotationAsRadians(rotation));
                let blocks = PIECES.getPieceBlocks(piece, rotation);
                for (let b of blocks) {
                    well.add_block_to_well(position.x + b[0],
                        position.y + b[1], piece)
                }
                well.commit_blocks_to_well();
            };

            let rotate = (new_rotation) => {
                if (!run_test(0, 0, new_rotation)) {
                    return;
                }
                rotation = new_rotation;
                active_piece.setFrame(PIECES.getRotation(piece, rotation));
                updateShadow();
            };

            let rotateCounterClockwise = () => {
                if (!active_piece) {
                    return;
                }
                rotate(ROTATION.counterClockwiseRotation(rotation));
            };

            let rotateClockwise = () => {
                if (!active_piece) {
                    return;
                }
                rotate(ROTATION.clockwiseRotation(rotation));
            };

            let drop_event = scene.time.addEvent({
                "delay": 250,
                "loop": true,
                "callback": () => {
                    drop();
                }
            });

            return {
                slide: slide,
                rotateClockwise : rotateClockwise,
                rotateCounterClockwise : rotateCounterClockwise,
                hardDrop : hardDrop,
            }
        };

        let active_piece = null;
        let bag = PIECES.getRandomBag();
        let bag_offset = 0;
        let drop = () => {
            active_piece = add_active_piece(bag[bag_offset], WELL_OFFSET.x, WELL_OFFSET.y);
            bag_offset = (bag_offset + 1) % bag.length
        };
        drop();

        let world_bounds = new Phaser.Geom.Rectangle(0,0,0,0);
        scene.cameras.main.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        scene.cameras.main.getBounds(world_bounds);
        scene.physics.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.width, world_bounds.height);
        scene.physics.world.setBoundsCollision();

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.interact = scene.input.keyboard.addKey("x");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        bind_event(scene, scene.__cursor_keys.letter_left, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.slide(-1)});
        bind_event(scene, scene.__cursor_keys.letter_right, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.slide(1)});
        bind_event(scene, scene.__cursor_keys.letter_up, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.rotateClockwise()});
        bind_event(scene, scene.__cursor_keys.letter_down, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.hardDrop()});
        bind_event(scene, scene.__cursor_keys.left, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.slide(-1)});
        bind_event(scene, scene.__cursor_keys.right, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.slide(1)});
        bind_event(scene, scene.__cursor_keys.up, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.rotateClockwise()});
        bind_event(scene, scene.__cursor_keys.down, Phaser.Input.Keyboard.Events.DOWN,
            () => { active_piece.hardDrop()});

        let dpad = scene.add.sprite(GRID_SIZE, GRID_SIZE * (WELL_DEPTH + 3), 'dpad')
            .setOrigin(0,0);
        let abutton = scene.add.sprite(SCREEN_WIDTH - GRID_SIZE,
            GRID_SIZE * (WELL_DEPTH + 3), 'bbutton')
            .setOrigin(1, 0);
        let bbutton = scene.add.sprite(SCREEN_WIDTH - GRID_SIZE - 80,
            SCREEN_HEIGHT - 32, 'abutton')
            .setOrigin(1, 1);

        dpad.setInteractive();
        let cursors = {
            _right : false,
            _left : false,
            _up : false,
            _down : false,
            setInputs : (right, left, up, down) => {
                //evaluate triggers
                if (right && !cursors._right) {
                    active_piece.slide(1);
                }
                if (left && !cursors._left) {
                    active_piece.slide(-1);
                }
                if (up && !cursors._up) {
                    //active_piece.rotateClockwise();
                }
                if (down && !cursors._down) {
                    active_piece.hardDrop();
                }
                cursors._right = right;
                cursors._left = left;
                cursors._up = up;
                cursors._down = down;
            },
            _a : false,
            _b : false,
            setAInput : (a) => {
                if (a && !cursors._a) {
                    active_piece.rotateClockwise();
                }
                cursors._a = a;
            },
            setBInput : (b) => {
                if (b && !cursors._b) {
                    active_piece.rotateCounterClockwise();
                }
                cursors._b = b;
            }
        };
        dpad.alpha = 0.5;
        let dpad_pointer = (pointer) => {
            let dx = pointer.worldX - dpad.x - dpad.width/2;
            let dy = pointer.worldY - dpad.y - dpad.height/2;
            dpad.alpha = 1;
            if (dx > dy && dy > -dx) {
                cursors.setInputs(true, false, false, false);
            } else if (dx < dy && dy < -dx) {
                cursors.setInputs(false, true, false, false);
            } else if (dx < dy && dy > -dx) {
                cursors.setInputs(false, false, false, true);
            } else if (dx > dy && dy < -dx) {
                cursors.setInputs(false, false, true, false);
            }else {
                cursors.setInputs(false, false, false, false);
            }
        };
        dpad.on('pointerover', dpad_pointer);
        dpad.on('pointermove', dpad_pointer);
        dpad.on('pointerout', (pointer) => {
            dpad.alpha = 0.5
            cursors.setInputs(false, false, false, false);
        });

        let a_pointer = () => {
            abutton.alpha = 1;
            cursors.setAInput(true);
        }
        let b_pointer = () => {
            bbutton.alpha = 1;
            cursors.setBInput(true);
        }
        abutton.setInteractive();
        bbutton.setInteractive();
        abutton.alpha = 0.5;
        bbutton.alpha = 0.5;
        abutton.on('pointerover', a_pointer);
        abutton.on('pointermove', a_pointer);
        abutton.on('pointerout', () => {
            abutton.alpha = 0.5,
            cursors.setAInput(false);
        });
        bbutton.on('pointerover', b_pointer);
        bbutton.on('pointermove', b_pointer);
        bbutton.on('pointerout', () => {
            bbutton.alpha = 0.5
            cursors.setBInput(false);
        });
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let config = {
    backgroundColor: "#3c3c3c",
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
            debug: true
        }
    },
    scene: [ LoadScene, GameScene ]
};

let game = new Phaser.Game(config);
