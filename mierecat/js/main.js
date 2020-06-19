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

let COLORS = {
    ORANGE: 0xd5a306,
    PINK: 0xef758a,
    ORANGE_TEXT: "#d5a306",
    PINK_TEXT: "#ef758a"
};

let g_game_settings = {
    move: 4,
    swim: 6,
    shoot_distance: 6
};

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32});
        this.load.image('splat', 'assets/splat2.png');
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.add.image(SCREEN_WIDTH/4,
            SCREEN_HEIGHT/4,
            'splat').setTint(COLORS.ORANGE);
        scene.add.image(SCREEN_WIDTH/4 *3,
            SCREEN_HEIGHT/2,
            'splat').setTint(COLORS.PINK).setAngle(70).setScale(0.9);
        let play = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2,
            "Play",
            { font: GRID_SIZE * 2 + 'px project_paintball', color: COLORS.PINK_TEXT})
            .setOrigin(0.5, 0.5)
            .setStroke('#ffffff', 3);
        play.setInteractive();
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){

            play.scaleX = 1.2;
            play.scaleY = 1.2;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
            play.scaleX = 1;
            play.scaleY = 1;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function(){
            scene.scene.start('UIScene');
            scene.scene.start('GameScene');
            scene.scene.stop('TitleScene');
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'UIScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.pink_score = scene.add.text(
            0,
            0,
            "0%",
            { font: GRID_SIZE + 'px project_paintball', color: COLORS.PINK_TEXT})
            .setOrigin(0,0)
            .setStroke('#ffffff', 3);
        scene.orange_score = scene.add.text(
            SCREEN_WIDTH,
            0,
            "0%",
            { font: GRID_SIZE + 'px project_paintball', color: COLORS.ORANGE_TEXT})
            .setOrigin(1,0)
            .setStroke('#ffffff', 3);
    },

    //--------------------------------------------------------------------------
    update: function() {
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

        let SELECTION_ACTIONS = {
            MOVE: 0,
            SHOOT: 1
        };
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

        let create_selector = function(x, y, grid)
        {
            let select_sprite = scene.add.rectangle(xPixel(x), yPixel(y),
                GRID_SIZE, GRID_SIZE, COLORS.PINK)
                .setDepth(DEPTHS.UI)
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

        let square_is_legal = function(x, y)
        {
            return x >= 0 && x < SCREEN_COLUMNS &&
                y >= 0 && y < SCREEN_ROWS;
        }

        let square_is_legal_move = function(x, y, my_color)
        {
            let squid;
            for (squid of squids)
            {
                if (squid.data.values.color !== my_color &&
                    squid.data.values.x === x && squid.data.values.y === y)
                {
                    return false;
                }
            }
            return square_is_legal(x, y)
        };

        let clear_selection = function()
        {
            for (let i = 0; i < selector_grid.length; i++) {
                for (let j = 0; j < selector_grid[i].length; j++) {
                    selector_grid[i][j].setVisible(false);
                }
            }
        };

        let calculate_reachable_squares = function(x, y, moves_left, my_color)
        {
            let slow_grid = TILES.ORANGE_GRID;
            if (my_color === COLORS.ORANGE)
            {
                slow_grid = TILES.PINK_GRID;
            }
            let INFINITY = moves_left + 1;
            let reach_map = create_grid(function(){return INFINITY;});
            let squares_to_expand = [{x: x, y: y, moves_used: 0}];
            reach_map[x][y] = 0;
            let MOVES = [ [0, 1], [0, -1], [1, 0], [-1, 0] ];
            while (squares_to_expand.length !== 0)
            {
                let square = squares_to_expand.pop();
                for ( let move of MOVES )
                {
                    let dx = move[0];
                    let dy = move[1];
                    if (square_is_legal_move(
                        square.x+dx,
                        square.y+dy,
                        my_color)) {
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

            //knock out squid squares if any...
            for (let squid of squids)
            {
                reach_map[squid.data.values.x][squid.data.values.y] = INFINITY;
            }

            return reach_map;
        };

        let calculate_shootable_squares = function(x, y, shoot_distance)
        {
            let INFINITY = shoot_distance + 1;
            let reach_map = create_grid( function(){return INFINITY;});
            for (let i = 1; i <= shoot_distance; i++)
            {
                if (square_is_legal(x+i, y)) {
                    reach_map[x+i][y] = 0;
                }
                if (square_is_legal(x-i, y)) {
                    reach_map[x-i][y] = 0;
                }
                if (square_is_legal(x, y+i)) {
                    reach_map[x][y+i] = 0;
                }
                if (square_is_legal(x, y-i)) {
                    reach_map[x][y-i] = 0;
                }
            }
            return reach_map;
        }

        let activate_selection = function(map, filter)
        {
            for (let i = 0; i < map.length; i++) {
                for (let j = 0; j < map[i].length; j++) {
                    let value = map[i][j];
                    if (filter(value)) {
                        selector_grid[i][j].setVisible(true);
                     }
                }
            }
        };

        let current_unit = null;
        let select_squid = function(squid) {
            if (current_unit === squid)
            {
                return;
            }
            if (current_unit)
            {
                current_unit.data.values.close();
                current_unit.data.values.deselect();
            }
            current_unit = squid;
            if (squid) {
                squid.setData("animation",
                    scene.tweens.add({
                    targets: squid,
                    y: "-=" + GRID_SIZE / 4,
                    scaleY: 0.9,
                    duration: 250,
                    ease: "Quad.easeOut",
                    yoyo: true,
                    repeat: -1}));
            }
        }
        scene.events.on('selector_clicked', function(x,y) {
            if (current_unit)
            {
                switch (current_unit.data.values.selection_action) {
                    case SELECTION_ACTIONS.MOVE:
                        current_unit.setData('x', x);
                        current_unit.setData('y', y);
                        current_unit.x = xPixel(x);
                        current_unit.y = yPixel(y);
                        current_unit.data.values.move();

                        track_camera(x, y);
                        clear_selection();
                        select_squid(null);
                        recalculate_moves();
                        break;
                    case SELECTION_ACTIONS.SHOOT:
                        let dx = x - current_unit.data.values.x;
                        let dy = y - current_unit.data.values.y;
                        let vector = new Phaser.Math.Vector2(dx, dy);
                        vector.normalize();
                        vector.scale(g_game_settings.shoot_distance);
                        let line = new Phaser.Geom.Line(0, 0, vector.x, vector.y);
                        let points = Phaser.Geom.Line.BresenhamPoints(line);

                        let tile_target = TILES.PINK_GRID;
                        if (current_unit.data.values.color === COLORS.ORANGE) {
                            tile_target = TILES.ORANGE_GRID;

                        }

                        for (let point of points)
                        {
                            let px = point.x + current_unit.data.values.x;
                            let py = point.y + current_unit.data.values.y;
                            if (square_is_legal(px,py))
                            {
                                let tile = game_grid[px][py];
                                tile.setTexture('tiles',tile_target);
                                tile.setData('value',tile_target);
                            }
                        };

                        select_squid(null);
                        clear_selection();
                        recalculate_moves();
                        break;
                }
            }
        });

        let track_camera = function(x,y)
        {
            console.log("Move camera from (" + scene.cameras.main.scrollX + ", "
                + scene.cameras.main.scrollY + ") to (" + xPixel(x) + ", "
                + yPixel(y) + ")");
            let camera = scene.cameras.main.pan(
                xPixel(x),
                yPixel(y),
                1000,
                'Linear',
                true);
            console.log("Calculated camera move of (" + camera.panEffect.current.x + ", "
                + camera.panEffect.current.y + ") to (" + camera.panEffect.destination.x + ", "
                + camera.panEffect.destination.y + ")");
            let d = Phaser.Math.Distance.Between(
                scene.cameras.main.scrollX,
                scene.cameras.main.scrollY,
                camera.panEffect.current.x,
                camera.panEffect.current.y
            );
            camera = scene.cameras.main.pan(
                xPixel(x),
                yPixel(y),
                d * 2,
                'Quad.EaseInEaseOut',
                true);



        };

        let add_menu_close = function(squid,angle)
        {
            let x = squid.data.values.x;
            let y = squid.data.values.y;
            angle %= 360;
            let text = scene.add.text(xPixel(x),yPixel(y),
                "X", { font: GRID_SIZE/2 + 'px project_paintball', color: "#ffffff"});
            text.setOrigin(0.5, 0.5);
            let width = text.width * 1.25;

            let vector = new Phaser.Math.Vector2(text.width/2+GRID_SIZE/4*3, 0);
            vector.rotate(Phaser.Math.DegToRad(angle));

            text.x = text.x + vector.x;
            text.y = text.y + vector.y;
            text.setDepth(DEPTHS.UI+2);

            let rect = scene.add.circle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                GRID_SIZE/4,
                squid.data.values.color, 1)
                .setDepth(DEPTHS.UI+1);
            rect.setAlpha(0.75);
            rect.setInteractive();
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
                rect.setAlpha(1);
            });
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
                rect.setAlpha(0.75);
            });
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function(){
                clear_selection();
                select_squid(null);
                squid.data.values.close();
            });
            let bg = scene.add.circle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                GRID_SIZE/4+1,
                0xFFFFFF, 1)
                .setDepth(DEPTHS.UI);

            let objects = [text, bg, rect];

            let move = function() {
                for (let object of objects) {
                    object.x = xPixel(squid.data.values.x) + vector.x;
                    object.y = yPixel(squid.data.values.y) + vector.y
                }
            };
            move();

            let close = function() {
                for (let object of objects) {
                    object.setVisible(false);
                }
            };
            close();

            squid.data.values.moveFunctions.push(move);
            squid.data.values.closeFunctions.push(close);
            squid.data.values.openFunctions.push(function() {
                for (let object of objects) {
                    object.setVisible(true);
                }
            });
        }

        let add_menu_item = function(squid,angle,label,click,akimbo=true) {
            let x = squid.data.values.x;
            let y = squid.data.values.y;
            angle %= 360;
            let text_correction = 0;
            if (angle >= 90 && angle < 270)
            {
                text_correction = 180;
            }
            let text = scene.add.text(xPixel(x),yPixel(y),
                label, { font: GRID_SIZE/2 + 'px project_paintball', color: "#ffffff"});
            text.setOrigin(0.5, 0.5);
            let width = text.width * 1.25;

            let vector = new Phaser.Math.Vector2(text.width/2+GRID_SIZE/4*3, 0);
            vector.rotate(Phaser.Math.DegToRad(angle));

            text.x = text.x + vector.x;
            text.y = text.y + vector.y;
            if (akimbo) {
                text.setAngle(angle + text_correction);
            }
            text.setDepth(DEPTHS.UI+2);

            let rect = scene.add.rectangle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                width, GRID_SIZE/2,
                squid.data.values.color, 1)
                .setDepth(DEPTHS.UI+1);
            if (akimbo) {
                rect.setAngle(angle);
            }
            rect.setAlpha(0.75);
            rect.setInteractive();
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
                rect.setAlpha(1);
            });
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
                rect.setAlpha(0.75);
            });
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, click);
            let bg = scene.add.rectangle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                width+2, GRID_SIZE/2+2,
                0xFFFFFF, 1)
                .setDepth(DEPTHS.UI);
            if (akimbo) {
                bg.setAngle(angle);
            }

            let objects = [text, bg, rect];

            let move = function() {
                for (let object of objects) {
                    object.x = xPixel(squid.data.values.x) + vector.x;
                    object.y = yPixel(squid.data.values.y) + vector.y
                }
            };
            move();

            let close = function() {
                for (let object of objects) {
                    object.setVisible(false);
                }
            };
            close();

            squid.data.values.moveFunctions.push(move);
            squid.data.values.closeFunctions.push(close);
            squid.data.values.openFunctions.push(function() {
                for (let object of objects) {
                    object.setVisible(true);
                }
            });
        };

        let squids = [];
        for (let start_position of [
            {x: 0, y: 0, color: COLORS.PINK},
            {x: 1, y: 0, color: COLORS.PINK},
            {x: 2, y: 0, color: COLORS.PINK},
            {x: 3, y: 0, color: COLORS.PINK},
            {x: SCREEN_COLUMNS - 1, y: SCREEN_ROWS - 1, color: COLORS.ORANGE},
            {x: SCREEN_COLUMNS - 2, y: SCREEN_ROWS - 1, color: COLORS.ORANGE},
            {x: SCREEN_COLUMNS - 3, y: SCREEN_ROWS - 1, color: COLORS.ORANGE},
            {x: SCREEN_COLUMNS - 4, y: SCREEN_ROWS - 1, color: COLORS.ORANGE}
        ])
        {
            let my_tile = COLORS.PINK === start_position.color ? TILES.PINK_SQUID : TILES.ORANGE_SQUID;
            let squid = scene.add.sprite(xPixel(start_position.x),yPixel(start_position.y),'tiles',my_tile);
            squid.setDepth(DEPTHS.SQUAD);
            squid.setInteractive();
            squid.setData('x',start_position.x);
            squid.setData('y',start_position.y);
            squid.setData('color', start_position.color);
            squid.setData('')
            squid.setData('deselectFunctions', [
                function() {
                    if(squid.data.values.animation) {
                        squid.data.values.animation.stop();
                    }
                    squid.x = xPixel(squid.data.values.x);
                    squid.y = yPixel(squid.data.values.y);
                    squid.scaleY = 1;
                }
            ]);
            squid.setData('openFunctions', []);
            squid.setData('closeFunctions', []);
            squid.setData('moveFunctions', []);
            let execute = function(func_array) {
                for (let func of func_array)
                {
                    func();
                }
            };
            squid.setData('deselect', function() { execute(squid.data.values.deselectFunctions); })
            squid.setData('open', function() { execute(squid.data.values.openFunctions); });
            squid.setData('close', function() { execute(squid.data.values.closeFunctions); });
            squid.setData('move', function() { execute(squid.data.values.moveFunctions); });

            let activateMove = function()
            {
                squid.data.values.close();
                let map = squid.data.values.current_move_map;
                squid.setData('selection_action',SELECTION_ACTIONS.MOVE)
                activate_selection(map, function (value){
                    return value <= g_game_settings.move;
                });
            };

            let activateShot = function()
            {
                squid.data.values.close();
                let map = squid.data.values.current_shoot_map;
                squid.setData('selection_action',SELECTION_ACTIONS.SHOOT)
                activate_selection(map, function (value){
                    return value <= g_game_settings.shoot_distance;
                });
            };

            let angle_fix = COLORS.PINK === start_position.color ? 1 : -1;
            let angle_start = COLORS.PINK === start_position.color ? 0 : 360+180;

            add_menu_item(squid, angle_start + 360 / 7 * 3 * angle_fix, 'Move', activateMove);
            add_menu_item(squid, angle_start + 360 / 7 * 0.5 * angle_fix, 'Attack', activateShot);
            add_menu_item(squid, angle_start + 360 / 7 * 4.5 * angle_fix, 'Cheer', function() {});
            add_menu_close(squid, angle_start + 360 / 7 * 6 * angle_fix);

            squid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                function(pointer, localX, localY, event) {
                    select_squid(squid);
                    squid.data.values.open();
                    track_camera(squid.data.values.x,squid.data.values.y);
                    clear_selection();
                });

            //pink_squad.push(squid);
            squids.push(squid);
        }

        let recalculate_moves = function() {
            for (let squid of squids) {
                let map = calculate_reachable_squares(
                    squid.data.values.x,
                    squid.data.values.y,
                    g_game_settings.move,
                    squid.data.values.color);
                squid.setData('current_move_map',map);
                map = calculate_shootable_squares(
                    squid.data.values.x,
                    squid.data.values.y,
                    g_game_settings.shoot_distance);
                squid.setData('current_shoot_map', map);
            }
            let pink_score = 0;
            let orange_score = 0;
            let total = 0;
            for (let col of game_grid) {
                for (let square of col) {
                    if (square.data.values.value === TILES.ORANGE_GRID) {
                        orange_score++;
                    }
                    if (square.data.values.value === TILES.PINK_GRID) {
                        pink_score++;
                    }
                    total++;
                }
            }
            let ui = scene.scene.get('UIScene');
            if (ui.pink_score && ui.orange_score)
            {
                ui.pink_score.setText(Math.floor(pink_score * 100 / total) + "%");
                ui.orange_score.setText(Math.floor(orange_score * 100 / total) + "%");
            }
        }
        recalculate_moves();

        let border = BG_BORDER*GRID_SIZE;
        scene.cameras.main.setBounds(-border, -border, SCREEN_WIDTH + 2*border, SCREEN_HEIGHT + 2*border);

        let zone = scene.add.zone(-border, -border, SCREEN_WIDTH + 2*border, SCREEN_HEIGHT + 2*border)
            .setOrigin(0)
            .setInteractive();

        zone.on(Phaser.Input.Events.POINTER_MOVE, function (pointer) {
            if (pointer.isDown) {
                let deltaY = pointer.prevPosition.y - pointer.position.y;
                scene.cameras.main.scrollY  = scene.cameras.main.scrollY + deltaY;
                let deltaX = pointer.prevPosition.x - pointer.position.x;
                scene.cameras.main.scrollX  = scene.cameras.main.scrollX + deltaX;
            } else {
                scene.cameras.main.scrollY = Math.round(scene.cameras.main.scrollY);
                scene.cameras.main.scrollX = Math.round(scene.cameras.main.scrollX);
            }
        });
        zone.on(Phaser.Input.Events.POINTER_UP, function (pointer) {
            scene.cameras.main.scrollY = Math.round(scene.cameras.main.scrollY);
            scene.cameras.main.scrollX = Math.round(scene.cameras.main.scrollX);
        });

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
        esc_key.on(Phaser.Input.Keyboard.Events.DOWN, function() {
            clear_selection();
            select_squid(null);
        });
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
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    render: {
        //pixelArt: true
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
    scene: [ TitleScene, GameScene, UIScene ]
};

game = new Phaser.Game(config);
