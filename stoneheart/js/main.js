const GRID_SIZE = 32;
const SCREEN_COLUMNS = 6;
const SCREEN_ROWS = 5;
const SCREEN_WIDTH_OFFSET = GRID_SIZE;
const SCREEN_HEIGHT_OFFSET = 3*GRID_SIZE;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS + 2 * SCREEN_WIDTH_OFFSET;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS + SCREEN_HEIGHT_OFFSET + GRID_SIZE/2;
const DEPTHS =
{
    BG : 0,
    BLOCK: 10,
    PLAYER_BLOCK: 20,
    PLAYER: 30,
    PLAYER_BORDER: 31,
    FG: 40,
    UI: 50
};

let g_current_level = 1;
let g_levels = [{
        name: "Puzzle Sample",
        scene: "GameScene"
    },
    {
        name: "The Kraken",
        scene: "GameScene"
    },
    {
        name: "Dialogue Test",
        scene: "DialogueScene"
    },
];

let  DialogueScene= new Phaser.Class({
    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'DialogueScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('flameprince', 'assets/FlamePrince.png', { frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('golemn', 'assets/Golemn2.png', { frameWidth: 32, frameHeight: 32});
    },

    //--------------------------------------------------------------------------
    create: function () {
        let screen = this;
        screen.input.addPointer(5);

        screen.anims.create({
            key: 'smolder',
            frames: [
                { key: 'flameprince', frame: 1 },
                { key: 'flameprince', frame: 2 },
                { key: 'flameprince', frame: 3 },
                { key: 'flameprince', frame: 4 }
            ],
            skipMissedFrames: false,
            frameRate: 3,
            repeat: -1,
        });

        screen.anims.create({
            key: 'blink',
            frames: [
                { key: 'flameprince', frame: 6 },
                { key: 'flameprince', frame: 6 },
                { key: 'flameprince', frame: 6 },
                { key: 'flameprince', frame: 6 },
                { key: 'flameprince', frame: 6 },
                { key: 'flameprince', frame: 5 },
                { key: 'flameprince', frame: 6 }
            ],
            skipMissedFrames: false,
            frameRate: 3,
            repeat: -1,
        });
        screen.anims.create({
            key: 'talk',
            frames: [
                { key: 'flameprince', frame: 7 },
                { key: 'flameprince', frame: 8 },
            ],
            skipMissedFrames: false,
            frameRate: 4,
            repeat: -1,
        });

        let flame_guy = screen.add.sprite(GRID_SIZE, GRID_SIZE, 'flameprince', 0)
            .setScale(2).setDepth(DEPTHS.PLAYER);
        flame_guy.anims.play('smolder');
        let flame_guy_eyes = screen.add.sprite(GRID_SIZE, GRID_SIZE, 'flameprince', 0)
            .setScale(2).setDepth(DEPTHS.PLAYER+1);
        flame_guy_eyes.anims.play('blink');
        let flame_guy_mouth = screen.add.sprite(GRID_SIZE, GRID_SIZE, 'flameprince', 0)
            .setScale(2).setDepth(DEPTHS.PLAYER+1);
        flame_guy_mouth.anims.play('talk');

        let flame_on = function(visible)
        {
            flame_guy.setVisible(visible);
            flame_guy_eyes.setVisible(visible);
            flame_guy_mouth.setVisible(visible);
        }

        screen.anims.create({
            key: 'golemn_talk',
            frames: [
                { key: 'golemn', frame: 0 },
                { key: 'golemn', frame: 1 },
                { key: 'golemn', frame: 0 },
                { key: 'golemn', frame: 1 },
                { key: 'golemn', frame: 4 },
                { key: 'golemn', frame: 1 }
            ],
            skipMissedFrames: false,
            frameRate: 4,
            repeat: -1,
        });

        let golemn = screen.add.sprite(SCREEN_WIDTH - GRID_SIZE, GRID_SIZE, 'golemn', 0)
            .setScale(2).setDepth(DEPTHS.PLAYER).setFlipX(true);
        golemn.anims.play('golemn_talk');

        let rock_on = function(visible)
        {
            golemn.setVisible(visible);
        }
        rock_on(false);

        screen.time.addEvent({
            "delay": 4000,
            "loop": true,
            "callback": function () {
                let bool = golemn.visible;
                rock_on(!bool);
                flame_on(bool);
            }
        });

    }
});

let  StartScene= new Phaser.Class({
    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'StartScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        this.input.addPointer(5);

        let font_size = 16;
        let font_size_str = '' + font_size + 'px';
        let max_width = 0;
        this.play_button = this.add.text(
            SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
            g_levels[g_current_level].name, { fontSize: font_size_str, fill: '#FFF' })
            .setOrigin(0.5, 0.5);
        this.play_button.alpha = 0.5;
        this.play_button.setInteractive();
        this.play_button.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.play_button.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.play_button.on('pointerup',
            function() {
                this.scene.switch(g_levels[g_current_level].scene);
                //this.scene.stop();
            }, this
        );

        for (let i = 0; i < g_levels.length; i++)
        {
            this.play_button.setText(g_levels[i].name);
            max_width = Math.max(max_width, this.play_button.width);
        }
        this.play_button.setText(g_levels[g_current_level].name);

        this.previous = this.add.text(SCREEN_WIDTH / 2 - max_width / 2 - font_size/2,
            SCREEN_HEIGHT / 2,
            "<<", { fontSize: font_size_str, fill: '#FFF' })
            .setOrigin(1 , 0.5);
        this.previous.setInteractive();
        this.previous.alpha = 0.5;
        this.previous.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.previous.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.previous.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                g_current_level-=1;
                if (g_current_level < 0)
                {
                    g_current_level = g_levels.length - 1;
                }
                this.play_button.setText(g_levels[g_current_level].name);
            }, this
        );

        this.next = this.add.text(SCREEN_WIDTH / 2 + max_width / 2 + font_size/2,
            SCREEN_HEIGHT / 2,
            ">>", { fontSize: font_size_str, fill: '#FFF' })
            .setOrigin(0 , 0.5);
        this.next.setInteractive();
        this.next.alpha = 0.5;
        this.next.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.next.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.next.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                g_current_level+=1;
                if (g_current_level >= g_levels.length)
                {
                    g_current_level = 0;
                }
                this.play_button.setText(g_levels[g_current_level].name);
            }, this
        );
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
        this.load.spritesheet('blocks', 'assets/match3_character.png', { frameWidth: 32, frameHeight: 32,  margin: 1, spacing: 1});
        this.load.spritesheet('heart', 'assets/heart.png', { frameWidth: 18, frameHeight: 18 });
        this.load.image('corner', 'assets/corner.png');
        this.load.image('frame', 'assets/frame.png');
        this.load.image('squid', 'assets/squid.png');
        this.load.image('tentacle', 'assets/tentacle.png');
        this.load.image('rain', 'assets/rain.png');
        this.load.image('settings', 'assets/settings-white-18dp.svg');
    },

    //--------------------------------------------------------------------------
    create: function () {
        let screen = this;

        let MOVE_TIMER = 125;

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x)
        {
            return x * GRID_SIZE + GRID_SIZE/2 + SCREEN_WIDTH_OFFSET;
        }

        let yPixel = function(y)
        {
            return y * GRID_SIZE + GRID_SIZE/2 + SCREEN_HEIGHT_OFFSET;
        }

        let make_board = function(columns, rows, generator)
        {
            let grid = [];
            for (let x = 0; x < columns; x++)
            {
                grid.push([]);
                for (let y = 0; y < rows; y++)
                {
                    grid[x].push(generator(x, y, grid));
                }
            }
            return grid;
        };

        let random_tile_generator = function(x, y, grid) {
            let value = Phaser.Math.Between(0, 4);
            let illegal_value_x = -1;
            let illegal_value_y = -1;
            if (x >= 2 && grid[x-2][y].value === grid[x-1][y].value) {
                illegal_value_x = grid[x-2][y].value;
            }
            if (y >= 2 && grid[x][y-2].value === grid[x][y-1].value) {
                illegal_value_y = grid[x][y-2].value;
            }
            while (value === illegal_value_x || value === illegal_value_y) {
                value = Phaser.Math.Between(0, 4);
            }
            return tile_generator(x, y, grid, value);
        };

        let puzzle_tile_generator = function(x, y, grid)
        {
            let puzzle = [
                [5, 3, 2, 4, 5, 5],
                [5, 2, 1, 4, 5, 5],
                [5, 4, 1, 1, 5, 5],
                [5, 3, 1, 2, 5, 5],
                [5, 1, 4, 4, 3, 5],
            ];
            return tile_generator(x, y, grid, puzzle[y][x]);
        }

        let tile_generator = function(x, y, grid, value)
        {
            if (x == screen.me_x && y == screen.me_y && value == 5)
            {
                value--;
            }
            if (value != 5) {
                let new_tile = {
                    x: x,
                    y: y,
                    valid: true,
                    broken: false,
                    value: value,
                    matchable: true,
                    sprite: screen.add.sprite(
                        xPixel(x), yPixel(y), 'blocks',value),
                    tweens: null
                };
                new_tile.sprite.setDepth(DEPTHS.BLOCK);
                new_tile.sprite.setInteractive();
                new_tile.sprite.setData('parent',new_tile);
                new_tile.sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                    function(pointer, localX, localY, event) {
                        let parent = this.data.values.parent;
                        let d_manhattan =
                            Phaser.Math.Distance.Snake(parent.x, parent.y, screen.me_x , screen.me_y);
                        if (0 == d_manhattan) {
                            try_selection();
                        } else if (1 == d_manhattan)
                        {
                            move_character(parent.x - screen.me_x, parent.y - screen.me_y);
                        }

                    }, new_tile.sprite
                );
                return new_tile;
            } else {
                return {
                    x: x,
                    y: y,
                    matchable: false,
                    valid: false,
                    broken: false,
                    value: -1,
                    sprite: null,
                    tweens: null};
            }
        };

        let add_squid = function() {
            particles = screen.add.particles('rain');

            particles.createEmitter({
                alpha: { start: 1, end: 0 },
                //scale: { start: 0.5, end: 2.5 },
                tint: 0x000080,
                //speed: 100,
                speedY : 350,
                speedX : -200,
                //accelerationY: 300,
                angle: 0, // { min: -85, max: -95 },
                scale: .25,
                rotate: 20, //{ min: -180, max: 180 },
                lifespan: { min: 1000, max: 1500 },
                //blendMode: 'ADD',
                frequency: 25,
                //maxParticles: 10,
                x: { min: -100, max: SCREEN_WIDTH + 100},
                y: 0
            });
            particles.setDepth(DEPTHS.FG + 2);
            let squid = screen.add.sprite(SCREEN_WIDTH / 2,
                yPixel(2.5), 'squid').setScale(2).setDepth(DEPTHS.BG);
            let left_tentacle = screen.add.sprite(xPixel(.5),
                yPixel(5), 'tentacle').setScale(1.5).setDepth(DEPTHS.BG);
            let right_tentacle = screen.add.sprite(xPixel(4.5),
                yPixel(5), 'tentacle').setScale(1.5).setDepth(DEPTHS.BG);
            right_tentacle.flipX = true;
            let water = []
            for (let i = 0; i < SCREEN_ROWS * 4; i++) {
                water.push(screen.add.rectangle(
                    SCREEN_WIDTH / 2,
                    yPixel(2.5 + i/4),
                    SCREEN_WIDTH + GRID_SIZE,
                    GRID_SIZE * (SCREEN_ROWS + 1),
                    0x000040,
                    .4).setDepth(DEPTHS.BG + 1));
            }
                screen.tweens.add({
                targets: water,
                //x: xPixel(1),
                y: '-=5',
                ease: 'Sine',
                duration: 3000,
                repeat: -1,
                yoyo: true,
            });

            for (let i = 0; i < 4; i++) {
                water.push(screen.add.rectangle(
                    SCREEN_WIDTH / 2,
                    yPixel(SCREEN_ROWS + i/4),
                    SCREEN_WIDTH + GRID_SIZE,
                    GRID_SIZE,
                    0x000040,
                    .4).setDepth(DEPTHS.FG + 1));
            }
            screen.tweens.add({
                targets: water,
                //x: xPixel(1),
                y: '-=5',
                ease: 'Sine',
                duration: 3000,
                repeat: -1,
                yoyo: true,
            });


            let add_tentacle = function () {

                let tentacle_shadow = screen.add.sprite(xPixel(0),
                    yPixel(3), 'tentacle').setDepth(DEPTHS.FG+1).setTint(0x000000).setAlpha(0.1);
                tentacle_shadow.setScale(3);
                let tentacle = screen.physics.add.sprite(xPixel(0),
                    yPixel(3), 'tentacle').setDepth(DEPTHS.FG+1).setVisible(false);
                tentacle.setScale(3);
                screen.player_dangers.add(tentacle);
                tentacle.setData('dangerous',false);
                tentacle.setData('shouldHit',function() {
                    return tentacle.data.values.dangerous;
                } );

                let reset = function() {
                    let target = Phaser.Math.Between(0, SCREEN_COLUMNS - 1);
                    let flip = [true, false][Phaser.Math.Between(0, 1)];
                    tentacle_shadow.flipX = flip;
                    tentacle_shadow.setScale(3);
                    tentacle_shadow.setAlpha(0.1);
                    tentacle_shadow.setX(xPixel(target));
                    tentacle_shadow.setY(yPixel(3));

                    tentacle.flipX = flip;
                    tentacle.setData('dangerous',false);
                    tentacle.setScale(3).setVisible(false);
                    tentacle.setY(yPixel(3));
                    tentacle.setX(xPixel(target));

                    screen.tweens.add({
                        targets: tentacle_shadow,
                        scale: 1,
                        ease: 'Quad',
                        duration: 2000,
                        onComplete: function () {
                            tentacle.visible = true;
                        }
                    });
                    screen.tweens.add({
                        targets: tentacle_shadow,
                        alpha: 0.5,
                        ease: 'Quad',
                        duration: 2000
                    });
                    screen.tweens.add({
                        targets: tentacle,
                        scale: 1,
                        ease: 'Expo',
                        duration: 250,
                        delay: 2000,
                        onComplete: function () {
                            tentacle.setData('dangerous',true);
                            screen.cameras.main.shake(250, 0.015, true);
                        }
                    });
                    screen.tweens.add({
                        targets: [tentacle, tentacle_shadow],
                        y: yPixel(10),
                        ease: 'Quad.easeIn',
                        duration: 4000,
                        delay: 2750,
                        onComplete : function()
                        {
                            reset();
                        }
                    });
                };
                reset();
            }
            screen.time.delayedCall(8000, add_tentacle);
            screen.time.delayedCall(10000, add_tentacle);
            //screen.time.delayedCall(12000, add_tentacle);


            let trigger_lightning = function () {
                screen.cameras.main.shake(500, 0.005);
                let timeline = screen.tweens.createTimeline();
                timeline.add({
                    targets: {counter: 0},
                    props: {counter: 255},
                    duration: 250,
                    onUpdate: function (tween) {
                        let value = Math.floor(tween.getValue());

                        screen.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(value, value, value));
                    }
                });
                timeline.add({
                    targets: {counter: 255},
                    props: {counter: 196},
                    duration: 50,
                    repeat: 3,
                    yoyo: true,
                    onUpdate: function (tween) {
                        let value = Math.floor(tween.getValue());

                        screen.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(value, value, value));
                    }
                });
                timeline.add({
                    targets: {counter: 255},
                    props: {counter: 0},
                    duration: 1000,
                    onUpdate: function (tween) {
                        let value = Math.floor(tween.getValue());

                        screen.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(value, value, value));
                    }
                });
                timeline.play();

            };
            screen.time.delayedCall(0, trigger_lightning);

            let continuous_lightning = function()
            {
                trigger_lightning();
                let delay = 1000 * Phaser.Math.Between(7, 15);
                screen.time.delayedCall(delay, continuous_lightning);
            };
            screen.time.delayedCall(3000, continuous_lightning);

            let life_bar_max_hp = 250;
            let life_bar_current_hp = life_bar_max_hp;
            let life_bar_full_width = xPixel(SCREEN_COLUMNS - 1) - xPixel(0);
            let life_bar_bg = screen.add.rectangle(
                xPixel(2.5),
                yPixel(-3),
                life_bar_full_width,
                1,
                0xFFFFFF,
                1,
            );
            let life_bar = screen.add.rectangle(
                xPixel(2.5),
                yPixel(-3),
                life_bar_full_width,
                1,
                0xff0000,
                1
            );
            life_bar_bg.width = 0;
            life_bar.width = 0;
            life_bar_bg.tween = null;

            let attack = function(value) {
                if (life_bar_bg.tween)
                {
                    life_bar_bg.tween.stop();
                }
                life_bar_bg.tween = screen.tweens.add({
                    targets: life_bar_bg,
                    width : life_bar.width,
                    duration: 500,
                    onComplete : function () {
                        life_bar_bg.tween = null
                    }
                })
            };
            let pre_attack = function(value) {
                if (life_bar_current_hp <= value) {
                    life_bar_current_hp = 0;
                } else {
                    life_bar_current_hp -= value;
                }
                life_bar.width = life_bar_full_width * (life_bar_current_hp / life_bar_max_hp);
                screen.tweens.add({
                    targets: { counter: 0 },
                    props: { counter: 255 },
                    duration: 500,
                    onUpdate: function(tween) {
                        let value = Math.floor(tween.getValue());
                        tint_squid(Phaser.Display.Color.GetColor(255, value, value));
                    }
                });
            };
            screen.tweens.add({
                targets: [life_bar, life_bar_bg],
                width: life_bar_full_width,
                duration: 1000,
                delay: 6000,
                onComplete: function (tween) {
                    screen.events.on('blocksMatched', attack, life_bar);
                    screen.events.on('blocksAdded', pre_attack, life_bar);
                }
            });

            let tint_squid = function(color){
                left_tentacle.setTint(color);
                right_tentacle.setTint(color);
                squid.setTint(color);
            };
            tint_squid(0x000000)
            screen.tweens.add({
                targets: { counter: 0 },
                props: { counter: 255 },
                duration: 4000,
                delay: 2000,
                onUpdate: function (tween)
                {
                    let value = Math.floor(tween.getValue());
                    tint_squid(Phaser.Display.Color.GetColor(value, value, value));
                }
            });

            let timeline = screen.tweens.createTimeline();
            timeline.add({
                targets: [squid],
                y: yPixel(-3.25),
                ease: 'Sine',
                duration: 6000,
            });

            timeline.add({
                targets: [squid, left_tentacle, right_tentacle],
                //x: xPixel(1),
                y: '+=5',
                ease: 'Sine',
                duration: 4000,
                repeat: -1,
                yoyo: true,
            });
            timeline.play();

            screen.tweens.add({
                targets: [left_tentacle, right_tentacle],
                y: yPixel(0),
                ease: 'Sine',
                duration: 3000,
            });

        };

        let set_border = function(bool) {
            screen.me_border.visible = bool;
        };

        let toggle_border = function() {
            set_border(!screen.me_border.visible);
        };

        let is_border_active = function() {
            return screen.me_border.visible;
        };

        let handle_broken_blocks_puzzle_mode = function(new_matching_blocks)
        {
            let delay = 0;
            for (let i = 0; i < new_matching_blocks.length; i++) {
                let grid_object = new_matching_blocks[i]

                grid_object.broken = true;
                grid_object.valid = false;
                delay += 50;
                if (delay > MOVE_TIMER * 4) {
                    delay = MOVE_TIMER * 4;
                }

                screen.time.delayedCall(delay, function () {
                    set_block_texture(grid_object.x, grid_object.y);
                    screen.cameras.main.shake(25, 0.0125, true);
                }, [], screen);

                if (grid_object.x == screen.me_x && grid_object.y == screen.me_y) {
                    set_border(false);
                }
            }
        };

        let handle_broken_blocks_arcade_mode = function(new_matching_blocks)
        {
            let delay = 0;
            for (let i = 0; i < new_matching_blocks.length; i++) {
                let grid_object = new_matching_blocks[i]

                grid_object.broken = true;
                grid_object.matchable = false;
                delay += 50;
                if (delay > MOVE_TIMER * 4) {
                    delay = MOVE_TIMER * 4;
                }

                screen.time.delayedCall(delay, function () {
                    set_block_texture(grid_object.x, grid_object.y);
                    screen.cameras.main.shake(25, 0.0125, true);
                }, [], screen);

                if (grid_object.x == screen.me_x && grid_object.y == screen.me_y) {
                    set_border(false);
                }
            }

            screen.time.delayedCall(MOVE_TIMER * 4, function () {
                let deletions = make_board(SCREEN_COLUMNS, SCREEN_ROWS,function() {return false; });
                for (let i = 0; i < new_matching_blocks.length; i++) {
                    deletions[new_matching_blocks[i].x][new_matching_blocks[i].y] = true;
                }

                for (let i = 0; i < SCREEN_COLUMNS; i++) {
                    let offset = 0;
                    let deleted_grid_objects = [];
                    for (let j = SCREEN_ROWS - 1; j >= 0; j--) {
                        if (deletions[i][j]) {
                            offset++;

                            let object_new_matching_blocks = screen.grid[i][j];
                            object_new_matching_blocks.sprite.y = -offset * GRID_SIZE + GRID_SIZE / 2 + SCREEN_HEIGHT_OFFSET;
                            object_new_matching_blocks.broken = false;
                            object_new_matching_blocks.valid = true;
                            object_new_matching_blocks.matchable = false;
                            object_new_matching_blocks.value = Math.floor(Math.random() * 5);
                            set_block_texture(i,j);
                            deleted_grid_objects.push(object_new_matching_blocks);
                        } else {
                            if (offset > 0) {
                                let object = screen.grid[i][j];
                                if (screen.me_x == i && screen.me_y == j) {
                                    //I have two options here: move the player down
                                    //or leave him where he is. Leaving him where he is
                                    //is fine except that if he's holding something he
                                    //will suddenly be holding a different block

                                    //option 1:
                                    // screen.me_y += offset;

                                    //option 2:
                                    set_border(false);
                                }
                                set_object_to_position(object, i, j + offset);
                            }
                        }

                    }
                    if (offset > 0) {
                        for (let k = 0; k < offset; k++) {
                            set_object_to_position(deleted_grid_objects[k], i, offset-1-k);
                        }
                    }
                }
            }, [], screen);
        };

        let set_block_texture = function(x,y)
        {
            let texture = screen.grid[x][y].value;
            if (screen.grid[x][y].broken)
            {
                texture += 5;
            }
            screen.grid[x][y].sprite.setTexture('blocks', texture);
        };

        let set_sprite_movement = function(new_x, new_y)
        {
            let object=screen.grid[new_x][new_y];
            let sprite=object.sprite;
            let dx = Phaser.Math.Distance.Snake( sprite.x, sprite.y, xPixel(new_x), yPixel(new_y));
            //go from pixel space to grid space
            dx /= GRID_SIZE;
            if (dx == 0)
            {
                return;
            }
            if (object.tweens)
            {
                object.tweens.stop();
                object.tweens = null;
            }
            object.matchable = false;

            let delay = MOVE_TIMER * dx;

            object.tweens = screen.tweens.add({
                targets: sprite,
                x: xPixel(new_x),
                y: yPixel(new_y),
                ease: 'Power3',
                duration: delay,
                repeat: 0
            });
            object.tweens.setCallback('onComplete', function() {
                this.tweens = null;
                if (!this.broken) {
                    this.matchable = true;
                }
            },[],object);
        };

        let set_object_to_position = function(object, x, y)
        {
            screen.grid[x][y] = object;
            object.x = x;
            object.y = y;
            set_sprite_movement(x, y);
        };

        let move_character = function(delta_x, delta_y)
        {
            if (screen.me_moving || //i'm already mid move
                screen.me_x + delta_x < 0 ||
                screen.me_x + delta_x >= screen.grid.length  ||
                screen.me_y + delta_y < 0 ||
                screen.me_y + delta_y >= screen.grid[screen.me_x + delta_x].length || //bounds check
                !screen.grid[screen.me_x + delta_x][screen.me_y + delta_y].valid  || //valid block check
                (is_border_active() && screen.grid[screen.me_x + delta_x][screen.me_y + delta_y].broken)
            //don't switch with broken
            )
            {
                //no move
                return;
            }

            screen.me_moving = true;

            let old_x = screen.me_x;
            let old_y = screen.me_y;
            screen.me_x += delta_x;
            screen.me_y += delta_y;

            let old_object = screen.grid[old_x][old_y];
            let new_object = screen.grid[screen.me_x][screen.me_y];

            if (is_border_active())
            {
                old_object.sprite.setDepth(DEPTHS.PLAYER_BLOCK);
                new_object.sprite.setDepth(DEPTHS.BLOCK);
                set_object_to_position(new_object, old_x, old_y);
                set_object_to_position(old_object, screen.me_x, screen.me_y);
            }
            else
            {
                old_object.sprite.setDepth(DEPTHS.BLOCK);
                new_object.sprite.setDepth(DEPTHS.PLAYER_BLOCK);
                screen.me_sprite.setTexture('blocks', screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
                screen.align_border(screen.me_x, screen.me_y);
            }
            screen.time.delayedCall(MOVE_TIMER, function() {
                screen.me_moving = false;
            }, [], screen);
        };

        let find_new_matches = function () {
            let new_matching_blocks = [];

            let matches = function(x, y, square_to_match)
            {
                //this square to match is a candidate match
                return !square_to_match.broken && square_to_match.matchable &&
                    //the other square is in bounds
                    x >= 0 && x < SCREEN_COLUMNS && y >= 0 && y < SCREEN_ROWS && //bounds check
                    //the other square is a match
                    screen.grid[x][y].matchable && screen.grid[x][y].value == square_to_match.value;
            }

            for (let i = 0; i < SCREEN_COLUMNS; i++) {
                for (let j = 0; j < SCREEN_ROWS; j++) {
                    let candidate = screen.grid[i][j];
                    let x_o__ = matches(i - 2, j, candidate);
                    let _xo__ = matches(i - 1, j, candidate);
                    let __ox_ = matches(i + 1, j, candidate);
                    let __o_x = matches(i + 2, j, candidate);
                    let y_o__ = matches(i, j - 2, candidate);
                    let _yo__ = matches(i, j - 1, candidate);
                    let __oy_ = matches(i, j + 1, candidate);
                    let __o_y = matches(i, j + 2, candidate);
                    if ((x_o__ && _xo__) ||
                        (_xo__ && __ox_) ||
                        (__ox_ && __o_x) ||
                        (y_o__ && _yo__) ||
                        (_yo__ && __oy_) ||
                        (__oy_ && __o_y))
                    {
                        new_matching_blocks.push(candidate);
                    }
                }
            }

            return new_matching_blocks;
        }

        screen.clear_matching = function() {
            let new_matching_blocks = find_new_matches();

            if (new_matching_blocks.length != 0) {
                screen.current_chain++;
                screen.events.emit('blocksAdded', new_matching_blocks.length);
                screen.current_blocks+=new_matching_blocks.length;
                screen.current_blocks_text.setText(screen.current_blocks);

                screen.time.delayedCall(MOVE_TIMER * (4+6), function () {
                    screen.current_chain--;
                    if (screen.current_chain == 0) {
                        screen.events.emit('blocksMatched', screen.current_blocks);
                        screen.current_blocks = 0;
                        screen.current_blocks_text.setText(screen.current_blocks);

                    }
                }, [], screen);

                //handle_broken_blocks_arcade_mode(new_matching_blocks);
                screen.handle_broken_blocks_mode(new_matching_blocks);
            }

            return new_matching_blocks.length != 0;
        };

        let try_selection = function()
        {
            if (!is_border_active() && screen.grid[screen.me_x][screen.me_y].broken)
            {
                return;
            }

            toggle_border();
        };

        screen.align_border = function(x, y)
        {
            screen.me_sprite.setTexture('blocks',
                screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
            screen.me_sprite.x = screen.grid[screen.me_x][screen.me_y].sprite.x;
            screen.me_sprite.y = screen.grid[screen.me_x][screen.me_y].sprite.y;
            screen.me_border.x = screen.grid[screen.me_x][screen.me_y].sprite.x;
            screen.me_border.y = screen.grid[screen.me_x][screen.me_y].sprite.y;
        };

        //----------------------------------------------------------------------
        // SETUP GAME OBJECTS
        //----------------------------------------------------------------------

        //set up combo text
        screen.current_blocks_text = this.add.text(SCREEN_WIDTH,
            SCREEN_HEIGHT,
            "0", { fontSize: '32px', fill: '#FFF' })
            .setOrigin(1 , 1).setVisible(false).setDepth(DEPTHS.UI);

        //set up player
        screen.me_hit = false;
        screen.me_state = 10;
        screen.me_moving = false;
        screen.me_x = 0;
        screen.me_y = 0;
        screen.me_hp = 3;
        screen.me_hearts = [];
        screen.current_blocks = 0;
        screen.current_chain = 0;
        screen.player_dangers = this.physics.add.group();


        this.anims.create({
            key: 'heartbreak',
            frames: [
                { key: 'heart', frame: 1 },
                { key: 'heart', frame: 2 },
                { key: 'heart', frame: 3 }
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });

        for (let i = 0; i < screen.me_hp; i++)
        {
            screen.me_hearts.push(
                screen.add.sprite(i*20 + 10, SCREEN_HEIGHT - 10,
                    'heart', 0).setDepth(DEPTHS.UI));
        }

        screen.me_border = screen.physics.add.sprite(0,0,'frame').setDepth(DEPTHS.PLAYER);
        set_border(false);

        screen.me_heartbeat = screen.time.addEvent({
            "delay": MOVE_TIMER * 6,
            "loop": true,
            "callback": function () {
                if (screen.me_state == 10) {
                    screen.me_state = 15;
                } else {
                    screen.me_state = 10;
                }
            }
        });

        //set up level
        if (g_current_level == 0)
        {
            screen.me_x = 1;
            screen.me_y = 1;
            screen.grid = make_board(SCREEN_COLUMNS, SCREEN_ROWS, puzzle_tile_generator);
            screen.handle_broken_blocks_mode = handle_broken_blocks_puzzle_mode;
        }
        else
        {
            screen.grid = make_board(SCREEN_COLUMNS, SCREEN_ROWS, random_tile_generator);
            screen.handle_broken_blocks_mode = handle_broken_blocks_arcade_mode;
            add_squid();
        }

        screen.me_sprite = screen.add.sprite(
            0, 0, 'blocks',
            screen.grid[screen.me_x][screen.me_y].value + screen.me_state)
            .setDepth(DEPTHS.PLAYER);


        this.physics.add.overlap(screen.me_border, screen.player_dangers,
            function(player, source) {
                if (!source.data.values.shouldHit(player, source))
                {
                    return;
                }
                if (!screen.me_hit)
                {
                    let spokes = 8;
                    for (i = 0; i < spokes; i++) {
                        let vector = new Phaser.Math.Vector2(.5, 0);
                        let angle = 360/spokes * i;
                        vector.rotate(Phaser.Math.DegToRad(angle));

                        let reaction = screen.add.rectangle(
                            xPixel(screen.me_x + vector.x),
                            yPixel(screen.me_y + vector.y),
                            GRID_SIZE / 4,
                            GRID_SIZE / 4,
                            0xffffff,
                            1
                        ).setDepth(DEPTHS.PLAYER + 1).setAngle(angle);
                        screen.tweens.add({
                            targets: reaction,
                            scaleX: 2,
                            scaleY: 0,
                            //height: 0,
                            alpha: 0,
                            duration: 250
                        });
                    }
                    if (screen.me_hp > 0)
                    {
                        screen.me_hp--;
                        let heart = screen.me_hearts[screen.me_hp];
                        heart.anims.play('heartbreak', false);
                        heart.on('animationcomplete-heartbreak', function() {
                            heart.setVisible(false);
                        });
                    }
                    screen.me_hit = true;
                    screen.me_sprite.alpha = 0.5;
                    screen.me_heartbeat.delay = MOVE_TIMER;
                    screen.time.delayedCall(MOVE_TIMER * 10, function(){
                        screen.me_sprite.alpha = 1;
                        screen.me_heartbeat.delay = MOVE_TIMER * 6;
                    });
                    screen.time.delayedCall(MOVE_TIMER * 11, function(){ screen.me_hit = false; });
                    screen.cameras.main.shake(125, 0.0125, true);
                }
            }, null, screen);

        let settings = this.add.image(
            Math.round(SCREEN_WIDTH - GRID_SIZE/4),
            Math.round(SCREEN_HEIGHT - GRID_SIZE/4), 'settings')
            .setDepth(DEPTHS.UI).setAlpha(0.5);
        settings.setInteractive();
        settings.on('pointerover', function(pointer){
            {
                settings.alpha = 1;
            }
        });
        settings.on('pointerout', function(pointer){
            {
                settings.alpha = 0.5;
            }
        });

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        screen.input.addPointer(5);
        screen.m_cursor_keys = screen.input.keyboard.createCursorKeys();
        screen.m_cursor_keys.down.on('down', function(event) {
            move_character(0,1)});
        screen.m_cursor_keys.up.on('down', function(event) {
            move_character(0,-1)});
        screen.m_cursor_keys.left.on('down', function(event) {
            move_character(-1,0)});
        screen.m_cursor_keys.right.on('down', function(event) {
            move_character(1,0)});
        screen.space_key = screen.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        screen.space_key.on('down', try_selection);
    },

    update: function () {
        let screen = this;
        screen.align_border(screen.me_x, screen.me_y);
        screen.clear_matching();
    }
});

let config = {
    backgroundColor: '#000000',
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
    scene: [ StartScene, DialogueScene, GameScene,  ]
};

game = new Phaser.Game(config);