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
    ORANGE_TEXT: "#d5a306",
    PINK_TEXT: "#ef758a"
};

let g_game_settings = {
    move: 4,
    swim: 6,
    shoot_distance: 6,
    shoot_damage: -85,
    booyah_damage: 5,
    actions_per_turn: 2
};

let Util = {
    fixCenterText : function(text)
    {
        if (text.width % 2 === 1) {
            text.x = Math.round(text.x) + 0.5;
        }
    }
}

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
        Util.fixCenterText(play);
        play.setInteractive();
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){

            play.scaleX = 1.2;
            play.scaleY = 1.2;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
            play.scaleX = 1;
            play.scaleY = 1;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function(){
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
            OPEN_EYES: 5,
            X_EYES: 6,
            CLOSED_EYES: 7,
            BG_GRID: 8,
            PINK_SELECTOR: 9,
            ORANGE_SELECTOR: 10
        };

        let SELECTION_ACTIONS = {
            MOVE: 0,
            SHOOT: 1,
            BOOYAH: 2
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
        let spawn_points = [
            {x: 1, y: 1, color: COLORS.PINK},
            {x: 2, y: 1, color: COLORS.PINK},
            {x: 1, y: 2, color: COLORS.PINK},
            {x: 2, y: 2, color: COLORS.PINK},
            {x: SCREEN_COLUMNS - 2, y: SCREEN_ROWS - 2, color: COLORS.ORANGE},
            {x: SCREEN_COLUMNS - 3, y: SCREEN_ROWS - 2, color: COLORS.ORANGE},
            {x: SCREEN_COLUMNS - 2, y: SCREEN_ROWS - 3, color: COLORS.ORANGE},
            {x: SCREEN_COLUMNS - 3, y: SCREEN_ROWS - 3, color: COLORS.ORANGE}
        ];

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

        let anim_round_start = function() {
            let texts = []
            texts.push(
                scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - GRID_SIZE,
                    "ROUND " + current_round,
                    { font: GRID_SIZE*2 + 'px project_paintball', color: COLORS.PINK_TEXT})
                    .setOrigin(0.5)
                    .setStroke("#FFFFFF", GRID_SIZE*2/4)
                    .setScrollFactor(0)
                    .setOrigin(0.5)
                    .setDepth(DEPTHS.HUD)
                    .setScale(3)
                    .setAlpha(0));
            texts.push(
                scene.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE,
                    "START",
                    { font: GRID_SIZE*2 + 'px project_paintball', color: COLORS.PINK_TEXT})
                    .setOrigin(0.5)
                    .setStroke("#FFFFFF", GRID_SIZE*2/4)
                    .setScrollFactor(0)
                    .setOrigin(0.5)
                    .setDepth(DEPTHS.HUD)
                    .setScale(3)
                    .setAlpha(0));
            let timeline = scene.tweens.createTimeline();
            timeline.add({
                targets: texts,
                scale: 1,
                alpha: 1,
                duration: 500,
                onComplete: function() {
                    scene.cameras.main.shake(250, 0.007, true);
                }
            });
            timeline.add({
                targets: texts,
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
        animation_queue.push(anim_round_start);

        scene.add.tileSprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH + (2 * BG_BORDER * GRID_SIZE),
            SCREEN_HEIGHT + (2 * BG_BORDER * GRID_SIZE),
            'tiles',
            TILES.BG_GRID)
            .setDepth(DEPTHS.BG)
            .setScale(2);

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
            sprite.setScale(2);

            return sprite;
        };

        let create_selector = function(x, y, grid)
        {
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
            select_sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function(){
                if (select_sprite.visible) {
                    scene.events.emit('selector_clicked',
                        select_sprite.data.values.x,
                        select_sprite.data.values.y);
                }
            });
            return select_sprite;
        };

        let clear_selection = function()
        {
            for (let i = 0; i < selector_grid.length; i++) {
                for (let j = 0; j < selector_grid[i].length; j++) {
                    selector_grid[i][j].setVisible(false);
                    selector_grid[i][j].data.values.bg.setVisible(false);
                }
            }
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

        game_grid = create_grid(create_random_square);
        selector_grid = create_grid(create_selector);

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
                if (squid.data.values.isAlive() &&
                    squid.data.values.color !== my_color &&
                    squid.data.values.x === x && squid.data.values.y === y)
                {
                    return false;
                }
            }
            return square_is_legal(x, y)
        };

        let activate_selection = function(map, filter)
        {
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
        scene.events.on('selector_clicked', function(x,y) {
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
                    case SELECTION_ACTIONS.SHOOT:
                        let dx = x - current_active_unit.data.values.x;
                        let dy = y - current_active_unit.data.values.y;
                        let vector = new Phaser.Math.Vector2(dx, dy);
                        vector.normalize();
                        vector.scale(g_game_settings.shoot_distance);
                        let line = new Phaser.Geom.Line(0, 0, vector.x, vector.y);
                        let points = Phaser.Geom.Line.BresenhamPoints(line);

                        let tile_target = TILES.PINK_GRID;
                        if (current_active_unit.data.values.color === COLORS.ORANGE) {
                            tile_target = TILES.ORANGE_GRID;
                        }

                        let shot_squids = [];
                        for (let point of points)
                        {
                            let px = point.x + current_active_unit.data.values.x;
                            let py = point.y + current_active_unit.data.values.y;
                            if (square_is_legal(px,py))
                            {
                                let tile = game_grid[px][py];
                                tile.setTexture('tiles',tile_target);
                                tile.setData('value',tile_target);
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
                            shot_squid.data.values.onDamage( g_game_settings.shoot_damage );
                        }

                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                    case SELECTION_ACTIONS.BOOYAH:
                        for (let squid of squids)
                        {
                            if( squid.data.values.isAlive() &&
                                squid !== current_active_unit &&
                                squid.data.values.color === current_active_unit.data.values.color)
                            {
                                squid.data.values.onDamage( g_game_settings.booyah_damage);
                            }
                        }
                        current_active_unit.data.values.onDamage(g_game_settings.booyah_damage);
                        set_current_active_unit(null);
                        recalculate_game_state();
                        break;
                }
            }
        });

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
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function(){
                highlight_squid(null);
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
            squid.data.values.closeFunctions.push(close);
            squid.data.values.openFunctions.push(function() {
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
            Util.fixCenterText(life);

            function onDamage(damage) {
                let new_life = Phaser.Math.Clamp(squid.data.values.health + damage, 0, 100);
                let actual_change = new_life - squid.data.values.health;
                let full_reaction = 1000;
                let actual_change_time = Math.round((actual_change/damage)*full_reaction);
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

                let reaction = function() {
                    highlight_squid(squid, function() {
                        if (new_life === 0)
                        {
                            scene.cameras.main.shake(250, 0.015, true);
                            scene.tweens.add({
                                targets: squid,
                                alpha: 0,
                                duration: full_reaction,
                                onComplete: function() {
                                    squid.setAlpha(1);
                                    squid.setVisible(false);
                                }
                            })
                        }
                        let old_depth = squid.depth;
                        let old_eye_depth = squid.data.values.eyes.depth;
                        squid.setDepth(DEPTHS.SQUAD+3);
                        squid.data.values.eyes.setDepth(DEPTHS.SQUAD+4);
                        squid.data.values.health_text
                            .setText(label)
                            .setVisible(true)
                            .setAlpha(1)
                            .setAngle(Phaser.Math.Between(-20,20));

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
                                scene.time.delayedCall(remainder_time, function() {
                                    squid.setData('health', new_life);
                                    recalculate_game_state();
                                    if (new_life === 0) {
                                        scene.tweens.add({
                                            targets: squid.data.values.eyes,
                                            scale: 3,
                                            alpha: 0,
                                            duration: 100,
                                            onComplete: function() {
                                                squid.data.values.eyes.setScale(2);
                                                squid.data.values.eyes.setAlpha(1);
                                                squid.data.values.eyes.setVisible(false);
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
                            onComplete: function() {
                                squid.data.values.health_text.y =
                                    yPixel(squid.data.values.y);
                                squid.setDepth(old_depth);
                                squid.data.values.eyes.setDepth(old_eye_depth);
                                squid.data.values.eyes.setTexture('tiles', TILES.OPEN_EYES);
                            }
                        });



                    });
                };
                animation_queue.push(reaction);
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

            Util.fixCenterText(ink);

            let pts = scene.add.text(
                SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2 + 4*text_height,
                'PTS: 100/100', {font: text_height + 'px project_paintball', color: my_text})
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setDepth(DEPTHS.HUD+3)
                .setStroke("#FFFFFF", GRID_SIZE/8)
                .setData('visible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2])
                .setData('invisible',[SCREEN_WIDTH/2, SCREEN_HEIGHT-text_height/2 + 4*text_height]);
            Util.fixCenterText(pts);

            let objects = [];
            let tween_targets = [bubble, bubble_outline, portrait, portrait_eyes, life, ink, pts];

            let unhighlight = function() {
                for (let object of objects) {
                    object.setVisible(false);
                }
                for (let target of tween_targets){
                    scene.tweens.add({
                        targets: target,
                        x: target.data.values.invisible[0],
                        y: target.data.values.invisible[1],
                        alpha: 0,
                        duration: 125,
                        ease: 'Linear',
                        onComplete: function() {
                            target.setVisible(false);
                        }
                    });
                }
            };
            for (let object of objects) {
                object.setVisible(false);
            }
            for (let object of tween_targets) {
                object.setVisible(false);
            }

            squid.data.values.highlightFunctions.push(function(callback=function(){}) {
                for (let object of objects) {
                    object.setVisible(true);
                }
                let delay = current_highlight === null ? 0 : 125;
                for (let target of tween_targets) {
                    target.setVisible(true);
                    scene.tweens.add({
                        delay: delay,
                        targets: target,
                        x: target.data.values.visible[0],
                        y: target.data.values.visible[1],
                        alpha: 1,
                        duration: 125,
                        ease: 'Linear',
                        onComplete: callback
                    })
                }
            });
            squid.data.values.unhighlightFunctions.push(unhighlight);
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

            let vector = new Phaser.Math.Vector2(width/2+GRID_SIZE/4*3, 0);
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
            rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, click);
            let bg = scene.add.rectangle(
                xPixel(x) + vector.x,yPixel(y) + vector.y,
                width+GRID_SIZE/16, GRID_SIZE/2+GRID_SIZE/16,
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

        for (let start_position of spawn_points)
        {
            let my_tile = COLORS.PINK === start_position.color ? TILES.PINK_SQUID : TILES.ORANGE_SQUID;
            let my_text = COLORS.PINK === start_position.color ? COLORS.PINK_TEXT : COLORS.ORANGE_TEXT;
            let squid = scene.add.sprite(xPixel(start_position.x),yPixel(start_position.y),'tiles',my_tile);
            let squid_eyes = scene.add.sprite(xPixel(start_position.x),yPixel(start_position.y),'tiles',TILES.OPEN_EYES);
            squid.setScale(2);
            squid.setDepth(DEPTHS.SQUAD);
            squid_eyes.setDepth(DEPTHS.SQUAD + 1);
            squid_eyes.setScale(2);
            squid.setInteractive();
            squid.setData('x',start_position.x);
            squid.setData('eyes', squid_eyes);
            squid.setData('y',start_position.y);
            squid.setData('color', start_position.color);
            squid.setData('health', 100);
            squid.setData('isAlive', function() {
                return squid.data.values.health > 0;
            });
            squid.setData('animate_list', [squid, squid_eyes]);
            let health_text = scene.add.text(xPixel(start_position.x),yPixel(start_position.y),"+0",
                {font: GRID_SIZE/4*3 + 'px project_paintball', color: my_text})
                .setOrigin(0.5)
                .setStroke("#FFFFFF", GRID_SIZE/8)
                .setDepth(DEPTHS.UI)
                .setVisible(false);
            squid.setData('health_text',health_text);
            squid.setData('unhighlightFunctions', [ function() {
                clear_selection();
                squid.data.values.close();
            }]);
            squid.setData('highlightFunctions', [ function(callback=function(){}) {
                track_camera(squid.data.values.x,squid.data.values.y,callback);
                if (current_active_unit === squid)
                {
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
                squid.setDepth(DEPTHS.SQUAD+2);
                squid_eyes.setDepth(DEPTHS.SQUAD+3);
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
                squid_eyes.setDepth(DEPTHS.SQUAD+1);
            });
            squid.setData('openFunctions', []);
            squid.setData('closeFunctions', []);
            squid.setData('moveFunctions', [function(){
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
                squid.setData('selection_action',SELECTION_ACTIONS.SHOOT);
                activate_selection(map, function (value){
                    return value <= g_game_settings.shoot_distance;
                });
            };

            let activateBooyah = function()
            {
                squid.data.values.close();
                squid.setData('selection_action',SELECTION_ACTIONS.BOOYAH);
                scene.events.emit('selector_clicked',
                    squid.data.values.x,
                    squid.data.values.y);
            };

            let angle_fix = COLORS.PINK === start_position.color ? 1 : -1;
            let angle_start = COLORS.PINK === start_position.color ? 0 : 360+180;

            add_hud(squid);
            if (squids.length === 0 || squids.length === 4) {
                /*
                add_health_bar('HP', squid, angle_start + 360 / 13 * 11.5 * angle_fix);
                add_health_bar('NK', squid, angle_start + 360 / 13 * 12.5 * angle_fix);
                add_health_bar('SP', squid, angle_start + 360 / 13 * 13.5 * angle_fix);
                 */
            }

            add_menu_item(squid, angle_start + 360 / 7 * 3 * angle_fix, 'Move', activateMove);
            add_menu_item(squid, angle_start + 360 / 7 * 0.5 * angle_fix, 'Attack', activateShot);
            add_menu_item(squid, angle_start + 360 / 7 * 4 * angle_fix, 'Booyah!', activateBooyah);
            add_menu_close(squid, angle_start + 360 / 7 * 6 * angle_fix);

            squid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
                function(pointer, localX, localY, event) {
                    if (current_active_unit === squid)
                    {
                        clear_selection();
                        squid.data.values.open();
                    }
                    highlight_squid(squid);
                });

            //pink_squad.push(squid);
            squids.push(squid);
        };
        Phaser.Actions.Shuffle(squids);

        let anim_respawn = function(squid, x, y) {
            squid.setData('x', x);
            squid.setData('y', y);
            squid.x = xPixel(x);
            squid.y = yPixel(y);
            squid.setData('health', 1);
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
                    square_is_legal_move(start_location.x, start_location.y, 0x000000))
                {
                    anim_respawn(squid, start_location.x, start_location.y);
                    return;
                }
            }
        };

        let round_begin = function() {
            for(let squid of squids)
            {
                if (!squid.data.values.isAlive()) {
                    find_start_point(squid);
                }
            }
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
            if (ui.pink_score && ui.orange_score)
            {
                ui.pink_score.setText(Math.floor(pink_score * 100 / total) + "%");
                ui.orange_score.setText(Math.floor(orange_score * 100 / total) + "%");
            }
            if (animation_queue.length !== 0)
            {
                //do an animation!
                let animation = animation_queue.pop();
                animation();
            } else if(!current_active_unit)
            {
                while(!current_active_unit) {
                    if (animation_queue.length !== 0)
                    {
                        let animation = animation_queue.pop();
                        animation();
                        return;
                    }
                    console.log('squid: ' + next_squid_index + ' action:' + next_action_index);
                    let squid = squids[next_squid_index];

                    if (squid.data.values.isAlive()) {
                        let map = calculate_reachable_squares(
                            squid.data.values.x,
                            squid.data.values.y,
                            g_game_settings.move,
                            squid.data.values.color);
                        squid.setData('current_move_map', map);
                        map = calculate_shootable_squares(
                            squid.data.values.x,
                            squid.data.values.y,
                            g_game_settings.shoot_distance);
                        squid.setData('current_shoot_map', map);

                        set_current_active_unit(squid);
                    }
                    next_action_index++;
                    if (next_action_index >= g_game_settings.actions_per_turn) {
                        next_action_index = 0;
                        next_squid_index = (next_squid_index + 1) % squids.length;
                        if (next_squid_index === 0) {
                            current_round++;
                            round_begin();
                            animation_queue.push(anim_round_start);
                        }
                    }
                }
            }
        }
        recalculate_game_state();

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
