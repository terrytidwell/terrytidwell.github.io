const GRID_SIZE = 32;
const SCREEN_COLUMNS = 10;
const SCREEN_ROWS = 10;
const SCREEN_VERTICAL_BORDRER = 1;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
const SCREEN_HEIGHT = GRID_SIZE * (SCREEN_ROWS + SCREEN_VERTICAL_BORDRER * 2);
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

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32});
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let TILES = {
            EMPTY_GRID: 0,
            ORANGE_GRID: 1,
            PINK_GRID: 2,
            PINK_SQUID: 3,
            EYES: 4,
            ORANGE_SQUID: 5
        };

        let COLORS = {
            ORANGE: 0xd5a306,
            PINK: 0xef758a
        }
        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x)
        {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        let yPixel = function(y)
        {
            return y * GRID_SIZE + GRID_SIZE/2 + SCREEN_VERTICAL_BORDRER * GRID_SIZE;
        };

        let create_random_square = function(x,y,grid)
        {
            let value = [TILES.EMPTY_GRID,
                TILES.EMPTY_GRID,
                TILES.EMPTY_GRID,
                TILES.ORANGE_GRID,
                TILES.PINK_GRID][Phaser.Math.Between(0, 4)];
            let sprite = scene.add.sprite(xPixel(x),yPixel(y),'tiles', value);
            sprite.setData("value", value);
            return sprite;
        };

        let create_grid = function(generator)
        {
            let grid = [];
            for (let x = 0; x < SCREEN_COLUMNS; x++)
            {
                grid.push([]);
                for (let y = 0; y < SCREEN_ROWS; y++)
                {
                    grid[x].push(generator(x,y,grid));
                }
            }
            return grid;
        };
        let game_grid = create_grid(create_random_square);

        let square_legal = function(x, y)
        {
            return x >= 0 && x < SCREEN_COLUMNS &&
                y >= 0 && y < SCREEN_ROWS;
        };

        let clear_tint = function()
        {
            for (let i = 0; i < game_grid.length; i++)
            {
                for (let j = 0; j < game_grid[i].length; j++)
                {
                    game_grid[i][j].setTint(0xffffff);
                }
            }
        };

        let calculate_reachable_squares_and_color = function(x, y, moves_left)
        {
            let INFINITY = moves_left + 1;
            let reach_map = create_grid(function(){return INFINITY;});
            reach_map[x][y] = 0;
            let squares_to_expand = [{x: x, y: y, moves_used: 0}];
            let MOVES = [ [0, 1], [0, -1], [1, 0], [-1, 0] ];
            while (squares_to_expand.length !== 0)
            {
                let square = squares_to_expand.pop();
                let move;
                for ( move of MOVES )
                {
                    let dx = move[0];
                    let dy = move[1];
                    if (square_legal(square.x+dx,square.y+dy)) {
                        let moves_needed = 1;
                        if (game_grid[square.x+dx][square.y+dy].data.values.value === TILES.ORANGE_GRID)
                        {
                            moves_needed = 2;
                        }

                        if (reach_map[square.x+dx][square.y+dy] >
                            square.moves_used + moves_needed) {

                            reach_map[square.x + dx][square.y + dy] = square.moves_used + moves_needed;
                            squares_to_expand.push({
                                x: square.x + dx,
                                y: square.y + dy,
                                moves_used: square.moves_used + moves_needed
                            });
                        }
                    }
                }
            }
            for (let i = 0; i < reach_map.length; i++)
            {
                for (let j = 0; j < reach_map[i].length; j++)
                {
                    if (reach_map[i][j] < INFINITY) {
                        game_grid[i][j].setTint(COLORS.PINK);
                    }
                }
            }
        };

        let pink_squad = [];
        for (let x = 0; x < 4; x++)
        {
            let squid = scene.add.sprite(xPixel(x),yPixel(0),'tiles',TILES.PINK_SQUID);
            squid.setInteractive();
            squid.setData('x',x);
            squid.setData('y',0);
            /*
            squid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
                function(pointer, localX, localY, event) {
                    squid.setAlpha(0.5);
                });
            squid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
                function(pointer, localX, localY, event) {
                    squid.setAlpha(1);
                });
            */
            squid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                function(pointer, localX, localY, event) {
                    clear_tint();
                    calculate_reachable_squares_and_color(
                        squid.data.values.x,
                        squid.data.values.y,
                        6);
                });

            pink_squad.push(squid);

        }
        let orange_squad = [];
        for (let x = SCREEN_COLUMNS - 1; x > SCREEN_COLUMNS - 5; x--)
        {
            orange_squad.push(scene.add.sprite(xPixel(x),yPixel(SCREEN_ROWS - 1),
                'tiles',TILES.ORANGE_SQUID));
        }

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);
        /*
        screen.m_cursor_keys = screen.input.keyboard.createCursorKeys();
        screen.m_cursor_keys.down.on('down', function(event) {
            move_character(0,1)});
        screen.m_cursor_keys.up.on('down', function(event) {
            move_character(0,-1)});
        screen.m_cursor_keys.left.on('down', function(event) {
            move_character(-1,0)});
        screen.m_cursor_keys.right.on('down', function(event) {
            move_character(1,0)});
            */
        let esc_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        esc_key.on(Phaser.Input.Keyboard.Events.DOWN, clear_tint);
        //screen.space_key.on('down', try_selection);
    },

    update: function () {
        let scene = this;
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
    scene: [ GameScene ]
};

game = new Phaser.Game(config);
