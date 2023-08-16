const GRID_SIZE = 30;
const SCREEN_WIDTH = 600;
const SCREEN_HEIGHT = 400;

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

        scene.load.image('lidia', 'assets/lidia.png');
        scene.load.image('flame', 'assets/flame.png');
        scene.load.image('background', 'assets/background.png');
        scene.load.audio('boing', ['assets/qubodup-cfork-ccby3-jump.ogg']);

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
        //magic numbers used to scale the sprite 2560x1563
        scene.add.tileSprite(SCREEN_WIDTH/2,0,6*2560,1563,'background')
            .setScrollFactor(0.5, 1)
            .setScale(SCREEN_HEIGHT/1536)
            .setTilePosition(2*SCREEN_WIDTH);
        //magic numbers used to scale the sprite 36x55
        scene.__character = scene.add.sprite(0, 0, 'lidia')
            .setScale(GRID_SIZE*2/3/36, GRID_SIZE/55);
        scene.physics.add.existing(scene.__character);
        scene.__character.body.gravity.y = 50;

        let platforms = scene.physics.add.staticGroup();
        scene.physics.add.collider(platforms,scene.__character);

        let addPlatform = function(x, y) {
            let platform = scene.add.rectangle(x*GRID_SIZE, y*GRID_SIZE,
                GRID_SIZE, GRID_SIZE, 0x646464, 1.0);
            platforms.add(platform);
        };
        let blocks = [
            [0,1], [1,1], [3,1], [4,2], [5,2], [7,2], [8,2], [9,3], [10,3],
            [11,3], [13,2], [14,2], [15,2], [16,3], [17,3], [18,3], [19,3],
            [20,3], [21,3], [22,3], [23,2], [24,2], [25,2], [26,2], [27,2],
            [28,2],
        ];
        for (let block of blocks) {
            addPlatform(block[0],block[1]);
        };
        let goal = scene.add.rectangle(28*GRID_SIZE, 1*GRID_SIZE,
            GRID_SIZE, GRID_SIZE, 0x0000ff);
        scene.physics.add.existing(goal);
        scene.physics.add.overlap(scene.__character, goal, function() {
           scene.scene.pause();
        });


        let doom = scene.physics.add.group();
        let fireballs = scene.physics.add.group();
        let fireball_recycler = scene.add.rectangle(0,SCREEN_HEIGHT/2 + GRID_SIZE*2,
            SCREEN_WIDTH*6,GRID_SIZE,0x00ff00);
        scene.physics.add.existing(fireball_recycler);
        scene.physics.add.overlap(fireball_recycler, fireballs, function(recyclyer, fireball) {
            fireball.__reset();
        });

        let addFireball = function() {
            let flame = scene.add.sprite(0, 0, 'flame');
            let flame_hitbox = scene.add.rectangle(0, 0,
                GRID_SIZE / 4, GRID_SIZE / 4, 0x000000, 0.0);
            scene.physics.add.existing(flame);
            doom.add(flame_hitbox);
            fireballs.add(flame_hitbox);
            flame_hitbox.__reset = function() {
                let rx = Phaser.Math.Between(0,28);
                flame.setPosition(rx*GRID_SIZE, -SCREEN_HEIGHT/2);
                flame_hitbox.setPosition(rx*GRID_SIZE, -SCREEN_HEIGHT/2);
                let dy = Phaser.Math.Between(30,70);
                flame.body.velocity.y = dy;
                flame_hitbox.body.velocity.y = dy;
            };
            flame_hitbox.__reset();
        };
        for(let i = 0; i < 20; i++) {
            addFireball();
        }

        doom.add(scene.add.rectangle(0,SCREEN_HEIGHT/2,SCREEN_WIDTH*6,GRID_SIZE*2,0xff0000));

        scene.physics.add.overlap(scene.__character, doom, function() {
            scene.scene.restart();
        });

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey("q");

        scene.cameras.main.setBounds(-SCREEN_WIDTH, -SCREEN_HEIGHT/2, 6*SCREEN_WIDTH, SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__character, true, 1, 1, -300+50, 0);

        scene.__boing = scene.sound.add('boing', {loop: false });

    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        let dx = 0;
        if (scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown) {
            dx -= 50;
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            dx += 50;
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            if (scene.__character.body.blocked.down) {
                scene.__boing.play();
                scene.__character.body.setVelocityY(-75);
            }
        }
        scene.__character.body.setVelocityX(dx);
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
