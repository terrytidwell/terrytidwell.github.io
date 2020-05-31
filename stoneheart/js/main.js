const GRID_SIZE = 32;
const SCREEN_COLUMNS = 6;
const SCREEN_ROWS = 6;
const SCREEN_WIDTH_OFFSET = GRID_SIZE;
const SCREEN_HEIGHT_OFFSET = GRID_SIZE/2;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS + 2 * SCREEN_WIDTH_OFFSET;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS + 2 * SCREEN_HEIGHT_OFFSET;
const DEPTHS =
{
    BG : 0,
    BLOCK: 10,
    PLAYER_BLOCK: 20,
    PLAYER: 30,
    PLAYER_BORDER: 31
};

//const PNG_TO_GRID_SCALE = GRID_SIZE/PNG_GRID_SIZE;

let  StartScreen = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'StartScreen', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('blocks', 'assets/match3_character.png', { frameWidth: 32, frameHeight: 32,  margin: 1, spacing: 1});
        this.load.image('corner', 'assets/corner.png');
        this.load.image('frame', 'assets/frame.png');
    },

    //--------------------------------------------------------------------------
    create: function () {
        let MOVE_TIMER = 125;
        let screen = this;

        let xPixel = function(x)
        {
            return x * GRID_SIZE + GRID_SIZE/2 + SCREEN_WIDTH_OFFSET;
        }
        let yPixel = function(y)
        {
            return y * GRID_SIZE + GRID_SIZE/2 + SCREEN_HEIGHT_OFFSET;
        }

        screen.input.addPointer(5);
        screen.me_state = 10;
        screen.me_moving = false;
        screen.disable_matches = false;
        screen.grid = [];
        screen.me_x = 0;
        screen.me_y = 0;
        for (let x = 0; x < SCREEN_COLUMNS; x++) {
            screen.grid.push([]);
            for (let y = 0; y < SCREEN_ROWS; y++) {
                let value = Math.floor(Math.random() * 5);
                if (x == screen.me_x && y == screen.me_y && value == 5)
                {
                    value--;
                }
                if (value != 5) {
                    screen.grid[x].push({
                        x: x,
                        y: y,
                        valid: true,
                        broken: false,
                        value:value,
                        matchable: true,
                        sprite: screen.add.tileSprite(
                            xPixel(x),
                            yPixel(y),
                            GRID_SIZE, GRID_SIZE, 'blocks',value),
                        tweens: null
                    });
                    screen.grid[x][y].sprite.setDepth(DEPTHS.BLOCK);
                    screen.grid[x][y].sprite.setInteractive();
                    screen.grid[x][y].sprite.setData('parent',screen.grid[x][y]);
                    screen.grid[x][y].sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                        function(pointer, localX, localY, event) {
                            let parent = this.data.values.parent;
                            let dx = parent.x - screen.me_x;
                            let dy = parent.y - screen.me_y;
                            let d_manhattan = Math.abs(dx) + Math.abs(dy);
                            if (0 == d_manhattan) {
                                try_selection();
                            } else if (1 == d_manhattan)
                            {
                                move_character(dx, dy);
                            }

                        }, screen.grid[x][y].sprite
                    );
                } else {
                    screen.grid[x].push({
                        x: x,
                        y: y,
                        matchable: false,
                        valid: false,
                        broken: false,
                        value: value,
                        sprite: null,
                        tweens: null});
                }
            }
        }

        screen.me_border = screen.add.sprite(0,0,'frame').setDepth(DEPTHS.PLAYER);
        let set_border = function(bool) {
            screen.me_border.visible = bool;
        }

        let toggle_border = function() {
            set_border(!screen.me_border.visible);
        };
        set_border(false);

        let is_border_active = function() {
            return screen.me_border.visible;
        }

        screen.me_sprite = screen.add.tileSprite(
            0, 0, GRID_SIZE, GRID_SIZE, 'blocks',
            screen.grid[screen.me_x][screen.me_y].value + screen.me_state).setDepth(DEPTHS.PLAYER);

        screen.align_border = function(x, y)
        {
            screen.me_sprite.setTexture('blocks',
                screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
            screen.me_sprite.x = screen.grid[screen.me_x][screen.me_y].sprite.x;
            screen.me_sprite.y = screen.grid[screen.me_x][screen.me_y].sprite.y;
            screen.me_border.x = screen.grid[screen.me_x][screen.me_y].sprite.x;
            screen.me_border.y = screen.grid[screen.me_x][screen.me_y].sprite.y;
        };
        screen.align_border(screen.me_x, screen.me_y);

        screen.time.addEvent({
            "delay": 750,
            "loop": true,
            "callback": function () {
                if (screen.me_state == 10) {
                    screen.me_state = 15;
                } else {
                    screen.me_state = 10;
                }
                screen.align_border(screen.me_x, screen.me_y);
            }
        });

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
            if (object.tweens)
            {
                object.tweens.stop();
                object.tweens = null;
            }
            object.matchable = false;

            let sprite=object.sprite;
            let dx = Math.abs( (sprite.x - xPixel(new_x))/GRID_SIZE)
                + Math.abs((sprite.y - yPixel(new_y))/GRID_SIZE);
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
                this.matchable = true;
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
                !screen.grid[screen.me_x + delta_x][screen.me_y + delta_y].valid //valid block check
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
            let new_value = screen.grid[screen.me_x][screen.me_y].value;
            if (is_border_active())
            {
                let old_object = screen.grid[old_x][old_y];
                let new_object = screen.grid[screen.me_x][screen.me_y];
                old_object.sprite.setDepth(DEPTHS.PLAYER_BLOCK);
                new_object.sprite.setDepth(DEPTHS.BLOCK);
                set_object_to_position(new_object, old_x, old_y);
                set_object_to_position(old_object, screen.me_x, screen.me_y);
            }
            else
            {
                let old_object = screen.grid[old_x][old_y];
                let new_object = screen.grid[screen.me_x][screen.me_y];
                old_object.sprite.setDepth(DEPTHS.BLOCK);
                new_object.sprite.setDepth(DEPTHS.PLAYER_BLOCK);
                screen.me_sprite.setTexture('blocks', screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
                screen.align_border(screen.me_x, screen.me_y);
            }
            screen.time.delayedCall(MOVE_TIMER, function() {
                screen.me_moving = false;
            }, [], screen);


        };

        screen.clear_matching = function() {
            if (screen.disable_matches)
            {
                return false;
            }

            let to_delete = [];
            let add_to_delete = function(x, y)
            {
                if (!screen.grid[x][y].broken)
                {
                    screen.disable_matches = true;
                    to_delete.push([x,y]);
                }
            }
            for (let i = 0; i < SCREEN_COLUMNS; i++) {
                let current_run_ij = 1
                let previous_value_ij = -1;
                let current_run_ji = 1
                let previous_value_ji = -1;
                for (let j = 0; j < SCREEN_ROWS; j++) {
                    if (screen.grid[i][j].matchable &&
                        screen.grid[i][j].value == previous_value_ij) {
                        current_run_ij++;
                        if (current_run_ij == 3) {
                            add_to_delete(i,j - 2);
                            add_to_delete(i,j - 1);
                        }
                        if (current_run_ij >= 3) {
                            add_to_delete(i,j);
                        }
                    }
                    else if (!screen.grid[i][j].matchable) {
                        previous_value_ij = -1;
                        current_run_ij = 1;
                    }
                    else {
                        previous_value_ij = screen.grid[i][j].value;
                        current_run_ij = 1;
                    }
                    if (screen.grid[j][i].value == previous_value_ji) {
                        current_run_ji++;
                        if (current_run_ji == 3) {

                            add_to_delete(j - 2,i);
                            add_to_delete(j - 1,i);
                        }
                        if (current_run_ji >= 3) {
                            add_to_delete(j,i);
                        }
                    }
                    else if (!screen.grid[j][i].matchable) {
                        previous_value_ji = -1;
                        current_run_ji = 1;
                    }
                    else {
                        previous_value_ji = screen.grid[j][i].value;
                        current_run_ji = 1;
                    }
                }
            }

            if (to_delete.length != 0) {

                let deletions = [];
                for (let i = 0; i < SCREEN_COLUMNS; i++)  {
                    deletions.push([])
                    for(let j = 0; j < SCREEN_ROWS; j++)
                    {
                        deletions[i].push(0);
                    }
                }

                let delay = 0;

                for (let i = 0; i < to_delete.length; i++) {
                    //let value = Math.floor(Math.random() * 5);
                    let d_x = to_delete[i][0];
                    let d_y = to_delete[i][1];


                    if (!screen.grid[d_x][d_y].broken) {

                        deletions[d_x][d_y] = 1;

                        screen.grid[d_x][d_y].broken = true;
                        screen.grid[to_delete[i][0]][to_delete[i][1]].matchable = false;
                        delay += 25;
                        if (delay > MOVE_TIMER * 4) {
                            delay = MOVE_TIMER * 4;
                        }

                        let grid_object = screen.grid[d_x][d_y];
                        screen.time.delayedCall(delay, function () {
                            set_block_texture(grid_object.x, grid_object.y);
                            screen.cameras.main.shake(25, 0.0125, true);
                        }, [], screen);
                    }
                    if (to_delete[i][0] == screen.me_x && to_delete[i][1] == screen.me_y) {
                        set_border(false);
                    }
                }

                screen.time.delayedCall(MOVE_TIMER * 4, function () {
                    let max_offset = 0;
                    for (let i = 0; i < SCREEN_COLUMNS; i++) {
                        let offset = 0;
                        let deleted_grid_objects = [];
                        for (let j = SCREEN_ROWS - 1; j >= 0; j--) {
                            if (deletions[i][j] == 1) {
                                offset++;
                                if (offset > max_offset) {
                                    max_offset = offset;
                                }

                                let object_to_delete = screen.grid[i][j];
                                object_to_delete.sprite.y = -offset * GRID_SIZE + GRID_SIZE / 2 + SCREEN_HEIGHT_OFFSET;
                                object_to_delete.broken = false;
                                object_to_delete.valid = true;
                                object_to_delete.matchable = false;
                                object_to_delete.value = Math.floor(Math.random() * 5);
                                set_block_texture(i,j);
                                deleted_grid_objects.push(object_to_delete);
                            } else {
                                if (offset > 0) {
                                    let object = screen.grid[i][j];
                                    if (screen.me_x == i && screen.me_y == j)
                                    {
                                        screen.me_y += offset;
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
                    screen.time.delayedCall(MOVE_TIMER * (max_offset + 1), function () {
                        screen.disable_matches = false;
                    }, [], screen);

                }, [], screen);
            }

            return to_delete.length != 0;
        };

        screen.m_cursor_keys = screen.input.keyboard.createCursorKeys();
        screen.m_cursor_keys.down.on('down', function(event) {
            move_character(0,1)});
        screen.m_cursor_keys.up.on('down', function(event) {
            move_character(0,-1)});
        screen.m_cursor_keys.left.on('down', function(event) {
            move_character(-1,0)});
        screen.m_cursor_keys.right.on('down', function(event) {
            move_character(1,0)});

        let try_selection = function()
        {
            if (!is_border_active() && screen.grid[screen.me_x][screen.me_y].broken)
            {
                return;
            }

            toggle_border();
        };

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
    backgroundColor: '#404040',
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
            gravity: { y: 20 * GRID_SIZE },
            debug: false
        }
    },
    scene: [ StartScreen ]
};

game = new Phaser.Game(config);