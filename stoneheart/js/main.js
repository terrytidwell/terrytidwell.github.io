const GRID_SIZE = 32;
const SCREEN_COLUMNS = 6;
const SCREEN_ROWS = 6;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS;

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
    },

    //--------------------------------------------------------------------------
    create: function () {
        let screen = this;
        screen.input.addPointer(5);
        screen.me_state = 10;
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
                        valid: true,
                        broken: false,
                        value:value,
                        sprite: screen.add.tileSprite(
                            x * GRID_SIZE + GRID_SIZE/2,
                            y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE, GRID_SIZE, 'blocks',value)
                    });
                } else {
                    screen.grid[x].push({
                        valid: false,
                        broken: false,
                        value: value,
                        sprite: null});
                }
            }
        }

        screen.me_border = [];
        const CORNER_OFFSET_SMALLER = 4;
        const CORNER_OFFSET_BIGGER = 27;
        screen.me_border.push(screen.add.sprite(0,0,'corner'));
        screen.me_border.push(screen.add.sprite(0,0,'corner'));
        screen.me_border[1].flipX = true;
        screen.me_border.push(screen.add.sprite(0,0,'corner'));
        screen.me_border[2].flipY = true;
        screen.me_border.push(screen.add.sprite(0,0,'corner'));
        screen.me_border[3].flipX = true;
        screen.me_border[3].flipY = true;
        let set_border = function(bool) {
            screen.me_border[0].visible = bool;
            screen.me_border[1].visible = bool;
            screen.me_border[2].visible = bool;
            screen.me_border[3].visible = bool;
        }

        let toggle_border = function() {
            set_border(!screen.me_border[0].visible);
        };
        set_border(false);

        let is_border_active = function() {
            return screen.me_border[0].visible;
        }

        screen.me_sprite = screen.add.tileSprite(
            0, 0, GRID_SIZE, GRID_SIZE, 'blocks',
            screen.grid[screen.me_x][screen.me_y].value + screen.me_state);

        let align_border = function(x, y)
        {
            screen.me_sprite.x = x * GRID_SIZE + GRID_SIZE/2;
            screen.me_sprite.y = y * GRID_SIZE + GRID_SIZE/2;

            screen.me_border[0].x = x * GRID_SIZE + CORNER_OFFSET_SMALLER;
            screen.me_border[0].y = y * GRID_SIZE + CORNER_OFFSET_BIGGER;
            screen.me_border[1].x = x * GRID_SIZE + CORNER_OFFSET_BIGGER;
            screen.me_border[1].y = y * GRID_SIZE + CORNER_OFFSET_BIGGER;
            screen.me_border[2].x = x * GRID_SIZE + CORNER_OFFSET_SMALLER;
            screen.me_border[2].y = y * GRID_SIZE + CORNER_OFFSET_SMALLER;
            screen.me_border[3].x = x * GRID_SIZE + CORNER_OFFSET_BIGGER;
            screen.me_border[3].y = y * GRID_SIZE + CORNER_OFFSET_SMALLER;
        };
        align_border(screen.me_x, screen.me_y);


        screen.time.addEvent({
            "delay": 750,
            "loop": true,
            "callback": function () {
                if (screen.me_state == 10) {
                    screen.me_state = 15;
                } else {
                    screen.me_state = 10;
                }
                screen.me_sprite.setTexture('blocks',
                    screen.grid[screen.me_x][screen.me_y].value + screen.me_state);
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
        }

        let move_character = function(delta_x, delta_y)
        {
            if (screen.me_x + delta_x < 0 ||
                screen.me_x + delta_x > screen.grid.length - 1 ||
                screen.me_y + delta_y < 0 ||
                screen.me_y + delta_y > screen.grid[screen.me_x + delta_x].length - 1 || //bounds check
                !screen.grid[screen.me_x + delta_x][screen.me_y + delta_y].valid //valid block check
            )
            {
                //no move
                return;
            }
            let old_value = screen.grid[screen.me_x][screen.me_y].value;
            let old_x = screen.me_x;
            let old_y = screen.me_y;
            screen.me_x += delta_x;
            screen.me_y += delta_y;
            let new_value = screen.grid[screen.me_x][screen.me_y].value;
            if (is_border_active())
            {
                screen.grid[old_x][old_y].value = new_value;
                screen.grid[screen.me_x][screen.me_y].value = old_value;
            }
            set_block_texture(old_x,old_y);
            set_block_texture(screen.me_x, screen.me_y);
            screen.me_sprite.setTexture('blocks', screen.grid[screen.me_x][screen.me_y].value + screen.me_state)
            align_border(screen.me_x, screen.me_y);
            clear_matching();
        };

        let clear_matching = function() {
            //return false;
            let to_delete = [];
            for (let i = 0; i < SCREEN_COLUMNS; i++) {
                let current_run_ij = 1
                let previous_value_ij = -1;
                let current_run_ji = 1
                let previous_value_ji = -1;
                for (let j = 0; j < SCREEN_ROWS; j++) {
                    if (screen.grid[i][j].value == previous_value_ij) {
                        current_run_ij++;
                        if (current_run_ij == 3) {
                            to_delete.push([i,j - 2]);
                            to_delete.push([i,j - 1]);
                        }
                        if (current_run_ij >= 3) {
                            to_delete.push([i,j]);
                        }
                    }
                    else {
                        previous_value_ij = screen.grid[i][j].value;
                        current_run_ij = 1;
                    }
                    if (screen.grid[j][i].value == previous_value_ji) {
                        current_run_ji++;
                        if (current_run_ji == 3) {
                            to_delete.push([j - 2,i]);
                            to_delete.push([j - 1,i]);
                        }
                        if (current_run_ji >= 3) {
                            to_delete.push([j,i]);
                        }
                    }
                    else {
                        previous_value_ji = screen.grid[j][i].value;
                        current_run_ji = 1;
                    }
                }
            }
            for (let i = 0; i < to_delete.length; i++) {
                let value = Math.floor(Math.random() * 5);
                if (!screen.grid[to_delete[i][0]][to_delete[i][1]].broken) {
                    screen.grid[to_delete[i][0]][to_delete[i][1]].broken = true;
                    set_block_texture(to_delete[i][0],to_delete[i][1]);
                }

                screen.grid[to_delete[i][0]][to_delete[i][1]].valid = false;
                if (to_delete[i][0] == screen.me_x && to_delete[i][1] == screen.me_y) {
                    set_border(false);
                }
                //screen.grid[to_delete[i][0]][to_delete[i][1]].sprite.visible = false;
            }
            return to_delete.length != 0;
        };

        clear_matching();

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
        }

        screen.space_key = screen.input.keyboard.addKey("a");
        screen.space_key.on('down', try_selection);
    },

    update: function () {
    }
});

let config = {
    backgroundColor: '#ffffff',
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