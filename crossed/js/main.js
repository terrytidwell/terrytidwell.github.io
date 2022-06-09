const SPRITE_SCALE = 1;
const GRID_SIZE = 67;
const GRID_ROWS = 25;
const GRID_COLS = 17;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS * SPRITE_SCALE;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS * SPRITE_SCALE;
const FONT = 'px Schoolbell-Regular';

const DEPTHS = {
    BG: 0,
    GRID: 500,
    BLOCKS: 1000,
    BLOCKS_DRAGGED: 2000,
};

let json_version = 1;

let player_stats = {
    version: json_version,
    grid_visible: true,
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
        let letters = [ 'A','B','C','D','E',
                        'F','G','H','I','J',
                        'K','L','M','N','O',
                        'P','Q','R','S','T',
                        'U','V','W','X','Y','Z',
                        'blank', 'grid', 'shine'];
        for (let letter of letters) {
            scene.load.spritesheet(letter, letter + '.png',
                { frameWidth: 67, frameHeight: 67 });
        }
        scene.load.image('bg', 'papelIGuess.jpeg');

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
        scene.load.svg('settings', 'settings_black_48dp.svg',
            {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.svg('next', 'navigate_next-black-36dp.svg',
            {width:GRID_SIZE, height:GRID_SIZE});
        scene.load.svg('close', 'close_FILL0_wght400_GRAD0_opsz48.svg',
            {width:GRID_SIZE, height:GRID_SIZE});


        scene.load.on('complete', function() {
            let local_stats = localStorage.getItem('player_stats');

            if (local_stats) {
                local_stats = JSON.parse(local_stats);
                if (local_stats.version &&
                    local_stats.version === json_version) {
                    player_stats = local_stats;
                } else {
                    localStorage.setItem('player_stats', JSON.stringify(player_stats));
                }
            }
            scene.scene.start('GameScene');
            scene.scene.start('VictoryScene');
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

let level = g_puzzles.length - 1;

let VictoryScene = new Phaser.Class( {
    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'VictoryScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;

        let bg = scene.add.rectangle(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000);
        bg.setAlpha(0);
        let square_scale = 2;
        let square_size = GRID_SIZE * square_scale;
        let x_offsets = [
            SCREEN_WIDTH/2 - 2*square_size,
            SCREEN_WIDTH/2 - square_size,
            SCREEN_WIDTH/2,
            SCREEN_WIDTH/2 + square_size,
            SCREEN_WIDTH/2 + 2*square_size
        ];
        let y_offsets = [
            SCREEN_HEIGHT/2 - square_size/2,
            SCREEN_HEIGHT/2 + square_size/2,
        ];
        let words = ["LEVEL","CLEAR"];
        let victory_tiles = [];
        for (let y = 0; y < y_offsets.length; y++) {
            for (let x = 0; x < x_offsets.length; x++) {
                let tile = scene.add.sprite(x_offsets[x], y_offsets[y] - SCREEN_HEIGHT, words[y][x])
                    .setScale(square_scale * .9);
                victory_tiles.push(tile);
            }
        }

        scene.__victory = () => {
            let game_scene = scene.scene.get('GameScene');
            //scene.scene.pause('GameScene');
            scene.tweens.add({
                targets : bg,
                alpha: 0.5,
                duration: 1000
            });
            for (let tile of victory_tiles) {
                scene.tweens.add({
                    targets: tile,
                    y : tile.y + SCREEN_HEIGHT,
                    duration: Phaser.Math.Between(2800, 3200),
                    ease:'Bounce.easeOut'
                })
            }
            scene.time.delayedCall(4500, () => {
                level += Phaser.Math.Between(1, g_puzzles.length - 1);
                level %= g_puzzles.length;

                game_scene.scene.restart();
                bg.alpha = 0;
                for (let tile of victory_tiles) {
                    tile.y -= SCREEN_HEIGHT;
                }
            });
        };

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
    create: function (data) {
        let scene = this;

        let container = scene.add.container(0,0);
        let menu_button = scene.add.image(SCREEN_WIDTH - GRID_SIZE/2, GRID_SIZE/2, 'settings').setOrigin(1,0);
        menu_button.setInteractive();

        let toggle_menu = () => {
            if (container.visible) {
                close_options();
            } else {
                open_options();
            }
        };

        menu_button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            toggle_menu();
        });
        let bg = scene.add.rectangle(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,
            SCREEN_WIDTH,
            SCREEN_HEIGHT, 0x000000, 0.5);
        bg.setInteractive();
        bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            toggle_menu();
        });
        container.add(bg);

        let menu = scene.add.rectangle(
            SCREEN_WIDTH/2,SCREEN_HEIGHT/2,
            SCREEN_WIDTH - 2*GRID_SIZE,
            SCREEN_HEIGHT - 4*GRID_SIZE, 0xFFFFFF);
        menu.setInteractive();
        menu.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            //no-op
        });
        container.add(menu);
        container.setVisible(false);

        let close_button = scene.add.image(SCREEN_WIDTH - GRID_SIZE, 2*GRID_SIZE, 'close').setOrigin(1,0);
        close_button.setInteractive();
        close_button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            toggle_menu();
        });
        container.add(close_button);

        let game_scene_was_paused = false;
        let victory_scene_was_paused = false;

        let textStyle = {
            fill: "#000000",
            font: ' ' + Math.round(GRID_SIZE * .9) + FONT,
            align: "center",
            wordWrap: { width: GRID_SIZE*(GRID_COLS - 2) , useAdvancedWrap: true }
        };

        let top_text = scene.add.text(SCREEN_WIDTH/2, 2*GRID_SIZE, 'SETTINGS', textStyle)
            .setDepth(DEPTHS.GRID)
            .setOrigin(0.5,0);
        container.add(top_text);

        let archive_text = scene.add.text(SCREEN_WIDTH/2, 8*GRID_SIZE, 'PUZZLE ARCHIVE', textStyle)
            .setDepth(DEPTHS.GRID)
            .setOrigin(0.5,0);
        container.add(archive_text);

        textStyle = {
            fill: "#000000",
            font: ' ' + Math.round(GRID_SIZE * .75) + FONT,
            align: "left",
            wordWrap: { width: GRID_SIZE*(GRID_COLS - 2) , useAdvancedWrap: true }
        };

        // set up the main text
        let text = scene.add.text(2 * GRID_SIZE, 4*GRID_SIZE, 'PUZZLE GRID VISIBLE', textStyle)
            .setDepth(DEPTHS.GRID)
            .setOrigin(0,0);
        let button = scene.add.sprite(SCREEN_WIDTH - 2 * GRID_SIZE, 4*GRID_SIZE,
            player_stats.grid_visible ? 'X' : 'blank')
            .setOrigin(1,0);
        container.add(text);
        container.add(button);
        button.setInteractive();
        button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            player_stats.grid_visible = !player_stats.grid_visible;
            localStorage.setItem('player_stats', JSON.stringify(player_stats));
            let game_scene = scene.scene.get('GameScene');
            if (game_scene) {
                game_scene.__set_grid_visibility();
                button.setTexture(player_stats.grid_visible ? 'X' : 'blank');
            }
        });

        let puzzles_per_page = 4;
        let max_pages = Math.ceil(g_puzzles.length/puzzles_per_page) - 1;
        let current_page = max_pages;
        let pages = [];
        let start_y = 10;
        let next = scene.add.sprite(SCREEN_WIDTH - GRID_SIZE,
            ( start_y + 1 + 2.5 * (puzzles_per_page-1)/2) * GRID_SIZE, 'next')
            .setOrigin(1,0.5);
        container.add(next);
        addButton(next, ()=> {
            pagination(1);
        });
        let prev = scene.add.sprite(GRID_SIZE,
            ( start_y + 1 + 2.5 * (puzzles_per_page-1)/2) * GRID_SIZE, 'next')
            .setOrigin(0,0.5)
            .setFlipX(true);
        container.add(prev);
        addButton(prev, ()=> {
            pagination(-1);
        });

        let pagination = (delta) => {
            let this_page = pages[current_page];
            for (let p of this_page) {
                p.setVisible(false);
            }
            current_page =
                Phaser.Math.Clamp(current_page + delta, 0, max_pages);
            this_page = pages[current_page];
            for (let p of this_page) {
                p.setVisible(true);
            }
            hide_pagination_buttons_if_needed();
        };

        let hide_pagination_buttons_if_needed = () => {
            prev.setVisible(current_page !== 0);
            next.setVisible(current_page !== max_pages);
        };
        hide_pagination_buttons_if_needed();


        let add_puzzle_buttons = () => {
            textStyle = {
                fill: "#000000",
                font: ' ' + Math.round(GRID_SIZE * .75) + FONT,
                align: "center",
                wordWrap: { width: GRID_SIZE*(GRID_COLS - 5) , useAdvancedWrap: true }
            };
            for (let p = 0; p <= max_pages; p++) {
                let this_page = [];
                for (let i = 0; i < puzzles_per_page; i++) {
                    let puzzle_num = p * puzzles_per_page + i;
                    if (puzzle_num >= g_puzzles.length) {
                        break;
                    }
                    let y_grid = start_y + 1 + 2.5 * i;
                    let text = scene.add.text(SCREEN_WIDTH / 2, y_grid * GRID_SIZE,
                        g_puzzles[puzzle_num].name, textStyle)
                        .setDepth(DEPTHS.GRID)
                        .setOrigin(0.5, 0.5);
                    container.add(text);
                    addButton(text, () => {
                        let game_scene = scene.scene.get('GameScene');
                        let victory_scene = scene.scene.get('GameScene');
                        level = puzzle_num;
                        game_scene.scene.restart();
                        victory_scene.scene.restart();
                        close_options();
                    });
                    text.setVisible(p === current_page);
                    this_page.push(text);
                }
                pages.push(this_page);
            }

        };
        add_puzzle_buttons();


        let open_options = () => {
            game_scene_was_paused = scene.scene.isPaused('GameScene');
            victory_scene_was_paused = scene.scene.isPaused('VictoryScene');
            scene.scene.pause('GameScene');
            scene.scene.pause('VictoryScene');
            container.setVisible(true);
        };

        let close_options = () => {
            if (!game_scene_was_paused) { scene.scene.resume('GameScene'); }
            if (!victory_scene_was_paused) { scene.scene.resume('VictoryScene'); }
            container.setVisible(false);
        };

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
            return Math.round( x / GRID_SIZE);
        };

        let snap_to = (x) => {
            return grid_square(x) * GRID_SIZE;
        };

        let add_cluster = (x, y, letters, vx, vy) => {
            let sprites = [];
            let drag_zones = [];
            let draggables = [];
            for (let letter of letters) {
                let sprite = scene.add.sprite(
                    letter.x * GRID_SIZE,
                    letter.y * GRID_SIZE,
                    letter.letter);
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
            drag_container.setDepth(DEPTHS.BLOCKS-1);
            for (let draggable of draggables) {
                draggable.setInteractive();
                scene.input.setDraggable(draggable);
                draggable.__parent = container;
            }
            container.__drag_zone = drag_container;
            clusters.add(container);
        };

        let check_adjacency = (cluster1, cluster2) => {
            if (cluster1 === cluster2) {
                return false;
            }
            let x_offset1 = cluster1._vx - grid_square(cluster1.x);
            let y_offset1 = cluster1._vy - grid_square(cluster1.y);
            let x_offset2 = cluster2._vx - grid_square(cluster2.x);
            let y_offset2 = cluster2._vy - grid_square(cluster2.y);
            if (x_offset1 !== x_offset2 ||
                y_offset1 !== y_offset2) {
                return false;
            }
            for (let letter1 of cluster1.list) {
                for (let letter2 of cluster2.list) {
                    let letter_x1 = grid_square(cluster1.x + letter1.x);
                    let letter_y1 = grid_square(cluster1.y + letter1.y);
                    let letter_x2 = grid_square(cluster2.x + letter2.x);
                    let letter_y2 = grid_square(cluster2.y + letter2.y);
                    if (Phaser.Math.Distance.Snake(letter_x1, letter_y1,
                        letter_x2, letter_y2) === 1) {
                        return true;
                    }
                }
            }
            return false;
        };

        let check_adjacency_and_merge = (this_cluster) => {
            let clusters_to_merge = [];
            for (let cluster of clusters.children.entries) {
                if (check_adjacency(this_cluster, cluster)) {
                    clusters_to_merge.push(cluster);
                }
            }
            if (clusters_to_merge.length === 0) {
                return;
            }
            for (let cluster of clusters_to_merge) {
                let cluster_offset_x = cluster.x - this_cluster.x;
                let cluster_offset_y = cluster.y - this_cluster.y;
                let drag_zone = cluster.__drag_zone;
                let letters = [];
                for (let letter of cluster.list) {
                    letter.x += cluster_offset_x;
                    letter.y += cluster_offset_y;
                    letters.push(letter);
                }
                let letter_drag_zones = [];
                for (let letter_drag_zone of drag_zone.list) {
                    letter_drag_zone.x += cluster_offset_x;
                    letter_drag_zone.y += cluster_offset_y;
                    letter_drag_zones.push(letter_drag_zone);
                }
                cluster.removeAll();
                cluster.destroy();
                drag_zone.removeAll();
                drag_zone.destroy();
                for (let letter of letters) {
                    this_cluster.add(letter);
                    letter.__parent = this_cluster;
                }
                for (let letter_drag_zone of letter_drag_zones) {
                    this_cluster.__drag_zone.add(letter_drag_zone);
                    letter_drag_zone.__parent = this_cluster;
                }
            }
            let shines = [];
            for (let letter of this_cluster.list) {
                let shine = scene.add.sprite(letter.x, letter.y, 'shine');
                shine.setAlpha(0);
                shines.push(shine);
            }
            let min = 0;
            let min_set = false;
            for (let shine of shines) {
                this_cluster.add(shine);
                if (min_set) {
                    min = Math.min(min, grid_square(shine.y) + grid_square(shine.x));
                } else {
                    min = grid_square(shine.y) + grid_square(shine.x);
                    min_set = true;
                }
            }
            for (let shine of shines) {
                let initial_delay = 20*(grid_square(shine.y) + grid_square(shine.x) - min);
                let warmup = 50;
                let cooldown = 150;
                scene.tweens.add({
                    targets: shine,
                    delay: initial_delay,
                    alpha: 1,
                    duration: warmup,
                });
                scene.tweens.add({
                    targets: shine,
                    alpha: 0,
                    delay: warmup + initial_delay,
                    duration: cooldown,
                    onComplete : () => {
                        shine.destroy();
                    }
                });
            }
        };

        let check_solve = () => {
            return clusters.children.size === 1;
        };

        let add_grid_square = (x, y) => {
            let sprite = scene.add.sprite(x * GRID_SIZE, y * GRID_SIZE, 'grid');
            sprite.setScale(0.9);
            sprite.setTintFill(0x000000);
            sprite.setDepth(DEPTHS.GRID);
            sprite.setAlpha(0.5);
            grid.add(sprite);
        };

        let setup_puzzle = () => {
            for (let piece of puzzle.pieces) {
                let letters = [];
                let s_index = 0;
                for (let s of piece.str) {
                    let l_index = 0;
                    for (let l of s) {
                        if (l !== '.') {
                            letters.push({
                                y: l_index,
                                x: s_index,
                                letter: l,
                            });
                        }
                        l_index++;
                    }
                    s_index++;
                }
                add_cluster(piece.y, piece.x + 2, letters, piece.vy, piece.vx);
            }

            let s_index = 0;
            for (let s of puzzle.grid.str) {
                let l_index = 0;
                for (let l of s) {
                    if (l === 'O') {
                        let x = puzzle.grid.x + l_index;
                        let y = puzzle.grid.y + s_index;
                        add_grid_square(y, x + 2)
                    }
                    l_index++;
                }
                s_index++;
            }


            let textStyle = {
                fill: "#000000",
                font: ' ' + Math.round(GRID_SIZE * .9) + FONT,
                align: "center",
                wordWrap: { width: GRID_SIZE*(GRID_COLS - 3) , useAdvancedWrap: true }
            };

            // set up the main text
            scene.add.text(SCREEN_WIDTH/2, 0, puzzle.name, textStyle)
                .setDepth(DEPTHS.GRID)
                .setOrigin(0.5,0);
        };

        scene.__set_grid_visibility = () => {
            grid.setVisible(player_stats.grid_visible);
        };

        let clusters = scene.add.group();
        let grid = scene.add.group();
        let puzzle = g_puzzles[level];

        setup_puzzle();
        scene.__set_grid_visibility();

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg').setDepth(DEPTHS.BG);


        let drag_enabled = true;
        scene.input.on('dragstart', function (pointer, gameObject) {
            if (!drag_enabled) { return; }
            let container = gameObject.__parent;
            container.alpha = 0.5;
            container.setDepth(DEPTHS.BLOCKS_DRAGGED);
            container.__start_x = container.x - gameObject.x;
            container.__start_y = container.y - gameObject.y;
        });
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (!drag_enabled) { return; }
            let container = gameObject.__parent;
            let drag_container = container.__drag_zone;
            container.x = dragX + container.__start_x;
            container.y = dragY + container.__start_y;
            drag_container.x = container.x;
            drag_container.y = container.y;
        });
        scene.input.on('dragend', function(pointer, gameObject) {
            if (!drag_enabled) { return; }
            let container = gameObject.__parent;
            let drag_container = container.__drag_zone;
            container.setDepth(DEPTHS.BLOCKS);
            container.x = snap_to(container.x);
            container.y = snap_to(container.y);
            drag_container.x = container.x;
            drag_container.y = container.y;
            container.alpha = 1;
            check_adjacency_and_merge(container);
            if (check_solve()) {
                drag_enabled = false;
                scene.scene.get('VictoryScene').__victory();
            }
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
    backgroundColor: "#000000",
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
    scene: [ LoadScene, GameScene, VictoryScene, ControllerScene ]
};

let game = new Phaser.Game(config);
