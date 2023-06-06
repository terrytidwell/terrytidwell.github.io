const GRID_SIZE = 80;
const SCREEN_COLUMNS = 16;
const SCREEN_ROWS = 9;
const SCREEN_HEIGHT = 250; //GRID_SIZE * SCREEN_ROWS;  //720
const SCREEN_WIDTH = 315; //GRID_SIZE * SCREEN_COLUMNS; //1280
const DEPTHS =
{
   PLAYER: 2000,
};
let COLORS =
{
    BLACK: 0x231F2C,
    HEX_BLACK: '#231F2C',
    RED: 0xBB4430,
    HEX_RED: '#BB4430',
    GREY: 0xA2A79E,
    HEX_GREY: '#A2A79E',
    BLUE: 0x05668D,
    HEX_BLUE: '#05668D',
    WHITE: 0xEFE6DD,
    HEX_WHITE: '#EFE6DD',
};

let addWordFindScene = (scene, opening_text, hidden_text, exit_scene, first_scene, last_scene) => {
    let letters = addLetterArray(scene, opening_text, SCREEN_WIDTH/2, SCREEN_HEIGHT/2);

    let help_letters = addLetterArray(scene, hidden_text, SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE/2);

    for (let i = 0; i < letters.length; i++) {
        let letter = letters[i];

        letter.setInteractive();
        letter.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer, localX, localY, event) => {
            for(let help_letter of help_letters) {
                if (help_letter.__state_handler.getState() ===
                    help_letter.__STATES.INVISIBLE &&
                    help_letter.text === letter.text) {
                    letter.__state_handler.changeState(letter.__STATES.FADE_OUT);
                    help_letter.__state_handler.changeState(help_letter.__STATES.FADE_IN);
                    let complete = true;
                    for (let help_letter of help_letters) {
                        if (help_letter.__state_handler.getState() !==
                            help_letter.__STATES.FADE_IN &&
                            help_letter.text !== ' ') {
                            complete = false;
                        }
                    }
                    let outro = () => {
                        start_static();
                        scene.time.delayedCall(800, () => {
                            scene.cameras.main.shake(200, 0.15, true);
                        });
                        scene.time.delayedCall(1000, () => {
                            current_scene = exit_scene;
                            scene.scene.restart();
                        });
                    };
                    if (complete) {
                        if (last_scene) {
                            scene.time.delayedCall(1000, () => {

                                let out_text = scene.add.text(SCREEN_WIDTH / 2,
                                    SCREEN_HEIGHT / 2,
                                    "you can't save her",
                                    {
                                        color: COLORS.HEX_RED,
                                        font: GRID_SIZE / 2 + 'px Roboto',
                                        align: 'center'
                                    })
                                    .setOrigin(0.5, 0.5)
                                    .setDepth(1);
                                let bounding_box = out_text.getBounds();
                                let rectangle = scene.add.rectangle(
                                    SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
                                    bounding_box.width + GRID_SIZE/2, bounding_box.height, COLORS.WHITE)
                                    .setOrigin(0.5, 0.5);
                                rectangle.setStrokeStyle(GRID_SIZE/16, COLORS.BLACK);

                                scene.cameras.main.shake(50, 0.015, true);
                                scene.time.delayedCall(1000, outro);
                            });
                        } else {
                            outro();
                        }
                    }
                    break;
                }
            }
        });

        if (first_scene) {
            if (i === 1) {
                letter.__state_handler.changeState(letter.__STATES.APPEARANCE_FAST);
            } else {
                letter.__state_handler.changeState(letter.__STATES.APPEARANCE);
            }
        } else {
            letter.__state_handler.changeState(letter.__STATES.VISIBLE);
            scene.cameras.main.shake(50, 0.015, true);
        }
    }
    end_static();
}

let SCENES = [
    (scene) => {
        let letters = [];
        letters.push(addLetterArray(scene, 'this space', SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - GRID_SIZE/2));
        letters.push(addLetterArray(scene, 'intentionally', SCREEN_WIDTH/2, SCREEN_HEIGHT/2));
        letters.push(addLetterArray(scene, 'left blank', SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID_SIZE/2));
        for (let word of letters) {
            for (let letter of word) {
                letter.__state_handler.changeState(letter.__STATES.APPEARANCE);
            }
        }
    },
    (scene) => {
        addWordFindScene(
            scene,
            'this space intentionally left blank',
            'help',
            1,
            true
        );
    },
    (scene) => {
        addWordFindScene(
            scene,
            'this space intentionally left blank',
            'please',
            2,
            false
        );
    },
    (scene) => {
        addWordFindScene(
            scene,
            'this space intentionally levt blamk',
            'save me',
            3,
            false,
            true
        );
    },
    (scene) => {
        end_static();
        scene.add.text(SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2,
            "403 forbidden",
            {
                color: COLORS.HEX_RED,
                font: GRID_SIZE / 2 + 'px Roboto',
                align: 'center'
            }).setOrigin(0.5,0.5);
        scene.cameras.main.shake(50, 0.015, true);
        let cell_size = Math.round(SCREEN_HEIGHT/13);
        let left = -cell_size*3.75;
        scene.cameras.main.setBounds(left, 0, SCREEN_WIDTH - 2*left, SCREEN_HEIGHT);
        let zone = scene.add.zone(left, 0, SCREEN_WIDTH - 2*left, SCREEN_HEIGHT)
            .setOrigin(0)
            .setInteractive();
        zone.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
            if (pointer.isDown) {
                //let deltaY = pointer.prevPosition.y - pointer.position.y;
                //scene.cameras.main.scrollY  = scene.cameras.main.scrollY + deltaY;
                let deltaX = pointer.prevPosition.x - pointer.position.x;
                scene.cameras.main.scrollX  = scene.cameras.main.scrollX + deltaX;
            } else {
                //scene.cameras.main.scrollY = Math.round(scene.cameras.main.scrollY);
                scene.cameras.main.scrollX = Math.round(scene.cameras.main.scrollX);
            }
        });
        zone.on(Phaser.Input.Events.POINTER_UP, function (pointer) {
            //scene.cameras.main.scrollY = Math.round(scene.cameras.main.scrollY);
            scene.cameras.main.scrollX = Math.round(scene.cameras.main.scrollX);
        });

        let add_cell = (x, y, color) => {

            let ox = left + cell_size * x + cell_size/2;
            let oy = 0 + cell_size * y + cell_size/2;
            let cell = scene.add.rectangle(ox, oy, cell_size * .9, cell_size * .9, COLORS.BLACK);
            cell.setInteractive();
            cell.__on = false;
            cell.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                cell.__on = !cell.__on;
                cell.setFillStyle(cell.__on ? color : COLORS.BLACK);
            });
        };
        let add_cell_pad = (x, y, color) => {
            add_cell(x, y, color);
            add_cell(x+1, y, color);
            add_cell(x+2, y, color);
            add_cell(x, y+1, color);
            add_cell(x+1, y+1, color);
            add_cell(x+2, y+1, color);
            add_cell(x, y+2, color);
            add_cell(x+1, y+2, color);
            add_cell(x+2, y+2, color);
        };
        add_cell_pad(1,1,0xff0000);
        add_cell_pad(1,5,0x00ff00);
        add_cell_pad(1,9,0x0000ff);

    },
];
let current_scene = 0;

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
    create: function (data) {
        let scene = this;

        SCENES[current_scene](scene);
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let start_static = null;
let end_static = null;
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
        let scene = this;
        let static_screen = scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'static', 0)
            .setScale(SCREEN_WIDTH/56)
            .play('static_anim')
            .setScrollFactor(0)
            .setAlpha(0);
        let current_tween = null;
        start_static = () => {
            current_tween = scene.tweens.add({
                targets: static_screen,
                alpha: 0.5,
                delay: 700,
                duration: 300,
                onComplete: () => {
                    current_tween = null;
                }
            });
        },
        end_static = () => {
            if (current_tween) {
                current_tween.remove();
            }
            static_screen.setAlpha(0);
        }
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

        scene.load.spritesheet('static', 'assets/display_static_strip.png',
            { frameWidth: 64, frameHeight: 64 });

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
        let scene = this;
        scene.anims.create({
            key: 'static_anim',
            frames: scene.anims.generateFrameNumbers('static',
                { start: 0, end: 8 }),
            skipMissedFrames: false,
            frameRate: 24,
            repeat: -1
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: COLORS.WHITE,
    type: Phaser.AUTO,
    render: {
        pixelArt: true
    },
    scale: {
        mode: Phaser.Scale.NONE,
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
    scene: [ LoadScene, ControllerScene, GameScene]
};

game = new Phaser.Game(config);
