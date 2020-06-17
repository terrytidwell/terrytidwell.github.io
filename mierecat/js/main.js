const GRID_SIZE = 32;
const SCREEN_COLUMNS = 10;
const SCREEN_ROWS = 10;
const SCREEN_VERTICAL_BORDER = 1;
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS;
const SCREEN_HEIGHT = GRID_SIZE * (SCREEN_ROWS + SCREEN_VERTICAL_BORDER * 2);
const BG_BORDER = 3;
const DEPTHS =
{
    BG : 0,
    GRID: 10,
    GRID_SELECT: 20,
    SQUAD: 30,
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
            ORANGE_SQUID: 5,
            BG_GRID: 6
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
            return y * GRID_SIZE + GRID_SIZE/2 + SCREEN_VERTICAL_BORDER * GRID_SIZE;
        };

        scene.add.tileSprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH + (2 * BG_BORDER * GRID_SIZE),
            SCREEN_HEIGHT + (2 * BG_BORDER * GRID_SIZE),
            'tiles',
            TILES.BG_GRID
        );

        let create_random_square = function(x,y,grid)
        {
            let value = [TILES.EMPTY_GRID,
                TILES.EMPTY_GRID,
                TILES.EMPTY_GRID,
                TILES.ORANGE_GRID,
                TILES.PINK_GRID][Phaser.Math.Between(0, 4)];
            let sprite = scene.add.sprite(xPixel(x),yPixel(y),'tiles', value);

            sprite.setData("value", value);
            sprite.setDepth(DEPTHS.GRID);

            return sprite;
        };

        scene.events.on('selector_clicked', function(x,y){
            console.log("Selection: " + x + " " + y);
        })

        let create_selector = function(x, y, grid)
        {
            let select_sprite = scene.add.rectangle(xPixel(x), yPixel(y),
                GRID_SIZE, GRID_SIZE, COLORS.PINK)
                .setDepth(DEPTHS.GRID_SELECT)
                .setVisible(false)
                .setAlpha(0.60);
            select_sprite.setData("x", x);
            select_sprite.setData("y", y);
            select_sprite.setInteractive();
            select_sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
                select_sprite.setAlpha(0.8);
            });
            select_sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
                select_sprite.setAlpha(0.60);
            });
            select_sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function(){
                if (select_sprite.visible) {
                    scene.events.emit('selector_clicked',
                        select_sprite.data.values.x,
                        select_sprite.data.values.y);
                }
            });
            return select_sprite;
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
        let selector_grid = create_grid(create_selector);

        let square_is_legal_move = function(x, y)
        {
            let squid;
            for (squid of squids)
            {
                if (squid.data.values.x === x && squid.data.values.y === y)
                {
                    return false;
                }
            }
            return x >= 0 && x < SCREEN_COLUMNS &&
                y >= 0 && y < SCREEN_ROWS;
        };

        let clear_selection = function()
        {
            for (let i = 0; i < selector_grid.length; i++) {
                for (let j = 0; j < selector_grid[i].length; j++) {
                    selector_grid[i][j].setVisible(false);
                }
            }
        };

        let calculate_reachable_squares = function(x, y, moves_left, slow_grid)
        {
            let INFINITY = moves_left + 1;
            let reach_map = create_grid(function(){return INFINITY;});
            let squares_to_expand = [{x, y: y, moves_used: 0}];
            let MOVES = [ [0, 1], [0, -1], [1, 0], [-1, 0] ];
            while (squares_to_expand.length !== 0)
            {
                let square = squares_to_expand.pop();
                let move;
                for ( move of MOVES )
                {
                    let dx = move[0];
                    let dy = move[1];
                    if (square_is_legal_move(square.x+dx,square.y+dy)) {
                        let moves_needed = 1;
                        if (game_grid[square.x+dx][square.y+dy].data.values.value === slow_grid)
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
            return reach_map;
        };

        let activate_selection = function(map, filter)
        {
            for (let i = 0; i < map.length; i++) {
                for (let j = 0; j < map[i].length; j++) {
                    let value = map[i][j];
                    if (value < filter) {
                        selector_grid[i][j].setVisible(true);
                     }
                }
            }
        };

        let squids = [];
        //let pink_squad = [];
        for (let x = 0; x < 4; x++)
        {
            let squid = scene.add.sprite(xPixel(x),yPixel(0),'tiles',TILES.PINK_SQUID);
            squid.setDepth(DEPTHS.SQUAD);
            squid.setInteractive();
            squid.setData('x',x);
            squid.setData('y',0);
            squid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                function(pointer, localX, localY, event) {
                    clear_selection();
                    let map = calculate_reachable_squares(
                        squid.data.values.x,
                        squid.data.values.y,
                        6,
                        TILES.ORANGE_GRID);
                    activate_selection(map, 7);
                });


            //pink_squad.push(squid);
            squids.push(squid);
        }
        //let orange_squad = [];
        for (let x = SCREEN_COLUMNS - 1; x > SCREEN_COLUMNS - 5; x--)
        {
            let squid = scene.add.sprite(xPixel(x),yPixel(SCREEN_ROWS - 1),
                'tiles',TILES.ORANGE_SQUID);
            //orange_squad.push(squid);
            squid.setDepth(DEPTHS.SQUAD);
            squid.setData('x',x);
            squid.setData('y',0);
            squids.push(squid)
        }

        let border = BG_BORDER*GRID_SIZE;
        scene.cameras.main.setBounds(-border, -border, SCREEN_WIDTH + 2*border, SCREEN_HEIGHT + 2*border);

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);

        scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.m_cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.m_cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.m_cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.m_cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        let esc_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        esc_key.on(Phaser.Input.Keyboard.Events.DOWN, clear_selection);
        //screen.space_key.on('down', try_selection);
    },

    update: function () {
        let scene = this;

        if (scene.m_cursor_keys.left.isDown
            || scene.m_cursor_keys.letter_left.isDown)
        {
            scene.cameras.main.scrollX -= 8;
        }
        if (scene.m_cursor_keys.right.isDown
            || scene.m_cursor_keys.letter_right.isDown)
        {
            scene.cameras.main.scrollX += 8;
        }
        if (scene.m_cursor_keys.up.isDown
            || scene.m_cursor_keys.letter_up.isDown)
        {
            scene.cameras.main.scrollY -= 8;
        }
        if (scene.m_cursor_keys.down.isDown
            || scene.m_cursor_keys.letter_down.isDown)
        {
            scene.cameras.main.scrollY += 8;
        }
    }
});

let config = {
    backgroundColor: '#FFFFFF',
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
