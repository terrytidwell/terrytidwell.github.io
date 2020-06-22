const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 512;

let TitleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'TitleScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        this.load.spritesheet('fighter_idle', 'assets/fighter_idle.png', { frameWidth: 128, frameHeight: 128});
        this.load.audio('qtclash', ['assets/qtclash.mp3']);
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let play = scene.add.text(
            SCREEN_WIDTH/2,
            SCREEN_HEIGHT/2,
            "click to continue...",
            { font: 32 + 'px Arial', color: '#ffffff'})
            .setOrigin(0.5, 0.5)
            .setStroke('#ffffff', 3);
        play.setInteractive();
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, function(){
            play.scaleX = 1.2;
            play.scaleY = 1.2;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, function(){
            play.scaleX = 1;
            play.scaleY = 1;
        });
        play.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, function(){
            scene.scene.start('UIScene');
            scene.scene.start('GameScene');
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

        let health = [100,100];
        let players = [];

        scene.anims.create({
            key: 'idle',
            frames: [
                { key: 'fighter_idle', frame: 0 },
                { key: 'fighter_idle', frame: 1 },
                { key: 'fighter_idle', frame: 2 },
                { key: 'fighter_idle', frame: 3 }
            ],
            skipMissedFrames: false,
            frameRate: 4,
            repeat: -1
        });
        scene.anims.create({
            key: 'hit',
            frames: [
                { key: 'fighter_idle', frame: 4 },
                { key: 'fighter_idle', frame: 5 },
                { key: 'fighter_idle', frame: 6 },
                { key: 'fighter_idle', frame: 7 }
            ],
            skipMissedFrames: false,
            frameRate: 8,
            repeat: 0
        });

        let damage = function()
        {
            players[0].play('hit')
                .on("animationcomplete-hit", function() {
                    players[0].play('idle');
                });
            health[0] = Phaser.Math.Clamp(health[0] - 10, 0, 100);
            scene.cameras.main.shake(250, 0.015, true);
            //left bar target = scaleX
            //rigth bar target = width
            scene.tweens.add({
                targets: life[0],
                scaleX: health[0]/100,
                duration: 200
            });
            scene.tweens.add({
                targets: life_bg[0],
                scaleX: health[0]/100,
                delay: 500,
                duration: 100
            });
        }

        players.push(
            scene.add.sprite(SCREEN_WIDTH/2 - 192, SCREEN_HEIGHT, 'fighter_idle', 0)
                .setOrigin(0.5, 1)
                .setScale(4)
                .play('idle'));
        players.push(
            scene.add.sprite(SCREEN_WIDTH/2 + 192, SCREEN_HEIGHT, 'fighter_idle', 0)
                .setOrigin(0.5, 1)
                .setScale(4)
                .setFlipX(true)
                .play('idle'));
        let life_x = SCREEN_WIDTH/2;
        let life_x_offset = 32;
        let life_y = 64;
        let life_w = SCREEN_WIDTH/2 - 128;
        let life_h = 32;
        let pinstripe = 4;

        scene.add.rectangle(life_x - life_x_offset + pinstripe/2, life_y,
            life_w + pinstripe, life_h + pinstripe, 0xffff00,0)
            .setOrigin(1,0.5)
            .setStrokeStyle(pinstripe,0xffffff,1);
        scene.add.rectangle(life_x + life_x_offset - pinstripe/2, life_y,
            life_w + pinstripe, life_h + pinstripe, 0xffff00,0)
            .setOrigin(0,0.5)
            .setStrokeStyle(pinstripe,0xffffff,1);
        let life_bg = [];
        life_bg.push(
            scene.add.rectangle(life_x - life_x_offset, life_y,
                life_w, life_h, 0xff0000)
                .setOrigin(1,0.5));
        life_bg.push(
            scene.add.rectangle(life_x + life_x_offset, life_y,
                life_w, life_h, 0xff0000)
                .setOrigin(0,0.5));
        let life = [];
        life.push(
            scene.add.rectangle(life_x - life_x_offset, life_y,
                life_w, life_h, 0xffff00)
            .setOrigin(1,0.5));
        life.push(
            scene.add.rectangle(life_x + life_x_offset, life_y,
                life_w, life_h, 0xffff00)
            .setOrigin(0,0.5))

        scene.space_key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        scene.space_key.on('down', damage);

        scene.sound.pauseOnBlur = false;
        scene.sound.add('qtclash', {loop: true }).play();
    },

    //--------------------------------------------------------------------------
    update: function() {
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
    scene: [ TitleScene, GameScene ]
};

game = new Phaser.Game(config);
