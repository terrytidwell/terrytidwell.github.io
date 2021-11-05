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
const PROPERTIES = [
    'cardinality',
    'shape',
    'fill',
    'color'
];
const COMPLETION = [
    [0, 2, 1],
    [2, 1, 0],
    [1, 0, 2]
];

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

        scene.__addCard = function(x, y, cardinality, shape, fill, color) {
            let size = GRID_SIZE/2 * 3;
            let tile_shift = GRID_SIZE/2;
            let highlight = scene.add.rectangle(0,0,size + GRID_SIZE/4,size + GRID_SIZE/4,0x8080ff, 0.75)
                .setVisible(false);
            let sprites = [
                highlight,
                scene.add.sprite(0, 0, 'set', 29),
                scene.add.sprite(-tile_shift, 0, 'set', 28),
                scene.add.sprite(0, -tile_shift, 'set', 28).setAngle(90),
                scene.add.sprite(0, tile_shift, 'set', 28).setAngle(-90),
                scene.add.sprite(tile_shift, 0, 'set', 28).setFlipX(true),
                scene.add.sprite(-tile_shift, -tile_shift, 'set', 27),
                scene.add.sprite(-tile_shift, tile_shift, 'set', 27)
                    .setFlipY(true),
                scene.add.sprite(tile_shift, tile_shift, 'set', 27)
                    .setFlipY(true).setFlipX(true),
                scene.add.sprite(tile_shift, -tile_shift, 'set', 27)
                    .setFlipX(true),
            ];
            let rectangle = scene.add.rectangle(x, y, size, size, 0xFFFFFF, 0);
            sprites.push(rectangle);
            let card = shape * 9 + fill * 3 + color;
            let gap = GRID_SIZE/4 + GRID_SIZE/32;
            let shapes = [];
            if (cardinality == 0) {
                shapes = [scene.add.sprite(0, 0, 'set', card).setScale(2)];
            }
            if (cardinality == 1) {
                shapes = [
                    scene.add.sprite(gap, 0, 'set', card),
                    scene.add.sprite(-gap, 0, 'set', card)];
            }
            if (cardinality == 2) {
                shapes = [
                    scene.add.sprite(0, -gap, 'set', card),
                    scene.add.sprite(gap, gap, 'set', card),
                    scene.add.sprite(-gap, gap, 'set', card)];
            }
            for (let shape of shapes) {
                sprites.push(shape);
            }
            let container = scene.add.container(x, y, sprites);
            container.setData('shapes', shapes);
            container.setData('isRevealed', function() {
                return shapes[0].visible;
            });
            container.setData('show', function (bool) {
                for (let shape of shapes) {
                    shape.setVisible(bool);
                }
            });
            container.setData('isChosen', function() {
                return highlight.visible;
            });
            container.setData('setChosen', function(bool) {
                return highlight.setVisible(bool);
            });
            container.setData('card', {
                cardinality : cardinality,
                shape : shape,
                fill : fill,
                color : color});
            container.setSize(size, size);
            //rectangle.setFillStyle(0xFFFFFF, 0.5);
            return container;
        };

        let CARDS = Phaser.Utils.Array.NumberArray(0, 80);

        scene.__integerToCard = function(card) {
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
        };

        scene.__cardToInteger = function(card) {
            return card.cardinality * 27 +
                card.shape * 9 +
                card.fill * 3 +
                card.color;
        };

        scene.__randomCard = function() {
            let retVal = {};
            for (let property of PROPERTIES) {
                retVal[property] = Phaser.Math.Between(0,2);
            }
            return retVal;
        };

        scene.__randomCardExcluding = function(card) {
            return scene.__integerToCard(
                (scene.__cardToInteger(card)+Phaser.Math.Between(1,80)) % 81);
        };

        scene.__completingCard = function(card1, card2) {

            let retVal = {};
            for (let property of PROPERTIES) {
                retVal[property] = COMPLETION[card1[property]][card2[property]];
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
        for (let x of [GRID_COLS/2 - 8, GRID_COLS/2 - 6, GRID_COLS/2 - 4, GRID_COLS/2 - 2, GRID_COLS/2, GRID_COLS/2 + 2, GRID_COLS/2 + 4, GRID_COLS/2 + 6, GRID_COLS/2 + 8]) {
            for (let y of [GRID_ROWS/2 - 8, GRID_ROWS/2 - 6, GRID_ROWS/2 - 4, GRID_ROWS/2 - 2, GRID_ROWS/2, GRID_ROWS/2 + 2, GRID_ROWS/2 + 4, GRID_ROWS/2 + 6, GRID_ROWS/2 + 8]) {
                if (count >= CARDS.length) { continue; }
                let card = scene.__integerToCard(CARDS[count++]);
                let rectangle = scene.__addCard(scene.__gridX(x), scene.__gridY(y),
                    card.cardinality, card.shape, card.fill, card.color, 1);
                if (count > BUTTONS_TO_REVEAL) {
                    rectangle.data.values.show(false);
                }
                rectangle.setInteractive();
                scene.input.setDraggable(rectangle);
                scene.input.on('drag', function(pointer, gameObject, dragX, dragY) {
                    gameObject.x = dragX;
                    gameObject.y = dragY;
                });

                rectangle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function() {
                    //rectangle.setFillStyle(0xFFFFFF, 0.5);
                });
                rectangle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function() {
                    //rectangle.setFillStyle(0xFFFFFF, 0);
                });
                rectangle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function() {
                    if (current.length < 2 && rectangle.data.values.isRevealed()) {
                        if (!rectangle.data.values.isChosen()) {
                            rectangle.data.values.setChosen(true);
                            current.push(rectangle);
                        } else {
                            current[0].data.values.setChosen(false);
                            current = [];
                        }
                    }
                    console.log(current.length);
                    if (current.length == 2) {
                        let cardToReveal = scene.__completingCard(current[0].data.values.card,
                            current[1].data.values.card);
                        let count = 0;
                        for (let button of buttons) {
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
                            if (button.data.values.isRevealed()) {
                                count++;
                            }
                        }
                        current[0].data.values.setChosen(false);
                        current[1].data.values.setChosen(false);
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
