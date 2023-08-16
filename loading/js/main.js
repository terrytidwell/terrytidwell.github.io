const GRID_SIZE = 80;
const SCREEN_COLUMNS = 16;
const SCREEN_ROWS = 9;
const SCREEN_HEIGHT = GRID_SIZE * SCREEN_ROWS;  //720
const SCREEN_WIDTH = GRID_SIZE * SCREEN_COLUMNS; //1280

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

        let pipelineInstance = scene.plugins.get('rexhorrifipipelineplugin').add(
            scene.cameras.main, {
                scanlinesEnable: false,
                scanStrength: 0.5,
                vhsEnable: false,
                vhsStrength: 0.25,
                bloomEnable: false,
                bloomRadius: GRID_SIZE, bloomIntensity: .75, bloomThreshold: .25,
                bloomTexelWidth: 5, bloomTexelHeight: 5,
                noiseEnable: true,
                noiseStrength: 0.15,
            });
        let textbg = scene.add.text(SCREEN_WIDTH/2-SCREEN_WIDTH, SCREEN_HEIGHT/2,"chirality_", {
            color: '#00C000',
            font: GRID_SIZE * 2 + 'px VT323',
            align: 'center',
            padding: SCREEN_WIDTH * 2,
            shadow: {color: '#00ff00ff', fill: 'true', blur: 45, offsetX: SCREEN_WIDTH}
        }).setOrigin(0.5, 0.5);

        let text = scene.add.text(SCREEN_WIDTH/2-SCREEN_WIDTH, SCREEN_HEIGHT/2,"chirality_", {
            color: '#00C000',
            font: GRID_SIZE * 2 + 'px VT323',
            align: 'center',
            padding: SCREEN_WIDTH * 2,
            shadow: {color: '#00c000ff', fill: 'true', blur: 5, offsetX: SCREEN_WIDTH}
        }).setOrigin(0.5, 0.5);

/*
        this.tweens.addCounter({
            from: 100,
            to: 10000,
            duration: 5000,
            onUpdate: function (tween)
            {
                let value = 1.0 * tween.getValue()/100.0;

                text.setShadow(SCREEN_WIDTH, 0, '#00ff00ff', value, true, true);
            }
        }); */

        let flip_flop = false;

        let timedEvent =
            this.time.addEvent({ delay: 500, callback: () => {
                    flip_flop = !flip_flop;
                    text.setText(flip_flop ? "chirality " : "chirality_");
                }, callbackScope: this, loop: true });



        let scanline_y = 0;
        let scanlineImage = null;

        let scanlineEvent = this.time.addEvent({delay: 35, callback: () => {
                scanline_y += GRID_SIZE/20;
                if (scanline_y > SCREEN_HEIGHT) { scanline_y = 0; }

                if (scanlineImage) {
                    scanlineImage.destroy();
                }

                let textureManager = scene.textures;

                scene.game.renderer.snapshotArea(0, scanline_y, SCREEN_WIDTH,
                    GRID_SIZE/10,
                (image) =>
                    {
                        if (textureManager.exists('area'))
                        {
                            textureManager.remove('area');
                        }

                        textureManager.addImage('area', image);

                        scanlineImage = scene.add.image(
                            -GRID_SIZE/20, scanline_y,'area').setOrigin(0,0);
                    });
            }, callbackScope: this, loop: true });

        let doBounce = (scene) => {

            let scanlines = [];
            let delete_scanlines = () => {
                for (scanline of scanlines) {
                    scanline.destroy();
                }
                scanlines = [];
            };

            let finished = false;
            let bounce_value = scene.tweens.addCounter({
                from: 160,
                to: 0,
                duration: 1000,
                onComplete: () => {
                    finished = true;
                }
            });

            let textureManager = scene.textures;

            let single_scan = () => {
                let scan_size = GRID_SIZE/4;
                delete_scanlines();
                let bounce_amount = Math.floor(bounce_value.getValue());

                let setLine = (y) => {
                    let scanline_y = y * scan_size;
                    if (scanline_y > SCREEN_HEIGHT) {
                        if (finished) {
                            delete_scanlines();
                            return;
                        };
                        scene.time.delayedCall(10, single_scan);
                    }
                    scene.game.renderer.snapshotArea(0, scanline_y, SCREEN_WIDTH,
                        scan_size,
                        (image) => {
                            let image_key = 'scanline' + y;
                            if (textureManager.exists(image_key)) {
                                textureManager.remove(image_key);
                            }

                            textureManager.addImage(image_key, image);

                            scanlineImage = scene.add.image(
                                Phaser.Math.Between(-bounce_amount, bounce_amount),
                                scanline_y, image_key).setOrigin(0, 0);
                            scanlines.push(scanlineImage);
                            setLine(y+1);
                        });
                };
                setLine(0);
            };
            single_scan();

        };

        //doBounce(scene);
/*
        scene.cameras.main.setZoom(0.5);

        this.tweens.add({
            targets: scene.cameras.main,
            duration: 5000,
            zoom: 1
        });

        for (let y = 0; y < SCREEN_HEIGHT; y+=GRID_SIZE/20) {
            scene.add.rectangle(SCREEN_WIDTH / 2, y, SCREEN_WIDTH, GRID_SIZE / 40, 0x0000000, 0.35)
                .setOrigin(0.5, 0.5);
        }
 */
        let pop = 100000;
        let num_districts = 28;
        let r_percent = 49; //58.42;
        let r_pop = pop*r_percent/100;
        let voters = [];
        let districts = [];
        for (let n = 0; n < num_districts; n++) {
            districts.push([0,0]);
        }
        for (let n = 0; n < pop; n++) {
            voters.push(n < r_pop ? 1 : 0);
        }
        Phaser.Utils.Array.Shuffle(voters);
        for (let n = 0; n < pop; n++) {
            districts[n % num_districts][voters[n]]++;
        }
        let win_count = [0, 0];
        for (let n = 0; n < num_districts; n++) {
            win_count[districts[n][0] > districts[n][1] ? 0 : 1 ]++;
        }
        console.log(win_count);
    },



    //--------------------------------------------------------------------------
    update: function () {
    }
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

        scene.load.plugin('rexhorrifipipelineplugin',
            'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexhorrifipipelineplugin.min.js', true);

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
    backgroundColor: 0x000000,
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
