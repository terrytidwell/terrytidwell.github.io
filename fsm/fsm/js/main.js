const DEBUG_BUILD = false;

const SCREEN_HEIGHT = 1920;
const SCREEN_WIDTH = 1080;

const GRID_SIZE = 60;

const DEPTHS = {
    BG: 0,
    PIECES: 1000,
    DRAG: 2000,
};

let COLORS = {
    grey: 0xE0E0E0,
    grey_border: 0xDEDEDE,
    white: 0xFFFFFF,
    white_text: "#FFFFFF",
    solved: 0x38bebc,
    piece_text: "#a2a39e",
    ui_text: "#3c3c3c",
    clue_text: "#3d9ca0",
    cursor: 0xa2a39e,
};

let SIZES = {
    clue_font: 100,
    piece_font: 95,
    circle_diameter: 110,
    circle_radius: 55,
    circle_spacing: 120,
    line_spacing: 150,
    timer_font: 50,
    icon_size: 80,
    icon_spacing: 120,
    puzzles_per_page: 12,
};

let level_legal = (words) => {
    return words.length === 7 &&
        words[1].length <= 8 &&
        words[3].length <= 8 &&
        words[5].length <= 8
};
for (let level of LEVELS) {
    let words = level.words;
    if (!level_legal(words)) {
        console.log("WARNING: Puzzle problem detected ", words);
    }
}
let serialize_level = (level) => {
    return level.join(">");
};

if (DEBUG_BUILD) {
    let i = 0;
    LEVELS = [];
    repeat(11,() => {
        i++;
        LEVELS.push({words:["UNLOCKED"+i,"1","B","2","C","3", "D"],})
    })

    LEVELS.push({
            words: ["LOCKED1", "A", "A", "A", "A", "A", "A"],
            locked: Date.now() + 30_000,
        });
    LEVELS.push({
            words: ["LOCKED2", "A", "A", "A", "A", "A", "A"],
            locked: Date.now() + 60_000,
        });
    repeat(36,() => {
        i++
        LEVELS.push({words:["UNLOCKED"+i,"1","B","2","C","3", "D"],})
    })
}

let get_new_game_state = () => {
    return {
        solved: {
            //'serialized_puzzle_name': {time:"00:25"},
        }
    };
};
let get_game_state = () => {
    let local_stats_str = localStorage.getItem('fsm_stats');
    local_stats_str = DEBUG_BUILD ? null : local_stats_str;
    let local_stats_obj;
    if (local_stats_str) {
        try {
            local_stats_obj = JSON.parse(local_stats_str);
        } catch (e) {
            // The JSON data is invalid, fallback:
            local_stats_obj = null;
        }
    }
    return local_stats_obj ?? get_new_game_state();
};
let game_state = get_game_state();
let save_game_state = () => {
    try {
        let value = JSON.stringify(game_state);
        localStorage.setItem('fsm_stats', value)
    } catch (e) {
        console.log('error writing save')
    }
};
let check_for_saved_solve = (level_number) => {
    let serialized_name = serialize_level(LEVELS[level_number].words);
    let value = game_state.solved?.[serialized_name] ?? false;
    return value;
};

let is_unlocked = (level_number) => {
    if (level_number >= LEVELS.length) {
        return false;
    }
    if (LEVELS[level_number].locked && LEVELS[level_number].locked >= Date.now()) {
        return false;
    }
    return true;
};
let get_next_candidate_puzzle = (level_number) => {
    let next_value = null;
    for (let i = level_number + 1; i < LEVELS.length; i++) {
        if (!check_for_saved_solve(i)) {
            next_value = i;
            break;
        }
    }
    return next_value;
};
let get_next_unsolved_puzzle = (level_number) => {
    let next_value = null;
    for (let i = level_number + 1; i < LEVELS.length; i++) {
        if (is_unlocked(i) && !check_for_saved_solve(i)) {
            next_value = i;
            break;
        }
        if ( !is_unlocked(i) ) {
            return null;
        }
    }
    return next_value;
};
let get_last_unlocked_puzzle = (level_number) => {
    let next_value = null;
    for (let i = level_number + 1; i < LEVELS.length; i++) {
        if(! is_unlocked(i)) {
            break;
        }
        next_value = i;
    }
    return next_value;
};
let get_max_displayed_puzzle = (level_number) => {
    for (let i = level_number; i < LEVELS.length; i++) {
        if(! is_unlocked(i)) {
            return i;
        }
    }
    return LEVELS.length - 1;
};

let current_puzzle = get_next_unsolved_puzzle(-1) ?? get_last_unlocked_puzzle(-1) ?? 0;
let calculate_current_page = () => {
    return Math.floor(current_puzzle/SIZES.puzzles_per_page);
}
let current_page = calculate_current_page();

let getFont = (align = "center", fontSize = SIZES.piece_font,
               color= COLORS.piece_text, wrap_length= SCREEN_WIDTH) => {
    return {font: '' + fontSize + 'px chewy_regular', fill: color, align: align,
        wordWrap: {width: wrap_length, useAdvancedWrap: true}};
};

let getTimeFont = () => {
    return getFont("center",  SIZES.timer_font, COLORS.ui_text);
};

let getClueFont = () => {
    return getFont("center",  SIZES.clue_font, COLORS.clue_text);
};

let getDateString = (later) => {
    let now = Date.now();
    //let later = new Date(2025,6,3,0,0,0,0);
    //let later = new Date("2025-07-03T00:00")
    let diffMs = Math.max(0, later - now);
    let hours = Math.floor(diffMs / 3_600_000);
    let minutes = Math.floor((diffMs / 60_000) % 60);
    let seconds = Math.floor((diffMs / 1_000) % 60);
    let date_string =
        Phaser.Utils.String.Pad(hours, 2, '0', 1) + ":" +
        Phaser.Utils.String.Pad(minutes, 2, '0',1) + ":" +
        Phaser.Utils.String.Pad(seconds, 2, '0',1);
    return date_string;
};

let LevelSelectScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LevelSelectScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.input.addPointer(5);

        let border_padding = SIZES.line_spacing - SIZES.circle_radius;
        let odd_y = [];
        let current = GRID_SIZE + border_padding + SIZES.line_spacing;
        repeat(10, () => {
            odd_y.push(current);
            current += SIZES.line_spacing;
        });

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg');

        let top_line_y = odd_y[0] - GRID_SIZE/2 - border_padding;
        scene.add.rectangle(SCREEN_WIDTH/2, top_line_y,
            SCREEN_WIDTH-2*GRID_SIZE,5,COLORS.grey, 1, 5);
        let upper_bar_middle_y = (top_line_y + GRID_SIZE/2)/2;
        scene.add.text(SCREEN_WIDTH/2, upper_bar_middle_y, "LEVELS", getTimeFont())
            .setOrigin(0.5,0.5);

        let x_start = GRID_SIZE+GRID_SIZE/2;
        let x_stop = SCREEN_WIDTH - x_start;
        let x_span = x_stop - x_start;
        let x_locations = [x_start + x_span/6, SCREEN_WIDTH/2, x_stop-x_span/6];
        let y_start = top_line_y + GRID_SIZE;
        let y_stop = SCREEN_HEIGHT - y_start;
        let y_span = y_stop - y_start;
        let y_locations = [
            y_start + y_span/8,
            y_start + 3*y_span/8,
            y_start + 5*y_span/8,
            y_start + 7*y_span/8];
        let y_height = y_span/4;
        let x_height = x_span/3;
        let y_center_bottom = (y_stop + SCREEN_HEIGHT) / 2;

        let makeRoundedPanelTexture = (scene, key, w, h, radius = 16) => {
            // 1) Draw off-screen
            const g = scene.add.graphics()
                .lineStyle(5, COLORS.grey, 1)
                .strokeRoundedRect(0, 0, w, h, radius);

            // 2) Turn the drawing into a texture in the global cache
            g.generateTexture(key, w, h);

            // 3) Free the Graphics object (no longer needed)
            g.destroy();
        };
        let panel_height = y_height-GRID_SIZE/2;
        makeRoundedPanelTexture(scene,'level_panel',
            x_height-GRID_SIZE/2, panel_height, GRID_SIZE/2);

        let puzzle = current_page*SIZES.puzzles_per_page;
        let max_puzzle = get_max_displayed_puzzle(puzzle);
        let max_page = Math.floor((max_puzzle)/SIZES.puzzles_per_page);

        for( let y of y_locations) {
            for (let x of x_locations) {
                if (puzzle > max_puzzle) {
                    continue;
                }
                let slack = panel_height - SIZES.circle_radius * 3 - SIZES.timer_font;
                let buffer = slack / 3;
                let top = y - panel_height/2;
                let center_circle = top + buffer + SIZES.circle_radius * 1.5;
                let center_text = center_circle + SIZES.circle_radius * 1.5 + buffer + SIZES.timer_font/2;
                let value = check_for_saved_solve(puzzle);

                let addLevel = (puzzle, save_data, locked_date) => {
                    console.log(puzzle, locked_date)
                    let grey_set = {circle_color: COLORS.grey, font_color: COLORS.piece_text, text: ""};

                    let parameters = save_data ?
                        {circle_color: COLORS.solved, font_color: COLORS.white_text, text: value.time} :
                        grey_set;
                    parameters = locked_date ? grey_set : parameters;
                    if ( locked_date ) {
                        parameters.text = getDateString(locked_date);
                    }

                    scene.add.sprite(x, y, 'level_panel');
                    let circle = scene.add.circle(x, center_circle, SIZES.circle_radius * 1.5,
                        parameters.circle_color, 1);
                    let this_puzzle = puzzle;

                    let under_text = scene.add.text(x, center_text, parameters.text, getTimeFont())
                        .setOrigin(0.5, 0.5)
                        .setColor(COLORS.piece_text);

                    if ( locked_date ) {
                        scene.add.sprite(x, center_circle, 'lock');
                        let ticker = this.time.addEvent({
                            delay   : 1000,
                            loop    : true,
                            callback: () => {
                                if ( Date.now() >= locked_date ) {
                                    scene.scene.restart();
                                    return;
                                }
                                under_text.setText(getDateString(locked_date));
                            }
                        });
                    }

                    let label = locked_date ? "" : puzzle + 1;
                    scene.add.text(x, center_circle, label, getFont())
                        .setOrigin(0.5, 0.5)
                        .setColor(parameters.font_color);


                    if ( !locked_date ) {
                        circle.setInteractive();
                        circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                            current_puzzle = this_puzzle;
                            current_page = calculate_current_page();
                            scene.scene.start('GameScene');
                        });

                    }
                };
                let locked = false;
                if ( LEVELS[puzzle].locked && LEVELS[puzzle].locked > Date.now())  {
                    locked = LEVELS[puzzle].locked;
                }
                addLevel(puzzle, value, locked);

                puzzle += 1;
            }
        }

        /*
        addButton(scene.add.sprite(GRID_SIZE, upper_bar_middle_y, 'chevron_left')
            .setOrigin(0,0.5),()=>{});
        */
        if (DEBUG_BUILD) {
            addButton(scene.add.sprite(SCREEN_WIDTH - GRID_SIZE, upper_bar_middle_y, 'menu')
                .setOrigin(1, 0.5), () => {
            });
        }
        if (current_page !== max_page) {
            addButton(scene.add.sprite(SCREEN_WIDTH - GRID_SIZE, y_center_bottom, 'chevron_left')
                .setOrigin(1, 0.5)
                .setFlipX(true), () => {
                    current_page += 1;
                    scene.scene.restart();
            });
        }
        if (current_page !== 0) {
            addButton(scene.add.sprite(GRID_SIZE, y_center_bottom, 'chevron_left')
                .setOrigin(0, 0.5)
                .setFlipX(false), () => {
                current_page -= 1;
                scene.scene.restart();
            });
        }
        /*addButton(scene.add.sprite(SCREEN_WIDTH - GRID_SIZE - SIZES.icon_spacing, upper_bar_middle_y, 'help')
            .setOrigin(1,0.5),()=>{});*/
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
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
    create: function () {
        let scene = this;

        if (DEBUG_BUILD) {
            //current_puzzle = LEVELS.length-1;
            //current_page = calculate_current_page();
        }

        //failsafe
        if (current_puzzle >= LEVELS.length || !is_unlocked(current_puzzle)) {
            console.log("WARNING: tried to start an illegal puzzle");
            current_puzzle = 0;
            current_page = calculate_current_page();
            scene.scene.start('LevelSelectScene')
        }

        let scene_state = {
            level_info: LEVELS[current_puzzle].words,
            targets: scene.physics.add.group(),
            pieces: scene.physics.add.group(),
            cursor: null,
            events: {
                SOLVED: 'SCENE_EVENTS.solved',
                WORD_SOLVED: 'SCENE_EVENTS.word_solved',
            },
        };

        scene.input.addPointer(5);

        let addPiece = (x, y, character, color) => {
            let circle = scene.add.circle(0, 0, SIZES.circle_diameter/2, color);
            let letter = scene.add.text(0, 0, character, getFont())
                .setOrigin(0.5, 0.5)
                .setPadding(SIZES.circle_spacing,SIZES.circle_spacing);
            let piece = scene.add.container(x, y, [circle, letter])
                .setDepth(DEPTHS.PIECES);
            piece.setSize(SIZES.circle_spacing,SIZES.circle_spacing);
            piece.__value = character;
            piece.__held = null;
            piece.__x = x;
            piece.__y = y;
            piece.setInteractive();
            piece.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                if (piece.__held) {
                    scene_state.cursor.__setPosition(piece.__held);
                    return;
                }
                scene_state.cursor.__handlePress(piece);
            });
            //scene.input.setDraggable(piece);
            scene_state.pieces.add(piece);
            piece.__finished = (delay) => {
                //scene.input.setDraggable(piece, false);
                piece.disableInteractive();
                scene.tweens.add({
                    targets: circle,
                    yoyo: true,
                    scale: 1.2,
                    delay: delay,
                    duration: 125,
                    onYoyo: () => {
                        letter.setColor(COLORS.white_text);
                        circle.setFillStyle(COLORS.solved);
                    },
                })
            };
            return piece;
        };

        let border_padding = SIZES.line_spacing - SIZES.circle_radius;
        let odd_y = [];
        let current = GRID_SIZE + border_padding + SIZES.line_spacing;
        repeat(10, () => {
            odd_y.push(current);
            current += SIZES.line_spacing;
        });
        let even_x = [120, 240, 360, 480, 600, 720, 840, 960];
        let odd_x = [180, 300, 420, 540, 660, 780, 900];

        let start_index = (7 -  scene_state.level_info.length) / 2;

        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bg');

        let bottom_line_y = odd_y[6] + GRID_SIZE/2 + border_padding;
        scene.add.rectangle(SCREEN_WIDTH/2, bottom_line_y,
            SCREEN_WIDTH-2*GRID_SIZE,5,COLORS.grey, 1, 5);
        let top_line_y = odd_y[0] - GRID_SIZE/2 - border_padding;
        scene.add.rectangle(SCREEN_WIDTH/2, top_line_y,
            SCREEN_WIDTH-2*GRID_SIZE,5,COLORS.grey, 1, 5);
        let upper_bar_middle_y = (top_line_y + GRID_SIZE/2)/2;
        let time_label = scene.add.text(SCREEN_WIDTH/2, upper_bar_middle_y, "00:00", getTimeFont())
            .setOrigin(0.5,0.5);

        addButton(scene.add.sprite(GRID_SIZE, upper_bar_middle_y, 'chevron_left')
            .setOrigin(0,0.5),()=>{
            scene.scene.start('LevelSelectScene')
        });
        if (DEBUG_BUILD) {
            addButton(scene.add.sprite(SCREEN_WIDTH - GRID_SIZE, upper_bar_middle_y, 'menu')
                .setOrigin(1, 0.5), () => {
            });
        }
        /*addButton(scene.add.sprite(SCREEN_WIDTH - GRID_SIZE - SIZES.icon_spacing, upper_bar_middle_y, 'help')
            .setOrigin(1,0.5),()=>{});*/

        let elapsed = 0;
        let format = s => {
            const mm = Phaser.Utils.String.Pad(Math.floor(s / 60), 2, '0', 1);
            const ss = Phaser.Utils.String.Pad(s % 60, 2, '0', 1);
            return `${mm}:${ss}`;
        };

        let ticker = this.time.addEvent({
            delay   : 1000,
            loop    : true,
            callback: () => {
                elapsed += 1;
                elapsed = Math.min(59*60+59, elapsed)
                time_label.setText(format(elapsed));
            }
        });

        /* ---------------- Stop on puzzle SOLVED ---------------- */
        bind_once_event(scene,scene.events,scene_state.events.SOLVED, () => {
            ticker.remove(false);
            let serialized_name = serialize_level(LEVELS[current_puzzle].words);
            game_state.solved[serialized_name] = {time: time_label.text};
            save_game_state();
        });

        let addClue = (y, word) => {
            scene.add.text(SCREEN_WIDTH/2, y, word, getClueFont()).
                setOrigin(0.5,0.5)
                .setDepth(DEPTHS.BG)
                .setPadding(GRID_SIZE);
        };
        for (let i = 0; i <= scene_state.level_info.length; i += 2) {
            let line_index = i + start_index;
            addClue(odd_y[line_index], scene_state.level_info[i]);
        }

        let addBlank = (y, n, word) => {
            let even = n % 2 === 0
            let array = even ? even_x : odd_x;
            let x_index = (array.length - n) / 2;

            let addBlankInner = (array, start_index, word) => {
                let x_index = start_index;
                let i = 0;
                repeat(n, () => {
                    scene.add.circle(array[x_index], y,
                        SIZES.circle_radius-5, COLORS.grey, 0)
                        .setStrokeStyle(5,COLORS.grey)
                        .setDepth(DEPTHS.BG);
                    let blank = scene.add.circle(array[x_index], y,
                        SIZES.circle_radius-5, COLORS.grey, 0)
                        .setStrokeStyle(5,COLORS.grey)
                        .setDepth(DEPTHS.BG);
                    blank.__value = word[i];
                    blank.__filled = null;
                    blank.__word = y;
                    blank.__index = i;
                    blank.__solved = false;
                    scene_state.targets.add(blank);
                    blank.setInteractive();
                    blank.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                        scene_state.cursor.__setPosition(blank);
                    });
                    x_index++;
                    i++;
                });
            };
            addBlankInner(array, x_index, word)
        };

        let checkSolve = (blank) => {
            if (blank.__solved) { return; }
            let pieces = [];
            let blanks = [];
            for (let target of scene_state.targets.getChildren()) {
                if (blank.__word !== target.__word) { continue; }
                if (!target.__filled) { return false; }
                if (target.__filled.__value !== target.__value) { return false; }
                pieces.push(target.__filled);
                blanks.push(target);
            }
            //trigger solved
            let delay = 0;
            for (let piece of pieces) {
                piece.__finished(delay);
                delay += 100
            }
            for (let target of blanks) {
                target.destroy();
            }
            scene.events.emit(scene_state.events.WORD_SOLVED);
            if (scene_state.targets.getChildren().length === 0) {
                scene.events.emit(scene_state.events.SOLVED);
            }
            return true;
        };

        let letters = [];
        for (let i = 1; i < scene_state.level_info.length; i += 2) {
            let line_index = i + start_index;
            addBlank(odd_y[line_index], scene_state.level_info[i].length,
                scene_state.level_info[i]);
            for (let c of scene_state.level_info[i]) {
                letters.push(c);
            }
        }

        let addCursor = () => {
            let cursor = scene.add.circle(
                0, 0,
                SIZES.circle_radius-5, COLORS.cursor, 0)
                .setStrokeStyle(5,COLORS.cursor)
                .setDepth(DEPTHS.PIECES+1);
            let assignLocation = (t) => {
                if (!t) {
                    return;
                }
                cursor.__target = t;
                cursor.__word = t.__word;
                cursor.__index = t.__index;
                cursor.copyPosition(t);
            }

            let getFirst = () => {
                let ret_val = null;
                for (let t of scene_state.targets.getChildren()) {
                    if (!ret_val || (t.__word < ret_val.__word) ||
                        (t.__word === ret_val.__word && t.__index < ret_val.__index)) {
                        ret_val = t;
                    }
                }
                return ret_val;
            };

            let getSelf = () => {
                for (let t of scene_state.targets.getChildren()) {
                    if (cursor.__word === t.__word && cursor.__index === t.__index) {
                        return t;
                    }
                }
                return null;
            };

            let getLast = () => {
                let ret_val = null;
                for (let t of scene_state.targets.getChildren()) {
                    if (!ret_val || (t.__word > ret_val.__word) ||
                        (t.__word === ret_val.__word && t.__index > ret_val.__index)) {
                        ret_val = t;
                    }
                }
                return ret_val;
            };

            let getPreviousSpace = () => {
                let ret_val = null;
                for (let t of scene_state.targets.getChildren()) {
                    if (t.__word > cursor.__word ||
                        (t.__word === cursor.__word && t.__index >= cursor.__index)) {
                        continue;
                    }
                    if (!ret_val || (t.__word > ret_val.__word) ||
                        (t.__word === ret_val.__word && t.__index > ret_val.__index)) {
                        ret_val = t;
                    }
                }
                return ret_val;
            };

            let getNextSpace = () => {
                let ret_val = null;
                for (let t of scene_state.targets.getChildren()) {
                    if (t.__word < cursor.__word ||
                        (t.__word === cursor.__word && t.__index <= cursor.__index)) {
                        continue;
                    }
                    if (!ret_val || (t.__word < ret_val.__word) ||
                        (t.__word === ret_val.__word && t.__index < ret_val.__index)) {
                        ret_val = t;
                    }
                }
                return ret_val;
            };

            let nextWord = () => {
                let ret_val = null;
                for (let t of scene_state.targets.getChildren()) {
                    if (t.__word <= cursor.__word || t.__index !== 0) {
                        continue;
                    }
                    if (! ret_val || (t.__word < ret_val.word)) {
                        ret_val = t;
                    }
                }
                return ret_val;
            };

            assignLocation(getFirst());

            cursor.__handlePress = (piece) => {
                if (!cursor.__target) { return; }
                if (cursor.__target.__filled) {
                    let old_piece = cursor.__target.__filled;
                    cursor.__target.__filled = null;
                    old_piece.setPosition(old_piece.__x, old_piece.__y);
                    old_piece.__held = null;
                }
                cursor.__target.__filled = piece;
                piece.copyPosition(cursor.__target);
                piece.__held = cursor.__target;
                cursor.__target.__filled = piece;
                checkSolve(cursor.__target);

                let test_point = getNextSpace() ?? getFirst();
                //corner case, if we would go to the next line
                //i.e. the index would not go up
                //we instead try to stay where we are (getSelf returns
                //null only if we just solved the word)
                //this prevents us from wrapping onto back onto the same
                //word when only one is left, or going to the next line
                //without correctly guessing the word we were working on
                if (test_point && test_point.__index <= cursor.__index) {
                    test_point = getSelf() ?? test_point;
                }
                assignLocation(test_point);
            };

            cursor.__handleBackspace = () => {
                if (!cursor.__target) { return; }
                if (!cursor.__target.__filled) {
                    assignLocation(getPreviousSpace() ?? getLast());
                }
                if (cursor.__target.__filled) {
                    let old_piece = cursor.__target.__filled;
                    cursor.__target.__filled = null;
                    old_piece.setPosition(old_piece.__x, old_piece.__y);
                    old_piece.__held = null;
                }
            };

            cursor.__setPosition = (t) => {
                assignLocation(t);
            };

            cursor.__handleTab = () => {
                if (!cursor.__target) { return; }
                assignLocation(nextWord() ?? getFirst());
            };

            bind_once_event(scene,scene.events,scene_state.events.SOLVED, () => {
                cursor.setVisible(false);
                cursor.__target = null;
            });

            scene_state.cursor = cursor;
        };
        addCursor();

        //let x = [120, 240, 360, 480, 600, 720, 840, 960];
        //let y = //[1200, 1320, 1440,
        //    [1560, 1680, 1800];
        let x_index = 0;
        let y_index = 8;

        let middle_y = (bottom_line_y + SCREEN_HEIGHT - GRID_SIZE/2)/2;
        let locations = [];
        let center = {x: SCREEN_WIDTH/2, y: middle_y};
        for (let i = 0; i < even_x.length; i++) {
            let x = even_x[i];
            locations.push({x: x, y: middle_y - SIZES.circle_spacing * 1.5});
            if (i === 0 || i === even_x.length - 1) { continue; }
            locations.push({x: x, y: middle_y + SIZES.circle_spacing * 0.5});
        }
        for (let i = 0; i < odd_x.length; i++) {
            let x = odd_x[i];
            locations.push({x: x, y: middle_y-SIZES.circle_spacing*0.5});
            if (i === 0 || i === odd_x.length - 1) { continue; }
            locations.push({x: x, y: middle_y + SIZES.circle_spacing * 1.5});
        }
        Phaser.Utils.Array.Shuffle(locations);
        for (let location of locations) {
            location.d = Phaser.Math.Distance.BetweenPoints(location, center);
        }
        locations.sort((a,b) => { return b.d - a.d});

        Phaser.Utils.Array.Shuffle(letters);
        for (let letter of letters) {
            let location = locations.pop();
            addPiece(
                location.x, location.y,
                //0, 0,
                letter, COLORS.grey)

            x_index++;
            if (x_index >= even_x.length) {
                x_index = 0;
                y_index++;
            }
        }
        let circle = scene.add.circle(
            even_x[7], middle_y + SIZES.circle_spacing * 1.5,
            SIZES.circle_diameter/2, COLORS.grey)
            .setDepth(DEPTHS.PIECES);
        let letter = scene.add.sprite(
            even_x[7], middle_y + SIZES.circle_spacing * 1.5,
            'backspace')
            .setDepth(DEPTHS.PIECES)
            .setOrigin(0.5, 0.5);
        let circle2 = scene.add.circle(
            even_x[0], middle_y + SIZES.circle_spacing * 1.5,
            SIZES.circle_diameter/2, COLORS.grey)
            .setDepth(DEPTHS.PIECES);
        let letter2 = scene.add.sprite(
            even_x[0], middle_y + SIZES.circle_spacing * 1.5,
            'arrow')
            .setDepth(DEPTHS.PIECES)
            .setOrigin(0.5, 0.5);
        circle.setInteractive();
        circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            scene_state.cursor.__handleBackspace();
        });
        circle2.setInteractive();
        circle2.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            scene_state.cursor.__handleTab();
        });

        bind_once_event(scene, scene.events, scene_state.events.SOLVED, () => {
            let congrat_y_locations = [
                middle_y - (SIZES.timer_font * 3),
                middle_y,
                middle_y + (SIZES.timer_font * 3)
            ];
            let congrats = scene.add.text(
                SCREEN_WIDTH/2, congrat_y_locations[0] + SIZES.timer_font/2,
                "YOU SOLVED PUZZLE #"+(current_puzzle+1)+" IN "+time_label.text+"!",
                getTimeFont())
                .setOrigin(0.5,0.5)
                .setAlpha(0)
                .setDepth(DEPTHS.BG);
            scene.tweens.add({
                targets: congrats,
                y: congrat_y_locations[0],
                alpha: 1,
                duration: 250,
                delay: 500,
            });
            scene.tweens.add({
                targets: [circle, circle2, letter, letter2],
                alpha: 0,
                duration: 250,
            });

            let add_next_button = (delay) => {
                let next_label = scene.add.text(
                    SCREEN_WIDTH/2, congrat_y_locations[1],
                    ["NEXT PUZZLE"],
                    getTimeFont())
                    .setOrigin(0.5,0.5)
                    .setAlpha(0)
                    .setDepth(DEPTHS.BG+1)
                    .setColor(COLORS.piece_text);

                let next_button = scene.add.sprite(
                    SCREEN_WIDTH/2, congrat_y_locations[1],
                    'button')
                    .setAlpha(0)
                    .setDepth(DEPTHS.BG);
                next_button.setInteractive();
                next_button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                    current_puzzle = next_puzzle;
                    current_page = calculate_current_page();
                    scene.scene.restart();
                });
                scene.tweens.add({
                    targets: [next_label, next_button],
                    alpha: 1,
                    duration: 250,
                    delay: delay,
                });
            }

            let delay = 750;
            let next_puzzle = get_next_candidate_puzzle(current_puzzle);
            if (! next_puzzle) {
                //finished everything?
                let next_puzzle_text = scene.add.text(
                    SCREEN_WIDTH/2, congrat_y_locations[1],
                    "LAST PUZZLE (FOR NOW)",
                    getTimeFont())
                    .setOrigin(0.5,0.5)
                    .setAlpha(0)
                    .setDepth(DEPTHS.BG);
                scene.tweens.add({
                    targets: [next_puzzle_text],
                    alpha: 1,
                    duration: 250,
                    delay: delay,
                });
                delay+=250
            }
            else if (is_unlocked(next_puzzle)) {
                add_next_button(delay);
                delay+=250;
            } else {
                let locked_date = LEVELS[next_puzzle].locked;
                let date_string = getDateString(locked_date);
                let next_puzzle_text = scene.add.text(
                    SCREEN_WIDTH/2, congrat_y_locations[1],
                    "NEXT PUZZLE IN "+date_string,
                    getTimeFont())
                    .setOrigin(0.5,0.5)
                    .setAlpha(0)
                    .setDepth(DEPTHS.BG);
                scene.tweens.add({
                    targets: [next_puzzle_text],
                    alpha: 1,
                    duration: 250,
                    delay: delay,
                });
                delay+=250;
                let ticker = this.time.addEvent({
                    delay   : 1000,
                    loop    : true,
                    callback: () => {
                        if ( Date.now() >= locked_date ) {
                            next_puzzle_text.destroy();
                            add_next_button(250);
                            ticker.remove();
                            return;
                        }
                        next_puzzle_text.setText("NEXT PUZZLE IN "+
                            getDateString(locked_date));
                    }
                });
            }
            let menu_label = scene.add.text(
                SCREEN_WIDTH/2, congrat_y_locations[2],
                ["SELECT PUZZLE"],
                getTimeFont())
                .setOrigin(0.5,0.5)
                .setAlpha(0)
                .setDepth(DEPTHS.BG+1)
                .setColor(COLORS.piece_text);
            let menu_button = scene.add.sprite(
                SCREEN_WIDTH/2, congrat_y_locations[2],
                'button')
                .setAlpha(0)
                .setDepth(DEPTHS.BG);
            menu_button.setInteractive();
            menu_button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                scene.scene.start("LevelSelectScene");
            });
            scene.tweens.add({
                targets: [menu_button, menu_label],
                alpha: 1,
                duration: 250,
                delay: delay
            });
        });

    },

    //--------------------------------------------------------------------------
    update: function () {
    }
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
    create: function () {
        let scene = this;
        //add_audio_handler(scene);
        scene.scene.launch(DEBUG_BUILD ? 'GameScene' : 'LogoScene');
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let LogoScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LogoScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.add.rectangle(
            SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT,
            0xffffff);
        addLogo(scene);
        scene.time.delayedCall(2500, () => {
            scene.scene.start('GameScene');
        })
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

        scene.load.spritesheet('phaser_logo', 'assets/phaser-pixel-medium-flat.png',
            { frameWidth: 104, frameHeight: 22 });
        scene.load.svg('chevron_left', 'assets/chevron_left.svg',
            {width:SIZES.icon_size, height:SIZES.icon_size});
        scene.load.svg('help', 'assets/help.svg',
            {width:SIZES.icon_size, height:SIZES.icon_size});
        scene.load.svg('menu', 'assets/menu.svg',
            {width:SIZES.icon_size, height:SIZES.icon_size});
        scene.load.svg('backspace', 'assets/backspace.svg',
            {width:SIZES.icon_size, height:SIZES.icon_size});
        scene.load.svg('arrow', 'assets/arrow.svg',
            {width:SIZES.icon_size, height:SIZES.icon_size});
        scene.load.svg('lock', 'assets/lock.svg',
            {width:SIZES.piece_font, height:SIZES.piece_font});
        //load_audio(scene);

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

        scene.load.on(Phaser.Loader.Events.COMPLETE, function() {
            scene.scene.start('ControllerScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        let makeRoundedPanelTexture = (scene, key, w, h, radius, color) => {
            // 1) Draw off-screen
            const g = scene.add.graphics()
                .fillStyle(color, 1)
                .fillRoundedRect(0, 0, w, h, radius)
                //.lineStyle(5, 0x808080, 1)
                .strokeRoundedRect(0, 0, w, h, radius);

            // 2) Turn the drawing into a texture in the global cache
            g.generateTexture(key, w, h);

            // 3) Free the Graphics object (no longer needed)
            g.destroy();
        };

        makeRoundedPanelTexture( scene, 'bg',
            SCREEN_WIDTH-GRID_SIZE, SCREEN_HEIGHT - GRID_SIZE,GRID_SIZE/2,
            0xFFFFFF);

        makeRoundedPanelTexture( scene, 'button',
            SCREEN_WIDTH/2, SIZES.timer_font*2,SIZES.timer_font,
            COLORS.grey);

    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: COLORS.grey,
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
            gravity: { y: 0},
            debug: DEBUG_BUILD,
        }
    },
    scene: [ LoadScene, LogoScene, ControllerScene, GameScene, LevelSelectScene ]
};

let game = new Phaser.Game(config);
