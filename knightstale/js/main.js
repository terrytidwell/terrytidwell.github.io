const GRID_SIZE = 64;
//const SPRITE_SCALE = GRID_SIZE/32;
const GRID_COLS = 12;
const GRID_ROWS = 12;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS; //845 + 400; //845; //1025
const SCREEN_HEIGHT = GRID_SIZE * GRID_COLS; //542 + 150; //542; //576
const DEPTHS = {
    BOARD: 0,
    SURFACE: 1,
    ENTITIES: 1000,
    UI: 2000,
}
const DIRECTIONS = {
    RIGHT: {dx: 1, dy: 0},
    LEFT: {dx: -1, dy: 0},
    UP: {dx: 0, dy: -1},
    DOWN: {dx: 0, dy: 1},

    UP_LEFT : {dx: -1, dy: -1},
    UP_RIGHT : {dx: 1, dy: -1},
    DOWN_LEFT : {dx: 1, dy: -1},
    DOWN_RIGHT : {dx: 1, dy: 1},
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
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.spritesheet('floor', 'assets/Wood 1 TD 64x72.png', { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('white_pieces', 'assets/White - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('black_pieces', 'assets/Black - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('impact', 'assets/Impact.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('health_bars', 'assets/health_bars.png', { frameWidth: 80, frameHeight: 9 });
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

        scene.__gridX = function(x) {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        scene.__gridY = function(y) {
            return y * GRID_SIZE + GRID_SIZE/2;
        };

        scene.__characterY = function(y) {
            return scene.__gridY(y - .5);
        };

        scene.__isGridPassable = function(x,y) {
            return x >= 0 && x < 12 &&
                y >= 0 && y < 12 &&
                grid[x][y].visible;
        };

        //----------------------------------------------------------------------
        //GAME SETUP
        //----------------------------------------------------------------------

        let grid = [];
        scene.__mob_grid = [];
        scene.__hittables = scene.physics.add.group();
        scene.__dangerous_touchables = scene.physics.add.group();
        scene.__updateables = scene.physics.add.group();

        let index_image = Phaser.Utils.Array.NumberArray(0,3);
        for (let x = 0; x < 12; x++)
        {
            grid.push([]);
            for (let y = 0; y < 12; y++)
            {
                let offset = 4 * ((x + y) % 2);
                let tile = Phaser.Utils.Array.Shuffle(index_image)[0] + offset;
                let square = scene.add.sprite(scene.__gridX(x), scene.__gridY(y), 'floor', tile);
                square.setDepth(DEPTHS.BOARD);
                square.setVisible(false);
                if (x >= 2 && x < 10 &&
                    y >= 2 && y < 10)
                {
                    square.setVisible(true);
                }
                grid[x].push(square);
            }
        }

        scene.__character = addPlayer(scene,5,7);
        scene.__pawn = addPawn(scene,9,9);
        scene.__pawn = addPawn(scene,2,2);


        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

        //----------------------------------------------------------------------
        //SETUP PHYSICS
        //----------------------------------------------------------------------

        scene.physics.add.overlap(scene.__character, scene.__hittables, function(character, hittable) {
            if (character.data.values.isHitting()) {
                hittable.data.values.onHit(character.data.values.dx,
                    character.data.values.dy);
            }
        });
        scene.physics.add.overlap(scene.__character, scene.__dangerous_touchables,
            function(character, dangerous_touchable) {
            if (character.data.values.isVulnerable() &&
                dangerous_touchable.data.values.isDangerous()) {
                let touch_info = dangerous_touchable.data.values.registerDangerousTouch();
                character.data.values.onHit(
                    touch_info.dx,
                    touch_info.dy);
            }
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        scene.__character.data.values.update();

        scene.__updateables.children.each(function(updatable) {
            updatable.data.values.update();
        }, this);

    },
});

let config = {
    backgroundColor: '#000000',
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

game = new Phaser.Game(config);
