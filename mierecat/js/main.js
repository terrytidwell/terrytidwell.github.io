const GRID_SIZE = 64;
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
    UI: 50,
    HUD: 60
};

let COLORS = {
    ORANGE: 0xd5a306,
    PINK: 0xef758a,
    NEUTRAL: 0xcec7b6,
    GRID_BORDER: 0x827c6c,
    ORANGE_TEXT: "#d5a306",
    PINK_TEXT: "#ef758a"
};

let g_game_settings = {
    move: 4,
    swim: 6,
    shoot_ink: 12,
    shoot_distance: 6,
    shoot_damage: -85,
    throw_ink: 26,
    throw_distance: 4,
    throw_damage: -60,
    throw_radius: 1,
    booyah_damage: 5,
    actions_per_turn: 2,
    points_per_square_inked: 4,
    end_of_turn_ink: 15,
    end_of_turn_submerged_ink: 20,
    end_of_turn_health: 15,
    number_of_rounds: 15,
    point_death_penalty: 30,
    splashdown_points: 100,
    splashdown_inner_radius: 2,
    splashdown_outer_radius: 4,
    splashdown_inner_damage: -180,
    splashdown_outer_damage: -79,
    grid_rows: 20,
    grid_cols:10,
};

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32, spacing: 1});
        this.load.image('splat', 'assets/splat2.png');
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.add.image(SCREEN_WIDTH/4,
            SCREEN_HEIGHT/4,
            'splat')
            .setTint(COLORS.ORANGE)
            .setScale(2);
        scene.add.image(SCREEN_WIDTH/4 *3,
            SCREEN_HEIGHT/2,
            'splat')
            .setTint(COLORS.PINK)
            .setAngle(70)
            .setScale(1.8);
        let play = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2,
            "Play",
            { font: GRID_SIZE * 2 + 'px project_paintball', color: COLORS.PINK_TEXT})
            .setOrigin(0.5, 0.5)
            .setStroke('#ffffff', GRID_SIZE/8);
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
            .setStroke('#ffffff', GRID_SIZE/8);
        scene.orange_score = scene.add.text(
            SCREEN_WIDTH,
            0,
            "0%",
            { font: GRID_SIZE + 'px project_paintball', color: COLORS.ORANGE_TEXT})
            .setOrigin(1,0)
            .setStroke('#ffffff', GRID_SIZE/8);
        scene.ui_timer = scene.add.text(
            SCREEN_WIDTH/2,
            0,
            'RD: 0/0',
            { font: GRID_SIZE/2 + 'px project_paintball', color: '#000000'})
            .setOrigin(0.5,0)
            .setStroke('#ffffff', GRID_SIZE/16)
            .setScrollFactor(0)
            .setDepth(DEPTHS.HUD);
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
            ORANGE_SQUID: 4,
            DEAD_SQUID: 5,
            OPEN_EYES: 6,
            X_EYES: 7,
            CLOSED_EYES: 8,
            BG_GRID: 9,
            PINK_SELECTOR: 10,
            ORANGE_SELECTOR: 11,
            DOT: 12,
            SPLAT: 13
        };

        let SELECTION_ACTIONS = {
            MOVE: 0,
            SHOOT: 1,
            BOOYAH: 2,
            SWIM: 3,
            SURFACE: 4,
            SPLASHDOWN_START: 5,
            SPLASHDOWN_FINISH: 6,
            THROW: 7
        };

        //----------------------------------------------------------------------
        // STATE VARIABLES
        //----------------------------------------------------------------------
        let current_active_unit = null;
        let current_highlight = null;
        let game_grid = null;
        let selector_grid = null;
        let squids = [];
        let next_squid_index = 0;
        let next_action_index = 0;
        let current_round = 1;
        let animation_queue = [];
        let spawn_portals = [];
        let spawn_points = [];

        //----------------------------------------------------------------------
        // HELPER FUNCTIONS
        //----------------------------------------------------------------------

        let xPixel = function(x)
        {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        let yPixel = function(y)
        {
            return y * GRID_SIZE + GRID_SIZE/2;
        };

        let update_turn_timer = function() {
            let ui = scene.scene.get('UIScene');
            if (ui.ui_timer)
            {
                ui.ui_timer.setText('RD:' + current_round + "/" + g_game_settings.number_of_rounds);
            }
        }

        let anim_round_start = function() {
            if (current_round > g_game_settings.number_of_rounds) {
                let ui = scene.scene.get('UIScene');
                let pink_percent = 0;
                let orange_percent = 0;
                if (ui.pink_score && ui.orange_score) {
                    pink_percent =  ui.pink_score.data.values.score;
                    orange_percent =  ui.orange_score.data.values.score;
                }
                let text = ["TIE!"];
                let text_color = '#000000';
                if (orange_percent > pink_percent) {
                   text = ["ORANGE", "WINS!"];
                   text_color = COLORS.ORANGE_TEXT;
                }
                if (pink_percent > orange_percent) {
                    text = ["PINK", "WINS!"];
                    text_color = COLORS.PINK_TEXT;
                }
                let victory_text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
                    text,
                    { font: GRID_SIZE*2 + 'px project_paintball', color: text_color})
                    .setOrigin(0.5)
                    .setStroke("#FFFFFF", GRID_SIZE*2/4)
                    .setScrollFactor(0)
                    .setOrigin(0.5)
                    .setDepth(DEPTHS.HUD)
                    .setScale(3)
                    .setAlpha(0)
                    .setAlign('center');
                scene.tweens.add({
                    targets: victory_text,
                    scale: 1,
                    alpha: 1,
                    duration: 500,
                    onComplete: function() {
                        scene.cameras.main.shake(250, 0.007, true);
                    }
                });
                return;
            }

            update_turn_timer();

            //if not first round, schedule the actions needed
            if (current_round !== 1) {
                round_begin();
            }

            let text = scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
                ["ROUND " + current_round, "START"],
                { font: GRID_SIZE*2 + 'px project_paintball', color: COLORS.PINK_TEXT})
                .setOrigin(0.5)
                .setStroke("#FFFFFF", GRID_SIZE*2/4)
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setDepth(DEPTHS.HUD)
                .setScale(3)
                .setAlpha(0)
                .setAlign('center');
            let timeline = scene.tweens.createTimeline();
            timeline.add({
                targets: text,
                scale: 1,
                alpha: 1,
                duration: 500,
                onComplete: function() {
                    scene.cameras.main.shake(250, 0.007, true);
                }
            });
            timeline.add({
                targets: text,
                scale: 2,
                alpha: 0,
                delay: 1000,
                duration: 100,
                onComplete: function() {
                    recalculate_game_state();
                }
            });
            timeline.play();
        };

        let create_random_square = function(x,y,grid) {
            let value = [TILES.EMPTY_GRID,
                TILES.EMPTY_GRID,
                TILES.EMPTY_GRID,
                TILES.ORANGE_GRID,
                TILES.PINK_GRID][Phaser.Math.Between(0, 4)];
            let sprite = scene.add.sprite(xPixel(x),yPixel(y),'tiles', value);

            sprite.setData("changeable", true);
            sprite.setData("value", value);
            sprite.setDepth(DEPTHS.GRID);
            sprite.setScale(2);

            return sprite;
        };

        let create_spawn_portal = function(x,y,color) {
            let border = GRID_SIZE/32;
            let radius = GRID_SIZE - border * 2;
            let spawn_portal_bg = scene.add.circle(
                xPixel(x + .5),
                yPixel(y + .5),
                GRID_SIZE,
                COLORS.GRID_BORDER,
                1
            ).setDepth(DEPTHS.GRID+1);
            let spawn_portal = scene.add.circle(
                xPixel(x + .5),
                yPixel(y + .5),
                radius,
                color,
                1
            ).setDepth(DEPTHS.GRID+2);
            let spawn_portal_fg = scene.add.circle(
                xPixel(x + .5),
                yPixel(y + .5),
                GRID_SIZE/4,
                COLORS.GRID_BORDER,
                1
            ).setDepth(DEPTHS.GRID+3);
            let my_tile = color === COLORS.PINK ? TILES.PINK_GRID : TILES.ORANGE_GRID;
            for (let p of [[x,y],[x+1,y],[x,y+1],[x+1,y+1]]) {
                game_grid[p[0]][p[1]].setTexture('tiles', my_tile);
                game_grid[p[0]][p[1]].setData('value', my_tile);
                game_grid[p[0]][p[1]].setData('changeable', false);
                spawn_points.push({x: p[0], y: p[1], color})
            }
            return spawn_portal;
        }

        let create_selector = function(x, y, grid) {
            let select_sprite = scene.add.sprite(xPixel(x), yPixel(y),
                'tiles', TILES.PINK_SELECTOR)
                .setDepth(DEPTHS.UI + 1)
                .setVisible(false)
                .setAlpha(0.6)
                .setScale(2);
            let select_sprite_bg = scene.add.rectangle(xPixel(x), yPixel(y),
                GRID_SIZE, GRID_SIZE, COLORS.PINK)
                .setDepth(DEPTHS.UI)
                .setVisible(false)
                .setAlpha(0.6);
            select_sprite.setData("x", x);
            select_sprite.setData("y", y);
            select_sprite.setInteractive();
            select_sprite.setData("bg",select_sprite_bg);
            select_sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
                select_sprite.setAlpha(0.8);
                select_sprite_bg.setAlpha(0.8);
            });
            select_sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
                select_sprite.setAlpha(0.6);
                select_sprite_bg.setAlpha(0.6);
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

        let clear_selection = function() {
            for (let i = 0; i < selector_grid.length; i++) {
                for (let j = 0; j < selector_grid[i].length; j++) {
                    selector_grid[i][j].setVisible(false);
                    selector_grid[i][j].data.values.bg.setVisible(false);
                }
            }
        };

        let create_grid = function(generator) {
            let grid = [];
            for (let x = 0; x < g_game_settings.grid_cols; x++)
            {
                grid.push([]);
                for (let y = 0; y < g_game_settings.grid_rows; y++)
                {
                    grid[x].push(generator(x,y,grid));
                }
            }
            return grid;
        };

        let square_is_legal = function(x, y) {
            return x >= 0 && x < g_game_settings.grid_cols &&
                y >= 0 && y < g_game_settings.grid_rows;
        };

        let color_square = function(x,y,squid,reward=true)
        {
            if (!square_is_legal(x,y)) {
                return;
            }
            let tile = game_grid[x][y];
            let tile_target = squid.data.values.color === COLORS.PINK ?
                TILES.PINK_GRID : TILES.ORANGE_GRID;
            if (tile.data.values.changeable &&
                tile.data.values.value !== tile_target) {
                if (reward) {
                    squid.data.values.update_points(g_game_settings.points_per_square_inked);
                }
                tile.setTexture('tiles', tile_target);
                tile.setData('value', tile_target);
            }
        };

        let square_is_shootable = function(x, y, my_color) {
            if (!square_is_legal(x,y)) {
                return false;
            }
            let exclusive_tile = my_color === COLORS.PINK ?
                TILES.PINK_GRID : TILES.ORANGE_GRID;
            if (!game_grid[x][y].data.values.changeable &&
                game_grid[x][y].data.values.value !== exclusive_tile)
            {
                return false;
            }
            return true;
        };

        let square_is_squid_free = function(x, y, color) {
            for (let squid of squids) {
                if (squid.data.values.isAlive() &&
                    squid.data.values.color === color &&
                    squid.data.values.x === x && squid.data.values.y === y) {
                    return false;
                }
            }
            return true;
        };

        let square_is_legal_swim = function(x, y, my_color) {
            //is the square part of the playing area?
            if (!square_is_legal(x, y))
            {
                return false;
            }
            if (!square_is_legal_move(x,y,my_color))
            {
                return false;
            }
            let my_tile =  my_color === COLORS.PINK ?
                TILES.PINK_GRID : TILES.ORANGE_GRID;
            if (game_grid[x][y].data.values.value !== my_tile)
            {
                return false;
            }
            return true;
        };

        let square_is_legal_move = function(x, y, my_color) {
            //is an enemy squid here?
            let enemy_color = my_color === COLORS.PINK ? COLORS.ORANGE : COLORS.PINK;
            if(!square_is_squid_free(x, y, enemy_color))
            {
                return false;
            }
            //is the square part of the playing area?
            if (!square_is_legal(x, y))
            {
                return false;
            }
            //is the square exclusive to the other team?
            let exclusive_tile = my_color === COLORS.PINK ?
                TILES.PINK_GRID : TILES.ORANGE_GRID;
            if (!game_grid[x][y].data.values.changeable &&
                game_grid[x][y].data.values.value !== exclusive_tile)
            {
                return false;
            }
            return true;
        };

        let activate_selection = function(map, filter) {
            for (let i = 0; i < map.length; i++) {
                for (let j = 0; j < map[i].length; j++) {
                    let value = map[i][j];
                    if (filter(value)) {
                        let square = selector_grid[i][j];

                        square.setVisible(true);
                        square.data.values.bg.setVisible(true);
                        square.data.values.bg.setFillStyle(current_active_unit.data.values.color, 0.6);
                        let sprite_texture = current_active_unit.data.values.color === COLORS.PINK ?
                            TILES.PINK_SELECTOR : TILES.ORANGE_SELECTOR;
                        square.setTexture('tiles', sprite_texture);
                    }
                }
            }
        };

        let calculate_throwable_squares = function(x, y, distance, color) {
            let INFINITY = distance + 1;
            let reach_map = create_grid(function(){return INFINITY;});
            for (let i = -distance; i <= distance; i++) {
                for (let j = -distance; j <= distance; j++) {
                    if (square_is_shootable(x+i, y+j, color) &&
                        Math.sqrt(i * i + j * j) <= distance) {
                        reach_map[x+i][y+j] = 0;
                    }
                }
            }
            return reach_map;
        };

        let calculate_swimmable_squares = function(x, y, moves_left, my_color) {
            let passable_squares = my_color === COLORS.PINK ? TILES.PINK_GRID : TILES.ORANGE_GRID;
            let INFINITY = moves_left + 1;
            let reach_map = create_grid(function(){return INFINITY;});
            let squares_to_expand = [{x: x, y: y, moves_used: 0}];
            reach_map[x][y] = 0;
            let MOVES = [ [0, 1], [0, -1], [1, 0], [-1, 0] ];
            while (squares_to_expand.length !== 0)
            {
                let square = squares_to_expand.shift();
                for ( let move of MOVES )
                {
                    let dx = move[0];
                    let dy = move[1];
                    if (square_is_legal_swim(
                        square.x+dx,
                        square.y+dy,
                        my_color)) {
                        if (reach_map[square.x+dx][square.y+dy] >
                            square.moves_used + 1) {

                            reach_map[square.x + dx][square.y + dy] = square.moves_used + 1;
                            squares_to_expand.push({
                                x: square.x + dx,
                                y: square.y + dy,
                                moves_used: square.moves_used + 1
                            });
                        }
                    }
                }
            }

            //knock out squid squares if any...
            for (let squid of squids)
            {
                if (squid.data.values.isAlive()) {
                    reach_map[squid.data.values.x][squid.data.values.y] = INFINITY;
                }
            }

            return reach_map;
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
                let square = squares_to_expand.shift();
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
                if (squid.data.values.isAlive()) {
                    reach_map[squid.data.values.x][squid.data.values.y] = INFINITY;
                }
            }

            return reach_map;
        };

        let calculate_shootable_squares = function(x, y, shoot_distance, my_color)
        {
            let INFINITY = shoot_distance + 1;
            let reach_map = create_grid( function(){return INFINITY;});
            let directions = [[+1,0,true],[-1,0,true],[0,+1,true],[0,-1,true]];
            for (let i = 1; i <= shoot_distance; i++)
            {
                for (let direction of directions) {
                    let dx = i * direction[0];
                    let dy = i * direction[1];
                    let propogate = direction[2];
                    if (propogate && square_is_legal(x + dx, y + dy)) {
                        if (square_is_shootable(x + dx, y + dy, my_color)) {
                            reach_map[x + dx][y + dy] = 0;
                        } else {
                            //stop propogation
                            direction[2] = false;
                        }
                    }
                }
            }
            return reach_map;
        };

        let highlight_squid = function(squid,callback=function(){}) {
            if (current_highlight === squid)
            {
                callback();
                return;
            }
            if (current_highlight)
            {
                current_highlight.data.values.unhighlight();
            }
            if (squid)
            {
                squid.data.values.highlight(callback);
            }
            current_highlight = squid;
        }

        let set_current_active_unit = function(squid) {
            highlight_squid(squid);
            if (current_active_unit === squid)
            {
                return;
            }
            if (current_active_unit)
            {
                current_active_unit.data.values.inactivate();
            }
            if (squid) {
                squid.data.values.activate();
            }
            current_active_unit = squid;
        }

        let on_selector_clicked = function(x, y) {
            if (current_active_unit)
            {
                switch (current_active_unit.data.values.selection_action) {
                    case SELECTION_ACTIONS.MOVE:
                        current_active_unit.setData('x', x);
                        current_active_unit.setData('y', y);
                        current_active_unit.x = xPixel(x);
                        current_active_unit.y = yPixel(y);
                        current_active_unit.data.values.move();

                        track_camera(x, y);
                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.SWIM:
                        current_active_unit.setData('x', x);
                        current_active_unit.setData('y', y);
                        current_active_unit.x = xPixel(x);
                        current_active_unit.y = yPixel(y);
                        current_active_unit.data.values.move();
                        current_active_unit.data.values.setSubmerged(true);

                        track_camera(x, y);
                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.SHOOT:
                        current_active_unit.data.values.update_ink(-g_game_settings.shoot_ink);
                        let dx = x - current_active_unit.data.values.x;
                        let dy = y - current_active_unit.data.values.y;
                        let vector = new Phaser.Math.Vector2(dx, dy);
                        vector.normalize();
                        vector.scale(g_game_settings.shoot_distance);
                        let line = new Phaser.Geom.Line(0, 0, vector.x, vector.y);
                        let points = Phaser.Geom.Line.BresenhamPoints(line);

                        let shot_squids = [];
                        for (let point of points)
                        {
                            let px = point.x + current_active_unit.data.values.x;
                            let py = point.y + current_active_unit.data.values.y;
                            if (square_is_legal(px,py))
                            {
                                if (!square_is_shootable(px,py,current_active_unit.data.values.color)) {
                                    //your shot has been blocked!
                                    //stop propogation
                                    break;
                                }
                                color_square(px,py,current_active_unit);
                                for (let squid of squids)
                                {
                                    if( squid.data.values.isAlive() &&
                                        squid.data.values.color !== current_active_unit.data.values.color &&
                                        squid.data.values.x === px &&
                                        squid.data.values.y === py)
                                    {
                                        shot_squids.unshift(squid);
                                    }
                                }
                            }
                        };
                        for (let shot_squid of shot_squids)
                        {
                            shot_squid.data.values.onDamage(g_game_settings.shoot_damage );
                        }

                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.BOOYAH:
                        let booyah_squids = [];
                        for (let squid of squids)
                        {
                            if( squid.data.values.isAlive() &&
                                squid !== current_active_unit &&
                                squid.data.values.color === current_active_unit.data.values.color)
                            {
                                booyah_squids.push(squid);
                            }
                        }
                        mass_life_change(booyah_squids, g_game_settings.booyah_damage);
                        current_active_unit.data.values.onDamage(g_game_settings.booyah_damage);
                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.SURFACE:
                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.SPLASHDOWN_START:
                        current_active_unit.data.values.update_points(-g_game_settings.splashdown_points);

                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.SPLASHDOWN_FINISH:
                        current_active_unit.data.values.update_ink(100);

                        let outer = g_game_settings.splashdown_outer_radius;
                        let inner = g_game_settings.splashdown_innder_radius;
                        for (let dx = -outer; dx <= outer; dx++)
                        {
                            for(let dy = -outer; dy <= outer; dy++)
                            {
                                let damage = (dx >= -inner && dx <= innder)
                                    && (dy >= -inner && dy <= inner) ?
                                    g_game_settings.splashdown_inner_damage :
                                    g_game_settings.splashdown_outer_damage;
                                let px = dx + current_active_unit.data.values.x;
                                let py = dy + current_active_unit.data.values.y;
                                if (square_is_shootable(px,py,current_active_unit.data.values.color))
                                {
                                    color_square(px,py,current_active_unit,false);
                                    for (let squid of squids)
                                    {
                                        if( squid.data.values.isAlive() &&
                                            squid.data.values.color !== current_active_unit.data.values.color &&
                                            squid.data.values.x === px &&
                                            squid.data.values.y === py)
                                        {
                                            squid.data.values.onDamage(damage);
                                        }
                                    }
                                }
                            }
                        }
                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.THROW:
                        current_active_unit.data.values.update_ink(-g_game_settings.throw_ink);

                        let radius = g_game_settings.throw_radius;
                        for (let dx = -radius; dx <= radius; dx++)
                        {
                            for(let dy = -radius; dy <= radius; dy++)
                            {
                                let damage = g_game_settings.throw_damage;
                                let px = dx + x;
                                let py = dy + y;
                                if (square_is_shootable(px,py,current_active_unit.data.values.color))
                                {
                                    color_square(px,py,current_active_unit);
                                    for (let squid of squids)
                                    {
                                        if( squid.data.values.isAlive() &&
                                            squid.data.values.color !== current_active_unit.data.values.color &&
                                            squid.data.values.x === px &&
                                            squid.data.values.y === py)
                                        {
                                            squid.data.values.onDamage(damage);
                                        }
                                    }
                                }
                            }
                        }
                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                }
            }
        };

        let mass_life_change = function (squids, delta) {
            if (squids.length > 0) {
                animation_queue.push(function () {
                    let total_callbacks = squids.length;
                    let received_callbacks = 0;
                    let damage_callbacks = function(){
                        received_callbacks++;
                        if (received_callbacks >= total_callbacks)
                        {
                            recalculate_game_state();
                        }
                    };

                    for (let squid of squids) {
                        squid.data.values.onDamage(delta,
                            true ,damage_callbacks);
                    }
                });
            }
        };

        let track_camera = function(x,y,callback=function(){})
        {
            //ok... so this code
            //the first camera pan simple is used to calculate the actual move to be made
            //after scheduling this pan the value camera.panEffect.current is a vector2 that
            //has the ACTUAL camera destination
            //
            //cameras.main.scrollX and scrollY have the actual start point so we need to
            //use those two variables to determine how far the camera should move, and thus
            //how long our pan should be
            let camera = scene.cameras.main.pan(
                xPixel(x),
                yPixel(y));
            let d = Phaser.Math.Distance.Between(
                scene.cameras.main.scrollX,
                scene.cameras.main.scrollY,
                camera.panEffect.current.x,
                camera.panEffect.current.y
            );
            camera = scene.cameras.main.pan(
                xPixel(x),
                yPixel(y),
                d,
                'Quad.EaseInEaseOut',
                true,
                callback);
        };

        let add_menu_close = function(squid, menu_index, parent_menu_index, angle)
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
                squid.data.values.open_internal(parent_menu_index);
            });
            let bg = scene.add.circle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                GRID_SIZE/4+GRID_SIZE/32,
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
            squid.data.values.closeFunctions[menu_index].push(close);
            squid.data.values.openFunctions[menu_index].push(function() {
                for (let object of objects) {
                    object.setVisible(true);
                }
            });
        };

        let add_hud = function(squid) {
            let bubble = scene.add.circle(
                0 - GRID_SIZE*3, SCREEN_HEIGHT + GRID_SIZE*3,
                GRID_SIZE * 2,
                0xFFFFFF, 1)
                .setScrollFactor(0)
                .setDepth(DEPTHS.HUD+1)
                .setData('visible',[0, SCREEN_HEIGHT])
                .setData('invisible',[0 - GRID_SIZE*3, SCREEN_HEIGHT + GRID_SIZE*3]);
            let bubble_outline = scene.add.circle(
                0 - GRID_SIZE*3, SCREEN_HEIGHT + GRID_SIZE*3,
                GRID_SIZE * 2.25,
                squid.data.values.color, 1)
                .setScrollFactor(0)
                .setDepth(DEPTHS.HUD)
                .setData('visible',[0, SCREEN_HEIGHT])
                .setData('invisible',[0 - GRID_SIZE*3, SCREEN_HEIGHT + GRID_SIZE*3]);
            let my_tile = COLORS.PINK === squid.data.values.color ? TILES.PINK_SQUID : TILES.ORANGE_SQUID;
            let my_text = COLORS.PINK === squid.data.values.color ? COLORS.PINK_TEXT : COLORS.ORANGE_TEXT;
            let portrait = scene.add.sprite(
                0 + GRID_SIZE/2 - GRID_SIZE*3, SCREEN_HEIGHT - GRID_SIZE/2 + GRID_SIZE*3,
                'tiles',my_tile)
                .setScale(4)
                .setScrollFactor(0)
                .setDepth(DEPTHS.HUD+2)
                .setData('visible',[0 + GRID_SIZE/2, SCREEN_HEIGHT - GRID_SIZE/2])
                .setData('invisible',[0 + GRID_SIZE/2 - GRID_SIZE*3, SCREEN_HEIGHT - GRID_SIZE/2 + GRID_SIZE*3]);;
            let portrait_eyes = scene.add.sprite(
                0 + GRID_SIZE/2 - GRID_SIZE*3, SCREEN_HEIGHT - GRID_SIZE/2 + GRID_SIZE*3,
                'tiles',TILES.OPEN_EYES)
                .setScale(4)
                .setScrollFactor(0)
                .setDepth(DEPTHS.HUD+3)
                .setData('visible',[0 + GRID_SIZE/2, SCREEN_HEIGHT - GRID_SIZE/2])
                .setData('invisible',[0 + GRID_SIZE/2 - GRID_SIZE*3, SCREEN_HEIGHT - GRID_SIZE/2 + GRID_SIZE*3]);;;
            let text_height = GRID_SIZE/2;

            let life = scene.add.text(
                SCREEN_WIDTH/2,
                SCREEN_HEIGHT-text_height/2-2*text_height + 4*text_height,
                'HP: 100/100', {font: text_height + 'px project_paintball', color: my_text})
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setDepth(DEPTHS.HUD+3)
                .setStroke("#FFFFFF", GRID_SIZE/8)
                .setData('visible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2-2*text_height])
                .setData('invisible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2-2*text_height + 4*text_height])

            function onDamage(damage, quick=false, quick_callback=null) {
                if (damage < 0) {
                    if (squid.data.values.submerged) {
                        damage = Math.round(damage * 1.5);
                    }
                    if (squid.data.values.splashdown) {
                        damage = Math.round(damage * 0.5);
                    }
                    squid.data.values.setSubmerged(false);
                }
                let new_life = Phaser.Math.Clamp(squid.data.values.health + damage, 0, 100);
                let actual_change = new_life - squid.data.values.health;
                let full_reaction = 1000;
                let actual_change_time = Math.round((actual_change / damage) * full_reaction);
                let remainder_time = full_reaction - actual_change_time + 250;

                let eye_tile = damage > 0 ? TILES.CLOSED_EYES : TILES.X_EYES;

                let heal_reaction = {
                    targets: squid.data.values.animate_list,
                    y: yPixel(squid.data.values.y - .25),
                    scaleY: 1.8,
                    duration: 250,
                    ease: "Quad.easeOut",
                    yoyo: true,
                    repeat: 1
                };
                let damage_reaction = {
                    targets: squid.data.values.animate_list,
                    scale: 1.75,
                    yoyo: true,
                    duration: 125,
                    repeat: 3
                };

                let animation = damage > 0 ? heal_reaction : damage_reaction;
                let label = damage > 0 ? '+' + damage : '' + damage;

                let reaction = function () {
                    let damage_function = function () {
                        if (new_life === 0) {
                            scene.cameras.main.shake(250, 0.015, true);
                            scene.tweens.add({
                                targets: squid,
                                alpha: 0,
                                duration: full_reaction,
                                onComplete: function () {
                                    squid.setAlpha(1);
                                    squid.setVisible(false);
                                }
                            })
                        }
                        let old_depth = squid.depth;
                        let old_eye_depth = squid.data.values.eyes.depth;
                        squid.setDepth(DEPTHS.SQUAD + 3);
                        squid.data.values.eyes.setDepth(DEPTHS.SQUAD + 4);
                        squid.data.values.health_text
                            .setText(label)
                            .setVisible(true)
                            .setAlpha(1)
                            .setAngle(Phaser.Math.Between(-20, 20));

                        squid.data.values.eyes.setTexture('tiles', eye_tile);

                        scene.tweens.add({
                            targets: {counter: squid.data.values.health},
                            props: {counter: new_life},
                            //delay: 1000,
                            duration: actual_change_time,
                            onUpdate: function (tween) {
                                let value = Math.floor(tween.getValue());
                                life.setText("HP: " + value + "/100");
                            },
                            onComplete: function () {
                                scene.time.delayedCall(remainder_time, function () {
                                    squid.setData('health', new_life);
                                    if (!quick){
                                        recalculate_game_state();
                                    } else {
                                        if (quick_callback) {
                                            quick_callback();
                                        }
                                    }
                                    if (new_life === 0) {
                                        scene.tweens.add({
                                            targets: squid.data.values.eyes,
                                            scale: 3,
                                            alpha: 0,
                                            duration: 100,
                                            onComplete: function () {
                                                squid.data.values.eyes.setScale(2);
                                                squid.data.values.eyes.setAlpha(1);
                                                squid.data.values.eyes.setVisible(false);
                                                //onDeath
                                                squid.data.values.setSplashdown(false);
                                            }
                                        })
                                    }
                                });
                            }
                        });

                        scene.tweens.add(animation);

                        scene.tweens.add({
                            targets: squid.data.values.health_text,
                            alpha: 0,
                            duration: full_reaction,
                            y: yPixel(squid.data.values.y - .5),
                            onComplete: function () {
                                squid.data.values.health_text.y =
                                    yPixel(squid.data.values.y);
                                squid.setDepth(old_depth);
                                squid.data.values.eyes.setDepth(old_eye_depth);
                                squid.data.values.eyes.setTexture('tiles', TILES.OPEN_EYES);
                            }
                        });
                    }; //end damage_function

                    if (!quick) {
                        highlight_squid(squid, damage_function);
                    } else {
                        damage_function();
                    }
                };

                if (!quick) {
                    animation_queue.push(reaction);
                } else {
                    reaction();
                }
            }
            squid.setData('onDamage', onDamage);

            let ink = scene.add.text(
                SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2-text_height + 4*text_height,
                'INK: 100/100', {font: text_height + 'px project_paintball', color: my_text})
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setDepth(DEPTHS.HUD+3)
                .setStroke("#FFFFFF", GRID_SIZE/8)
                .setData('visible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2-text_height])
                .setData('invisible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2-text_height + 4*text_height])
            squid.setData('update_ink',function(delta){
                squid.data.values.ink = Phaser.Math.Clamp(squid.data.values.ink + delta, 0, 100);
                ink.setText("INK: " + squid.data.values.ink + "/100");
            });
            squid.data.values.update_ink(0);

            let pts = scene.add.text(
                SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2 + 4*text_height,
                'PTS: 0/100', {font: text_height + 'px project_paintball', color: my_text})
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setDepth(DEPTHS.HUD+3)
                .setStroke("#FFFFFF", GRID_SIZE/8)
                .setData('visible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2])
                .setData('invisible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2 + 4*text_height]);
            squid.setData('update_points',function(delta){
                squid.data.values.points = Phaser.Math.Clamp(squid.data.values.points + delta, 0, 100);
                pts.setText("PTS: " + squid.data.values.points + "/100");
            });
            squid.data.values.update_points(0);

            let tween_targets = [bubble, bubble_outline, portrait, portrait_eyes, life, ink, pts];
            for (let target of tween_targets) {
                target.setVisible(false);
                target.setData('current_tween',null);
            }

            let unhighlight = function() {
                for (let target of tween_targets){
                    if (target.data.values.current_tween) {
                        target.data.values.current_tween.stop()
                    }
                    let tween = scene.tweens.add({
                        targets: target,
                        x: target.data.values.invisible[0],
                        y: target.data.values.invisible[1],
                        alpha: 0,
                        duration: 125,
                        ease: 'Linear',
                        onComplete: function() {
                            target.setData('current_tween',null);
                            target.setVisible(false);
                        }
                    });
                    target.setData('current_tween', tween);
                }
            };
            squid.data.values.unhighlightFunctions.push(unhighlight);

            squid.data.values.highlightFunctions.push(function(callback=function(){}) {
                let current_callbacks = 0;
                let expected_callbacks = tween_targets.length;
                let chain_callback = function() {
                    current_callbacks++;
                    if (current_callbacks === expected_callbacks) {
                        callback();
                    }
                };
                let delay = current_highlight === null ? 0 : 125;

                for (let target of tween_targets) {
                    if (target.data.values.current_tween) {
                        target.data.values.current_tween.stop()
                    }
                    target.setVisible(true);
                    let tween = scene.tweens.add({
                        delay: delay,
                        targets: target,
                        x: target.data.values.visible[0],
                        y: target.data.values.visible[1],
                        alpha: 1,
                        duration: 125,
                        ease: 'Linear',
                        onComplete: function() {
                            target.setData('current_tween',null);
                            chain_callback();
                        }
                    });
                    target.setData('current_tween', tween);
                }
            });
        }

        let add_health_bar = function(label, squid,angle) {
            let x = squid.data.values.x;
            let y = squid.data.values.y;
            angle %= 360;
            let text_correction = 0;
            if (angle >= 90 && angle < 270)
            {
                text_correction = 180;
            }

            let text = scene.add.text(xPixel(x),yPixel(y),
                label, { font: GRID_SIZE/2 + 'px Splatfont2', color: "#ffffff"});
            text.setOrigin(0.5, 0.5);
            let width = text.width * 1.25;

            let inner_radius = text.width+GRID_SIZE;
            let vector = new Phaser.Math.Vector2(inner_radius, 0);
            let vector2 = new Phaser.Math.Vector2(inner_radius+ text.width/2+GRID_SIZE/2, 0);
            vector.rotate(Phaser.Math.DegToRad(angle));
            vector2.rotate(Phaser.Math.DegToRad(angle));

            text.x = text.x + vector.x;
            text.y = text.y + vector.y;
            text.setAngle(angle + text_correction);
            text.setDepth(DEPTHS.UI+3);

            let circle = scene.add.circle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                width/2,
                squid.data.values.color, 1)
                .setDepth(DEPTHS.UI+2);

            circle.setAlpha(0.75);
            let bg = scene.add.circle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                width/2+1,
                0xFFFFFF, 1)
                .setDepth(DEPTHS.UI+1);

            let bar = scene.add.rectangle(
                xPixel(x) + vector2.x,
                yPixel(y) + vector2.y,
                GRID_SIZE,
                GRID_SIZE/4,
                squid.data.values.color, 1)
                .setDepth(DEPTHS.UI)
                .setAngle(angle);
            let bar_bg = scene.add.rectangle(
                xPixel(x) + vector2.x,
                yPixel(y) + vector2.y,
                GRID_SIZE + 2,
                GRID_SIZE/4 + 2,
                0xFFFFFF, 1)
                .setDepth(DEPTHS.UI-1)
                .setAngle(angle);
            let objects = [text, circle, bg];
            let objects2 = [bar, bar_bg];

            let move = function() {
                for (let object of objects) {
                    object.x = Math.round(xPixel(squid.data.values.x) + vector.x);
                    object.y = Math.round(yPixel(squid.data.values.y) + vector.y);
                }
                for (let object of objects2) {
                    object.x = Math.round(xPixel(squid.data.values.x) + vector2.x);
                    object.y = Math.round(yPixel(squid.data.values.y) + vector2.y);
                }
            };
            move();

            scene.tweens.add({
                yoyo: true,
                duration: 1000,
                targets: bar,
                width: 0,
                repeat: -1
            })

            let open = function() {
                for (let object of objects) {
                    object.setVisible(false);
                }
                for (let object of objects2) {
                    object.setVisible(false);
                }
            };

            squid.data.values.openFunctions.push(open);
            squid.data.values.moveFunctions.push(move);
        };

        let add_menu_item = function(squid,menu_index,
             angle,label,click,allowed=function(){return true;}){
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

            let vector = new Phaser.Math.Vector2(width/2+GRID_SIZE/4*3, 0);
            vector.rotate(Phaser.Math.DegToRad(angle));

            text.x = text.x + vector.x;
            text.y = text.y + vector.y;
            text.setAngle(angle + text_correction);
            text.setDepth(DEPTHS.UI+2);

            let rect = scene.add.rectangle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                width, GRID_SIZE/2,
                squid.data.values.color, 1)
                .setDepth(DEPTHS.UI+1);
            rect.setAngle(angle);
            rect.setAlpha(0.75);
            rect.setInteractive();
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
                rect.setAlpha(1);
            });
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
                rect.setAlpha(0.75);
            });
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function(){
                if (allowed()) {
                    click();
                }
            });
            let bg = scene.add.rectangle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                width+GRID_SIZE/16, GRID_SIZE/2+GRID_SIZE/16,
                0xFFFFFF, 1)
                .setDepth(DEPTHS.UI);
            bg.setAngle(angle);

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
            squid.data.values.closeFunctions[menu_index].push(close);
            squid.data.values.openFunctions[menu_index].push(function() {
                for (let object of objects) {
                    object.setVisible(true);
                }
                if (allowed()) {
                    rect.setFillStyle(squid.data.values.color, 1);
                } else {
                    rect.setFillStyle(COLORS.NEUTRAL, 1);
                }
            });
        };

        let add_squid = function(x,y,color) {
            let my_tile = COLORS.PINK === color ? TILES.PINK_SQUID : TILES.ORANGE_SQUID;
            let my_text = COLORS.PINK === color ? COLORS.PINK_TEXT : COLORS.ORANGE_TEXT;
            let squid = scene.add.sprite(xPixel(x),yPixel(y),'tiles',my_tile);
            let squid_eyes = scene.add.sprite(xPixel(x),yPixel(y),'tiles',TILES.OPEN_EYES);

            let MENUS = {
                none: 0,
                main: 1,
                move: 2,
                swim: 3,
                swim_selection: 4,
                shoot_selection: 5,
                move_selection: 6,
                ink: 7,
                splashdown: 8,
                throw_selection: 9,
                max: 10
            };

            squid.setData('openFunctions', []);
            squid.setData('closeFunctions', []);
            for (i = 0; i < MENUS.max; i++)
            {
                squid.data.values.openFunctions.push([]);
                squid.data.values.closeFunctions.push([]);
            }

            squid.setData('currentMenu',MENUS.none);
            squid.setScale(2);
            squid.setDepth(DEPTHS.SQUAD);
            squid_eyes.setDepth(DEPTHS.SQUAD + 2);
            squid_eyes.setScale(2);
            squid.setInteractive();
            squid.setData('x',x);
            squid.setData('eyes', squid_eyes);
            squid.setData('y',y);
            squid.setData('color', color);
            squid.setData('health', 100);
            squid.setData('ink', 100);
            squid.setData('points',0);
            squid.setData('isAlive', function() {
                return squid.data.values.health > 0;
            });
            let splashdown_shape = new Phaser.Geom.Rectangle(-GRID_SIZE/2,-GRID_SIZE/2,GRID_SIZE,GRID_SIZE);
            let particle = scene.add.particles('tiles', TILES.SPLAT);
            particle.setDepth(DEPTHS.SQUAD+1);
            let splashdown_animation = particle.createEmitter({
                x: xPixel(x),
                y: yPixel(y),
                alpha: {
                    start: 1,
                    end: 0,
                },
                speedY: -100,
                speedX: {min: -40, max: 40},
                gravityY: 200,
                frequency: 25,
                lifespan: 1000,
                tint: color,
                emitZone: { type: 'random', source: splashdown_shape}
                //maxParticles: 10,
            });
            splashdown_animation.stop();

            squid.setData('submerged', false);
            squid.setData('setSubmerged', function(bool){
                squid.setData('submerged',bool);
                if (bool) {
                    squid.setAlpha(0.01);
                } else {
                    squid.setAlpha(1);
                }
            });
            squid.setData('splashdown', false);
            squid.setData('setSplashdown', function(bool){
                squid.setData('splashdown',bool);
                if (bool) {
                    splashdown_animation.start();
                    //do some sort of animation
                    //squid.setAlpha(0.01);
                } else {
                    splashdown_animation.stop();
                    //squid.setAlpha(1);
                }
            });
            squid.setData('animate_list', [squid, squid_eyes]);
            let health_text = scene.add.text(xPixel(x),yPixel(y),"+0",
                {font: GRID_SIZE/4*3 + 'px project_paintball', color: my_text})
                .setOrigin(0.5)
                .setStroke("#FFFFFF", GRID_SIZE/8)
                .setDepth(DEPTHS.UI)
                .setVisible(false);
            squid.setData('health_text',health_text);
            squid.setData('unhighlightFunctions', [ function() {
                squid.data.values.close(squid.data.values.currentMenu);
                squid.setData('currentMenu',MENUS.none)
            }]);
            squid.setData('highlightFunctions', [ function(callback=function(){}) {
                track_camera(squid.data.values.x,squid.data.values.y,callback);
                if (current_active_unit === squid)
                {
                    let my_menu = MENUS.main;
                    squid.setData('currentMenu',MENUS.main);
                    squid.data.values.open();
                }
            }]);
            squid.setData('activate', function() {
                squid.setData("animation",
                    scene.tweens.add({
                        targets: squid.data.values.animate_list,
                        y: yPixel(squid.data.values.y - .25),
                        scaleY: 1.8,
                        duration: 250,
                        ease: "Quad.easeOut",
                        yoyo: true,
                        repeat: -1
                    }));
                squid.data.values.highlight();
                squid.setDepth(DEPTHS.SQUAD+3);
                particle.setDepth(DEPTHS.SQUAD+4);
                squid_eyes.setDepth(DEPTHS.SQUAD+5);
                squid.data.values.open();
            });
            squid.setData('inactivate', function() {
                if(squid.data.values.animation) {
                    squid.data.values.animation.stop();
                }
                for (let animated of squid.data.values.animate_list)
                {
                    animated.x = xPixel(squid.data.values.x);
                    animated.y = yPixel(squid.data.values.y);
                    animated.scaleY = 2;
                }
                squid.setDepth(DEPTHS.SQUAD);
                particle.setDepth(DEPTHS.SQUAD+1);
                squid_eyes.setDepth(DEPTHS.SQUAD+2);
            });
            squid.setData('moveFunctions', [function(){
                splashdown_animation.setPosition(
                    xPixel(squid.data.values.x),
                    yPixel(squid.data.values.y));
                squid_eyes.x = xPixel(squid.data.values.x);
                squid_eyes.y = yPixel(squid.data.values.y);
                health_text.x = xPixel(squid.data.values.x);
                health_text.y = yPixel(squid.data.values.y);
            }]);
            let execute = function(func_array) {
                for (let func of func_array)
                {
                    func();
                }
            };
            let executeWithCallback = function(func_array,callback=function(){}) {
                let full_count = func_array.length;
                let current_count = 0;
                let counterCallback = function() {
                    current_count++;
                    if(current_count === full_count)
                    {
                        callback();
                    }
                };

                for (let func of func_array)
                {
                    func(counterCallback);
                }
            };

            squid.setData('highlight', function(callback=function(){}) {
                executeWithCallback(squid.data.values.highlightFunctions, callback); });
            squid.setData('unhighlight', function() { execute(squid.data.values.unhighlightFunctions); });
            squid.setData('open', function() {
                if (squid.data.values.submerged) {
                    squid.data.values.open_internal(MENUS.swim);
                    return;
                }
                if (squid.data.values.splashdown) {
                    squid.data.values.open_internal(MENUS.splashdown);
                    return;
                }

                squid.data.values.open_internal(MENUS.main);
            });
            squid.setData('open_internal', function(index) {
                execute(squid.data.values.closeFunctions[squid.data.values.currentMenu]);
                squid.setData('currentMenu',index);
                execute(squid.data.values.openFunctions[index]); });
            squid.setData('close', function() {
                execute(squid.data.values.closeFunctions[squid.data.values.currentMenu]);
                squid.setData('currentMenu',MENUS.none);
            });
            squid.setData('move', function() { execute(squid.data.values.moveFunctions); });

            let activateBooyah = function()
            {
                squid.setData('selection_action',SELECTION_ACTIONS.BOOYAH);
                scene.events.emit('selector_clicked',
                    squid.data.values.x,
                    squid.data.values.y);
            };

            let angle_fix = COLORS.PINK === color ? 1 : -1;
            let angle_start = COLORS.PINK === color ? 0 : 360+180;

            add_hud(squid);
            if (squids.length === 0 || squids.length === 4) {
                /*
                add_health_bar('HP', squid, angle_start + 360 / 13 * 11.5 * angle_fix);
                add_health_bar('NK', squid, angle_start + 360 / 13 * 12.5 * angle_fix);
                add_health_bar('SP', squid, angle_start + 360 / 13 * 13.5 * angle_fix);
                 */
            }

            squid.data.values.openFunctions[MENUS.swim_selection].push(function() {
                let map = squid.data.values.current_swim_map;
                squid.setData('selection_action',SELECTION_ACTIONS.SWIM);
                activate_selection(map, function (value){
                    return value <= g_game_settings.swim;
                });
            });
            squid.data.values.closeFunctions[MENUS.swim_selection].push(function() {
                clear_selection();
            });

            squid.data.values.openFunctions[MENUS.throw_selection].push(function() {
                let map = squid.data.values.current_throw_map;
                squid.setData('selection_action',SELECTION_ACTIONS.THROW);
                activate_selection(map, function (value){
                    return value <= g_game_settings.throw_radius;
                });
            });
            squid.data.values.closeFunctions[MENUS.throw_selection].push(function() {
                clear_selection();
            });

            squid.data.values.openFunctions[MENUS.move_selection].push(function() {
                let map = squid.data.values.current_move_map;
                squid.setData('selection_action',SELECTION_ACTIONS.MOVE);
                activate_selection(map, function (value){
                    return value <= g_game_settings.move;
                });
            });
            squid.data.values.closeFunctions[MENUS.move_selection].push(function() {
                clear_selection();
            });

            squid.data.values.openFunctions[MENUS.shoot_selection].push(function() {
                let map = squid.data.values.current_shoot_map;
                squid.setData('selection_action',SELECTION_ACTIONS.SHOOT);
                activate_selection(map, function (value){
                    return value <= g_game_settings.shoot_distance;
                });
            });
            squid.data.values.closeFunctions[MENUS.shoot_selection].push(function() {
                clear_selection();
            });

            add_menu_item(squid, MENUS.main, angle_start + 360 / 7 * 3 * angle_fix, 'Move', function() {
                squid.data.values.open_internal(MENUS.move);
            });
            add_menu_item(squid, MENUS.main, angle_start + 360 / 7 * 0.5 * angle_fix, 'Ink', function () {
                    squid.data.values.open_internal(MENUS.ink);
                },
                function(){return squid.data.values.ink > g_game_settings.shoot_ink;});
            add_menu_item(squid, MENUS.main, angle_start + 360 / 7 * 4 * angle_fix, 'Booyah!', activateBooyah);
            add_menu_close(squid, MENUS.main, MENUS.none,angle_start + 360 / 7 * 6 * angle_fix);

            add_menu_item(squid, MENUS.ink, angle_start + 360 / 7 * 3 * angle_fix, 'Shoot', function() {
                squid.data.values.open_internal(MENUS.shoot_selection);
            }, function() {
                return squid.data.values.ink >= g_game_settings.shoot_ink;
            });
            add_menu_item(squid, MENUS.ink, angle_start + 360 / 7 * 0.5 * angle_fix, 'Throw', function() {
                squid.data.values.open_internal(MENUS.throw_selection);
            },function() {
                return squid.data.values.ink >= g_game_settings.throw_ink;
            });
            add_menu_item(squid, MENUS.ink, angle_start + 360 / 7 * 4 * angle_fix, 'Splashdown',
                function() {
                    squid.data.values.setSplashdown(true);
                    squid.setData('selection_action',SELECTION_ACTIONS.SPLASHDOWN_START);
                    scene.events.emit('selector_clicked',
                        squid.data.values.x,
                        squid.data.values.y);
                }, function() {return squid.data.values.points >= g_game_settings.splashdown_points;});
            add_menu_close(squid, MENUS.ink, MENUS.main,angle_start + 360 / 7 * 6 * angle_fix);

            add_menu_item(squid, MENUS.move, angle_start + 360 / 7 * 3 * angle_fix, 'Run', function() {
                squid.data.values.open_internal(MENUS.move_selection);
            });

            let swim_allowed = function () {
                let my_grid = squid.data.values.color === COLORS.PINK ? TILES.PINK_GRID : TILES.ORANGE_GRID;
                return my_grid === game_grid[squid.data.values.x][squid.data.values.y].data.values.value;
            };

            add_menu_item(squid, MENUS.move, angle_start + 360 / 7 * 0.5 * angle_fix, 'Swim', function () {
                    squid.data.values.open_internal(MENUS.swim_selection);
            },swim_allowed);
            add_menu_close(squid, MENUS.move, MENUS.main,angle_start + 360 / 7 * 6 * angle_fix);


            add_menu_item(squid, MENUS.swim, angle_start + 360 / 7 * 3 * angle_fix, 'Surface', function() {
                squid.data.values.setSubmerged(false);
                squid.setData('selection_action',SELECTION_ACTIONS.SURFACE);
                scene.events.emit('selector_clicked',
                    squid.data.values.x,
                    squid.data.values.y);
            });
            add_menu_item(squid, MENUS.swim, angle_start + 360 / 7 * 0.5 * angle_fix, 'Swim', function () {
                squid.data.values.open_internal(MENUS.swim_selection);
            }, swim_allowed);
            add_menu_close(squid, MENUS.swim, MENUS.none, angle_start + 360 / 7 * 6 * angle_fix);


            add_menu_item(squid, MENUS.splashdown, angle_start + 360 / 7 * 3 * angle_fix, 'BOOM!', function() {
                squid.data.values.setSplashdown(false);
                squid.setData('selection_action',SELECTION_ACTIONS.SPLASHDOWN_FINISH);
                scene.events.emit('selector_clicked',
                    squid.data.values.x,
                    squid.data.values.y);
            });
            add_menu_close(squid, MENUS.splashdown, MENUS.none, angle_start + 360 / 7 * 6 * angle_fix);

            squid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                function(pointer, localX, localY, event) {
                    if (current_active_unit === squid)
                    {
                        squid.data.values.open();
                    }
                    highlight_squid(squid);
                });

            //pink_squad.push(squid);
            squids.push(squid);
        };

        let anim_respawn = function(squid, x, y) {
            squid.setData('x', x);
            squid.setData('y', y);
            squid.x = xPixel(x);
            squid.y = yPixel(y);
            squid.setData('health', 1);
            squid.data.values.update_points(-g_game_settings.point_death_penalty);
            squid.data.values.update_ink(100);
            squid.data.values.setSubmerged(false);
            squid.data.values.move();
            animation_queue.push(function() {
                highlight_squid(squid, function() {
                    squid.setVisible(true);
                    squid.data.values.eyes.setVisible(true);
                    squid.data.values.onDamage(100);
                    recalculate_game_state();
                });
            });
        };

        let find_start_point = function(squid) {
            for(let start_location of spawn_points) {
                if (start_location.color === squid.data.values.color &&
                    square_is_squid_free(start_location.x, start_location.y, squid.data.values.color))
                {
                    anim_respawn(squid, start_location.x, start_location.y);
                    return;
                }
            }
        };

        let round_begin = function() {
            let alive_squids = [];
            let dead_squids = [];
            for(let squid of squids)
            {
                if (!squid.data.values.isAlive()) {
                    dead_squids.push(squid);
                } else {
                    alive_squids.push(squid);
                }
            };
            for (let dead of dead_squids) {
                find_start_point(dead);
            }
            for (let alive of alive_squids) {
                let ink_recover = alive.data.values.submerged ?
                    g_game_settings.end_of_turn_submerged_ink :
                    g_game_settings.end_of_turn_ink;
                alive.data.values.update_ink(ink_recover);
            }
            mass_life_change(alive_squids, g_game_settings.end_of_turn_health);
        };

        let recalculate_game_state = function() {
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
            if (ui.pink_score && ui.orange_score) {
                let pink_percent = Math.floor(pink_score * 100 / total);
                ui.pink_score.setText(pink_percent + "%");
                ui.pink_score.setData('score', pink_percent);
                let orange_percent = Math.floor(orange_score * 100 / total);
                ui.orange_score.setText(orange_percent + "%");
                ui.orange_score.setData('score', orange_percent);
            }
            if (animation_queue.length !== 0)
            {
                //do an animation!
                let animation = animation_queue.pop();
                animation();
                return;
            } else if(!current_active_unit)
            {
                while(!current_active_unit) {
                    if (animation_queue.length !== 0)
                    {
                        let animation = animation_queue.pop();
                        animation();
                        return;
                    }
                    let squid = squids[next_squid_index];

                    if (squid.data.values.isAlive()) {
                        let map = calculate_reachable_squares(
                            squid.data.values.x,
                            squid.data.values.y,
                            g_game_settings.move,
                            squid.data.values.color);
                        squid.setData('current_move_map', map);
                        map = calculate_throwable_squares(
                            squid.data.values.x,
                            squid.data.values.y,
                            g_game_settings.throw_distance,
                            squid.data.values.color);
                        squid.setData('current_throw_map', map);
                        map = calculate_shootable_squares(
                            squid.data.values.x,
                            squid.data.values.y,
                            g_game_settings.shoot_distance,
                            squid.data.values.color);
                        squid.setData('current_shoot_map', map);
                        map = calculate_swimmable_squares(
                            squid.data.values.x,
                            squid.data.values.y,
                            g_game_settings.swim,
                            squid.data.values.color);
                        squid.setData('current_swim_map', map);

                        set_current_active_unit(squid);
                    }
                    next_action_index++;
                    if (next_action_index >= g_game_settings.actions_per_turn) {
                        next_action_index = 0;
                        next_squid_index = (next_squid_index + 1) % squids.length;
                        if (next_squid_index === 0) {
                            current_round++;
                            animation_queue.push(anim_round_start);
                        }
                    }
                }
            }
        }

        let border = BG_BORDER*GRID_SIZE;
        let world_height =  g_game_settings.grid_rows * GRID_SIZE + (2 * border);
        let world_width = g_game_settings.grid_cols * GRID_SIZE + (2 * border);
        scene.add.tileSprite(world_width/2, world_height/2,
            world_width,
            world_height,
            'tiles',
            TILES.BG_GRID)
            .setDepth(DEPTHS.BG)
            .setScale(2);
        game_grid = create_grid(create_random_square);
        selector_grid = create_grid(create_selector);
        create_spawn_portal(1,1,COLORS.PINK);
        create_spawn_portal(g_game_settings.grid_cols - 3, g_game_settings.grid_rows - 3, COLORS.ORANGE);
        for (let start_position of spawn_points) {
            add_squid(start_position.x, start_position.y, start_position.color)
        }

        //prepare for game start
        Phaser.Actions.Shuffle(squids);
        animation_queue.push(anim_round_start);
        recalculate_game_state();


        scene.cameras.main.setBounds(-border, -border, world_width, world_height);

        //----------------------------------------------------------------------
        // SETUP GAME INPUT
        //----------------------------------------------------------------------
        scene.input.addPointer(5);

        let zone = scene.add.zone(-border, -border, world_width, world_height)
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

        //SCENE EVENTS
        scene.events.on('selector_clicked', on_selector_clicked);
        scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.m_cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.m_cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.m_cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.m_cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        let esc_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        esc_key.on(Phaser.Input.Keyboard.Events.UP, function() {
            highlight_squid(null);
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
