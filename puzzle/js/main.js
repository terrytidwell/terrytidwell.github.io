const SPRITE_SCALE = 1;
const GRID_SIZE = 64;
const PUZZLE_SCALE_DOWN = 1;
const PUZZLE_ROWS = 6;
const PUZZLE_COLS = 8;
const GRID_ROWS = PUZZLE_ROWS + 2;
const GRID_COLS = PUZZLE_COLS + 2;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS * SPRITE_SCALE;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS * SPRITE_SCALE;
const FONT = 'px Schoolbell-Regular';

const DEPTHS = {
    BG: 0,
    PUZZLE_DRAG_ZONE: 1000,
    SELECTED_PUZZLE_DRAG_ZONE: 2000,
};

const PIECES = {
    EDGE: 0,
    MALE: 1,
    FEMALE: 2,
    pieceToIndex: function(n,e,s,w) {
        return [
            1, // E E E E
            2, // E E E M
            3, // E E E F
            2, // E E M E
            9, // E E M M
            8, // E E M F
            3, // E E F E
            8, // E E F M
            7, // E E F F
            2, // E M E E
            6, // E M E M
            5, // E M E F
            9, // E M M E
            15, // E M M M
            14, // E M M F
            8, // E M F E
            13, // E M F M
            12, // E M F F
            3, // E F E E
            5, // E F E M
            4, // E F E F
            8, // E F M E
            14, // E F M M
            11, // E F M F
            7, // E F F E
            12, // E F F M
            10, // E F F F
            2, // M E E E
            9, // M E E M
            8, // M E E F
            6, // M E M E
            15, // M E M M
            13, // M E M F
            5, // M E F E
            14, // M E F M
            12, // M E F F
            9, // M M E E
            15, // M M E M
            14, // M M E F
            15, // M M M E
            21, // M M M M
            20, // M M M F
            14, // M M F E
            20, // M M F M
            19, // M M F F
            8, // M F E E
            14, // M F E M
            11, // M F E F
            13, // M F M E
            20, // M F M M
            18, // M F M F
            12, // M F F E
            19, // M F F M
            17, // M F F F
            3, // F E E E
            8, // F E E M
            7, // F E E F
            5, // F E M E
            14, // F E M M
            12, // F E M F
            4, // F E F E
            11, // F E F M
            10, // F E F F
            8, // F M E E
            13, // F M E M
            12, // F M E F
            14, // F M M E
            20, // F M M M
            19, // F M M F
            11, // F M F E
            18, // F M F M
            17, // F M F F
            7, // F F E E
            12, // F F E M
            10, // F F E F
            12, // F F M E
            19, // F F M M
            17, // F F M F
            10, // F F F E
            17, // F F F M
            16, // F F F F
        ][27*n + 9*e + 3*s + w];
    },
    rotation: function(n,e,s,w) {
        return [
            0, // E E E E
            2, // E E E M
            2, // E E E F
            1, // E E M E
            1, // E E M M
            1, // E E M F
            1, // E E F E
            0, // E E F M //need flip
            1, // E E F F
            0, // E M E E
            0, // E M E M
            0, // E M E F
            0, // E M M E
            1, // E M M M
            1, // E M M F
            0, // E M F E
            1, // E M F M
            1, // E M F F
            0, // E F E E
            0, // E F E M //need filp
            0, // E F E F
            3, // E F M E //need flip
            3, // E F M M //need flip
            1, // E F M F
            0, // E F F E
            3, // E F F M //need flip
            1, // E F F F
            3, // M E E E
            1, // M E E M
            1, // M E E F //need flip
            1, // M E M E
            2, // M E M M
            2, // M E M F
            3, // M E F E
            0, // M E F M //need flip
            0, // M E F F //need flip
            3, // M M E E
            3, // M M E M
            1, // M M E F //need flip
            0, // M M M E
            0, // M M M M
            0, // M M M F //need flip
            0, // M M F E
            1, // M M F M
            0, // M M F F //need flip
            3, // M F E E
            3, // M F E M
            3, // M F E F
            0, // M F M E
            0, // M F M M
            0, // M F M F
            0, // M F F E
            0, // M F F F
            0, // M F F M
            3, // F E E E
            2, // F E E M
            1, // F E E F //need flip
            1, // F E M E
            2, // F E M M
            2, // F E M F
            1, // F E F E
            2, // F E F M
            2, // F E F F
            2, // F M E E //need flip
            3, // F M E M
            1, // F M E F //need flip
            2, // F M M E //need flip
            3, // F M M M
            2, // F M M F
            0, // F M F E
            1, // F M F M
            1, // F M F F
            3, // F F E E
            3, // F F E M
            3, // F F E F
            2, // F F M E //need flip
            3, // F F M M
            2, // F F M F
            0, // F F F E
            3, // F F F M
            0, // F F F F
        ][27*n + 9*e + 3*s + w] * Math.PI/2;
    },
    flipX: function(n, e, s, w) {
        return [
            false, // E E E E
            false, // E E E M
            false, // E E E F
            false, // E E M E
            false, // E E M M
            false, // E E M F
            false, // E E F E
            true, // E E F M
            false, // E E F F
            false, // E M E E
            false, // E M E M
            false, // E M E F
            false, // E M M E
            false, // E M M M
            false, // E M M F
            false, // E M F E
            false, // E M F M
            false, // E M F F
            false, // E F E E
            true, // E F E M
            false, // E F E F
            true, // E F M E
            true, // E F M M
            false, // E F M F
            false, // E F F E
            true, // E F F M
            false, // E F F F
            false, // M E E E
            true, // M E E M
            true, // M E E F
            false, // M E M E
            false, // M E M M
            false, // M E M F
            false, // M E F E
            true, // M E F M
            true, // M E F F
            false, // M M E E
            false, // M M E M
            true, // M M E F
            false, // M M M E
            false, // M M M M
            true, // M M M F
            false, // M M F E
            false, // M M F M
            true, // M M F F
            false, // M F E E
            false, // M F E M
            false, // M F E F
            false, // M F M E
            false, // M F M M
            false, // M F M F
            false, // M F F E
            false, // M F F F
            false, // M F F M
            false, // F E E E
            false, // F E E M
            true, // F E E F
            false, // F E M E
            false, // F E M M
            false, // F E M F
            false, // F E F E
            false, // F E F M
            false, // F E F F
            true, // F M E E
            false, // F M E M
            true, // F M E F
            true, // F M M E
            false, // F M M M
            false, // F M M F
            false, // F M F E
            false, // F M F M
            false, // F M F F
            false, // F F E E
            false, // F F E M
            false, // F F E F
            true, // F F M E
            false, // F F M M
            false, // F F M F
            false, // F F F E
            false, // F F F M
            false, // F F F F
        ][27*n + 9*e + 3*s + w];
    }
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

        //scene.load.image('bg', 'papelIGuess.jpeg');

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

        scene.load.spritesheet('pieces', 'PuzzlePieces.png',
            { frameWidth: 128, frameHeight: 128 });

        scene.load.image('bg', 'papelIGuess.jpeg');

        //const PUZZLE_SCALE_DOWN = 8;
        //const PUZZLE_ROWS = 7;
        //const PUZZLE_COLS = 10;
        scene.load.spritesheet('puzzle', 'puzzle.jpg',
            { frameWidth: 64*PUZZLE_SCALE_DOWN, frameHeight: 64*PUZZLE_SCALE_DOWN });
        scene.load.spritesheet('puzzle2', 'puzzle2.png',
            { frameWidth: 64*PUZZLE_SCALE_DOWN, frameHeight: 64*PUZZLE_SCALE_DOWN });

        scene.load.on('complete', function() {
            //scene.scene.start('TitleScreen');
            scene.scene.start('GameScene');
            //scene.scene.start('VictoryScene');
            scene.scene.start('ControllerScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let ControllerScene = new Phaser.Class( {
    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ControllerScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function (data) {},
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

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg').setDepth(DEPTHS.BG).setScale(0.5);

        let grid_square = (x) => {
            return Math.round( x / GRID_SIZE);
        };

        let to_grid = (x) => {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        let snap_to = (x) => {
            return grid_square(x) * GRID_SIZE;
        };

        let add_cluster = (x, y) => {
            let sprites = [];
            let drag_zones = [];
            let draggables = [];
            for (let letter of letters) {
                let sprite = scene.add.sprite(
                    letter.x * GRID_SIZE,
                    letter.y * GRID_SIZE,
                    'pieces', 1);
                sprite._vx = letter.x + vx;
                sprite._vy = letter.x + vy;
                let drag_zone = scene.add.zone(
                    letter.x * GRID_SIZE,
                    letter.y * GRID_SIZE,
                    GRID_SIZE * 3,
                    GRID_SIZE * 3
                );
                drag_zone._vx = letter.x + vx;
                drag_zone._vy = letter.y + vy;
                drag_zones.push(drag_zone);
                sprites.push(sprite);
                draggables.push(drag_zone);
                draggables.push(sprite);
            }

            let container = scene.add.container(x * GRID_SIZE,
                y * GRID_SIZE, sprites);
            container._vx = vx;
            container._vy = vy;
            container.setDepth(DEPTHS.BLOCKS);
            let drag_container = scene.add.container(x * GRID_SIZE,
                y * GRID_SIZE, drag_zones);
            drag_container.setDepth(DEPTHS.BLOCK_DRAG_ZONES);
            for (let draggable of draggables) {
                draggable.setInteractive();
                scene.input.setDraggable(draggable);
                draggable.__parent = container;
            }
            container.__drag_zone = drag_container;
            clusters.add(container);
        };

        let fix_sprite = (sprite, tips) => {
            sprite.setFrame(PIECES.pieceToIndex(
                tips[0],
                tips[1],
                tips[2],
                tips[3]
            ));
            sprite.setRotation(PIECES.rotation(
                tips[0],
                tips[1],
                tips[2],
                tips[3]
            ));
            sprite.setFlipX(PIECES.flipX(
                tips[0],
                tips[1],
                tips[2],
                tips[3]
            ));
        };

        let set_depth = (piece, depth) => {
            for (let d of piece.__drag_zones) {
                d.setDepth(depth);
                //d.__mask.setDepth(depth);
                for (let p of d.__sprites) {
                    p.setDepth(depth);
                }
            }
        };

        let addPiece = (x, y) => {
            let px = 32 + (x+1) * 64;
            let py = 32 + (y+1) * 64;
            let current_piece = [PIECES.EDGE, PIECES.EDGE, PIECES.EDGE, PIECES.EDGE];
            let sprite = scene.add.sprite(
                px, py,
                'pieces', 0);
            fix_sprite(sprite, current_piece);
            let drag_zone = scene.add.zone(
                px, py, 64,
                64
            );
            let container_sprites = [];
            let mask = sprite.createBitmapMask();

            for (let d of [[0,0],[0,1],[1,0],[1,1]]) { //},[0,1],[1,0],[1,1]]) {
                let frame = (y+d[1])*(PUZZLE_COLS+1) + x+d[0];
                let puzzle = scene.add.sprite(
                    px + d[0]*64-32, py + d[1]*64-32, 'puzzle2',
                    frame
                ).setScale(1/PUZZLE_SCALE_DOWN);
                puzzle.setMask(mask);
                container_sprites.push(puzzle);
            }
            /*
            let container = scene.add.container(px,
                py, container_sprites);
            */

            drag_zone.setInteractive();
            scene.input.setDraggable(drag_zone);
            drag_zone.__solvedX = x;
            drag_zone.__solvedY = y;
            drag_zone.__sprites = container_sprites;
            //drag_zone.__parent = container;
            drag_zone.__mask = sprite;
            drag_zone.__drag_zones = [drag_zone];
            sprite.__tips = current_piece;
            set_depth(drag_zone, DEPTHS.PUZZLE_DRAG_ZONE);
            return drag_zone;
        };
        let pieces = [];
        for (let y = 0; y < PUZZLE_ROWS; y++) {
            for (let x = 0; x < PUZZLE_COLS; x++) {
                pieces.push(addPiece(x, y));
            }
        }
        let modify_right = (x, y) => {
            let sprite = pieces[y*PUZZLE_COLS + x].__mask;
            let sprite2 = pieces[y*PUZZLE_COLS + x + 1].__mask;
            let tips = Phaser.Utils.Array.Shuffle([PIECES.FEMALE, PIECES.MALE]);
            sprite.__tips[1] = tips[0];
            sprite2.__tips[3] = tips[1];
            fix_sprite(sprite, sprite.__tips);
            fix_sprite(sprite2, sprite2.__tips);
        };
        let modify_bottom = (x, y) => {
            let sprite = pieces[y*PUZZLE_COLS + x].__mask;
            let sprite2 = pieces[(y+1)*PUZZLE_COLS + x].__mask;
            let tips = Phaser.Utils.Array.Shuffle([PIECES.FEMALE, PIECES.MALE]);
            sprite.__tips[2] = tips[0];
            sprite2.__tips[0] = tips[1];
            fix_sprite(sprite, sprite.__tips);
            fix_sprite(sprite2, sprite2.__tips);
        };

        for (let y = 0; y < PUZZLE_ROWS; y++) {
            for (let x = 0; x < PUZZLE_COLS; x++) {
                if (x < PUZZLE_COLS - 1) { modify_right(x,y); }
                if (y < PUZZLE_ROWS - 1) { modify_bottom(x,y); }
            }
        }

        let merge = (central_piece, toMerge) => {
            //put these two pieces at the end and pop them
            let new_pieces = [];
            let piecesToMerge = [];
            let pieceToRemain = pieces[central_piece];
            for (let i = 0; i < pieces.length; i++) {
                let piece_found = false;
                for (let j of toMerge) {
                    if (i === j) {
                        piece_found = true;
                    }
                }
                if (!piece_found) {
                    new_pieces.push(pieces[i]);
                } else {
                    piecesToMerge.push(pieces[i]);
                }
            }
            pieces = new_pieces;

            for (let p of piecesToMerge) {
                for (let d of p.__drag_zones) {
                    pieceToRemain.__drag_zones.push(d);
                }
            }
            for (let p of piecesToMerge) {
                for (let d of p.__drag_zones) {
                    d.__drag_zones = pieceToRemain.__drag_zones;
                }
            }
        };



        let move_piece_relative = (piece, dx, dy) => {
            for (let d of piece.__drag_zones) {
                d.x += dx;
                d.y += dy;
                d.__mask.x += dx;
                d.__mask.y += dy;
                for (let p of d.__sprites) {
                    p.x += dx;
                    p.y += dy;
                }
            }
        }

        let move_piece = (piece, x, y) => {
            let dx = x - piece.x;
            let dy = y - piece.y;
            move_piece_relative(piece, dx, dy);
        };

        let puzzle_size = pieces.length;
        //merge([0,1,2]);
        puzzle_size = pieces.length;

        let positions = [];
        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_COLS; x++) {
                positions.push([x,y]);
            }
        }
        Phaser.Utils.Array.Shuffle(positions);
        for (let n = 0; n < pieces.length; n++) {
            let x = 32 + (positions[n][0]) * 64;
            let y = 32 + (positions[n][1]) * 64;
            move_piece(pieces[n], x, y);
        }

        let check_adjacency = (piece) => {
            let my_index = -1;
            let piecesToMerge = [];
            for (let i = 0; i < pieces.length; i++) {
                let merge_piece = false;
                let p = pieces[i];
                if (piece.__drag_zones[0] === p.__drag_zones[0]) {
                    my_index = i;
                    continue;
                }
                for (let d of p.__drag_zones) {
                    for (let d2 of piece.__drag_zones) {
                        if (Phaser.Math.Distance.Snake(
                            d2.__solvedX, d2.__solvedY,
                            d.__solvedX, d.__solvedY) === 1) {
                            //found two that should be adjecent
                            let dx = d.__solvedX - d2.__solvedX;
                            let dy = d.__solvedY - d2.__solvedY;
                            dx *= GRID_SIZE;
                            dy *= GRID_SIZE;
                            let distance = Phaser.Math.Distance.Between(
                                d2.x + dx, d2.y + dy,
                                d.x, d.y);
                            if (distance < 32) {
                                merge_piece = true;
                                move_piece(d, d2.x + dx,
                                    d2.y + dy);
                            }
                        }
                    }
                }
                if (merge_piece) {
                    piecesToMerge.push(i);
                }
            }
            if (piecesToMerge.length > 0) {
                if (my_index === -1) {
                    null.__break;
                }
                if (piecesToMerge.length > 1) {
                    console.log('error?');
                }
                merge(my_index, piecesToMerge);
                let puzzle_size = pieces.length;
            }
        };

        let clusters = scene.add.group();


        /*
                for (let n = 0; n < 4; n++) {
                    let add_button = (n) => {
                        let direction = [
                            [0, -1],
                            [1, 0],
                            [0, 1],
                            [-1, 0]
                        ];
                        let turn = [0, 1, 2, 3];
                        let color = [24, 23, 25];
                        let text = ["EDGE", "MALE", "FEMALE"];
                        let button_sprite = scene.add.sprite(SCREEN_WIDTH / 2 + direction[n][0]*48,
                            128 + direction[n][1]*48, 'pieces', color[current_piece[n]])
                            .setRotation(turn[n]*Math.PI/2);
                        let rect = scene.add.zone(SCREEN_WIDTH / 2 + direction[n][0]*48,
                            128 + direction[n][1]*48, 64, 64);
                        addButton(rect, () => {
                            current_piece[n] = (current_piece[n] + 1) % 3;
                            button_sprite.setFrame(color[current_piece[n]]);
                            fix_sprite(sprite, current_piece);
                        });
                    }
                    add_button(n);
                } */



        let drag_enabled = true;
        scene.input.on('dragstart', function (pointer, gameObject) {
            if (!drag_enabled) { return; }
            set_depth(gameObject, DEPTHS.SELECTED_PUZZLE_DRAG_ZONE);
        });
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (!drag_enabled) { return; }
            move_piece(gameObject, dragX, dragY)
        });
        scene.input.on('dragend', function(pointer, gameObject) {
            if (!drag_enabled) { return; }
            set_depth(gameObject, DEPTHS.PUZZLE_DRAG_ZONE);
            check_adjacency(gameObject);
            //console.log(gameObject.__drag_zones.length);
        });

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


    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let config = {
    backgroundColor: "#FFFFFF",
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
    antialias: false,
    scene: [ LoadScene, GameScene, ControllerScene ]
};

let game = new Phaser.Game(config);