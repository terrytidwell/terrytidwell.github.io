
const SPRITE_SCALE = 6;
const SPRITE_SIZE = 12;
const CARD_SIZE = SPRITE_SCALE * SPRITE_SIZE * 2;
const GRID_SIZE = SPRITE_SCALE * SPRITE_SIZE;
const GAP = SPRITE_SIZE * SPRITE_SCALE / 2;

const SCREEN_COLUMNS = 5;
const SCREEN_ROWS = 10;
const SCREEN_HEIGHT = SCREEN_ROWS*CARD_SIZE + (SCREEN_ROWS+1)*GAP;  // 500 //
const SCREEN_WIDTH = SCREEN_COLUMNS*CARD_SIZE + (SCREEN_COLUMNS+1)*GAP; // 630 //

const DEPTHS = {
    CARD: 1000,
    SHADE: 2000,
    BATTLE: 3000,
    UI: 4000,
    ITEMS: 4500,
    FG: 5000,
};

let getFont = (align = "left", fontSize = GRID_SIZE) => {
    let color = '#ffffff'; //'#8ae234';
    return {font: '' + fontSize + 'px VT323', fill: color, align: align,
        wordWrap: {width: SCREEN_WIDTH, useAdvancedWrap: false}};
};

let level_to_cost = (level) => {
    let array = [3, 5, 8, 13, 21];
    let return_default = 34;
    return (level < array.length ? array[level] : return_default);
};

let LOCATIONS = {
    dungeon: 0,
    town: 1,
    screenshot: 2, //500x630
    test: 3,
};

let make_new_player_stats = () => {
    return {
        health: {current: 10, max: 10},
        health_level: {current: 0 },
        stamina: {current: 50, max: 50},
        stamina_level: {current: 0 },
        gold : {current: 0},
        skulls : {current:0},
        floor : {current: 1},
        tiles_flipped : {current: 0},
        matches : {current: 0},
        sword : false,
        location : {current: LOCATIONS.dungeon},
        inventory: {current: [null, null]},
        inventory_level: {current: 0 },
    };
};

let playerStats = make_new_player_stats();

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

        console.log(SCREEN_WIDTH + 'x' + SCREEN_HEIGHT);

        let shade = scene.add.rectangle(0, 0,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000)
            .setScrollFactor(0)
            .setOrigin(0, 0)
            .setDepth(DEPTHS.SHADE)
            .setAlpha(0);
        let reset_shade = () => {
            shade.setAlpha(0);
            shade.setDepth(DEPTHS.SHADE);
        };

        let card_slot = (x) => {
            return x * (CARD_SIZE + GAP) + CARD_SIZE / 2 + GAP;
        };

        let GAME_STATES = {
            'animation': {},
            'animation_no_item': {},
            'playing': {},
            'inventory_management': {},
        };

        //game_state_variables
        let current_game_state = GAME_STATES.animation;
        let current_pair = [];
        let current_inventory_item = null;
        let current_inventory_card = null;
        let ui = null; //ui functions
        let dungeon_cards = scene.add.group();
        let updateables = scene.add.group({
            runChildUpdate: true,
        });
        let current_loot_table = [];
        let current_spell_effects = {};

        let MATCH_ACTIONS = {
            CLEAR: 0,
            CLEAR_WITH_ITEM: 1,
            REMAIN: 2
        };

        let SELECT_ACTIONS = {
            NO_ACTION: 0,
            ATTACK: 1,
        };

        let get_first_empty_inventory_slot = () => {
            let i = 0;
            for (; i < playerStats.inventory.current.length; i++) {
                let item = playerStats.inventory.current[i];
                if (!item) {
                    return i;
                }
            }
            return i;
        };

        let is_inventory_full = () => {
            return get_first_empty_inventory_slot()
                === playerStats.inventory.current.length;
        };

        let fade_in_item = (item_type, shade_alpha = 0.5) => {
            current_game_state = GAME_STATES.animation;
            let new_card = add_card(2, 3.25, item_type);
            new_card.setDepth(DEPTHS.BATTLE);
            new_card.setAlpha(0);
            new_card.setScale(2);
            scene.tweens.add({
                targets: new_card,
                duration: 250,
                alpha: 1,
                x: card_slot(2),
                y: card_slot(3),
            });
            scene.tweens.add({
                targets: shade,
                duration: 250,
                alpha: shade_alpha,
            });
            return new_card;
        };

        let handle_item = (item_type) => {
            let new_card = fade_in_item(item_type);
            scene.time.delayedCall(1000, () => {
                shade.setAlpha(0);
                current_game_state = GAME_STATES.playing;
                new_card.destroy();
                if (item_type.on_consumed) {
                    item_type.on_consumed();
                }
            });
        };

        let handle_inventory_full_item = (item_name) => {
            let new_card = fade_in_item(CARDS[item_name]);
            current_game_state = GAME_STATES.inventory_management;
            new_card.setDepth(DEPTHS.ITEMS);
            new_card.add(scene.add.text(0, 7/8*GRID_SIZE, "Choose an item to use", getFont('middle', GRID_SIZE/2))
                .setOrigin(0.5, 0));
            shade.setDepth(DEPTHS.ITEMS-1);
            current_inventory_card = new_card;
            current_inventory_item = item_name;
            new_card.setInteractive();
            new_card.once(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                CARDS[item_name].on_used();
                new_card.destroy();
                reset_shade();
                current_game_state = GAME_STATES.playing;
                current_inventory_card = null;
                current_inventory_item = null;
            });
        };

        let handle_attack = (card) => {
            let current_type = card.data.values.getType();
            card.setDepth(DEPTHS.BATTLE);
            current_game_state = GAME_STATES.animation_no_item;
            scene.time.delayedCall(1000, () => {
                for (let pair of current_pair) {
                    pair.data.values.flip();
                }
                current_pair = [];
                card.destroy();
                shade.setAlpha(0);
                if (!playerStats.sword) {
                    ui.set_health_text(-3);
                    current_game_state = GAME_STATES.playing;
                } else {
                    if (current_type.on_defeat) {
                        current_type.on_defeat();
                    } else {
                        current_game_state = GAME_STATES.playing;
                    }
                    ui.set_sword_icon(false);
                }
            });

            card.data.values.flip(() => {
                scene.tweens.add({
                    targets: card,
                    duration: 250,
                    scaleX: 2,
                    scaleY: 2,
                    angle: 0,
                    x: card_slot(2),
                    y: card_slot(3),
                });
                scene.tweens.add({
                    targets: shade,
                    duration: 250,
                    alpha: 0.5,
                });
            });
        };

        let on_selection = (new_card) => {
            playerStats.tiles_flipped.current += 1;
            ui.set_stamina_text(-1);
            let current_type = new_card.data.values.getType();

            let select_action = SELECT_ACTIONS.NO_ACTION;
            if (current_type.on_select) {
                select_action = current_type.on_select();
            }

            if (SELECT_ACTIONS.ATTACK === select_action) {
                handle_attack(new_card);
                return;
            }

            new_card.data.values.flip();


            if (current_pair.length < 2) {
                current_pair.push(new_card);
            }
            if (current_pair.length < 2) {
                return;
            }
            current_game_state = GAME_STATES.animation;

            if (current_pair[0].data.values.getType() ===
                current_pair[1].data.values.getType()) {

                playerStats.matches.current += 1;
                scene.time.delayedCall(1000, () => {

                    let match_action = MATCH_ACTIONS.CLEAR;
                    if (current_type.on_match) {
                        match_action = current_type.on_match();
                    }

                    for (let pair of current_pair) {

                        switch (match_action) {
                            case (MATCH_ACTIONS.CLEAR) :
                                pair.destroy();
                                break;
                            case (MATCH_ACTIONS.REMAIN) :
                                pair.data.values.flip();
                                break;
                        }
                    }

                    current_pair = [];
                    current_game_state = GAME_STATES.playing;
                    if (current_type.on_clear) {
                        current_type.on_clear();
                    }
                });
            } else {
                scene.time.delayedCall(1000, () => {

                    for (let pair of current_pair) {
                        pair.data.values.flip();
                    }
                    current_pair = [];
                    current_game_state = GAME_STATES.playing;
                });
            }

        };

        let CARDS = {
            'back': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [347, 348, 349, 350, 345]
            },
            'merchant': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 144]
            },
            'witch': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 49]
            },
            'health': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'misc'],
                'frames': [356, 356, 356, 356, 4 * 18 + 10]
            },
            'health_upgrade': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'custom'],
                'frames': [356, 356, 356, 356, 3],
                'on_consumed': () => {
                    playerStats.health.max += 3;
                    playerStats.health.current += playerStats.stamina.max;
                    ui.set_health_text(0);
                }
            },
            'inventory_upgrade': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'custom'],
                'frames': [356, 356, 356, 356, 9],
                'on_consumed': () => {
                    playerStats.inventory.current.push(null);
                    ui.add_item_slot(playerStats.inventory.current.length-1);
                }
            },
            'stamina_upgrade': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'custom'],
                'frames': [356, 356, 356, 356, 1],
                'on_consumed': () => {
                    playerStats.stamina.max += 10;
                    playerStats.stamina.current += playerStats.stamina.max;
                    ui.set_stamina_text(0);
                }
            },
            'inn': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 319],
                'on_consumed': () => {
                    playerStats.health.current = playerStats.health.max;
                    ui.set_health_text();
                    playerStats.stamina.current = playerStats.stamina.max;
                    ui.set_stamina_text();
                }
            },
            'innkeep': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 143]
            },
            'armorer': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 54]
            },
            'key': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 359],
                'on_clear': () => {
                    let new_card = fade_in_item(CARDS.locked_door);

                    scene.time.delayedCall(500, () => {
                        new_card.data.values.setType(CARDS.unlocked_door);
                        new_card.data.values.setFrames();
                        scene.cameras.main.shake(100, 0.005);
                    });
                    scene.time.delayedCall(1000, () => {
                        new_card.destroy();
                        shade.setAlpha(0);
                        current_game_state = GAME_STATES.playing;
                    });

                    for (let card of dungeon_cards.children.entries) {
                        if (card.data.values.getType() === CARDS.locked_door) {
                            card.data.values.setType(CARDS.unlocked_door);
                        }
                    }
                }
            },
            'meat': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 112],
                'on_clear': () => {
                    if (!is_inventory_full()) {
                        handle_item(CARDS.meat);
                        return;
                    }
                    handle_inventory_full_item('meat');
                },
                'on_consumed': () => {
                    ui.add_item_to_inventory('meat');
                },
                'on_used': () => {
                    ui.set_stamina_text(15);
                    return true;
                }
            },
            'sword': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 99],
                'on_clear': () => {
                    if (!playerStats.sword) {
                        handle_item(CARDS.sword);
                        return;
                    }
                    if (!is_inventory_full()) {
                        handle_item(CARDS.sword);
                        return;
                    }
                    handle_inventory_full_item('sword');
                },
                'on_consumed': () => {
                    if (!playerStats.sword) {
                        ui.set_sword_icon(true);
                        return;
                    }
                    ui.add_item_to_inventory('sword');
                },
                'on_used': () => {
                    if (playerStats.sword) {
                        return false;
                    }
                    ui.set_sword_icon(true);
                    return true;
                }
            },
            'potion': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 30],
                'on_clear': () => {
                    if (playerStats.health.current <= 0 || !is_inventory_full()) {
                        handle_item(CARDS.potion);
                        return;
                    }
                    handle_inventory_full_item('potion');
                },
                'on_consumed': () => {
                    if (playerStats.health.current <= 0) {
                        ui.set_health_text(5);
                        return;
                    }
                    ui.add_item_to_inventory('potion');
                },
                'on_used': () => {
                    ui.set_health_text(5);
                    return true;
                }
            },
            'peek_spell' : {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'custom'],
                'frames': [356, 356, 356, 356, 7],
                'on_clear': () => {
                    if (!is_inventory_full()) {
                        handle_item(CARDS.peek_spell);
                        return;
                    }
                    handle_inventory_full_item('peek_spell');
                },
                'on_consumed': () => {
                    ui.add_item_to_inventory('peek_spell');
                },
                'usable' : () => {
                    return current_game_state === GAME_STATES.playing ||
                        current_game_state === GAME_STATES.inventory_management;
                },
                'on_used': () => {
                    if (!CARDS.peek_spell.usable()) {
                        return false;
                    }
                    if (current_spell_effects.peek_spell) {
                        current_spell_effects.peek_spell();
                        return true;
                    }
                    return false;
                }
            },
            'portal_spell' : {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'custom'],
                'frames': [356, 356, 356, 356, 8],
                'on_clear': () => {
                    if (!is_inventory_full()) {
                        handle_item(CARDS.portal_spell);
                        return;
                    }
                    handle_inventory_full_item('portal_spell');
                },
                'on_consumed': () => {
                    ui.add_item_to_inventory('portal_spell');
                },
                'usable' : () => {
                    if (playerStats.location.current !== LOCATIONS.dungeon) {
                        return false;
                    }
                    return current_game_state !== GAME_STATES.animation &&
                        current_game_state !== GAME_STATES.animation_no_item;
                },
                'on_used': () => {
                    if (!CARDS.portal_spell.usable()) {
                        return false;
                    }
                    CARDS.portal.on_clear();
                    return true;
                }
            },
            'treasure': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 159],
                'on_clear': () => {
                    let new_card = fade_in_item(CARDS.treasure);

                    scene.time.delayedCall(500, () => {
                        new_card.data.values.setType(CARDS.open_treasure);
                        new_card.data.values.setFrames();
                        scene.cameras.main.shake(100, 0.005);
                    });
                    scene.time.delayedCall(1000, () => {
                        new_card.destroy();
                        Phaser.Utils.Array.GetRandom(current_loot_table)
                            .on_clear();
                    });
                }
            },
            'open_treasure': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 161],
            },
            'skeleton': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 51],
                'on_select': () => {
                    return SELECT_ACTIONS.ATTACK;
                },
                'on_defeat': () => {
                    handle_item(CARDS.skull);
                }
            },
            'zombie': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 78],
                'on_select': () => {
                    return SELECT_ACTIONS.ATTACK;
                },
                'on_defeat': () => {
                    handle_item(CARDS.meat);
                }
            },
            'skull': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 344],
                'on_consumed': () => {
                    ui.set_skull_text(1);
                }
            },
            'gold': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 374],
                'on_clear': () => {
                    handle_item(CARDS.gold);
                },
                'on_consumed': () => {
                    ui.set_gold_text(1);
                }
            },
            'locked_door': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 26],
                'on_match': () => {
                    return MATCH_ACTIONS.REMAIN;
                }
            },
            'unlocked_door': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 27],
                'on_clear': () => {
                    let exit = fade_in_item(CARDS.unlocked_door);
                    scene.time.delayedCall(1000, () => {
                        current_game_state = GAME_STATES.animation;
                        let top_shade = scene.add.rectangle(0, 0,
                            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000)
                            .setScrollFactor(0)
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.FG)
                            .setAlpha(0);
                        scene.tweens.add({
                            targets: top_shade,
                            duration: 500,
                            alpha: 1,
                            onComplete: () => {
                                ui.set_floor_text(1);
                                scene.scene.restart();
                            }
                        });
                        scene.tweens.add({
                            targets: exit,
                            scale: 4,
                            duration: 500
                        });
                    });
                },
            },
            'portal': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [356, 356, 356, 356, 141],
                'on_clear': () => {
                    let exit = fade_in_item(CARDS.portal);
                    scene.time.delayedCall(1000, () => {
                        current_game_state = GAME_STATES.animation_no_item;
                        let top_shade = scene.add.rectangle(0, 0,
                            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000)
                            .setScrollFactor(0)
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.FG)
                            .setAlpha(0);
                        scene.tweens.add({
                            targets: top_shade,
                            duration: 500,
                            alpha: 1,
                            onComplete: () => {
                                if (playerStats.location.current === LOCATIONS.dungeon) {
                                    playerStats.location.current = LOCATIONS.town;
                                    ui.set_floor_text(1);
                                } else {
                                    playerStats.location.current = LOCATIONS.dungeon;
                                }
                                scene.scene.restart();
                            }
                        });
                        scene.tweens.add({
                            targets: exit,
                            scale: 4,
                            duration: 500
                        });
                    });
                },
            },
            'empty_room': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 49],
            },
            'tower_dungeon_back': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames': [347, 348, 349, 350, 8],
            },
            'village_back': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [347, 348, 349, 350, 269],
            },
            'gravestone': {
                'spritesheet': ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames': [356, 356, 356, 356, 354],
            },
        };

        let add_card = (x, y, type = CARDS.back, back = CARDS.back) => {
            let internal_x = 0;
            let internal_y = 0;
            let sprites = [];
            sprites.push(scene.add.sprite(
                internal_x - SPRITE_SIZE / 2 * SPRITE_SCALE,
                internal_y - SPRITE_SIZE / 2 * SPRITE_SCALE,
                'basic', 370)
                .setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x + SPRITE_SIZE / 2 * SPRITE_SCALE,
                internal_y - SPRITE_SIZE / 2 * SPRITE_SCALE,
                'basic', 371).setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x + SPRITE_SIZE / 2 * SPRITE_SCALE,
                internal_y + SPRITE_SIZE / 2 * SPRITE_SCALE,
                'basic', 372).setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x - SPRITE_SIZE / 2 * SPRITE_SCALE,
                internal_y + SPRITE_SIZE / 2 * SPRITE_SCALE,
                'basic', 373).setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x,
                internal_y,
                'basic', 368).setScale(SPRITE_SCALE));
            internal_x = card_slot(x);
            internal_y = card_slot(y);
            let container = scene.add.container(internal_x, internal_y, sprites)
                .setDepth(DEPTHS.CARD);

            let sides = [back, type];
            let current_side = 1;

            let setFrames = () => {
                for (let n = 0; n < sprites.length; n++) {
                    sprites[n].setTexture(
                        sides[current_side].spritesheet[n],
                        sides[current_side].frames[n]);
                }
            };
            setFrames();
            container.setData('setFrames', setFrames);
            container.setData('setSide', (side) => {
                current_side = side;
            });

            container.setData('flip', (callback) => {
                current_side = (current_side + 1) % 2;
                let flip_time = 175;
                let max_y_scale = 1.05;
                scene.tweens.add({
                    targets: container,
                    duration: flip_time,
                    scaleX: 0,
                    scaleY: max_y_scale,
                    ease: 'Circle',
                    onComplete: () => {
                        setFrames();
                    }
                });
                scene.tweens.add({
                    targets: container,
                    delay: flip_time,
                    duration: flip_time,
                    scaleX: 1,
                    scaleY: 1,
                    ease: 'Circle',
                    onComplete: () => {
                        if (callback) {
                            callback();
                        }
                    }
                });
            });

            container.setData('getType', () => {
                return sides[1];
            });

            container.setData('setType', (new_type) => {
                return sides[1] = new_type;
            });

            container.setData('isFaceDown', () => {
                return current_side === 0;
            });

            container.setSize(SPRITE_SCALE * SPRITE_SIZE * 2, SPRITE_SCALE * SPRITE_SIZE * 2);
            return container;
        };

        let set_up_ui = () => {
            let sword_icon = scene.add.sprite(
                GAP,
                SCREEN_HEIGHT - 2 * GRID_SIZE - GAP,
                'fantasy', 99)
                .setOrigin(0, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI);
            scene.add.sprite(
                SCREEN_WIDTH - GAP,
                SCREEN_HEIGHT - GAP,
                'basic', 374)
                .setOrigin(1, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI);
            let gold_text = scene.add.text(
                SCREEN_WIDTH - GRID_SIZE - GAP, SCREEN_HEIGHT - GAP,
                "0 ", getFont("right"))
                .setOrigin(1, 1)
                .setVisible(true)
                .setDepth(DEPTHS.UI);
            scene.add.sprite(
                SCREEN_WIDTH - GAP,
                SCREEN_HEIGHT - GRID_SIZE - GAP,
                'basic', 344)
                .setOrigin(1, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI);
            let skull_text = scene.add.text(
                SCREEN_WIDTH - GRID_SIZE - GAP, SCREEN_HEIGHT - GRID_SIZE - GAP,
                "0 ", getFont("right"))
                .setOrigin(1, 1)
                .setVisible(true)
                .setDepth(DEPTHS.UI);
            scene.add.sprite(
                GAP,
                SCREEN_HEIGHT - GAP,
                'basic', 112)
                .setOrigin(0, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI);
            let stamina_text = scene.add.text(
                GRID_SIZE + GAP, SCREEN_HEIGHT - GAP, " 50/50",
                getFont())
                .setOrigin(0, 1)
                .setVisible(true)
                .setDepth(DEPTHS.UI);
            scene.add.sprite(
                GAP,
                SCREEN_HEIGHT - GRID_SIZE - GAP,
                'misc', 4 * 18 + 10)
                .setOrigin(0, 1)
                .setScale(SPRITE_SCALE)
                .setDepth(DEPTHS.UI);
            let health_text = scene.add.text(
                GRID_SIZE + GAP, SCREEN_HEIGHT - GRID_SIZE - GAP, " 50/50",
                getFont())
                .setOrigin(0, 1)
                .setVisible(true)
                .setDepth(DEPTHS.UI);
            let floor_text = scene.add.text(
                SCREEN_WIDTH - GAP, GAP, "1st floor",
                getFont())
                .setOrigin(1, 0)
                .setVisible(true)
                .setDepth(DEPTHS.UI);
            let set_health_text = (delta = 0) => {
                playerStats.health.current += delta;
                let display_value =
                    Phaser.Math.Clamp(playerStats.health.current,
                        0, playerStats.health.max);
                playerStats.health.current = Math.min(
                    playerStats.health.current, playerStats.health.max
                );

                health_text.setText((display_value < 10 ? "  " : " ")
                    + display_value
                    + "/" + playerStats.health.max)
            };
            let set_stamina_text = (delta = 0) => {
                playerStats.stamina.current = playerStats.stamina.current + delta;
                playerStats.stamina.current = Math.min(playerStats.stamina.current,
                    playerStats.stamina.max);
                if (playerStats.stamina.current < 0) {
                    set_health_text(playerStats.stamina.current);
                    playerStats.stamina.current = 0;
                }
                stamina_text.setText((playerStats.stamina.current < 10 ? "  " : " ")
                    + playerStats.stamina.current
                    + "/" + playerStats.stamina.max)
            };
            let set_gold_text = (delta = 0) => {
                playerStats.gold.current += delta;
                gold_text.setText(playerStats.gold.current + " ")
            };
            let set_skull_text = (delta = 0) => {
                playerStats.skulls.current += delta;
                skull_text.setText(playerStats.skulls.current + " ")
            };
            let set_sword_icon = (bool = playerStats.sword) => {
                playerStats.sword = bool;
                if (!playerStats.sword) {
                    for (let i = 0; i < playerStats.inventory.current.length; i++) {
                        let item = playerStats.inventory.current[i];
                        if (item === 'sword') {
                            clear_item_slot(i);
                        }
                    }
                }
                sword_icon.setVisible(playerStats.sword);
            };
            let set_floor_text = (delta = 0) => {
                playerStats.floor.current += delta;
                let postfix = playerStats.floor.current < 4 ? ['th', 'st', 'nd', 'rd'][playerStats.floor.current] : 'th';
                floor_text.setText(playerStats.floor.current + postfix + " f\u200Cloor")
            };
            let set_floor_text_custom = (text) => {
                floor_text.setText(text);
            };
            set_stamina_text();
            set_health_text();
            set_gold_text();
            set_skull_text();
            set_sword_icon();
            set_floor_text();

            let inventory_sprites = [];
            let clear_item_slot = (index) => {
                let consumed = true;
                if (playerStats.inventory.current[index]) {
                    let item_type = CARDS[playerStats.inventory.current[index]];
                    if (item_type.on_used) {
                        consumed = item_type.on_used();
                    }
                }
                if (consumed) {
                    playerStats.inventory.current[index] = null;
                    inventory_sprites[index].setTexture(
                        'basic', 314)
                        .setAlpha(1);
                }
            };

            let add_item_slot = (index) => {
                let item_sprite = scene.add.sprite(
                    SCREEN_WIDTH - index * GRID_SIZE - GAP, SCREEN_HEIGHT - 2 * GRID_SIZE - GAP,
                    'basic', 314)
                    .setDepth(DEPTHS.ITEMS)
                    .setOrigin(1, 1)
                    .setAlpha(1)
                    .setScale(SPRITE_SCALE);
                inventory_sprites.push(item_sprite);
                item_sprite.setInteractive();
                item_sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                    if (current_game_state === GAME_STATES.animation_no_item) {
                        return;
                    }
                    clear_item_slot(item_sprite.data.values.index);
                    if (current_inventory_item) {
                        playerStats.inventory.current[item_sprite.data.values.index] = null;
                        add_item_to_inventory(current_inventory_item, index);
                        current_inventory_item = null;
                        current_inventory_card.destroy();
                        current_inventory_card = null;
                        reset_shade();
                        current_game_state = GAME_STATES.playing;
                    }
                });
                item_sprite.setData('index', index);
                scene.add.rectangle(
                    SCREEN_WIDTH - index * GRID_SIZE - SPRITE_SCALE - GAP,
                    SCREEN_HEIGHT - 2 * GRID_SIZE - GAP,
                    GRID_SIZE - 2 * SPRITE_SCALE, GRID_SIZE - SPRITE_SCALE, 0x303030)
                    .setDepth(DEPTHS.UI - 1)
                    .setOrigin(1, 1);
                if (index < playerStats.inventory.current.length &&
                    playerStats.inventory.current[index]) {
                    let item_name = playerStats.inventory.current[index];
                    let item_type = CARDS[item_name];
                    item_sprite.setTexture(
                        item_type.spritesheet[4], item_type.frames[4])
                        .setAlpha(1);
                }
                item_sprite.update = () => {
                    let item_name = playerStats.inventory.current[index];
                    if (!item_name) {
                        item_sprite.setAlpha(1);
                        return;
                    }
                    let item_type = CARDS[item_name];
                    if (!item_type.usable) {
                        item_sprite.setAlpha(1);
                        return;
                    }
                    if (item_type.usable()) {
                        item_sprite.setAlpha(1);
                        return;
                    }
                    item_sprite.setAlpha(0.5);
                };
                updateables.add(item_sprite);
            };
            for (let i = 0; i < playerStats.inventory.current.length; i++) {
                add_item_slot(i);
            }

            let add_item_to_index = (item_name, item_index) => {
                let current_inventory_sprite = inventory_sprites[item_index];
                playerStats.inventory.current[item_index] = item_name;
                let item_type = CARDS[item_name];
                current_inventory_sprite.setTexture(
                    item_type.spritesheet[4], item_type.frames[4])
                    .setAlpha(1);
            };

            let add_item_to_inventory = (item_name) => {
                let item_index = get_first_empty_inventory_slot();

                if (item_index === playerStats.inventory.current.length) {
                    //handle_max
                    return;
                }

                add_item_to_index(item_name, item_index);
            };

            return {
                set_stamina_text: set_stamina_text,
                set_health_text: set_health_text,
                set_gold_text: set_gold_text,
                set_skull_text: set_skull_text,
                set_sword_icon: set_sword_icon,
                set_floor_text: set_floor_text,
                set_floor_text_custom: set_floor_text_custom,
                add_item_to_inventory: add_item_to_inventory,
                add_item_slot: add_item_slot,
                clear_item_slot: clear_item_slot,
            };
        };
        ui = set_up_ui();

        let set_up_dungeon = () => {
            let current_level_cards = [
                CARDS.key,
                CARDS.key,
                CARDS.skeleton,
                CARDS.skeleton,
                CARDS.skeleton,
                CARDS.locked_door,
                CARDS.locked_door,
                CARDS.treasure,
                CARDS.treasure,
                CARDS.potion,
                CARDS.potion,
                CARDS.gold,
                CARDS.gold,
                CARDS.treasure,
                CARDS.treasure,
                CARDS.empty_room,
                CARDS.empty_room,
                CARDS.empty_room,
                CARDS.empty_room,
                CARDS.empty_room,
                CARDS.empty_room,
            ];

            let add_loot = (card, weight) => {
                repeat(weight, () => { current_loot_table.push(card) });
            };
            add_loot(CARDS.meat, 5);
            add_loot(CARDS.sword, 5);
            add_loot(CARDS.peek_spell, 2);
            add_loot(CARDS.portal_spell, 1);

            if (playerStats.floor.current === 5 || playerStats.floor.current % 10 === 0) {
                current_level_cards[current_level_cards.length - 1] = CARDS.portal;
                current_level_cards[current_level_cards.length - 2] = CARDS.portal;
            }

            Phaser.Utils.Array.Shuffle(current_level_cards);
            let face_down = [];
            for (let i = 0; i < current_level_cards.length; i++) {
                face_down.push(i < current_level_cards.length * 0);
            }
            Phaser.Utils.Array.Shuffle(face_down);
            let deck = [];
            let top_card = null;
            let go_button = scene.add.sprite(card_slot(2), card_slot(7),
                'custom', 10)
                .setDepth(DEPTHS.CARD-1)
                .setAngle(Phaser.Math.Between(-10, 10))
                .setScale(SPRITE_SCALE);
            go_button.play('go_button');
            let current_card_index = 0;
            for (let y = 5; y >= 1; y--) {
                for (let x = 4; x >= 0; x--) {
                    if ((x === 0 || x === 4) && (y === 1 || y === 5)) {
                        continue;
                    }
                    let type = current_level_cards[current_card_index];
                    current_card_index++;
                    let current_card = add_card(2, 7, type);
                    dungeon_cards.add(current_card);
                    deck.push(current_card);
                    current_card.setData('position', [x, y, Phaser.Math.Between(-10, 10)]);
                    current_card.setAngle(Phaser.Math.Between(-10, 10));
                    current_card.setInteractive();

                    if (face_down[current_card_index]) {
                        current_card.data.values.setSide(0);
                        current_card.data.values.setFrames(0);
                    }
                    current_card.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                        if (current_game_state !== GAME_STATES.playing) {
                            return;
                        }
                        if (!current_card.data.values.isFaceDown()) {
                            return;
                        }
                        on_selection(current_card);
                    });
                    top_card = current_card;
                }
            }

            let flip_all = (condition = null) => {
                let max_distance = 0;
                for (let card of dungeon_cards.children.entries) {
                    max_distance = Math.max(
                        max_distance,
                        card.data.values.position[0] + card.data.values.position[1]);
                }
                for (let card of dungeon_cards.children.entries) {
                    let card_distance = card.data.values.position[0] +
                        card.data.values.position[1];
                    if (condition && condition(card)) {
                        scene.time.delayedCall(500 * card_distance / max_distance, card.data.values.flip);
                    }
                }
            };

            let flip_all_down = () => {
                flip_all((card) => {
                    for (let pair of current_pair) {
                        if (pair === card) {
                            return false;
                        }
                    }
                    return !card.data.values.isFaceDown();
                });
            };

            let flip_all_up = () => {
                flip_all((card) => {
                    return card.data.values.isFaceDown();
                });
            };

            current_spell_effects.peek_spell = () => {
                current_game_state = GAME_STATES.animation;
                flip_all_up();
                scene.time.delayedCall(2000, flip_all_down);
                scene.time.delayedCall(2500, () => {
                    current_game_state = GAME_STATES.playing;
                });
            };

            let lay_one = () => {
                if (deck.length === 0) {
                    go_button.setInteractive();
                    /*
                    let shadow = scene.add.sprite(go_button.x, go_button.y, 'custom', 10)
                        .setScale(SPRITE_SCALE)
                        .setDepth(DEPTHS.CARD-2)
                        .setAngle(go_button.angle)
                        .setTintFill();
                    scene.tweens.add({
                        targets: shadow,
                        duration: 500,
                        repeatDelay: 1000,
                        repeat: -1,
                        alpha: 0,
                        scale: SPRITE_SCALE * 2
                    });
                     */
                    go_button.once(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                        flip_all_down();
                        scene.time.delayedCall(500, () => {
                            current_game_state = GAME_STATES.playing;
                        });
                        go_button.destroy();
                        //shadow.destroy();
                    });
                    return;
                }
                let card_to_move = deck.pop();
                scene.tweens.add({
                    targets: card_to_move,
                    x: card_slot(card_to_move.data.values.position[0]),
                    y: card_slot(card_to_move.data.values.position[1]),
                    angle: card_to_move.data.values.position[2],
                    duration: 200,
                    onComplete: () => {
                        lay_one();
                    }
                });
            };

            top_card.data.values.setSide(0);
            top_card.data.values.setFrames(0);
            top_card.once(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                top_card.data.values.flip(() => {
                    scene.time.delayedCall(500, () => {
                        lay_one();
                    });
                });
            });
        };

        let set_up_town = () => {
            ui.set_floor_text_custom("Town")
            let deck = [];
            let flip_all = () => {
                let max_distance = 0;
                for (let card of dungeon_cards.children.entries) {
                    max_distance = Math.max(
                        max_distance,
                        card.data.values.position[0] + card.data.values.position[1]);
                }
                for (let card of dungeon_cards.children.entries) {
                    let card_distance = card.data.values.position[0] +
                        card.data.values.position[1];
                    scene.time.delayedCall(500 * card_distance / max_distance, () => {
                        card.data.values.flip(() => {
                            if (card.data.values.prep) {
                                card.data.values.prep(card);
                            }
                            if (card.data.values.on_click) {
                                card.setInteractive();
                                card.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                                    card.data.values.on_click();
                                });
                            }
                            if (card.update) {
                                updateables.add(card);
                            }
                        });
                    });
                }
                scene.time.delayedCall(1000, () => {
                    current_game_state = GAME_STATES.playing;
                })
            };

            let lay_one = () => {
                if (deck.length === 0) {
                    scene.time.delayedCall(500, flip_all);
                    return;
                }
                let card_to_move = deck.pop();
                scene.tweens.add({
                    targets: card_to_move,
                    x: card_slot(card_to_move.data.values.position[0]),
                    y: card_slot(card_to_move.data.values.position[1]),
                    angle: card_to_move.data.values.position[2],
                    duration: 200,
                    onComplete: () => {
                        lay_one();
                    }
                })
            };

            let justify_text = (cost_text, icon, padding = 0) => {
                let text_width = cost_text.width + padding / 2;
                let total_width = text_width + GRID_SIZE + padding;
                cost_text.x = - total_width / 2;
                icon.x = - total_width / 2 + text_width;
            };

            let set_cost_text = (cost_text, icon, stat, padding = -GRID_SIZE / 4) => {
                let text = "" + level_to_cost(stat.current) + "x";
                cost_text.setText(text);
                justify_text(cost_text, icon, padding);
            };

            let town_types = {
                health_upgrade: {
                    type: CARDS.health_upgrade, x: 1, y: 1, prep: (card) => {
                        let height = GRID_SIZE * 7 / 8;
                        let cost_text = scene.add.text(
                            0, height,
                            "xxx", getFont('left'))
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.UI);
                        let icon = scene.add.sprite(
                            0, height + SPRITE_SCALE / 2,
                            'basic', 344)
                            .setOrigin(0, 0)
                            .setScale(SPRITE_SCALE)
                            .setDepth(DEPTHS.UI);
                        card.add(cost_text);
                        card.add(icon);
                        set_cost_text(cost_text, icon, playerStats.health_level);
                        town_types.health_upgrade.cost_text = cost_text;
                        town_types.health_upgrade.icon = icon;
                    },
                    clickable: () => {
                        if (playerStats.skulls.current < level_to_cost(playerStats.health_level.current)) {
                            return false;
                        }
                        return true;
                    },
                    on_click: () => {
                        if (current_game_state !== GAME_STATES.playing) {
                            return;
                        }
                        if (!town_types.health_upgrade.clickable()) {
                            return;
                        }
                        ui.set_skull_text(-level_to_cost(playerStats.health_level.current));
                        playerStats.health_level.current++;
                        set_cost_text(town_types.health_upgrade.cost_text,
                            town_types.health_upgrade.icon,
                            playerStats.health_level);
                        handle_item(CARDS.health_upgrade);
                    }
                },
                stamina_upgrade: {
                    type: CARDS.stamina_upgrade, x: 0, y: 1, prep: (card) => {
                        let height = GRID_SIZE * 7 / 8;
                        let cost_text = scene.add.text(
                            0, height,
                            "xxx", getFont('left'))
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.UI);
                        let icon = scene.add.sprite(
                            0, height + SPRITE_SCALE / 2,
                            'basic', 344)
                            .setOrigin(0, 0)
                            .setScale(SPRITE_SCALE)
                            .setDepth(DEPTHS.UI);
                        card.add(cost_text);
                        card.add(icon);
                        set_cost_text(cost_text, icon, playerStats.stamina_level);
                        town_types.stamina_upgrade.cost_text = cost_text;
                        town_types.stamina_upgrade.icon = icon;
                    },
                    clickable: () => {
                        if (playerStats.skulls.current < level_to_cost(playerStats.stamina_level.current)) {
                            return false;
                        }
                        return true;
                    },
                    on_click: () => {
                        if (current_game_state !== GAME_STATES.playing) {
                            return;
                        }
                        if (!town_types.stamina_upgrade.clickable()) {
                            return;
                        }
                        ui.set_skull_text(-level_to_cost(playerStats.stamina_level.current));
                        playerStats.stamina_level.current++;
                        set_cost_text(town_types.stamina_upgrade.cost_text,
                            town_types.stamina_upgrade.icon,
                            playerStats.stamina_level);
                        handle_item(CARDS.stamina_upgrade);
                    }
                },
                witch: {type: CARDS.witch, x: 0.5, y: 0},
                innkeep: {type: CARDS.innkeep, x: 3.5, y: 1.5},
                inn: {
                    type: CARDS.inn, x: 3.5, y: 2.5, prep: (card) => {
                        let height = GRID_SIZE * 7 / 8;
                        let cost_text = scene.add.text(
                            0, height,
                            "1x", getFont('left'))
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.UI);
                        let icon = scene.add.sprite(
                            0, height,
                            'basic', 374)
                            .setOrigin(0, 0)
                            .setScale(SPRITE_SCALE)
                            .setDepth(DEPTHS.UI);
                        card.add(cost_text);
                        card.add(icon);
                        town_types.inn.cost_text = cost_text;
                        town_types.inn.icon = icon;
                        justify_text(cost_text, icon)
                    },
                    clickable: () => {
                        if (playerStats.gold.current < 1) {
                            return false;
                        }
                        if (playerStats.health.current >= playerStats.health.max && playerStats.stamina.current >= playerStats.stamina.max) {
                            return false;
                        }
                        return true;
                    },
                    on_click: () => {
                        if (current_game_state !== GAME_STATES.playing) {
                            return;
                        }
                        if (!town_types.inn.clickable()) {
                            return;
                        }
                        ui.set_gold_text(-1);
                        handle_item(CARDS.inn);
                    },
                },
                inventory_upgrade: {
                    type: CARDS.inventory_upgrade, x: 2, y: 4, prep: (card) => {
                        let height = GRID_SIZE * 7 / 8;
                        let cost_text = scene.add.text(
                            0, height,
                            "xxx", getFont('left'))
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.UI);
                        let icon = scene.add.sprite(
                            0, height,
                            'basic', 374)
                            .setOrigin(0, 0)
                            .setScale(SPRITE_SCALE)
                            .setDepth(DEPTHS.UI);
                        card.add(cost_text);
                        card.add(icon);
                        set_cost_text(cost_text, icon, playerStats.inventory_level, 0);
                        town_types.inventory_upgrade.cost_text = cost_text;
                        town_types.inventory_upgrade.icon = icon;
                    },
                    clickable: () => {
                        if (playerStats.gold.current < level_to_cost(playerStats.inventory_level.current)) {
                            return false;
                        }
                        return true;
                    },
                    on_click: () => {
                        if (current_game_state !== GAME_STATES.playing) {
                            return;
                        }
                        if (!town_types.inventory_upgrade.clickable()) {
                            return;
                        }
                        ui.set_gold_text(-level_to_cost(playerStats.inventory_level.current));
                        playerStats.inventory_level.current++;
                        set_cost_text(town_types.inventory_upgrade.cost_text,
                            town_types.inventory_upgrade.icon,
                            playerStats.inventory_level, 0);
                        handle_item(CARDS.inventory_upgrade);
                    }
                },
                armorer: {type: CARDS.armorer, x: 1.5, y: 3},
                sword: {
                    type: CARDS.sword, x: 1, y: 4, prep: (card) => {
                        let height = GRID_SIZE * 7 / 8;
                        let cost_text = scene.add.text(
                            0, height,
                            "1x", getFont('left'))
                            .setOrigin(0, 0)
                            .setDepth(DEPTHS.UI);
                        let icon = scene.add.sprite(
                            0, height,
                            'basic', 374)
                            .setOrigin(0, 0)
                            .setScale(SPRITE_SCALE)
                            .setDepth(DEPTHS.UI);
                        card.add(cost_text);
                        card.add(icon);
                        town_types.sword.cost_text = cost_text;
                        town_types.sword.icon = icon;
                        justify_text(cost_text, icon);
                    },
                    clickable: () => {
                        if (playerStats.gold.current < 1) {
                            return false;
                        }
                        if (playerStats.sword && is_inventory_full()) {
                            return false;
                        }
                        return true;
                    },
                    on_click: () => {
                        if (current_game_state !== GAME_STATES.playing) {
                            return;
                        }
                        if (!town_types.sword.clickable()) {
                            return;
                        }
                        ui.set_gold_text(-1);
                        handle_item(CARDS.sword);
                    },
                },
                portal: {
                    type: CARDS.portal, x: 4, y: 6,
                    on_click: () => {
                        CARDS.portal.on_clear();
                    }
                },
            };
            let town_cards = [
                town_types.portal,
                town_types.inventory_upgrade,
                town_types.sword,
                town_types.armorer,
                town_types.inn,
                town_types.innkeep,
                town_types.health_upgrade,
                town_types.stamina_upgrade,
                town_types.witch,
            ];

            let top_card = null;
            for (let town_card of town_cards) {
                let new_card = add_card(2, 7, town_card.type, CARDS.village_back);
                dungeon_cards.add(new_card);
                deck.push(new_card);
                new_card.setData('position', [town_card.x, town_card.y, 0]); //Phaser.Math.Between(-10, 10)
                new_card.setData('prep', town_card.prep);
                new_card.setData('clickable', town_card.clickable);
                new_card.setData('on_click', town_card.on_click);
                new_card.setData('town_card', town_card);
                if (new_card.data.values.clickable) {
                    new_card.update = () => {
                        if (new_card.data.values.town_card.type.frames[4] === 99) {
                            console.log('sword');
                        }
                        if (new_card.data.values.clickable) {
                            new_card.setAlpha(new_card.data.values.clickable() ? 1 : 0.25);
                        }
                    };
                }
                new_card.setAngle(Phaser.Math.Between(-10, 10));
                new_card.setInteractive();
                new_card.data.values.setSide(0);
                new_card.data.values.setFrames(0);
                top_card = new_card;
            }

            top_card.once(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                lay_one();
            });
        };

        let set_up_test = () => {
            add_card(0,1, CARDS.meat).on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,() => {
                CARDS.meat.on_clear();
            }).setInteractive();
            add_card(1,1, CARDS.potion).on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,() => {
                CARDS.potion.on_clear();;
            }).setInteractive();
            add_card(2,1, CARDS.sword).on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,() => {
                CARDS.sword.on_clear();;
            }).setInteractive();
            add_card(3,1, CARDS.skeleton).on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,() => {
                let card = add_card(3,1, CARDS.skeleton);
                card.data.values.flip(() => {
                    scene.time.delayedCall(500, () => {handle_attack(card);});
                });
            }).setInteractive();
            ui.set_floor_text_custom("Test")
            ui.set_health_text(-9);
            ui.set_stamina_text(-49);
        };

        let set_up_screenshot = () => {
            add_card(1.25, 1.5)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(2.5, 1.25)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(2.75, -0.25, CARDS.village_back)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(2.25, 0.5)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(2, 1, CARDS.tower_dungeon_back)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(1, -0.25, CARDS.sword)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(0.25, 0.5, CARDS.tower_dungeon_back)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(-0.25, -0.25)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(1.75, 1.25, CARDS.open_treasure)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(0.75, 0.5)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(1.5, 0.25, CARDS.village_back)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(0, 1.4, CARDS.tower_dungeon_back)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(0.5, 1.25, CARDS.gold)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(-0.25, 0.5, CARDS.skeleton)
                .setAngle(Phaser.Math.Between(-10,10));
            add_card(1.9, 0, CARDS.locked_door)
                .setAngle(Phaser.Math.Between(-10,10));
            //shade.setAlpha(0.50);
            //scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, "MATCH\nDUNGEON", getFont('center', GRID_SIZE*2))
            //    .setOrigin(0.5, 0.5)
            //    .setDepth(DEPTHS.UI);
        };

        if (playerStats.location.current === LOCATIONS.dungeon) {
            set_up_dungeon();
        } else if (playerStats.location.current === LOCATIONS.town) {
            set_up_town();
        } else if (playerStats.location.current === LOCATIONS.test) {
            set_up_test();
        } else if (playerStats.location.current === LOCATIONS.screenshot) {
            set_up_screenshot();
        }


        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;

        scene.__update = () => {
             if (current_game_state === GAME_STATES.playing && playerStats.health.current <= 0) {
                //try to save yourself;
                for (let i = 0; i < playerStats.inventory.current.length; i++) {
                    let item = playerStats.inventory.current[i];
                    if (item === 'potion') {
                        ui.clear_item_slot(i);
                        if (playerStats.health.current > 0) {
                            break;
                        }
                    }
                }
                if (playerStats.health.current > 0) {
                    return;
                }

                fade_in_item(CARDS.gravestone, 0.85);
                //overwrite with a new gamestate
                current_game_state = GAME_STATES.animation_no_item;

                let texts = ['You died', '', 'Tiles Flipped: ' + playerStats.tiles_flipped.current, 'Matches: ' + playerStats.matches.current, '', 'Restart Game'];
                let current_offset = card_slot(3.5);
                let current_delay = 500;
                for (let i = 0; i < texts.length; i++) {
                    let text = texts[i];
                    current_offset += GRID_SIZE;
                    if (text === '') {
                        continue;
                    }
                    let text_object = scene.add.text(
                        SCREEN_WIDTH / 2, current_offset, text,
                        getFont('center'))
                        .setOrigin(0.5, 0)
                        .setAlpha(0)
                        .setDepth(DEPTHS.UI);
                    let target_alpha = 1;
                    let completion_handler = () => {
                    };
                    if (i === texts.length - 1) {
                        target_alpha = 0.5;
                        completion_handler = () => {
                            addButton(text_object, () => {
                                playerStats = make_new_player_stats();
                                scene.scene.restart();
                            });
                        };
                    }
                    scene.tweens.add({
                        targets: text_object,
                        duration: 250,
                        delay: current_delay,
                        alpha: target_alpha,
                        onComplete: completion_handler,
                    });
                    current_delay += 250;
                }
            }
        }
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

        scene.load.spritesheet('misc', 'assets/Misc.png',
            { frameWidth: 12, frameHeight: 12 });
        scene.load.spritesheet('basic', 'assets/basic.png',
            { frameWidth: 12, frameHeight: 12 });
        scene.load.spritesheet('custom', 'assets/custom.png',
            { frameWidth: 12, frameHeight: 12 });
        scene.load.spritesheet('modern', 'assets/modern.png',
            { frameWidth: 12, frameHeight: 12 });
        scene.load.spritesheet('fantasy', 'assets/fantasy.png',
            { frameWidth: 12, frameHeight: 12 });

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
            key: 'go_button',
            frames: [

                { key: 'custom', frame: 11 },
                { key: 'custom', frame: 12 },
                { key: 'custom', frame: 11 },
                { key: 'custom', frame: 10 },
            ],
            skipMissedFrames: false,
            frameRate: 6,
            repeat: -1,
            repeatDelay: 250,
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
