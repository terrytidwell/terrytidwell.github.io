

const SCREEN_HEIGHT = 720;
const SCREEN_WIDTH = 1280;
const GRID_SIZE = 80; //9x16
/*
const SCREEN_HEIGHT = 1080;
const SCREEN_WIDTH = 1920;
const SPRITE_SCALE = 9;

const SCREEN_HEIGHT = 720;
const SCREEN_WIDTH = 1280;
const SPRITE_SCALE = 6;
 */
const DEPTHS = {
    BG: 0,
    MG: 3000,
    FG: 6000,
    UI: 9000,
};

const COLORS = {
    RED: {value: 0xFF0000},//0xFF4136},
    GREEN: {value: 0x00FF00},//0x2ECC40},
    BLUE: {value: 0x0000FF},//0x0074D9},
    GRAY: {value: 0xaaaaaa}
};

let getFont = (align = "left", fontSize = GRID_SIZE, color="#FFFFFF") => {
    return {font: '' + fontSize + 'px VT323-Regular', fill: color, align: align,
        wordWrap: {width: SCREEN_WIDTH, useAdvancedWrap: false}};
};

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

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);
        scene.input.topOnly = true;

        let cursor_keys = scene.input.keyboard.createCursorKeys();
        cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        cursor_keys.interact = scene.input.keyboard.addKey("e");
        cursor_keys.letter_one = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        let x = SCREEN_WIDTH/2;
        let y = SCREEN_HEIGHT/2;

        let block_size = GRID_SIZE/4;
        let gap_size = block_size/2;
        let laser_size = GRID_SIZE/32;
        scene.add.rectangle(x,y,
            block_size,block_size,
            COLORS.GRAY.value)
            .setOrigin(0.5,0.5);

        let possible_colors = [COLORS.RED, COLORS.BLUE, COLORS.GREEN];
        let block_colors = [
            COLORS.RED, COLORS.BLUE, COLORS.GREEN,
            COLORS.RED, COLORS.BLUE, COLORS.GREEN,
            Phaser.Utils.Array.GetRandom(possible_colors),
            Phaser.Utils.Array.GetRandom(possible_colors)];
        Phaser.Utils.Array.Shuffle(block_colors);

        let block_positions = [
            {x: -1, y: -1},
            {x: -1, y: 0},
            {x: -1, y: 1},
            {x: 0, y: 1},
            {x: 1, y: 1},
            {x: 1, y: 0},
            {x: 1, y: -1},
            {x: 0, y: -1}];
        let blocks = [];
        for (let block_position of block_positions) {
            let color = block_colors.pop();
            blocks.push(scene.add.rectangle(
                x + block_position.x * (block_size + gap_size),
                y + block_position.y * (block_size + gap_size),
                block_size,block_size,
                color.value)
                .setOrigin(0.5,0.5));
        }

        let laser = scene.add.rectangle(
            x,y,
            laser_size,
            SCREEN_HEIGHT,
            COLORS.RED.value)
            .setOrigin(0.5,1)
            .setAlpha(0.75);
        let laser_state = 0;
        let laser_operation = [
            true, true, false, false, false, false,
            true, true, false, false, false, false,
            true, true, false, false, false, false,
            true, true, false, false, false, false,
            false, true,
            false, true,
            false, true,
            false, true,
            false, true,
            false, true,
            false, true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
        ]
        scene.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                laser.setVisible(laser_operation[laser_state])
                laser_state++;
                if (laser_state > laser_operation.length) {
                    laser_state = 0;
                }
            }
        });

        let SHIP_STATES = {
            IDLE : {},
            ROTATE_CLOCKWISE: {
                enter: (handler) => {
                    let loose = blocks.pop();
                    blocks.unshift(loose);
                    handler.changeState(SHIP_STATES.ROTATING)
                }
            },
            ROTATE_COUNTER_CLOCKWISE: {
                enter: (handler) => {
                    let loose = blocks.shift();
                    blocks.push(loose);
                    handler.changeState(SHIP_STATES.ROTATING)
                }
            },
            ROTATING : {enter: (handler) => {
                let tweens = [];
                for (const [index, block_position] of block_positions.entries()){
                    tweens.push({
                        duration: 100,
                        targets:blocks[index],
                        x: x + block_position.x * (block_size + gap_size),
                        y: y + block_position.y * (block_size + gap_size)
                    })
                }
                handler.addTweenParallel(tweens,
                    () => {handler.changeState(SHIP_STATES.IDLE)})
            }},
        };
        let shipStateHandler = stateHandler(scene, SHIP_STATES.IDLE)

        let vector = new Phaser.Math.Vector2();
        let previous_vector = new Phaser.Math.Vector2();
        scene.__update = () => {
            let input = {
                up: false,
                down: false,
                left: false,
                right: false,
                interact: false,
            };

            vector.x = 0;
            vector.y = 0;
            if (true) {
                if (cursor_keys.left.isDown ||
                    cursor_keys.letter_left.isDown) {
                    input.left = true;
                    vector.x += -1;
                }
                if (cursor_keys.right.isDown ||
                    cursor_keys.letter_right.isDown) {
                    input.right = true;
                    vector.x += 1;
                }
                if (cursor_keys.up.isDown ||
                    cursor_keys.letter_up.isDown) {
                    input.up = true;
                    vector.y -= 1;
                }
                if (cursor_keys.down.isDown ||
                    cursor_keys.letter_down.isDown) {
                    input.down = true;
                    vector.y += 1;
                }
                if (cursor_keys.interact.isDown) {
                    input.interact = true;
                    //initiate_ghost_attack();
                }
            }
            if (vector.x > 0 && previous_vector.x <= 0) {
                shipStateHandler.changeState(SHIP_STATES.ROTATE_COUNTER_CLOCKWISE)
            }
            if (vector.x < 0 && previous_vector.x >= 0) {
                shipStateHandler.changeState(SHIP_STATES.ROTATE_CLOCKWISE)
            }
            previous_vector.x = vector.x;
            previous_vector.y = vector.y;
        };
    },

    update: function () {
        let scene = this;
        scene.__update();
    },
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
    backgroundColor: 0x000000,
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
            debug: false,
        }
    },
    scene: [ LoadScene, TitleScene, ControllerScene, GameScene]
};

game = new Phaser.Game(config);
