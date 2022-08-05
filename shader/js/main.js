class BlurPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            renderTarget: true,
            fragShader: `
#define SHADER_NAME BLUR_FS
precision mediump float;
//"in" attributes from our vertex shader
varying vec2 outTexCoord;
//declare uniforms
uniform sampler2D uMainSampler;
uniform float uResolution;
uniform float radius;
uniform vec2 dir;
void main()
{
    //this will be our RGBA sum
    vec4 sum = vec4(0.0);
    //our original texcoord for this fragment
    vec2 tc = outTexCoord;
    //the amount to blur, i.e. how far off center to sample from
    //1.0 -> blur by one pixel
    //2.0 -> blur by two pixels, etc.
    float blur = radius/uResolution;
    //the direction of our blur
    //(1.0, 0.0) -> x-axis blur
    //(0.0, 1.0) -> y-axis blur
    float hstep = dir.x;
    float vstep = dir.y;
    //apply blurring, using a 9-tap filter with predefined gaussian weights",
    sum += texture2D(uMainSampler, vec2(tc.x - 4.0*blur*hstep, tc.y - 4.0*blur*vstep)) * 0.0162162162;
    sum += texture2D(uMainSampler, vec2(tc.x - 3.0*blur*hstep, tc.y - 3.0*blur*vstep)) * 0.0540540541;
    sum += texture2D(uMainSampler, vec2(tc.x - 2.0*blur*hstep, tc.y - 2.0*blur*vstep)) * 0.1216216216;
    sum += texture2D(uMainSampler, vec2(tc.x - 1.0*blur*hstep, tc.y - 1.0*blur*vstep)) * 0.1945945946;
    sum += texture2D(uMainSampler, vec2(tc.x, tc.y)) * 0.2270270270;
    sum += texture2D(uMainSampler, vec2(tc.x + 1.0*blur*hstep, tc.y + 1.0*blur*vstep)) * 0.1945945946;
    sum += texture2D(uMainSampler, vec2(tc.x + 2.0*blur*hstep, tc.y + 2.0*blur*vstep)) * 0.1216216216;
    sum += texture2D(uMainSampler, vec2(tc.x + 3.0*blur*hstep, tc.y + 3.0*blur*vstep)) * 0.0540540541;
    sum += texture2D(uMainSampler, vec2(tc.x + 4.0*blur*hstep, tc.y + 4.0*blur*vstep)) * 0.0162162162;
    //discard alpha for our simple demo,return
    gl_FragColor =  vec4(sum.rgb, 1.0);
}
`,
            uniforms: [
                'uProjectionMatrix',
                'uMainSampler',
                'uResolution',
                'radius',
                'dir'
            ]
        });
    }

    onPreRender ()
    {
        const r = Math.abs(2 * Math.sin(this.game.loop.time * 10))
        this.set1f('uResolution', this.renderer.width);
        this.set1f('radius', r);
        this.set2f('dir', 1.0, 1.0);
    }
}


const SPRITE_SCALE = 1;
const GRID_SIZE = 67;
const GRID_SQUARES = 3;
const GRID_ROWS = GRID_SQUARES+2;
const GRID_COLS = GRID_SQUARES+2;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS * SPRITE_SCALE;
const SCREEN_HEIGHT = GRID_SIZE * GRID_ROWS * SPRITE_SCALE;
const FONT = 'px Schoolbell-Regular';

let letters = [ 'blank', '01', '02', '03','04',
    '05', '06', '07', '08', '09'];

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        //this.load.plugin('rexgrayscalepipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgrayscalepipelineplugin.min.js', true);

        scene.load.path = "assets/";


        for (let letter of letters) {
            scene.load.spritesheet(letter, 'tile1_' + letter + '_67.png',
                { frameWidth: 67, frameHeight: 67 });
        }

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
            scene.scene.start('GameScene');
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
    create: function (data) {
        let scene = this;
        this.cameras.main.setPostPipeline(BlurPostFX);

        for (let x = 0; x < GRID_SQUARES; x++) {
            for (let y = 0; y < GRID_SQUARES; y++) {
                let grid_square = (x) => {
                    return Math.round( x * GRID_SIZE + GRID_SIZE/2);
                };

                let tile = scene.add.sprite(
                    grid_square(x+1),
                    grid_square(y+1),
                    '01'
                );
                tile.scaleY = 0;
                scene.tweens.add({
                    targets: tile,
                    scaleY : 1,
                    duration: Phaser.Math.Between(500, 750),
                    delay: Phaser.Math.Between(500,750),
                    ease:'Bounce.easeOut'
                });
                tile.scaleX = 0;
                scene.tweens.add({
                    targets: tile,
                    scaleX : 1,
                    duration: Phaser.Math.Between(500, 750),
                    delay: Phaser.Math.Between(500,750),
                    ease:'Bounce.easeOut'
                });
                let y_target = tile.y - GRID_SIZE;
                scene.tweens.add({
                    targets: tile,
                    y: y_target,
                    yoyo: true,
                    delay: Phaser.Math.Between(500,750),
                    duration: Phaser.Math.Between(100,200),
                    ease: Phaser.Math.Easing.Quadratic.Out,
                });
            }
        }

    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let config = {
    backgroundColor: "#000000",
    type: Phaser.WEBGL,
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
    pipeline: { BlurPostFX },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: [ LoadScene, GameScene ]
};

let game = new Phaser.Game(config);
