const GRID_SIZE = 50;
const GRID_ROWS = 10;
const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 768;

const ARROW = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
};
const DIRECTION = {
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    dx(direction) {
        return [0, 0,0,-1,1][direction];
    },
    dy(direction) {
        return [0, -1,1,0,0][direction];
    },
    opposite(direction) {
        return [0, 2, 1, 4, 3][direction];
    },
};
const CONNECTION = {
    NONE: 0,
    LEFT: 1,
    LEFT_2_DOWN: 2,
    LEFT_2_RIGHT: 3,
    LEFT_2_UP: 4,
    RIGHT: 5,
    RIGHT_2_DOWN: 6,
    RIGHT_2_UP: 7,
    UP: 8,
    UP_2_DOWN: 9,
    DOWN: 10,
    isEndpoint(connection) {
      return [
          false,  true, false, false,
          false,  true, false, false,
           true, false,  true
      ][connection];
    },
    directionToSegment(d1,d2) {
      return [
           0, 8,10, 1, 5,
           8, 8, 9, 4, 7,
          10, 9,10, 2, 6,
           1, 4, 2, 1, 3,
           5, 7, 6, 3, 5
      ][d1*5+d2];
    },
    offset: function(connection) {
        return [
            0, 1, 3, 2,
            3, 1, 3, 3,
            1, 2, 1
        ][connection];
    },
    flipX: function(connection) {
        return [
            false, true, false, false,
            false, false, true, true,
            false, false, false
        ][connection];
    },
    flipY: function(connection) {
        return [
            false, false, true, false,
            false, false, true, false,
            false, false, true
        ][connection];
    },
    rotation: function(connection) {
        return [
            0, 0, 0, 0,
            0, 0, 0, 0,
            -Math.PI/2, Math.PI/2, Math.PI/2
        ][connection];
    }
};
const COLORS = {
    BLUE: 0,
    GREEN: 1,
    LIME: 2,
    ORANGE: 3,
    PURPLE: 4,
    RED: 5,
    COLORLESS: 6,
    isColor: function(color) {
        return color !== 6;
    },
    randomColor: function() {
        return Phaser.Math.Between(0,5);
    },
    randomColorExcluding(color) {
        if (COLORS.isColor(color)) {
            return (color + Phaser.Math.Between(1,5)) % 6;
        }
        return COLORS.randomColor();
    }
};

/*
1) BPM
2) Song
3) BG video
4) column #
5) block sprites
6) grid sprite
7) scanline color
 */
let Levels = [{
    artist: "Doctor Vox",
    song_name: "Frontier",
    bpm: 123,
    cols: 10,
    bg_music: 'bg_music_2', //"assets/Play Grid/Background Video/Level 2 Bgvid_10mb.mp4'",
    bg_video: 'bg_video_2', //"assets/DOCTOR VOX - Frontier - (123bpm).mp3",
    block_spritesheet: 'boxes2',
    grey_arrow: 'grey_arrow2',
    grid_spritesheet: 'grid2',
    scanline_spritesheet: 'scanline_bar2',
    scanline_tail_spritesheet: 'scanline_tail2',
    player_controller_spritesheet: 'player_controller2'
}, {
    artist: "Arinity",
    song_name: "Going Home",
    bpm: 116,
    cols: 16,
    bg_music: 'bg_music_1', //"assets/Play Grid/Background Video/Level 2 Bgvid_10mb.mp4'",
    bg_video: 'bg_video_1', //"assets/DOCTOR VOX - Frontier - (123bpm).mp3",
    block_spritesheet: 'boxes1',
    grey_arrow: 'grey_arrow1',
    grid_spritesheet: 'grid1',
    scanline_spritesheet: 'scanline_bar1',
    scanline_tail_spritesheet: 'scanline_tail1',
    player_controller_spritesheet: 'player_controller1'
}];
let CurrentLevel = 1;


let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        let loading_text = scene.add.text(
            SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
            "0%", { font: GRID_SIZE/2 + 'px xolonium', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.spritesheet('boxes1', 'assets/Boxes/Boxes2.png', { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet('boxes2', 'assets/Play Grid/SpriteSheet2.png', { frameWidth: 50, frameHeight: 50 });
        this.load.image('grid1', 'assets/Play Grid/EmptyGrid01.png');
        this.load.image('grid2', 'assets/Play Grid/EmptyGrid2.png');
        this.load.image('start_01', 'assets/Play Grid/Start_01.png');
        this.load.image('start_02', 'assets/Play Grid/Start_02.png');
        this.load.image('start_03', 'assets/Play Grid/Start_03.png');
        this.load.image('start_start', 'assets/Play Grid/Start_start.png');
        this.load.image('player_controller1', 'assets/Play Grid/PlayerController.png');
        this.load.image('player_controller2', 'assets/Play Grid/PlayerController2.png');
        this.load.image('grey_arrow1', 'assets/Boxes/GreyArrow_Right.png');
        this.load.image('grey_arrow2', 'assets/Play Grid/GreyArrow.png');
        this.load.image('grey_box', 'assets/Boxes/Grey_Single.png');
        this.load.image('scanline', 'assets/Play Grid/R_Scanline.png');
        this.load.image('scanline_bar1', 'assets/Play Grid/Scanline_v3_Bar.png');
        this.load.image('scanline_bar2', 'assets/Play Grid/Scanline_v2_Bar.png');
        this.load.image('scanline_tail1', 'assets/Play Grid/Scanline_v3_Trail.png');
        this.load.image('scanline_tail2', 'assets/Play Grid/Scanline_v2_Trail.png');
        this.load.image('menu', 'assets/ScanlineMenu_v2.png');
        this.load.image('bonus_box', 'assets/Play Grid/BonusBox.png');
        this.load.image('combo_box', 'assets/Play Grid/ComboBox.png');
        this.load.image('score_box', 'assets/Play Grid/ScoreBox.png');
        this.load.video('bg_video_1','assets/Play Grid/Background Video/dynamic lines.mp4');
        this.load.video('bg_video_2','assets/Play Grid/Background Video/Level 2 Bgvid_10mb.mp4');
        this.load.audio('bg_music_1', ['assets/Arinity - Going Home.mp3']);
        this.load.audio('bg_music_2', ['assets/DOCTOR VOX - Frontier - (123bpm).mp3']);
        this.load.audio('sl_move', ['assets/SFX/sl_move.wav']);
        this.load.audio('sl_swap', ['assets/SFX/sl_swap.wav']);
        this.load.audio('sl_count', ['assets/SFX/sl_count.wav']);
        this.load.audio('sl_start', ['assets/SFX/sl_start.wav']);
        this.load.audio('sl_scan', ['assets/SFX/sl_scan.wav']);
        this.load.audio('sl_remove', ['assets/SFX/sl_remove.wav']);

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('TitleScene');
            scene.scene.stop('LoadScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        //let scene = this;
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let menu = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'menu');
        menu.setInteractive();
        menu.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function() {
            scene.scene.start('LevelSelectScene');
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let addButton = (text, handler) => {
    text.setAlpha(0.5);
    text.setInteractive();
    text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        text.setAlpha(1);
    });
    text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        text.setAlpha(0.5);
    });
    text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, handler);
};

let LevelSelectScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LevelSelectScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let offset = 0;
        for (let level of Levels) {
            let text = scene.add.text(SCREEN_WIDTH/2, GRID_SIZE + offset * GRID_SIZE,
                level.song_name + " by " + level.artist,
                { font: GRID_SIZE+ 'px xolonium', fill: '#FFF' })
                .setOrigin(0.5, 0.5);
            let current_offset = offset;
            addButton(text, () => {
                CurrentLevel = current_offset;
                scene.scene.start('GameScene');
            })
            offset++;
        }
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let ScoreScene = new Phaser.Class( {
    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ScoreScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        //scene.scene.bringToTop();
        /*
        let bg = scene.add.rectangle(SCREEN_WIDTH/2-SCREEN_WIDTH, SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT * 7/8, 0x000000, 0.1);
        */
        let text = scene.add.text(SCREEN_WIDTH/2+SCREEN_WIDTH, SCREEN_HEIGHT/2, "LEVEL COMPLETE",
            { font: GRID_SIZE*2+ 'px xolonium', fill: '#FFF' })
            .setOrigin(0.5, 0.5);
        scene.tweens.add({
            targets: text,
            x: SCREEN_WIDTH/2,
            duration: 250,
            onComplete: () => {
                scene.cameras.main.shake(250, 0.007, true);
            },
        })
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
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let level = Levels[CurrentLevel];
        let grid_offset = 1 * GRID_SIZE;
        let score_strip_offset = grid_offset + GRID_SIZE/2;

        //----------------------------------------------------------------------
        //FUNCTIONS
        //----------------------------------------------------------------------
        let gridX = function(x) {
            let dx = x - level.cols / 2;
            return SCREEN_WIDTH/2 + dx * GRID_SIZE + 23;
        };

        let gridY = function(y) {
            let dy = y - GRID_ROWS / 2;
            return SCREEN_HEIGHT/2 + dy * GRID_SIZE + 27 + grid_offset;
        };

        let yLegal = function(y) {
            return y >= 0 && y < GRID_ROWS;
        };

        let xLegal = function(x) {
            return x >= 0 && x < level.cols;
        };

        let gridLegal = function(x, y) {
            return xLegal(x) && yLegal(y);
        };

        let set_block_texture = function(square) {
            square.rotation = 0;
            square.setFlipX(false);
            square.setFlipY(false);
            square.setVisible(false);
            square.rotation = 0;
            let color = square.data.values.color;
            if (COLORS.isColor(color)) {
                let connection = square.data.values.connection;
                let offset = CONNECTION.offset(connection);
                if (square.data.values.locked) {
                    offset += 4;
                }
                let flipX = CONNECTION.flipX(connection);
                let flipY = CONNECTION.flipY(connection);
                let rotation = CONNECTION.rotation(connection);
                square.setTexture(level.block_spritesheet, color*9 + offset).setFlipX(flipX).setFlipY(flipY);
                square.rotation = rotation;
                square.setVisible(true);
            } else {
                if (square.data.values.arrow === ARROW.NONE) {
                    square.setTexture('grey_box');
                    square.setVisible(false);
                } else {
                    square.setTexture(level.grey_arrow)
                        .setFlipX(ARROW.LEFT === square.data.values.arrow);
                    if (COLORS.isColor(square.data.values.arrow_color)) {
                        let offset = 4;
                        if (square.data.values.locked) {
                            offset += 4;
                        }
                        square.setTexture(level.block_spritesheet, square.data.values.arrow_color*9 + offset);
                    }
                    square.setVisible(true);
                }
            }
        };

        let swap_squares = function(square1, square2) {
            let data_properties = ['connection', 'color', 'arrow_color', 'arrow', 'locked', 'path'];
            for (let i = 0; i < data_properties.length; i++) {
                let temp = square1.data.values[data_properties[i]];
                square1.setData(data_properties[i],square2.data.values[data_properties[i]]);
                square2.setData(data_properties[i],temp);
            }
            let properties = ['visible'];
            for (let i = 0; i < properties.length; i++) {
                let temp = square1[properties[i]];
                square1[properties[i]] = square2[properties[i]];
                square2[properties[i]] = temp;
            }
        };

        scene.__gravity = function() {
            for (let y = GRID_ROWS - 1; y > 0; y--) {
                for(let x = 0; x < level.cols; x++) {
                    let square = grid[x][y];
                    let blank = square.data.values.color === COLORS.COLORLESS &&
                        square.data.values.arrow === ARROW.NONE;
                    if (blank) {
                        try_swap_squares(square, grid[x][y-1]);
                    }
                }
                scan_grid();
            }
        };

        let clear_block = function(square) {
            square.setData('connection',CONNECTION.NONE);
            square.setData('color',COLORS.COLORLESS);
            square.setData('arrow_color',COLORS.COLORLESS);
            square.setData('arrow',ARROW.NONE);
            square.setData('locked',false);
            square.setData('path', null);
        };

        let create_block = function (x,y) {
            let square = scene.add.sprite(gridX(x), gridY(y),
                'boxes', 0).setAlpha(0.75);
            clear_block(square);
            return square;
        };

        let randomize_block = function(x, y) {
            let square = grid[x][y];
            let chosen_color = COLORS.randomColor();
            let chosen_arrow = ARROW.NONE;
            if (x - 2 >= 0)
            {
                chosen_color =
                    COLORS.randomColorExcluding(grid[x-2][y].data.values.color);
            }
            if (Phaser.Math.Between(0, 100) < 10) {
                chosen_arrow = Phaser.Utils.Array.GetRandom(
                    [ARROW.LEFT, ARROW.RIGHT]);
                chosen_color = COLORS.COLORLESS;
            }
            square.setData('arrow', chosen_arrow);
            square.setData('color', chosen_color);
        };

        let legal_to_add = function(x, y, path_color = COLORS.COLORLESS) {
            if (!gridLegal(x, y)) {
                return false;
            }
            if (!COLORS.isColor(grid[x][y].data.values.color)) {
                return false;
            }
            if (COLORS.isColor(path_color) && grid[x][y].data.values.color !== path_color) {
                return false;
            }
            if (grid[x][y].data.values.connection !== CONNECTION.NONE) {
                return false;
            }
            if (grid[x][y].data.values.locked) {
                return false;
            }
            return true;
        };

        let new_line_algorithm = function(path, x, y) {
            let arrow = path.steps[path.steps.length-1].square.data.values.arrow;
            let path_color = grid[x][y].data.values.color;
            let preferred_direction = ARROW.RIGHT === arrow ?
                DIRECTION.RIGHT : DIRECTION.LEFT;
            let directions = [
                preferred_direction,
                DIRECTION.UP, //up
                DIRECTION.DOWN, //down
            ];
            let start_point = path.steps[0];
            let start_x = x - start_point.dx;
            let start_y = y - start_point.dy;
            let current_end_points = [start_point];
            let current_winner = start_point;
            while (current_end_points.length !== 0) {
                let current_point = current_end_points.pop();
                let previous_direction = DIRECTION.opposite(current_point.d1)
                for (let direction of directions) {
                    if (direction === DIRECTION.opposite(previous_direction)) {
                        continue;
                    }
                    let test_x = start_x + current_point.dx + DIRECTION.dx(direction);
                    let test_y = start_y + current_point.dy + DIRECTION.dy(direction);
                    if (!legal_to_add(test_x, test_y, path_color))
                    {
                        continue;
                    }

                    let new_point = {
                        square: grid[test_x][test_y],
                        dx: current_point.dx + DIRECTION.dx(direction),
                        dy: current_point.dy + DIRECTION.dy(direction),
                        d1: DIRECTION.opposite(direction),
                        d2: DIRECTION.NONE,
                        parent: current_point,
                        length: current_point.length + 1}
                    current_end_points.unshift(new_point);
                    if (new_point.length > current_winner.length) {
                        current_winner = new_point;
                    }
                }
            }
            let reverse_array = [];
            let tail = current_winner;
            while(tail !== start_point) {
                reverse_array.push(tail);
                tail.parent.d2 = DIRECTION.opposite(tail.d1);
                tail = tail.parent;
            }
            while (reverse_array.length > 0) {
                let item = reverse_array.pop();
                path.steps.unshift(item);
                path.min_x = Math.min(path.min_x, start_x + item.dx);
                path.min_y = Math.min(path.min_y, start_y + item.dy);
                path.max_x = Math.max(path.max_x, start_x + item.dx);
                path.max_y = Math.max(path.max_y, start_y + item.dy);
            }
            return path;
        };

        let find_line = function(x, y) {
            let arrow = grid[x][y].data.values.arrow;
            let dx = 0;
            let dy = 0;
            let preferred_direction = arrow === ARROW.RIGHT ?
                DIRECTION.RIGHT : DIRECTION.LEFT;

            let path = {
                min_x: x, max_x: x,
                min_y: y, max_y: y,
                steps: [] };
            path.steps.unshift({
                square: grid[x][y],
                dx: dx,
                dy: dy,
                d1: DIRECTION.NONE,
                d2: preferred_direction,
                parent: null,
                length: 1,
            });
            dx += DIRECTION.dx(preferred_direction);
            dy += DIRECTION.dy(preferred_direction);
            x += dx;
            y += dy;

            if (!legal_to_add(x,y)) {
                return path;
            }
            let path_color = grid[x][y].data.values.color;
            path.steps.unshift({
                square: grid[x][y],
                dx: dx,
                dy: dy,
                d1: DIRECTION.opposite(preferred_direction),
                d2: DIRECTION.NONE,
                parent: path.steps[0],
                length: 2
            });
            path.min_x = Math.min(path.min_x, x);
            path.min_y = Math.min(path.min_y, y);
            path.max_x = Math.max(path.max_x, x);
            path.max_y = Math.max(path.max_y, y);

            return new_line_algorithm(path, x, y);
        };

        let continue_line = function(x, y) {
            let path = grid[x][y].data.values.path;
            return new_line_algorithm(path, x, y);
        };

        let scan_grid = function() {
            //clear all unlocked blocks
            for (let y = 0; y < GRID_ROWS; y++) {
                for (let x = 0; x < level.cols; x++) {
                    if (!grid[x][y].data.values.locked &&
                        COLORS.isColor(grid[x][y].data.values.color)) {
                        grid[x][y].setData('connection', CONNECTION.NONE);
                        grid[x][y].setData('path', null);
                    }
                }
            }

            //look for grey arrows
            for (let y = 0; y < GRID_ROWS; y++) {
               for (let x = 0; x < level.cols; x++) {
                    let square = grid[x][y];
                    let color = square.data.values.color;
                    let arrow = square.data.values.arrow;
                    if (!COLORS.isColor(color) &&
                        arrow !== ARROW.NONE &&
                        !square.data.values.locked) {

                        let path = find_line(x, y);
                        //includes arrow
                        if (path.steps.length >= 4) {
                            //path.steps[0] is last square
                            let color = path.steps[0].square.data.values.color;
                            square.setData('arrow_color',
                                color);
                            for (let step of path.steps) {
                                step.square.setData('connection',
                                    CONNECTION.directionToSegment(step.d1, step.d2));
                                step.square.setData('path', path);
                            }
                        } else {
                            square.setData('arrow_color', COLORS.COLORLESS);
                            square.setData('path', null);
                        }
                    }
                }
            }

            for (let y = 0; y < GRID_ROWS; y++) {
                for (let x = 0; x < level.cols; x++) {
                    let square = grid[x][y];
                    let color = square.data.values.color;
                    let arrow = square.data.values.arrow;
                    if (square.data.values.locked &&
                        COLORS.isColor(color) &&
                        arrow === ARROW.NONE &&
                        CONNECTION.isEndpoint(square.data.values.connection)) {

                        let path = continue_line(x, y);
                        for (let step of path.steps) {
                            step.square.setData('connection',
                                CONNECTION.directionToSegment(step.d1, step.d2));
                            step.square.setData('path', path);
                            step.square.setData('locked', true);
                        }
                    }
                }
            }

            for (let y = 0; y < GRID_ROWS; y++) {
                for(let x = 0; x < level.cols; x++) {
                    let square = grid[x][y];
                    set_block_texture(square);
                }
            }
        };

        let try_swap_squares = function(square1, square2) {
            if (square1.data.values.locked || square2.data.values.locked) {
                return false;
            }

            swap_squares(square1, square2);
            return true;
        };

        let try_selection = function () {
            let left_square = grid[playerX][playerY];
            let right_square = grid[playerX+1][playerY];

            if (try_swap_squares(left_square,right_square)) {
                scan_grid();
                sl_swap.play();
            }
        };

        let move_character = function (direction, surpress_sound = false) {
            if (!surpress_sound) {
                sl_move.play();
            }
            let newX = playerX + DIRECTION.dx(direction);
            let newY = playerY + DIRECTION.dy(direction);
            if (!xLegal(newX) ||
                !xLegal(newX+1) ||
                !yLegal(newY))
            {
                return;
            }
            playerX = newX;
            playerY = newY;
            player.setPosition(gridX(playerX + .5), gridY(playerY));
        };

        let add_test_line = function () {
            for (let x = 0; x < CONNECTION.DOWN + 1; x++) {
                grid[x][GRID_ROWS - 1].setData('color', COLORS.RED);
                grid[x][GRID_ROWS - 1].setData('connection',x);
                grid[x][GRID_ROWS - 2].setData('color', COLORS.RED);
                grid[x][GRID_ROWS - 2].setData('connection',x);
                grid[x][GRID_ROWS - 2].setData('locked',true);
            }
            scan_grid();
        };

        let add_line = function() {
            for (let y = 0; y < GRID_ROWS; y++) {
                for(let x = 0; x < level.cols; x++) {
                    //two things on most rows we...
                    if (y + 1 < GRID_ROWS) {
                        //...shift squares up, but...
                        let square = grid[x][y];
                        swap_squares(square, grid[x][y+1]);
                    } else {
                        //...on the bottom row, add random blocks
                        clear_block(grid[x][y]);
                        randomize_block(x,y);
                    }
                }
                scan_grid();
            }
            move_character(DIRECTION.UP, true);
        };

        let remove_n_blocks_from_line = function(y, number) {
            let indexes = Phaser.Utils.Array.NumberArray(0, level.cols-1);
            Phaser.Utils.Array.Shuffle(indexes);
            number = Math.min(number, indexes.length);
            for (let i = 0; i < number; i++) {
                let square = grid[indexes[i]][y];
                clear_block(square);
            }
            scan_grid();
        };

        let set_scanline = function(supress_shadow = false) {
            scanline.setPosition(gridX(scanlineX), SCREEN_HEIGHT/2 + grid_offset);
            scanline_tail.setPosition(gridX(scanlineX), SCREEN_HEIGHT/2 + grid_offset);
            if (supress_shadow) {
                return;
            }
            scene.tweens.add({
                targets: [scanline, scanline_tail],
                x: gridX(scanlineX + DIRECTION.dx(scanlineDirection)),
                duration: 60 * 1000 / level.bpm
            });
            scene.tweens.add({
                targets: [scanline],
                alpha: 0.85,
                yoyo: true,
                duration: 60 * 1000 / level.bpm / 2
            });
            scene.tweens.add({
                targets: [scanline_tail],
                alpha: 0.65,
                yoyo: true,
                duration: 60 * 1000 / level.bpm / 2
            });
        };

        let active_lines = [];
        let scan_line_enter = function(x, direction) {
            if (!xLegal(x)) {
                return;
            }
            for (let y = 0; y < GRID_ROWS; y++) {
                //test for locking
                let square = grid[x][y];
                let arrow_color = square.data.values.arrow_color;
                let arrow = square.data.values.arrow;
                if (arrow !== ARROW.NONE &&
                    arrow_color !== COLORS.COLORLESS) {
                    if (DIRECTION.RIGHT === direction && arrow === ARROW.RIGHT ||
                        DIRECTION.LEFT === direction && arrow === ARROW.LEFT) {
                        for (let step of square.data.values.path.steps) {
                            step.square.setData('locked', true);
                        }
                        sl_scan.play()
                        active_lines.push({start_x: x, start_y:y, path: square.data.values.path});
                    }
                    scan_grid();
                }
            }
        };

        let calculate_score = function(length) {
            return 300 + (length-3) * 50 + (length-3)*(length-3)*50;
        };

        let clear_stats = {
            line_count: 0,
            true_score: 0,
            squares_cleared: 0,
        };
        let clear_line = function(active_line) {
            sl_remove.play();
            clear_stats.line_count++;
            clear_stats.squares_cleared += active_line.path.steps.length;
            let delta = calculate_score(active_line.path.steps.length);
            clear_stats.true_score += delta;
            let mid_x = (active_line.path.min_x + active_line.path.max_x)/2;
            let mid_y = (active_line.path.min_y + active_line.path.max_y)/2;
            let text = scene.add.text(
                gridX(mid_x),
                gridY(mid_y),
                '+' + delta,
                {font: '' + GRID_SIZE*2 + 'px the_ovd', fill: '#FFFFFF'})
                .setOrigin(0.5, 0.5)
                .setAlpha(0)
                .setScale(0);
            let timeline = scene.tweens.createTimeline();
            timeline.add({
                targets: text,
                scale: 1,
                alpha: 1,
                duration: 100,
            });
            timeline.add({
                targets: text,
                scale: 0.75,
                alpha: 0.5,
                duration: 1000,
            });
            timeline.add({
                targets: text,
                scale: 0,
                alpha: 0,
                duration: 200,
                x: SCREEN_WIDTH/2,
                y: score_strip_offset + GRID_SIZE/2,
                onComplete: function() {
                    addScore(delta);
                    text.destroy();
                }
            });
            timeline.play();
            for (let step of active_line.path.steps) {

                let afterglow = afterglow_pool.length === 0 ? create_block(0, 0) : afterglow_pool.pop();
                clear_block(afterglow);
                afterglow.setPosition(gridX(active_line.start_x + step.dx),
                    gridY(active_line.start_y + step.dy));
                swap_squares(afterglow, step.square);
                set_block_texture(afterglow);
                afterglow.setAlpha(0);
                afterglow.setTintFill(0xffffff);
                let timeline2 = scene.tweens.createTimeline();
                timeline2.add({
                    targets: afterglow,
                    alpha: 1,
                    duration: 100,
                });
                timeline2.add({
                    targets: afterglow,
                    alpha: 0,
                    duration: 500,
                    onComplete: function() {
                        afterglow_pool.push(afterglow);
                    }
                });
                timeline2.play();
            }
        };

        let scan_line_exit = function(x, direction) {
            if (!xLegal(x)) {
                return;
            }
            active_lines =
                active_lines.filter(function(active_line) {
                let end_x = direction === DIRECTION.LEFT ?
                    active_line.path.min_x :
                    active_line.path.max_x;
                if (x !== end_x) {
                    //keep this around
                    return true;
                }
                clear_line(active_line);

                return false;
            });
            scan_grid();
        };

        let update_scanline = function() {

            scan_line_exit(scanlineX, scanlineDirection);

            scanlineX += DIRECTION.dx(scanlineDirection);
            if (!xLegal(scanlineX)) {
                scanlineDirection = DIRECTION.opposite(scanlineDirection);
                if ( scanlineX < 0) {
                    console.assert(active_lines.length === 0);
                    add_line();
                }
            }

            scanline.setFlipX(DIRECTION.LEFT === scanlineDirection);
            scanline_tail.setFlipX(DIRECTION.LEFT === scanlineDirection);
            scanline_tail.setOrigin(DIRECTION.LEFT === scanlineDirection ? 0 : 1,
                0.5)

            set_scanline(false);
            scan_line_enter(scanlineX, scanlineDirection);
        };

        //----------------------------------------------------------------------
        //GAME ENTITY SETUP
        //----------------------------------------------------------------------

        let grid = [];
        let afterglow_pool = [];

        scene.add.video(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, level.bg_video).play(true);
        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + grid_offset, level.grid_spritesheet);
        scene.add.sprite(SCREEN_WIDTH/2, score_strip_offset,'score_box').setScale(0.75);
        scene.add.sprite(SCREEN_WIDTH/2 + 8 * GRID_SIZE, score_strip_offset,'bonus_box').setScale(0.75);
        scene.add.sprite(SCREEN_WIDTH/2 - 8 * GRID_SIZE, score_strip_offset,'combo_box').setScale(0.75);
        let sl_move = scene.sound.add('sl_move', {loop: false });
        let sl_swap = scene.sound.add('sl_swap', {loop: false });
        let sl_count = scene.sound.add('sl_count', {loop: false });
        let sl_start = scene.sound.add('sl_start', {loop: false });
        let sl_scan = scene.sound.add('sl_scan', {loop: false });
        let sl_remove = scene.sound.add('sl_remove', {loop: false });

        for (let x = 0; x < level.cols; x++)
        {
            grid.push([]);
            for (let y = 0; y < GRID_ROWS; y++)
            {
                let square = create_block(x,y);
                grid[x].push(square);
                set_block_texture(square);
            }
        }

        let playerX = level.cols/2 - 1;
        let playerY = GRID_ROWS - 1;
        let player = scene.add.sprite(0,0,level.player_controller_spritesheet);
        //reconcile sprite to playerX, playerY
        move_character(DIRECTION.NONE);

        let scanlineX = 0;
        let scanlineDirection = DIRECTION.RIGHT;
        let scanline_tail = scene.add.sprite(0,0,level.scanline_tail_spritesheet)
            .setOrigin(1, 0.5)
            .setScale(583/818);
        let scanline = scene.add.sprite(0,0,level.scanline_spritesheet)
            .setScale(583/818);


        //add_test_line();

        add_line();
        remove_n_blocks_from_line(GRID_ROWS - 1, Math.round(level.cols * .75));

        add_line();
        remove_n_blocks_from_line(GRID_ROWS - 1, Math.round(level.cols * .50));

        add_line();
        remove_n_blocks_from_line(GRID_ROWS - 1, Math.round(level.cols * .25));

        add_line();
        /*
         */

        //reconcile sprite to scanelineX
        set_scanline(true);

        let addScore = function(delta) {
            scene.tweens.add({
                targets: {score: score},
                props: {score: score+delta},
                duration: 250,
                onUpdate: function() {
                    score = Math.round(this.getValue());
                    score_text.text = '' + score + '';
                }
            });
            scene.tweens.add({
                targets: score_text,
                alpha: 1,
                duration: 125,
                yoyo: true
            });
        };

        let score = 0;
        let score_text = scene.add.text(
            SCREEN_WIDTH/2,
            score_strip_offset + GRID_SIZE/4,
            '' +  score + '',
            {font: '' + GRID_SIZE*3/4 + 'px the_ovd', fill: '#FFFFFF'})
            .setOrigin(0.5, 0.5)
            .setAlpha(0.7);

        let fade_screen = scene.add.rectangle(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,
            SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.5);
        let start_text = scene.add.sprite(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2,
            'start_03');
        sl_count.play();

        scene.time.delayedCall(1000,function() {
            sl_count.play();
            start_text.setTexture('start_02');
            fade_screen.height -= 4*GRID_SIZE;
            fade_screen.y += 2*GRID_SIZE;
        });
        scene.time.delayedCall(2000,function() {
            sl_count.play();
            start_text.setTexture('start_01');
            fade_screen.height -= 4*GRID_SIZE;
            fade_screen.y += 2*GRID_SIZE;
        });
        scene.time.delayedCall(3000,function() {
            sl_start.play();
            start_text.setTexture('start_start');
            fade_screen.height -= 4*GRID_SIZE;
            fade_screen.y += 2*GRID_SIZE;
        });
        scene.time.delayedCall(4000,function() {
            start_text.destroy();
            fade_screen.destroy();
            start();
        });

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------


        let start = function () {
            set_scanline();
            let scanline_event = scene.time.addEvent({
                "delay": 60 * 1000 / level.bpm,
                "loop": true,
                "callback": update_scanline
            });
            scene.m_cursor_keys = scene.input.keyboard.createCursorKeys();
            scene.m_cursor_keys.down.on('down', function () {
                move_character(DIRECTION.DOWN)
            });
            scene.m_cursor_keys.up.on('down', function () {
                move_character(DIRECTION.UP)
            });
            scene.m_cursor_keys.left.on('down', function () {
                move_character(DIRECTION.LEFT)
            });
            scene.m_cursor_keys.right.on('down', function () {
                move_character(DIRECTION.RIGHT)
            });
            scene.space_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            scene.space_key.on('down', try_selection);

            let music = scene.sound.add(level.bg_music, {loop: false });
            let finish = function() {
                scanline_event.remove();
                scene.m_cursor_keys.down.off('down');
                scene.m_cursor_keys.left.off('down');
                scene.m_cursor_keys.right.off('down');
                scene.m_cursor_keys.up.off('down');
                scene.space_key.off('down');

                music.stop();

                let bg = scene.add.rectangle(SCREEN_WIDTH/2-SCREEN_WIDTH, SCREEN_HEIGHT/2,
                    SCREEN_WIDTH, SCREEN_HEIGHT * 7/8, 0x000000, 0.8);
                let text = scene.add.text(SCREEN_WIDTH/2+SCREEN_WIDTH, SCREEN_HEIGHT/2, "LEVEL COMPLETE",
                    { font: GRID_SIZE*2+ 'px xolonium', fill: '#FFF' })
                    .setOrigin(0.5, 0.5);
                let scoring_timeline = scene.tweens.createTimeline()

                scoring_timeline.add({
                    targets: [bg,text],
                    x: SCREEN_WIDTH/2,
                    duration: 250,
                    onComplete: () => {
                        scene.cameras.main.shake(250, 0.007, true);
                    },
                });
                scoring_timeline.add({
                    targets: text,
                    y: SCREEN_HEIGHT * 1/16 + GRID_SIZE,
                    duration: 500,
                    delay: 1000,
                });

                let current_offset = 3;
                let add_stat = function(label, value) {
                    let label_text = scene.add.text(SCREEN_WIDTH/2 - GRID_SIZE + SCREEN_WIDTH*1.5,
                        SCREEN_HEIGHT * 1/16 + current_offset*GRID_SIZE, label,
                        { font: GRID_SIZE/2 + 'px xolonium', fill: '#FFF' })
                        .setOrigin(1, 0.5);
                    //should be the_ovd
                    let value_text = scene.add.text(SCREEN_WIDTH/2 + GRID_SIZE,
                        SCREEN_HEIGHT * 1/16 + current_offset*GRID_SIZE, label,
                        { font: GRID_SIZE/2 + 'px xolonium', fill: '#FFF' })
                        .setOrigin(0, 0.5)
                        .setVisible(false);
                    scoring_timeline.add({
                        targets: label_text,
                        x: SCREEN_WIDTH/2 - GRID_SIZE,
                        duration: 250,
                        delay: 250,
                        onComplete: () => value_text.setVisible(true),
                    });

                    scoring_timeline.add({
                        targets: {score: 0},
                        props: {score: value},
                        duration: value/100,
                        onUpdate: function () {
                            let current = Math.round(this.getValue());
                            value_text.setText('' + current + '');
                        }
                    });
                    current_offset++;
                };
                add_stat('SCORE:', clear_stats.true_score);
                add_stat('LINES CLEARED:', clear_stats.line_count);
                add_stat('SQUARES CLEARED:', clear_stats.squares_cleared);

                scoring_timeline.play();
            };
            music.once(Phaser.Sound.Events.COMPLETE, finish);
            music.play();

            let title_text = scene.add.text(SCREEN_WIDTH, SCREEN_HEIGHT,
                level.song_name,{ font: GRID_SIZE*3/4 + 'px xolonium', fill: '#FFF' })
                .setOrigin(0,1)
                .setAlpha(0);
            let artist_text = scene.add.text(SCREEN_WIDTH, SCREEN_HEIGHT,
                'By ' + level.artist,{ font: GRID_SIZE*3/4 + 'px xolonium', fill: '#FFF' })
                .setOrigin(0,1)
                .setAlpha(0);
            let title_timeline = scene.tweens.createTimeline()
            title_timeline.add({
                targets: title_text,
                x: GRID_SIZE,
                alpha: 0.7
            });
            title_timeline.add({
                targets: title_text,
                x: 0,
                duration: 2000,
                onComplete: () => {
                    scene.tweens.add({
                        targets: title_text,
                        x: -SCREEN_WIDTH,
                        alpha: 0
                    });
                }
            });
            title_timeline.add({
                targets: artist_text,
                x: GRID_SIZE,
                alpha: 0.7
            });
            title_timeline.add({
                targets: artist_text,
                x: 0,
                duration: 2000
            });
            title_timeline.add({
                targets: artist_text,
                x: -SCREEN_WIDTH,
                alpha: 0
            });
            title_timeline.play();
        }

    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;
        scene.__gravity();
    },
});

let config = {
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    render: {
        pixelArt: true
    },
    input: {
        gamepad: true
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
    scene: [ LoadScene, TitleScene, LevelSelectScene, GameScene, ScoreScene ]
};

game = new Phaser.Game(config);
