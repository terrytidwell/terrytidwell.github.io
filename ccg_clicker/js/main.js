
/*
const SPRITE_SCALE = 4;
const SPRITE_SIZE = 16;
const CARD_SIZE = SPRITE_SCALE * SPRITE_SIZE * 2;
const GRID_SIZE = SPRITE_SCALE * SPRITE_SIZE;
const GAP = SPRITE_SIZE * SPRITE_SCALE / 2;

const SCREEN_COLUMNS = 5;
const SCREEN_ROWS = 10;

const SCREEN_HEIGHT = SCREEN_ROWS*CARD_SIZE + (SCREEN_ROWS+1)*GAP;  // 500 //
const SCREEN_WIDTH = SCREEN_COLUMNS*CARD_SIZE + (SCREEN_COLUMNS+1)*GAP; // 630 //
*/
const GRID_SIZE = 64;
const SCREEN_SCALE = 1.5;
const SCREEN_HEIGHT = 720 * SCREEN_SCALE;
const SCREEN_WIDTH = 360 * SCREEN_SCALE;

const DEPTHS = {
    CARD: 1000,
    SELECTED_CARD: 1500,
    UI: 2000,
};

let card_image_atlas = {
    "Ashen Aggressor" : {frame: 0},
    "Aqua Arcanist" : {frame: 1},
    "Ebon Enmity" : {frame: 2},
    "Moss Mantid" : {frame: 3},
    "Justice Rally" : {frame: 4},
    "Pyro Pixie" : {frame: 5},
    "Zephyr Insight" : {frame: 6},
    "Doom Dancer" : {frame: 7},
    "Thorn Titan" : {frame: 8},
    "Order's Omen" : {frame: 9},
    "Fiery Tantrum" : {frame: 10},
    "Mist Elemental" : {frame: 11},
    "Unholy Union" : {frame: 12},
    "Leaf Lancer" : {frame: 13},
    "Light's Law" : {frame: 14},
    "Ember Goblin" : {frame: 15},
    "Foam Sprite" : {frame: 16},
    "Carrion Crow" : {frame: 17},
    "Bud Beast" : {frame: 18},
    "Archon's Answer" : {frame: 19},
    "Ripple Read" : {frame: 20},
    "Hearth Hulk" : {frame: 21},
    "Decay's Demand" : {frame: 22},
    "Bloom Behemoth" : {frame: 23},
    "Harmony Healer" : {frame: 24},
    "Tsunami Turtle" : {frame: 25},
    "Spark Ignition" : {frame: 26},
    "Rotten Revival" : {frame: 27},
    "Pollen Pixie" : {frame: 28},
    "Sacred Shield" : {frame: 29},
    "Wind Whisperer" : {frame: 30},
    "Terra Titan" : {frame: 31},
    "Ominous Ooze" : {frame: 32},
    "Foliage Fox" : {frame: 33},
    "Zealous Templar" : {frame: 34},
    "Tidal Testament" : {frame: 35},
    "Caldera Chimera" : {frame: 36},
    "Deadman's Dance" : {frame: 37},
    "Bramble Bear" : {frame: 38},
    "Serene Sentinel" : {frame: 39},
    "Cyclone Sphinx" : {frame: 40},
    "Flamekin Fool" : {frame: 41},
    "Shadow Scheme" : {frame: 42},
    "Wildwood Wisp" : {frame: 43},
    "Pure Presence" : {frame: 44},
    "Squall Serpent" : {frame: 45},
    "Scorched Guard" : {frame: 46},
    "Vile Vessel" : {frame: 47},
    "Sudden Growth" : {frame: 48},
    "Divine Decree" : {frame: 49},
    "Zephyr's Puzzle" : {frame: 50},
    "Magma Mantis" : {frame: 51},
    "Bane's Birth" : {frame: 52},
    "Mossy Mammoth" : {frame: 53},
    "Paladin Promise" : {frame: 54},
    "Breeze Bard" : {frame: 55},
    "Volcano Dragon" : {frame: 56},
    "Morbid Mockery" : {frame: 57},
    "Seedling Satyr" : {frame: 58},
    "Angelic Aid" : {frame: 59},
    "Gust Grimoire" : {frame: 60},
    "Crackle Crone" : {frame: 61},
    "Crypt Creeper" : {frame: 62},
    "Feral Fawn" : {frame: 63},
    "Cherub's Charge" : {frame: 64},
    "Sea Song Aria" : {frame: 65},
    "Frenzy Flame" : {frame: 66},
    "Ghastly Grip" : {frame: 67},
    "Fungal Fighter" : {frame: 68},
    "Heavenly Healer" : {frame: 69},
    "Tempest Tutor" : {frame: 70},
    "Quake Quagmire" : {frame: 71},
    "Sin's Servant" : {frame: 72},
    "Orchard Ogre" : {frame: 73},
    "Lawful Light" : {frame: 74},
    "Windway Scholar" : {frame: 75},
    "Smoke Specter" : {frame: 76},
    "Vampire Vanity" : {frame: 77},
    "Sprig Spriggan" : {frame: 78},
    "Unicorn's Bond" : {frame: 79},
    "Sky Tidal Echo" : {frame: 80},
    "Cinder Scamp" : {frame: 81},
    "Demon's Mark" : {frame: 82},
    "Canopy Chimera" : {frame: 83},
    "Blessed Bulwark" : {frame: 84},
    "Tidal Thinker" : {frame: 85},
    "Clay Troglodyte" : {frame: 86},
    "Graveborn Grin" : {frame: 87},
    "Lichen Lich" : {frame: 88},
    "Faith's Flame" : {frame: 89},
    "Breeze's Lesson" : {frame: 90},
    "Geode Goliath" : {frame: 91},
    "Crypt Command" : {frame: 92},
    "Petal Protector" : {frame: 93},
    "Spirit Stag" : {frame: 94},
    "Ocean Ponder" : {frame: 95},
    "Raging Rockhide" : {frame: 96},
    "Morose Muse" : {frame: 97},
    "Verdant Viper" : {frame: 98},
    "Loyal Hound" : {frame: 99},
    "Windwise Scribe" : {frame: 100},
    "Spark Satyr" : {frame: 101},
    "Sinister Self" : {frame: 102},
    "Tangle Toad" : {frame: 103},
    "Pegasus Paragon" : {frame: 104},
    /*
    "---" : {frame: 105},
    "---" : {frame: 106},
    "---" : {frame: 107},
    "---" : {frame: 108},
    "---" : {frame: 109},
    */
};

let blue_cards = [
    "Aqua Adept",
    "Aqua Arcanist",
    "Aqua Brainstorm",
    "Aquatic Wisdom",
    "Breeze Bard",
    "Breeze's Lesson",
    "Cyclone Lessons",
    "Cyclone Sphinx",
    "Deluge Dragon",
    "Deluge Scribe",
    "Dewdrop Oracle",
    "Foam Sprite",
    "Gale Mindweaver",
    "Gale's Caress",
    "Gust Grimoire",
    "Gust Guide",
    "Knowledge Wave",
    "Mist Elemental",
    "Misty Whispers",
    "Ocean Ponder",
    "Ocean's Secret",
    "Ripple Read",
    "Ripple Wisdom",
    "Riptide Reader",
    "Sea Song Aria",
    "Sky Tidal Echo",
    "Splash Insight",
    "Squall Serpent",
    "Stormscribe",
    "Tempest Tome",
    "Tempest Tutor",
    "Tidal Intellect",
    "Tidal Seahorse",
    "Tidal Testament",
    "Tidal Thinker",
    "Torrent's Tale",
    "Tsunami Sage",
    "Tsunami Turtle",
    "Vortex Kraken",
    "Wave Warden",
    "Wave Whisper",
    "Wave's Archive",
    "Wind Whisperer",
    "Windlore Keeper",
    "Windrider Eagle",
    "Windway Scholar",
    "Windwise Scribe",
    "Windwoven Words",
    "Zephyr Griffin",
    "Zephyr Insight",
    "Zephyr Zealot",
    "Zephyr's Puzzle",
];

let red_cards = [
    "Ashen Aggressor",
    "Blaze Barbarian",
    "Blaze Basilisk",
    "Blaze Brute",
    "Blaze Warlord",
    "Caldera Chimera",
    "Cinder Cyclops",
    "Cinder Scamp",
    "Clay Troglodyte",
    "Coal Conqueror",
    "Crackle Crone",
    "Duststorm Demon",
    "Earthquake Ogre",
    "Ember Elemental",
    "Ember Goblin",
    "Erupt Elemental",
    "Fiery Tantrum",
    "Fissure Fiend",
    "Flame Fiend",
    "Flamekin Fool",
    "Flashfire Fairy",
    "Frenzy Flame",
    "Furnace Fury",
    "Geode Goliath",
    "Hasty Hellion",
    "Hearth Hulk",
    "Ignite Instigator",
    "Impulsive Imp",
    "Lava Leaper",
    "Lava Orc",
    "Magma Mantis",
    "Magma Mauler",
    "Molten Marauder",
    "Pyro Pixie",
    "Pyro Prince",
    "Pyro Prowler",
    "Quake Quagmire",
    "Raging Rockhide",
    "Rift Rascal",
    "Scorched Guard",
    "Scoria Scamp",
    "Sear Sentinel",
    "Sizzle Newt",
    "Smoke Specter",
    "Smolder Sprite",
    "Soot Slinger",
    "Soot Sprite",
    "Spark Ignition",
    "Spark Satyr",
    "Terra Titan",
    "Volcanic Vandal",
    "Volcano Dragon",
];

//   123456789012345
let black_cards = [
    "Bane's Birth",
    "Blood Boon",
    "Bone Brute",
    "Carrion Crow",
    "Crypt Command",
    "Crypt Crawler",
    "Crypt Creeper",
    "Dark Decree",
    "Dark Drifter",
    "Deadman's Dance",
    "Deadwood Demon",
    "Death's Demand",
    "Death's Drum",
    "Decay's Demand",
    "Demonic Deal",
    "Demon's Mark",
    "Despair Drake",
    "Dire Demand",
    "Doom Dancer",
    "Ebon Enmity",
    "Ego Echo",
    "Ghastly Grip",
    "Ghoul's Grasp",
    "Grave Gambit",
    "Grave Ghoul",
    "Graveborn Grin",
    "Gutter Rat",
    "Morbid Mockery",
    "Morose Muse",
    "Necro Nurturer",
    "Nether Nudge",
    "Ominous Ooze",
    "Plague Patron",
    "Rot Raider",
    "Rotten Revival",
    "Self Surge",
    "Selfish Specter",
    "Shade Sacrifice",
    "Shadow Scheme",
    "Sinew Skeleton",
    "Sinister Self",
    "Sin's Servant",
    "Skeleton Scorn",
    "Skull Siphon",
    "Tomb Tyrant",
    "Unholy Union",
    "Vampire Vanity",
    "Vampiric Vice",
    "Vile Vessel",
    "Wicked Wraith",
    "Wraith Whisper",
    "Zombie Zealot",
];

let green_cards = [
    "Bloom Behemoth",
    "Blossom Brute",
    "Bough Basilisk",
    "Bramble Bear",
    "Bramble Boar",
    "Bud Beast",
    "Bud Beetle",
    "Canopy Chimera",
    "Canopy Cougar",
    "Dewdrop Drake",
    "Feral Fawn",
    "Fern Fiend",
    "Flora Faerie",
    "Foliage Fox",
    "Foliage Phoenix",
    "Fungal Fighter",
    "Grove Gargoyle",
    "Grove Griffin",
    "Grove Guardian",
    "Ivy Imp",
    "Leaf Lancer",
    "Lichen Lich",
    "Lush Lynx",
    "Moss Mantid",
    "Mossy Mammoth",
    "Mossy Mongoose",
    "Mycelium Mantis",
    "Nature Nurturer",
    "Orchard Ogre",
    "Petal Paladin",
    "Petal Protector",
    "Pollen Pixie",
    "Root Raptor",
    "Root Wrestler",
    "Sapling Serpent",
    "Seedling Satyr",
    "Soil Soldier",
    "Soil Sylph",
    "Sprig Spriggan",
    "Sprout Serpent",
    "Sprout Sprite",
    "Sudden Growth",
    "Tangle Toad",
    "Thicket Thug",
    "Thorn Titan",
    "Timber Troll",
    "Timber Turtle",
    "Verdant Viper",
    "Verdant Vulture",
    "Vine Viper",
    "Wildwood Wisp",
    "Wildwood Wurm",
];

//   123456789012345
let white_cards = [
    "Angelic Aid",
    "Angelic Aura",
    "Angel's Wings",
    "Archangel's Arc",
    "Archon's Answer",
    "Blessed Blade",
    "Blessed Bulwark",
    "Celestial Call",
    "Cherub's Charge",
    "Devotion",
    "Devout Crusader",
    "Divine Decree",
    "Divine Defender",
    "Faith's Flame",
    "Faith's Fury",
    "Harmony Healer",
    "Healing Hand",
    "Heavenly Healer",
    "Holy Herald",
    "Holy Honor",
    "Justice Javelin",
    "Justice Rally",
    "Knight's Knack",
    "Lawful Light",
    "Law's Lantern",
    "Light's Law",
    "Loyal Charger",
    "Loyal Hound",
    "Noble Knight",
    "Noble's Nudge",
    "Order's Oath",
    "Order's Omen",
    "Order's Oracle",
    "Paladin Promise",
    "Peace Preserver",
    "Pegasus Paragon",
    "Pious Paladin",
    "Pious Protector",
    "Pure Presence",
    "Sacred Shield",
    "Sacred Soldier",
    "Saintly Strike",
    "Seraph's Song",
    "Serene Sentinel",
    "Smite",
    "Spirit Stag",
    "Truth's Torch",
    "Unicorn's Bond",
    "Virtue's Voice",
    "Virtuous Vigil",
    "Worship",
    "Zealous Templar",
];

let RARITY = {
    "Common" : {name: "Common", frame: 5, count: 20},
    "Uncommon" : {name: "Uncommon", frame: 6, count: 16},
    "Rare" : {name: "Rare", frame: 7, count: 12},
    "Mythic" : {name: "Mythic", frame: 7, count: 4},
};
let RARITIES = [RARITY.Common, RARITY.Uncommon, RARITY.Rare, RARITY.Mythic];

let COLOR = {
    "Blue" : {name: "Blue", names: blue_cards, frame: 0}, // collector_number_offset: 0},
    "Red" : {name: "Red", names: red_cards, frame: 1}, // collector_number_offset: 52},
    "Black" : {name: "Black", names: black_cards, frame: 2}, // collector_number_offset: 104},
    "Green" : {name: "Green", names: green_cards, frame: 3}, // collector_number_offset: 156},
    "White" : {name: "White", names: white_cards, frame: 4}, // collector_number_offset: 208},
};
let COLORS = [COLOR.Blue, COLOR.Red, COLOR.Black, COLOR.Green, COLOR.White];

let getFont = (align = "left", fontSize = 16) => {
    let color = '#000000'; //'#8ae234';
    return {font: '' + fontSize + 'px m5x7', fill: color, align: align,
        wordWrap: {width: SCREEN_WIDTH, useAdvancedWrap: false}};
};

let createGameState = () => {
    let value = {
        money: 0,
        number_collected: [],
    };
    repeat(260, () => { value.number_collected.push(0); });
    return value;
};

let gameState = createGameState();

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

        let updateables = scene.add.group({
            runChildUpdate: true,
        });
        let draggables = scene.physics.add.group();
        let drag_targets = scene.physics.add.group();

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;

        let x = SCREEN_WIDTH/2;
        let y = SCREEN_HEIGHT/2;

        let assign_rarities_randomly = () => {
            for (let color of COLORS) {
                let rarity_array = [];
                for (let rarity of RARITIES) {
                    repeat(rarity.count, () => {
                        rarity_array.push(rarity);
                    });
                }
                Phaser.Utils.Array.Shuffle(rarity_array);
                color.rarities = rarity_array;
            }
        };

        let assign_unassigned_randomly = () => {
            for (let color of COLORS) {
                let rarity_array = [];
                for (let rarity of RARITIES) {
                    repeat(rarity.count, () => {
                        rarity_array.push(rarity);
                    });
                }
                color.rarities = [];
                let image_rarity_array = [];
                for (let name of color.names) {
                    if (!card_image_atlas[name]) {
                        continue;
                    }
                    image_rarity_array.push(rarity_array.shift());
                }
                Phaser.Utils.Array.Shuffle(image_rarity_array);
                for (let name of color.names) {
                    color.rarities.push(!card_image_atlas[name] ?
                        null : image_rarity_array.shift());
                }
                Phaser.Utils.Array.Shuffle(rarity_array);
                for (let i = 0; i < color.rarities.length; i++) {
                    if (!color.rarities[i]) {
                        color.rarities[i] = rarity_array.pop();
                    }
                }
            }
        };
        assign_unassigned_randomly();

        let build_card_list = () => {
            let all_card_list = [];
            let collectors_number = 0;
            for (let color of COLORS) {
                for (let i = 0; i < color.names.length; i++) {
                    let name = color.names[i];
                    let rarity = color.rarities[i];
                    collectors_number++;
                    let image_frame = color.frame;
                    let image_sprite_sheet = 'ccg-default-images';
                    if (card_image_atlas[name]) {
                        image_frame = card_image_atlas[name].frame;
                        image_sprite_sheet = 'ccg-images';
                    }
                    all_card_list.push({
                        name: name,
                        index: collectors_number - 1,
                        collectors_number : collectors_number,
                        collectors_number_string : "" + collectors_number + "/260",
                        //color_string: color.name,
                        color: color,
                        //rarity_string: rarity.name,
                        rarity: rarity,
                        image_frame: image_frame,
                        image_sprite_sheet: image_sprite_sheet,
                    });
                }
            }
            return all_card_list;
        };
        let all_card_list = build_card_list();

        let color_filters = [
            {active: true, color: COLOR.Blue},
            {active: true, color: COLOR.Red},
            {active: true, color: COLOR.Black},
            {active: true, color: COLOR.Green},
            {active: true, color: COLOR.White},
        ];
        let rarity_filters = [
            {active: true, rarity: RARITY.Common},
            {active: true, rarity: RARITY.Uncommon},
            {active: true, rarity: RARITY.Rare},
            {active: true, rarity: RARITY.Mythic},
        ];
        let owned_filters = [
            {active: true, owned: 0},
            {active: true, owned: 1},
            {active: true, owned: 2},
            {active: true, owned: 3},
            {active: true, owned: 4},
        ];

        let current_filter_list = [];
        let card_filter = (card) => {
            let color_filter_match = false;
            for (let color_filter of color_filters) {
                if (color_filter.active && card.color === color_filter.color) {
                    color_filter_match = true;
                    break;
                }
            }
            let rarity_filter_match = false;
            for (let rarity_filter of rarity_filters) {
                if (rarity_filter.active && card.rarity === rarity_filter.rarity) {
                    rarity_filter_match = true;
                    break;
                }
            }
            let owned_filter_match = false;
            for (let owned_filter of owned_filters) {
                if (owned_filter.active &&
                    gameState.number_collected[card.index] === owned_filter.owned) {
                    owned_filter_match = true;
                    break;
                }
            }
            return color_filter_match && rarity_filter_match && owned_filter_match;
        };
        let apply_filter = () => {
            current_filter_list = all_card_list.filter(card_filter);
            scene.events.emit('filter_updated');
        };
        apply_filter();

        let add_filter_buttons = () => {
            let filters = [];
            for (let color_filter of color_filters) {
                filters.push(color_filter);
            }
            for (let rarity_filter of rarity_filters) {
                filters.push(rarity_filter);
            }
            for (let owned_filter of owned_filters) {
                filters.push(owned_filter);
            }
            for (let i = 0; i < 14; i++) {
                let current_filter_index = i;
                let x = SCREEN_WIDTH/2 + 32*(i-6.5);
                let button = scene.add.sprite(
                    x,
                    16,
                    'filter-ui',
                    current_filter_index);
                let halo = scene.add.sprite(
                    x,
                    16,
                    'filter-ui',
                    9);
                let my_filter = filters[current_filter_index];
                if ("owned" in my_filter) {
                    scene.add.text(
                        x,
                        16,
                        "" + my_filter.owned,
                        getFont('center', 16))
                        .setOrigin(0.5, 0.5);
                    button.setFrame(2);
                }
                button.setInteractive();
                button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                    my_filter.active = !my_filter.active;
                    halo.visible = my_filter.active;
                    apply_filter();
                });
            }
        };
        add_filter_buttons();

        let random_card_by_rarity = (rarity) => {
            let total_rarity = rarity.count * COLORS.length;
            let rarity_index = Phaser.Math.Between(0, total_rarity-1);
            //rarity_index = 0;
            let current_rarity_index = 0;
            for (let card of all_card_list) {
                if (card.rarity !== rarity) {
                    continue;
                }
                if (rarity_index === current_rarity_index) {
                    return card;
                }
                current_rarity_index++;
            }
            return null;
        };


        let add_card = (x, y, card) => {
            let sprites = [];
            //color bg
            sprites.push(scene.add.sprite(0, 0, 'ccg', card.color.frame));
            //picture
            sprites.push(scene.add.sprite(0 - 50 + 10, 0 - 64 + 27, card.image_sprite_sheet,
                card.image_frame)
                .setOrigin(0,0));
            //frame
            sprites.push(scene.add.sprite(0, 0, 'ccg', card.rarity.frame));

            sprites.push(scene.add.text(0 - 50 + 5, 0 - 64 + 5, card.name, getFont('left'))
                .setOrigin(0, 0));
            sprites.push(scene.add.text(0 - 50 + 5, 0 + 64 - 6, card.color.name, getFont('left'))
                .setOrigin(0, 1));
            sprites.push(scene.add.text(0 - 50 + 5, 0 + 64 - 6 - 12, card.rarity.name, getFont('left'))
                .setOrigin(0, 1));
            sprites.push(scene.add.text(0 + 50 - 5, 0 + 64 - 6, card.collectors_number_string, getFont('right'))
                .setOrigin(1, 1));
            let sheen_sprite = scene.add.sprite(0, 0, 'ccg', 9)
                .setAlpha(1) ;
            sprites.push(sheen_sprite);
            let container = scene.add.container(x, y, sprites)
                .setDepth(DEPTHS.CARD);
            container.__sheen = () => {
                sheen_sprite.play('sheen');
                return sheen_sprite;
            };
            container.__collectors_number = card.collectors_number;
            container.setSize(100, 128);
            return container;
        };

        let add_card_by_index_in_current_filter = (x, y, index) => {
            if (index >= current_filter_list.length) {
                return null;
            }
            return add_card(x, y, current_filter_list[index]);
        };

        let add_binder = (x, y) => {
            let current_page = 0;
            let cards_per_page = 10;
            let gap = 8;
            let text_height = 16;
            let card_height = 128;
            let card_width = 100;
            let binder_height = 3*gap + 2*text_height + 2*card_height;
            let binder_width = 6*gap + 5 * card_width;
            let dys = [
                {card: - gap/2 - card_height/2, text: - gap/2 - card_height - text_height/2},
                {card: + gap/2 + text_height + card_height/2, text: + gap/2 + text_height/2}
            ];
            let dxs = [
                -2*card_width + -2*gap,
                -card_width - gap,
                0,
                card_width + gap,
                2 * card_width + 2 * gap,
            ];
            //adjust to put at top of screen
            let container = scene.add.container(x, y + binder_height/2, []);
            container.add(
                scene.add.rectangle(0, 0, binder_width, binder_height, 0x000000)
                    .setOrigin(0.5,0.5));
            let bg = scene.add.rectangle(0, 0, binder_width, binder_height-gap, 0x804040)
                .setOrigin(0.5,0.5);
            container.add(bg);

            let current_backings = [];
            for (let dy of dys) {
                for (let dx of dxs) {
                    let backing = scene.add.sprite(dx, dy.card, 'ccg', 0)
                        .setTintFill(0x000000);
                    current_backings.push(backing);
                    container.add(backing);
                }
            }
            let current_cards = [];
            let current_texts = [];
            let set_texts = () => {
                for (let i = 0; i < current_texts.length; i++) {
                    let filter_index = current_page * cards_per_page + i;
                    let card_index = current_filter_list[filter_index].index;
                    let number_collected = gameState.number_collected[card_index];
                    current_texts[i].setText("x " + number_collected);
                    current_cards[i].setAlpha(number_collected === 0 ? 0.5 : 1);
                }
            };
            container.update = () => {
                set_texts();
            };
            updateables.add(container);

            let set_page = () => {
                for (let card of current_cards) {
                    card.destroy();
                }
                for (let text of current_texts) {
                    text.destroy();
                }
                current_cards = [];
                current_texts = [];
                let count = 0;
                for (let dy of dys) {
                    for (let dx of dxs) {
                        let index = current_page * cards_per_page + count;
                        count++;
                        let card = add_card_by_index_in_current_filter(dx, dy.card,
                            index);
                        if (!card) {
                            current_backings[count-1].setAlpha(0.25);
                            continue;
                        }
                        current_backings[count-1].setAlpha(1);
                        current_cards.push(card);
                        drag_targets.add(card);
                        container.add(card);

                        let collectors_number = card.collectors_number;
                        let number_collected = gameState.number_collected[collectors_number-1];
                        let text = scene.add.text(dx, dy.text,
                            "x " + number_collected, getFont('center'))
                            .setOrigin(0.5,0.5)
                            .setColor('#FFFFFF');
                        current_texts.push(text);
                        container.add(text);
                        if (number_collected === 0) {
                            card.setAlpha(0.25);
                        }
                    }
                }
                container.bringToTop(next);
                container.bringToTop(prev);
            };

            let set_max_page = () => {
                return current_filter_list.length === 0 ?
                    0 : Math.floor((current_filter_list.length - 1) / 10 );
            };

            let min_page = 0;
            let max_page = set_max_page();

            let next =
                scene.add.text(binder_width/2 - 32, -gap, " > ", getFont('right', 32))
                    .setOrigin(1, 0)
                    .setBackgroundColor('#FFFFFF')
                    .setDepth(DEPTHS.CARD+1);
            container.add(next);
            let prev =
                scene.add.text(-binder_width/2 + 32, -gap, " < ", getFont('right', 32))
                    .setOrigin(0, 0)
                    .setBackgroundColor('#FFFFFF')
                    .setDepth(DEPTHS.CARD+1);
            container.add(prev);
            let changePage = (delta) => {
                max_page = set_max_page();
                current_page = Phaser.Math.Clamp(current_page+delta, min_page, max_page);
                prev.setVisible(current_page !== min_page);
                next.setVisible(current_page !== max_page);
            };
            changePage(0);
            addButton(next, () => {
                changePage(1);
                set_page();
            });
            addButton(prev, () => {
                changePage(-1);
                set_page();
            });

            set_page();

            scene.events.on('filter_updated', () => {
                changePage(0);
                set_page();
            });
        };
        add_binder(SCREEN_WIDTH/2, 32);

        let buy_pack_button =
            scene.add.text(x, SCREEN_HEIGHT - 32, " BUY PACK ($4) ",
                getFont("center", 32))
                .setOrigin(0.5,1)
                .setBackgroundColor("#FFFFFF");
        let buy_pack_available = true;
        addButton(buy_pack_button, () => {
            if (gameState.money < 4 && buy_pack_available) {
                return;
            }
            gameState.money -= 4;
            let pack = [
                {dx: 0, dy: 0, rarity: Phaser.Math.Between(0, 7) === 0 ? RARITY.Mythic : RARITY.Rare, delay: 400},
                {dx: - 100 - 8, dy: 8, rarity: RARITY.Uncommon, delay: 300},
                {dx: 100 + 8, dy: 8, rarity: RARITY.Uncommon, delay: 300},
                {dx: - 100*2 - 8*2, dy: + 128 + 8 + 8*2, rarity: RARITY.Common, delay: 0},
                {dx: - 100*1 - 8*1, dy: + 128 + 8 + 8*1, rarity: RARITY.Common, delay: 100},
                {dx: - 100*0 - 8*0, dy: + 128 + 8 + 8*0, rarity: RARITY.Common, delay: 200},
                {dx: 100*1 + 8*1, dy: + 128 + 8 + 8*1, rarity: RARITY.Common, delay: 100},
                {dx: 100*2 + 8*2, dy: + 128 + 8 + 8*2, rarity: RARITY.Common, delay: 0},
            ];
            for (let card of pack) {
                scene.time.delayedCall(card.delay, () => {
                    let new_card = add_card(x + card.dx, y + card.dy,
                        random_card_by_rarity(card.rarity));
                    new_card.setInteractive();
                    scene.input.setDraggable(new_card);
                    draggables.add(new_card);

                    let target_y = new_card.y;
                    new_card.alpha = 0;
                    new_card.y += 16;
                    scene.tweens.add({
                        targets: new_card,
                        duration: 150,
                        alpha: 1,
                        y: target_y,
                        //ease: 'Bounce.easeOut'
                    });

                    new_card.__sheen();
                });
            }
        });

        let earn_money_button =
            scene.add.text(32, SCREEN_HEIGHT - 32, " EARN MONEY ", getFont("left", 32))
                .setOrigin(0,1)
                .setBackgroundColor("#FFFFFF");
        addButton(earn_money_button, () => {
            gameState.money += 1;
        });

        let money_ui =
            scene.add.text(SCREEN_WIDTH - 32, SCREEN_HEIGHT - 32, " $0 ",
                getFont("right", 32))
                .setOrigin(1,1)
                .setColor("#FFFFFF");
        money_ui.update = () => {
            money_ui.setText(" $" + gameState.money + " ");
        };
        updateables.add(money_ui);

        let drag_enabled = true;
        scene.input.on('dragstart', function (pointer, gameObject) {
            if (!drag_enabled) { return; }
            gameObject.setDepth(DEPTHS.SELECTED_CARD);
        });
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (!drag_enabled) { return; }
            gameObject.setPosition(dragX, dragY);
        });

        let do_filter = false;
        scene.input.on('dragend', function(pointer, gameObject) {
            if (!drag_enabled) { return; }
            gameObject.setDepth(DEPTHS.CARD);
            scene.physics.overlap(gameObject, drag_targets, (gameObject, drag_target) => {
                if (gameObject.__collectors_number === drag_target.__collectors_number &&
                    gameState.number_collected[drag_target.__collectors_number - 1] < 4) {
                    gameObject.destroy();
                    gameState.number_collected[drag_target.__collectors_number - 1]++;

                    //TODO: if I add a sheen and then do apply_filter later, I get a weird graphical glitch
                    drag_target.__sheen();
                    let card = all_card_list[drag_target.__collectors_number - 1];
                    if (!card_filter(card)) {
                        apply_filter();
                    }
                }
            });
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

        scene.load.spritesheet('ccg', 'assets/ccg.png',
            { frameWidth: 100, frameHeight: 128 });
        scene.load.spritesheet('ccg-images', 'assets/ccg-images.png',
            { frameWidth: 80, frameHeight: 64 });
        scene.load.spritesheet('ccg-default-images', 'assets/ccg-default-images.png',
            { frameWidth: 80, frameHeight: 64 });
        scene.load.spritesheet('filter-ui', 'assets/filter-ui.png',
            { frameWidth: 24, frameHeight: 24 });

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
            key: 'sheen',
            frames: scene.anims.generateFrameNumbers('ccg',
                { start: 9, end: 20 }),
            skipMissedFrames: false,
            frameRate: 24,
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
