const GRID_SIZE = 20;
const GRID_COLS = 18;
const GRID_ROWS = 36;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS; //360;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS; //720;
const DEPTHS = {
    BOARD: 0,
    CARD: 1000,
    SHAPES: 2000,
};

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
            "0%", { font: GRID_SIZE/2 + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        scene.load.spritesheet('cardback', 'assets/Back - Top Down 88x124.png', { frameWidth: 88, frameHeight: 124 });

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('GameScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {},

    //--------------------------------------------------------------------------
    create: function (data) {
        let scene = this;

        //----------------------------------------------------------------------
        //FUNCTIONS
        //----------------------------------------------------------------------

        scene.__addCard = function(x, y) {
            let width = 88;
            let height = 124;
            let scale = 2;

            let sprites = [
                scene.add.sprite(0, 0, 'cardback', 0).setScale(2),
                scene.add.sprite(0, 0, 'cardback', 1).setScale(2)
            ];
            let container = scene.add.container(x, y, sprites);
            container.setSize(width*scale, height*scale);
            let draggable = true;
            container.setData('dragabble', () => {
                return draggable;
            });
            container.setData('setDraggable', (bool) => {
                draggable = bool;
            });
            return container;
        };

/*
        let text = scene.add.text(
            SCREEN_WIDTH, SCREEN_HEIGHT,
            '' + BUTTONS_TO_REVEAL +"/81", { font: GRID_SIZE + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(1, 1);
*/
        let rectangle = scene.__addCard(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
        rectangle.setInteractive();
        scene.input.setDraggable(rectangle);
        scene.input.on('drag', function(pointer, gameObject, dragX, dragY) {
            if (!gameObject.data.values.dragabble()) {
                return;
            }
            gameObject.x = dragX;
        });

        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

        //----------------------------------------------------------------------
        //SETUP PHYSICS
        //----------------------------------------------------------------------
    },

    //--------------------------------------------------------------------------
    update: function() {},
});

let config = {
    backgroundColor: '#202020',
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
    scene: [ LoadScene, GameScene ]
};

let game = new Phaser.Game(config);
