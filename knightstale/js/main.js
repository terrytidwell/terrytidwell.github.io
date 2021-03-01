const GRID_SIZE = 64;
//const SPRITE_SCALE = GRID_SIZE/32;
const GRID_COLS = 12;
const GRID_ROWS = 12;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS; //845 + 400; //845; //1025
const SCREEN_HEIGHT = GRID_SIZE * GRID_COLS; //542 + 150; //542; //576

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
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.spritesheet('floor', 'assets/Wood 1 TD 64x72.png', { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('pieces', 'assets/White - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('impact', 'assets/Impact.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('frame', 'assets/frame.png');

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('GameScene');
            scene.scene.stop('LoadScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;

        scene.anims.create({
            key: 'impact_anim',
            frames: [
                { key: 'impact', frame: 0 },
                { key: 'impact', frame: 1 },
                { key: 'impact', frame: 2 },
                { key: 'impact', frame: 3 },
                { key: 'impact', frame: 4 },
                { key: 'impact', frame: 5 },
            ],
            skipMissedFrames: false,
            frameRate: 24,
            repeat: 0
        });
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

        //----------------------------------------------------------------------
        //FUNCTIONS
        //----------------------------------------------------------------------

        let gridX = function(x) {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        let gridY = function(y) {
            return y * GRID_SIZE + GRID_SIZE/2;
        };

        let characterY = function(y) {
            return gridY(y - .5);
        };

        let impact = function() {
            impact_sprite.play('impact_anim');
            //scene.cameras.main.shake(25, 0.0125, true);
        };

        let movePlayer = function(x, y) {
            playerMoveAllowed = false;
            let z_height = -64;
            let tweenX = scene.tweens.add({
                targets: { x: playerX},
                props: { x: x },
                duration: 200,
                onUpdate: function() {
                    playerX = tweenX.getValue();
                }
            });
            let tweenY = scene.tweens.add({
                targets: { y: playerY},
                props: { y: y },
                duration: 200,
                onUpdate: function() {
                    playerY = tweenY.getValue();
                }
            });
            let timeline = scene.tweens.createTimeline();
            timeline.add({
                targets: { z: playerZ},
                props: { z: z_height },
                duration: 200,
                onUpdate: function() {
                    playerZ = this.getValue();
                }
            });
            timeline.add({
                targets: { z: z_height},
                props: { z: 0 },
                duration: 100,
                onUpdate: function() {
                    playerZ = this.getValue();
                },
                onComplete: function()
                {
                    impact();
                    playerMoveAllowed = true;
                }
            });
            timeline.play();

            /*
            scene.add.tween({
                targets: character,
                x: gridX(x),
                y: characterY(y),
                duration: 200
            });
             */
            //character.setPosition(gridX(x),characterY(y));
        };

        let orientation = {
            RIGHT: 0,
            UP: 1,
            DOWN: 2,
            LEFT: 3
        };
        let setOrientation = function(orientation) {
            character.setTexture('pieces', 4 + orientation);
        }

        let tryMovePlayer = function(x, y) {
            if (!playerMoveAllowed) {
                return;
            }
            if (x !== playerX &&
                y !== playerY &&
                3 === Phaser.Math.Distance.Snake(x, y, playerX, playerY) ) {
                let dx = x - playerX;
                let dy = y - playerY;
                if (dx === 2) {
                    setOrientation(orientation.RIGHT);
                }
                if (dy === -2) {
                    setOrientation(orientation.UP);
                }
                if (dy === 2) {
                    setOrientation(orientation.DOWN);
                }
                if (dx === -2) {
                    setOrientation(orientation.LEFT);
                }
                movePlayer(x, y);
            }
        };
        //----------------------------------------------------------------------
        //GAME ENTITY SETUP
        //----------------------------------------------------------------------

        let grid = [];

        let index_image = Phaser.Utils.Array.NumberArray(0,3);
        for (let x = 0; x < 12; x++)
        {
            grid.push([]);
            for (let y = 0; y < 12; y++)
            {
                let offset = 4 * ((x + y) % 2);
                let tile = Phaser.Utils.Array.Shuffle(index_image)[0] + offset;
                let square = scene.add.sprite(gridX(x), gridY(y), 'floor', tile);
                square.setVisible(false);
                if (x >= 2 && x < 10 &&
                    y >= 2 && y < 10)
                {
                    square.setVisible(true);
                }
                grid[x].push(square);
            }
        }


        let playerX = 5;
        let playerY = 7;
        let playerZ = -1000;
        let playerMoveAllowed = false;
        let tweenZ = scene.tweens.add({
            targets: { z: playerZ},
            props: { z: 0 },
            duration: 1000,
            onUpdate: function() {
                playerZ = tweenZ.getValue();
            },
            onComplete: function() {
                impact();
                playerMoveAllowed = true;
            }
        });

        let moves = [
            {dx: -2, dy: -1},
            {dx: -2, dy: 1},
            {dx: 2, dy: -1},
            {dx: 2, dy: 1},
            {dx: -1, dy: -2},
            {dx: 1, dy: -2},
            {dx: -1, dy: 2},
            {dx: 1, dy: 2}
        ];
        let frames = [];
        for (let i = 0; i < moves.length; i++) {
            let frame = scene.add.sprite(0,0,'frame').setScale(2);
            frames.push(frame);
            frame.setData('dx', moves[i].dx);
            frame.setData('dy', moves[i].dy);
            frame.setInteractive();
            frame.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
                function () {
                    tryMovePlayer(playerX + frame.data.values.dx,
                        playerY + frame.data.values.dy);
                }
            );
        }

        scene.__alignPlayer = function() {
            character.setPosition(gridX(playerX), characterY(playerY)+playerZ);
            shadow.setPosition(gridX(playerX),gridY(playerY));
            impact_sprite.setPosition(gridX(playerX),gridY(playerY));
            for (let i = 0; i < frames.length; i++) {
                let frame = frames[i];
                let x = playerX + frame.data.values.dx;
                let y = playerY + frame.data.values.dy;
                frame.setPosition(gridX(x),
                    gridY(y));
                frame.setVisible(playerMoveAllowed &&
                    x <= 9 && x >= 2 &&
                    y <= 9 && y >= 2);
            }
        };

        let impact_sprite = scene.add.sprite(0,0, 'impact', 5).setVisible(true).setScale(2);
        let shadow = scene.add.ellipse(0, 0,
            GRID_SIZE*.70,GRID_SIZE*.57,0x000000, 0.5);
        let character = scene.add.sprite(0, 0, 'pieces', 4);
        scene.add.sprite(gridX(9), characterY(9), 'pieces', 12);


        scene.__alignPlayer();


        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        scene.__alignPlayer();
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
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
