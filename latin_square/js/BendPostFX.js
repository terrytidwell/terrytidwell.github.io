const fragShader = `
#define SHADER_NAME LAZER_FS
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
uniform vec2 uResolution;
varying vec2 outTexCoord;
#define PI 0.01
void main()
{
    vec2 p = (gl_FragCoord.xy / uResolution.xy) - 0.5;
    float sx = 0.2 * sin(25.0 * p.y - uTime);
    float dy = 2.9 / (20.0 * abs(p.y - sx));
    vec4 pixel = texture2D(uMainSampler, outTexCoord);
    gl_FragColor = pixel * vec4((p.x + 0.5) * dy, 0.5 * dy, dy - 1.65, pixel.a);
}
`;

class LazersPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            renderTarget: true,
            fragShader,
            uniforms: [
                'uProjectionMatrix',
                'uMainSampler',
                'uTime',
                'uResolution'
            ]
        });
    }

    onBoot ()
    {
        this.set2f('uResolution', this.renderer.width, this.renderer.height);
    }

    onPreRender ()
    {
        this.set1f('uTime', this.game.loop.time / 1000);
    }
};

const fragShader2 = `
#define SHADER_NAME HUE_ROTATE_FS
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uSpeed;
varying vec2 outTexCoord;
void main()
{
    float c = cos(uTime * uSpeed);
    float s = sin(uTime * uSpeed);
    mat4 r = mat4(0.299, 0.587, 0.114, 0.0, 0.299, 0.587, 0.114, 0.0, 0.299, 0.587, 0.114, 0.0, 0.0,  0.0, 0.0, 1.0);
    mat4 g = mat4(0.701, -0.587, -0.114, 0.0, -0.299, 0.413, -0.114, 0.0, -0.300, -0.588, 0.886, 0.0, 0.0, 0.0, 0.0, 0.0);
    mat4 b = mat4(0.168, 0.330, -0.497, 0.0, -0.328, 0.035, 0.292, 0.0, 1.250, -1.050, -0.203, 0.0, 0.0, 0.0, 0.0, 0.0);
    mat4 hueRotation = r + g * c + b * s;
    gl_FragColor = texture2D(uMainSampler, outTexCoord) * hueRotation;
}
`;

class HueRotatePostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            name: 'HueRotatePostFX',
            fragShader2,
            uniforms: [
                'uMainSampler',
                'uTime',
                'uSpeed'
            ]
        });

        this.speed = 1;
    }

    onPreRender ()
    {
        this.setTime('uTime');
        this.set1f('uSpeed', this.speed);
    }
}