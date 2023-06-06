
const SPRITE_SCALE = 6;
const SPRITE_SIZE = 12;
const CARD_SIZE = SPRITE_SCALE * SPRITE_SIZE * 2;
const GRID_SIZE = SPRITE_SCALE * SPRITE_SIZE;
const GAP = SPRITE_SIZE * SPRITE_SCALE / 2;

const SCREEN_COLUMNS = 5;
const SCREEN_ROWS = 10;
const SCREEN_HEIGHT = SCREEN_ROWS*CARD_SIZE + (SCREEN_ROWS+1)*GAP;  //
const SCREEN_WIDTH = SCREEN_COLUMNS*CARD_SIZE + (SCREEN_COLUMNS+1)*GAP; //

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

        console.log(SCREEN_WIDTH + 'x' + SCREEN_HEIGHT);

        let card_slot = (x) => {
            return x*(CARD_SIZE+GAP) + CARD_SIZE/2 + GAP;
        };

        let GAME_STATES = {
            'animation' : {},
            'playing' : {},
        };
        let current_game_state = GAME_STATES.animation;
        let current_pair = [];

        let on_selection = (new_card) => {
            if (current_pair.length < 2) {
                current_pair.push(new_card);
            }
            if (current_pair.length < 2) {
                return;
            }
            current_game_state = GAME_STATES.animation;

            if(current_pair[0].data.values.getType() ===
                current_pair[1].data.values.getType()) {
                scene.time.delayedCall(1000, () => {

                    let current_type = current_pair[0].data.values.getType();

                    let clear = true;
                    if (current_type.on_match) {
                        clear = current_type.on_match();
                    }

                    for (let pair of current_pair) {

                        if (clear) {
                            pair.destroy();
                        } else {
                            pair.data.values.flip();
                        }

                    }
                    current_pair = [];
                    current_game_state = GAME_STATES.playing;
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

        }

        let CARDS = {
            'back' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames' : [370, 371, 372, 373, 368]
            },
            'key' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames' : [379, 379, 379, 379, 382],
                'on_match' : () => {
                    for (let card of dungeon_cards.children.entries) {
                        if (card.data.values.getType() === CARDS.locked_door) {
                            card.data.values.setType(CARDS.unlocked_door);
                        }
                    }
                    return true;
                }
            },
            'treasure' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames' : [379, 379, 379, 379, 162],
            },
            'skeleton' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames' : [379, 379, 379, 379, 51],
            },
            'potion' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'fantasy'],
                'frames' : [379, 379, 379, 379, 30],
            },
            'gold' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames' : [379, 379, 379, 379, 397],
            },
            'locked_door' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames' : [379, 379, 379, 379, 30],
                'on_match' : () => {
                    return false;
                }
            },
            'unlocked_door' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames' : [379, 379, 379, 379, 31],
                'on_match' : () => {
                    scene.scene.restart();
                    return true;
                }
            },
            'empty_room' : {
                'spritesheet' : ['basic', 'basic', 'basic', 'basic', 'basic'],
                'frames' : [379, 379, 379, 379, 49],
            },
        };

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
            CARDS.empty_room,
            CARDS.empty_room,
            CARDS.empty_room,
            CARDS.empty_room,
            CARDS.empty_room,
            CARDS.empty_room,
            CARDS.empty_room,
            CARDS.empty_room,
        ];


        let add_card = (x,y, type = CARDS.back) => {
            let internal_x = 0;
            let internal_y = 0;
            let sprites = [];
            sprites.push(scene.add.sprite(
                internal_x - SPRITE_SIZE/2 * SPRITE_SCALE,
                internal_y - SPRITE_SIZE/2 * SPRITE_SCALE,
                'basic', 370)
                .setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x + SPRITE_SIZE/2 * SPRITE_SCALE,
                internal_y - SPRITE_SIZE/2 * SPRITE_SCALE,
                'basic', 371).setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x + SPRITE_SIZE/2 * SPRITE_SCALE,
                internal_y + SPRITE_SIZE/2 * SPRITE_SCALE,
                'basic', 372).setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x - SPRITE_SIZE/2 * SPRITE_SCALE,
                internal_y + SPRITE_SIZE/2 * SPRITE_SCALE,
                'basic', 373).setScale(SPRITE_SCALE));
            sprites.push(scene.add.sprite(
                internal_x,
                internal_y,
                'basic', 368).setScale(SPRITE_SCALE));
            internal_x = card_slot(x);
            internal_y = card_slot(y);
            let container = scene.add.container(internal_x, internal_y, sprites);

            let sides = [CARDS.back, type];
            let current_side = 1;

            let set_frames = () => {
                for (let n = 0; n < sprites.length; n++) {
                    sprites[n].setTexture(
                        sides[current_side].spritesheet[n],
                        sides[current_side].frames[n]);
                }
            };
            set_frames();

            container.setData('flip', (callback) => {
                current_side = (current_side + 1) % 2;
                let flip_time = 175;
                let max_y_scale = 1.05;
                scene.tweens.add({
                    targets: container,
                    duration: flip_time,
                    scaleX : 0,
                    scaleY : max_y_scale,
                    ease: 'Circle',
                    onComplete: () => {
                        set_frames();
                    }
                });
                scene.tweens.add({
                    targets: container,
                    delay: flip_time,
                    duration: flip_time,
                    scaleX : 1,
                    scaleY : 1,
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

        Phaser.Utils.Array.Shuffle(current_level_cards);
        let deck = [];
        let dungeon_cards = scene.add.group();
        let current_card_index = 0;
        for (let y = 5; y >= 1; y--) {
            for  (let x = 4; x >= 0; x--) {
                if ((x === 0 || x === 4) && (y === 1 || y ===5 )) {
                    continue;
                }
                let type = current_level_cards[current_card_index];
                current_card_index++;
                let current_card = add_card(2, 7, type);
                dungeon_cards.add(current_card);
                deck.push(current_card);
                current_card.setData('position', [x, y, Phaser.Math.Between(-10,10)]);
                current_card.setAngle(Phaser.Math.Between(-10, 10));
                current_card.setInteractive();
                current_card.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                    if (current_game_state !== GAME_STATES.playing) {
                        return;
                    }
                    if (!current_card.data.values.isFaceDown()) {
                        return;
                    }
                    current_card.data.values.flip();
                    on_selection(current_card);
                });
            }
        }

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
                scene.time.delayedCall(500 * card_distance/max_distance, card.data.values.flip);
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
        lay_one();

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;

        let = simulate = () => {
            let tournament = () => {
                let resolution = 10000;

                let teams = [];
                let match = (a, b) => {
                    let denom = (teams[a] / resolution + teams[b] / resolution);
                    let a_wins = denom === 0 ? 0.5 :
                        (teams[a] / resolution) / denom;
                    if (Phaser.Math.Between(0, 10000) / 10000 >= a_wins) {
                        let temp = teams[a];
                        teams[a] = teams[b];
                        teams[b] = temp;
                    }
                };


                for (let a = 0; a < 4; a++) {
                    teams.push(Phaser.Math.Between(0, resolution));
                }

                teams.sort();
                match(0, 3);
                match(1, 2);
                match(0, 1);
                return {
                    winners: [teams[0]],
                    semis: [teams[0], teams[1]],
                    teams: teams
                }
            };

            let winner_stat = { count: 0, sum: 0, mean: 0};
            let semi_stat = { count: 0, sum: 0, mean: 0};
            let team_stat = { count: 0, sum: 0, mean: 0};

            for (let n = 0; n < 1000000; n++) {
                let result = tournament();
                for (let winner of result.winners) {
                    winner_stat.sum += winner;
                    winner_stat.count ++;
                }
                for (let semi of result.semis) {
                    semi_stat.sum += semi;
                    semi_stat.count ++;
                }
                for (let team of result.teams) {
                    team_stat.sum += team;
                    team_stat.count ++;
                }
            }
            winner_stat.mean = winner_stat.sum / winner_stat.count;
            semi_stat.mean = semi_stat.sum / semi_stat.count;
            team_stat.mean = team_stat.sum / team_stat.count;
            console.log(winner_stat);
            console.log(semi_stat);
            console.log(team_stat);
        };
        simulate();

        /*
        let seed = []
        let results = [];
        let resolution = 10000;
        for (let a = 1; a < resolution; a++) {
            let x = SCREEN_WIDTH/resolution * a;
            let y = SCREEN_HEIGHT - (SCREEN_WIDTH * 0.5);
            scene.add.rectangle(x, y, 40, 40, 0x0000ff);
            results[a] = 0;
            seed[a] = 1/(resolution-1);
        }

        for (let a = 1; a < resolution; a++) {
            for (let b = 1; b < resolution; b++) {
                let a_wins = (a / resolution) / (a / resolution + b / resolution);
                let b_wins = (b / resolution) / (a / resolution + b / resolution);
                results[a] += a_wins * seed[a] * seed[b];
                results[b] += b_wins * seed[a] * seed[b];
            }
        }
        //console.log(results);
        let sum = 0;
        for (let a = 1; a < resolution; a++) {
            sum += results[a] * a/resolution;
            let x = SCREEN_WIDTH/resolution * a;
            let y = SCREEN_HEIGHT - (SCREEN_WIDTH/resolution * results[a]*resolution);
            scene.add.rectangle(x, y, 40, 40, 0x00ff00);
        }
        console.log(sum);

        for (let a = 1; a < resolution; a++) {
            seed[a] = results[a];
            results[a] = 0;
        }
        for (let a = 1; a < resolution; a++) {
            for (let b = 1; b < resolution; b++) {
                let a_wins = (a / resolution) / (a / resolution + b / resolution);
                let b_wins = (b / resolution) / (a / resolution + b / resolution);
                results[a] += a_wins * seed[a] * seed[b];
                results[b] += b_wins * seed[a] * seed[b];
            }
        }
        //console.log(results);
        sum = 0;
        for (let a = 1; a < resolution; a++) {
            sum += results[a] * a/resolution;
            let x = SCREEN_WIDTH/resolution * a;
            let y = SCREEN_HEIGHT - (SCREEN_WIDTH/resolution * results[a]*resolution);
            scene.add.rectangle(x, y, 40, 40, 0xff0000);
        }
        console.log(sum);
        */
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

        scene.load.spritesheet('basic', 'assets/basic.png',
            { frameWidth: 12, frameHeight: 12, margin: 1, spacing: 1 });
        scene.load.spritesheet('fantasy', 'assets/fantasy.png',
            { frameWidth: 12, frameHeight: 12, margin: 1, spacing: 1 });

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
