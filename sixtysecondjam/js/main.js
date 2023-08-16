const GRID_SIZE = 20;
const GRID_COLS = 18;
const GRID_ROWS = 36;
const SCREEN_WIDTH = 800; //360;
const SCREEN_HEIGHT = 600; //720;
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

        scene.load.image('art', 'assets/still_life_with_mustard_pot_2014.18.9.png');
        scene.load.spritesheet('wall', 'assets/bw_wall.png', { frameWidth:64, frameHeight: 64 });

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
        let scene = this;
        scene.anims.create({
            key: 'flicker_anim',
            frames: scene.anims.generateFrameNumbers('wall',
                { start: 3, end: 5 }),
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1,
            yoyo: true
        });
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
/*
        scene.__addCard = function(x, y) {
            let color = [Phaser.Math.Between(128, 255),
                Phaser.Math.Between(0,64),
                Phaser.Math.Between(0,64)];
            Phaser.Utils.Array.Shuffle(color);
            color = [0, 0, 0];
            for (let px = x - GRID_SIZE/2; px < x + GRID_SIZE/2; px++) {
                for (let py = y - GRID_SIZE/2; py < y + GRID_SIZE/2; py++) {
                    let pc = scene.textures.getPixel(px, py, 'art');
                    color[0] += pc.r * pc.r;
                    color[1] += pc.g * pc.g;
                    color[2] += pc.b * pc.b;
                }
            }
            for (let c of [0,1,2]) {
                color[c] = Math.sqrt(color[c] / (GRID_SIZE * GRID_SIZE));
            }
            let container = scene.add.rectangle(x, y, GRID_SIZE, GRID_SIZE,
                Phaser.Display.Color.GetColor(color[0],color[1],color[2]))
                .setDepth(0);
            return container;
        };

        scene.add.sprite(0,0,'art')
            .setOrigin(0,0)
            .setDepth(0);
        let tiles = [];
        for (let x = GRID_SIZE/2; x < SCREEN_WIDTH; x+= GRID_SIZE) {
            for (let y = GRID_SIZE/2; y < SCREEN_HEIGHT; y+= GRID_SIZE) {
                let rectangle = scene.__addCard(x, y);
                tiles.push(rectangle);
                rectangle.setInteractive();
                scene.input.setDraggable(rectangle);
                scene.input.on(Phaser.Input.Events.DRAG_START, function (pointer, gameObject, dragX, dragY) {
                    gameObject.setDepth(1);
                });
                scene.input.on(Phaser.Input.Events.DRAG, function (pointer, gameObject, dragX, dragY) {
                    gameObject.y = dragY;
                    gameObject.x = dragX;
                });
                scene.input.on(Phaser.Input.Events.DRAG_END, function (pointer, gameObject, dragX, dragY) {
                    gameObject.setDepth(0);
                });
            }
        }*/

        //let text = "> iptrace 192.16.3.10"
        let text = scene.add.text(-SCREEN_WIDTH/4, SCREEN_HEIGHT/2, '> iptrace 192.16.3.10',
            {font: GRID_SIZE*2 + 'px VT323-Regular', fill: '#0F0', padding:{left:0, right: 400, y:100}});
        text.setShadow(0, 0, '#00C000', 10, false, true);
        //text.setResolution(2);
        text.setText(text.text);
        for (let y = 0; y < SCREEN_HEIGHT; y+=GRID_SIZE/5) {
            scene.add.rectangle(SCREEN_WIDTH/2, y, SCREEN_WIDTH, GRID_SIZE/40, 0x000000);
        }

        let flicker = scene.add.sprite(32,32,'wall',3).setVisible(true);
        flicker.play('flicker_anim');
        let mask = new Phaser.Display.Masks.BitmapMask(scene, flicker);
        scene.add.rectangle(64,64,128,128,0x000000);
        for (let p of [[32,32],[32,96],[96,32],[96,96]]) {
            let wall = scene.add.sprite(p[0],p[1],'wall',0);
            wall.setMask(mask);
        }
        flicker.setInteractive();
        scene.input.setDraggable(flicker);

        scene.input.on(Phaser.Input.Events.DRAG, function (pointer, gameObject, dragX, dragY) {
            gameObject.y = dragY;
            gameObject.x = dragX;
        });

        scene.tweens.add({
            targets: text,
            shadowBlur: 0,
            duration: 5000,
            yoyo: true,
            repeat: -1
        });
/*
        }*/

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
