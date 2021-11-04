const GRID_SIZE = 64;
const GRID_COLS = 32;
const GRID_ROWS = 18;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS;
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

        scene.load.spritesheet('set', 'assets/set.png', { frameWidth: 32, frameHeight: 32 });

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

        scene.__addCard = function(x, y, cardinality, shape, fill, color, scale = 2) {
            let size = GRID_SIZE/2 * 3 * scale;
            let tile_shift = GRID_SIZE/2;
            tile_shift *= scale;
            scene.add.sprite(x, y, 'set', 29).setScale(scale);
            scene.add.sprite(x - tile_shift, y, 'set', 28).setScale(scale);
            let sprite = scene.add.sprite(x, y - tile_shift, 'set', 28).setScale(scale);
            sprite.angle = 90;
            sprite = scene.add.sprite(x, y + tile_shift, 'set', 28).setScale(scale);
            sprite.angle = -90;
            scene.add.sprite(x + tile_shift, y, 'set', 28).setScale(scale).setFlipX(true);
            scene.add.sprite(x - tile_shift, y - tile_shift, 'set', 27).setScale(scale);
            scene.add.sprite(x - tile_shift, y + tile_shift, 'set', 27)
                .setScale(scale).setFlipY(true);
            scene.add.sprite(x + tile_shift, y + tile_shift, 'set', 27)
                .setScale(scale).setFlipY(true).setFlipX(true);
            scene.add.sprite(x + tile_shift, y - tile_shift, 'set', 27)
                .setScale(scale).setFlipX(true);
            let rectangle = scene.add.rectangle(x, y, size, size, 0xFFFFFF, 0);
            let card = shape * 9 + fill * 3 + color;
            let gap = GRID_SIZE/4 + GRID_SIZE/32;
            gap *= scale;
            let shapes = [];
            if (cardinality == 0) {
                shapes = [scene.add.sprite(x, y, 'set', card).setScale(scale*2)];
            }
            if (cardinality == 1) {
                shapes = [
                    scene.add.sprite(x+gap, y, 'set', card).setScale(scale),
                    scene.add.sprite(x-gap, y, 'set', card).setScale(scale)];
            }
            if (cardinality == 2) {
                shapes = [
                    scene.add.sprite(x, y - gap, 'set', card).setScale(scale),
                    scene.add.sprite(x + gap, y + gap, 'set', card).setScale(scale),
                    scene.add.sprite(x - gap, y + gap, 'set', card).setScale(scale)];
            }
            rectangle.setData('shapes', shapes);
            rectangle.setData('show', function (bool) {
                for (shape of shapes) {
                    shape.setVisible(bool);
                }
            });
            rectangle.setData('card', {
                cardinality : cardinality,
                shape : shape,
                fill : fill,
                color : color});
            return rectangle;
        };

        let CARDS = Phaser.Utils.Array.NumberArray(0, 80);

        scene.__randomCardFromInteger = function(card) {
            let retVal = {};
            let value = Math.floor(card/27);
            card -= value * 27;
            retVal.cardinality = value;
            value = Math.floor(card/9);
            card -= value * 9;
            retVal.shape = value;
             value = Math.floor(card/3);
            card -= value * 3;
            retVal.fill = value;
            retVal.color = card;
            return retVal;
        }

        scene.__randomCard = function() {
            return {
                cardinality : Phaser.Math.Between(0,2),
                shape : Phaser.Math.Between(0,2),
                fill : Phaser.Math.Between(0,2),
                color : Phaser.Math.Between(0,2),
            };
        };

        scene.__completingCard = function(card1, card2) {
            let magic = [
                [0, 2, 1],
                [2, 1, 0],
                [1, 0, 2]
            ];
            let retVal = {};
            for (property of ['cardinality','shape','fill','color']) {
                retVal[property] = magic[card1[property]][card2[property]];
            }
            return retVal;
        };

        scene.__gridX = function(x) {
            return GRID_SIZE*x;
        };

        scene.__gridY = scene.__gridX;

        let count = 0;
        let current = [];
        let buttons = [];
        let BUTTONS_TO_REVEAL = 5;
        let text = scene.add.text(
            SCREEN_WIDTH, SCREEN_HEIGHT,
            '' + BUTTONS_TO_REVEAL +"/81", { font: GRID_SIZE + 'px Eczar-Regular', fill: '#FFF' })
            .setOrigin(1, 1);
        Phaser.Utils.Array.Shuffle(CARDS);
        for (x of [GRID_COLS/2 - 8, GRID_COLS/2 - 6, GRID_COLS/2 - 4, GRID_COLS/2 - 2, GRID_COLS/2, GRID_COLS/2 + 2, GRID_COLS/2 + 4, GRID_COLS/2 + 6, GRID_COLS/2 + 8]) {
            for (y of [GRID_ROWS/2 - 8, GRID_ROWS/2 - 6, GRID_ROWS/2 - 4, GRID_ROWS/2 - 2, GRID_ROWS/2, GRID_ROWS/2 + 2, GRID_ROWS/2 + 4, GRID_ROWS/2 + 6, GRID_ROWS/2 + 8]) {
                if (count >= CARDS.length) { continue; }
                let card = scene.__randomCardFromInteger(CARDS[count++]);
                let rectangle = scene.__addCard(scene.__gridX(x), scene.__gridY(y),
                    card.cardinality, card.shape, card.fill, card.color, 1);
                if (count > BUTTONS_TO_REVEAL) {
                    rectangle.data.values.show(false);
                }
                rectangle.setInteractive();
                rectangle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
                    rectangle.setFillStyle(0xFFFFFF, 0.5);
                });
                rectangle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function() {
                    rectangle.setFillStyle(0xFFFFFF, 0);
                });
                rectangle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function() {
                    if (current.length < 2) {
                        current.push(rectangle.data.values.card);
                    }
                    if (current.length == 2) {
                        let cardToReveal = scene.__completingCard(current[0], current[1]);
                        let count = 0;
                        for (button of buttons) {
                            if (cardToReveal.cardinality === button.data.values.card.cardinality &&
                                cardToReveal.shape === button.data.values.card.shape &&
                                cardToReveal.fill === button.data.values.card.fill &&
                                cardToReveal.color === button.data.values.card.color) {
                                if (!button.data.values.shapes[0].visible) {
                                    let shine = scene.add.rectangle(button.x, button.y, button.width, button.height, 0xffffff, 1);
                                    scene.tweens.add({
                                        targets: [shine],
                                        alpha: 0,
                                        scaleX: 2,
                                        scaleY: 2,
                                        duration: 1000
                                    })
                                }
                                button.data.values.show(true);
                            }
                            if (button.data.values.shapes[0].visible) {
                                count++;
                            }
                        }
                        current = [];
                        text.setText(''+count+'/81');
                    }
                });
                buttons.push(rectangle);
            }
        }

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
