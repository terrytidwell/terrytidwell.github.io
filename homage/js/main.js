const SCREEN_WIDTH = 832;
const SCREEN_HEIGHT = 576;
const GRID_SIZE = 64;
const PNG_GRID_SIZE = 16;
const PNG_TO_GRID_SCALE = GRID_SIZE/PNG_GRID_SIZE;

function delta_adjustment(object_size)
{
    return (PNG_GRID_SIZE - GRID_SIZE)/2;
}

function fix_object(object, width, height)
{
    object.setScale(PNG_TO_GRID_SCALE);
    object.body.setSize(width, height);
    let delta_x = delta_adjustment(width);
    let delta_y = delta_adjustment(height);
    object.body.setOffset(delta_x, delta_y);
}

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'GameScene', active: false });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
        this.load.image('simon1', 'assets/simon1.png');
        this.load.image('simon2', 'assets/simon2.png');
        this.load.image('simon3', 'assets/simon3.png');
        this.load.image('hit', 'assets/hit.png');
        this.load.image('simon_ducking', 'assets/simon_ducking.png');
        this.load.image('ducking_whip1', 'assets/ducking_whip1.png');
        this.load.image('ducking_whip2', 'assets/ducking_whip2.png');
        this.load.image('ducking_whip3', 'assets/ducking_whip3.png');
        this.load.image('standing_whip1', 'assets/standing_whip1.png');
        this.load.image('standing_whip2', 'assets/standing_whip2.png');
        this.load.image('standing_whip3', 'assets/standing_whip3.png');
        this.load.image('whip1', 'assets/whip1.png');
        this.load.image('whip2', 'assets/whip2.png');
        this.load.image('whip3', 'assets/whip3.png');
        this.load.image('block', 'assets/block.png');
        this.load.image('column_left', 'assets/column_left.png');
        this.load.image('column_right', 'assets/column_right.png');
    },

    addBlock: function(group, x, y)
    {
        let block = this.add.sprite(x, y, 'block').setScale(PNG_TO_GRID_SCALE);
        group.add(block);
        fix_object(block, GRID_SIZE, GRID_SIZE);
        return block;
    },

    addVerticalBlock: function(group, x, y)
    {
        let block = this.addBlock(group, x, y);
        block.body.checkCollision.up = false;
        block.body.checkCollision.down = false;
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        let map = [
            [1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1],
            [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
            [1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1],
            [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        this.myGameState = {
            platforms: null,
            player : {
                sprite : null,
                ready_to_jump : false,
                jumping : false,
                ducking : false,
                attacking : false,
                ready_to_attack : false,
                hit : false,
                whip1 : null,
                whip2 : null,
                whip3 : null,
            },
            cursors : null,
            whips: null
		};
        let G = this.myGameState;
		this.anims.create({
			key: 'walk',
			frames: [
				{ key: 'simon2' },
				{ key: 'simon3' },
				{ key: 'simon2' },
				{ key: 'simon1' }
			],
			frameRate: 4,
            repeat: -1
		});
        this.anims.create({
            key: 'ducking_whip',
            frames: [
                { key: 'ducking_whip1' },
                { key: 'ducking_whip2' },
                { key: 'ducking_whip3' }
            ],
            frameRate: 8,
            repeat: 0
        });
        this.anims.create({
            key: 'standing_whip',
            frames: [
                { key: 'standing_whip1' },
                { key: 'standing_whip2' },
                { key: 'standing_whip3' }
            ],
            frameRate: 8,
            repeat: 0
        });

        //let bg = this.physics.add.staticGroup();
        G.platforms = this.physics.add.staticGroup();
        G.breakable_platforms = this.physics.add.staticGroup();

        for (let y = 0; y < 16; y++)
        {
            if (y === 13 || y === 9 || y === 4 ) {
                continue;
            }
            this.add.sprite(6 * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE);
            this.add.sprite(7 * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE).setFlipX(true);
        }

        for (let y = 11; y < 17; y++)
        {
            if (y === 14) {
                continue;
            }
            this.add.sprite(14 * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE);
            this.add.sprite(15 * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE).setFlipX(true);
        }

        /*
        let scene_height = SCREEN_HEIGHT * 2;
        let scene_width = SCREEN_WIDTH * 2;
        for (let x = 0; x < scene_width / GRID_SIZE; x++) {
            this.addBlock(G.platforms, x*GRID_SIZE+GRID_SIZE/2,GRID_SIZE/2);
            if (Math.random() < 0.8) {
                this.addBlock(G.platforms, x * GRID_SIZE + GRID_SIZE / 2, (scene_height / GRID_SIZE - 1) * GRID_SIZE + GRID_SIZE / 2);
            }
        }
        for (let y = 1; y < (scene_width / GRID_SIZE - 1); y++) {
            this.addVerticalBlock(G.platforms, GRID_SIZE/2, y*GRID_SIZE+GRID_SIZE/2);
            this.addVerticalBlock(G.platforms, (scene_width / GRID_SIZE - 1)*GRID_SIZE+GRID_SIZE/2, y*GRID_SIZE+GRID_SIZE/2);
        }
        */

        let scene_height = map.length * GRID_SIZE;
        let scene_width = 0;
        for (let y = 0; y < map.length; ++y)
        {
            scene_width = Math.max(scene_width,  map[y].length*GRID_SIZE);
            for (let x = 0; x < map[y].length; ++x)
            {
                if (map[y][x] === 1)
                {
                    let block = this.addBlock(G.platforms, x*GRID_SIZE+GRID_SIZE/2, y*GRID_SIZE+GRID_SIZE/2);
                    if (y > 0 && map[y-1][x] === 1)
                    {
                        block.body.checkCollision.up = false;
                    }
                    if (x > 0 && map[y][x-1] === 1)
                    {
                        block.body.checkCollision.left = false;
                    }
                    if (x + 1 < map[y].length > 0 && map[y][x+1] === 1)
                    {
                        block.body.checkCollision.right = false;
                    }
                    if (y + 1 < map.length > 0 && map[y+1][x] === 1)
                    {
                        block.body.checkCollision.down = false;
                    }
                }
            }
        }

        //set up player
        G.player.sprite = this.physics.add.sprite(scene_width - 128, scene_height - 64, 'simon1').setScale(4);
        G.player.sprite.originX = 0;
        G.player.sprite.originY = 1;
        G.player.whip1 = this.physics.add.sprite(G.player.sprite.body.right, G.player.sprite.body.top, 'whip1').setScale(4);
        G.player.whip1.visible = false;
        G.player.whip1.body.allowGravity = false;
        G.player.whip1.body.immovable = true;
        G.player.whip2 = this.physics.add.sprite(G.player.sprite.body.right, G.player.sprite.body.top, 'whip2').setScale(4);
        G.player.whip2.visible = false;
        G.player.whip2.body.allowGravity = false;
        G.player.whip2.body.immovable = true;
        G.player.whip3 = this.physics.add.sprite(G.player.sprite.body.left - 44*4, G.player.sprite.body.top + 8*4, 'whip3').setScale(4);
        G.player.whip3.visible = false;
        G.player.whip3.body.allowGravity = false;
        G.player.whip3.body.immovable = true;
        G.player.whip3.body.setOffset(0,-1);
        G.whips = this.physics.add.group();
        G.whips.defaults.setAllowGravity = false;
        G.whips.defaults.setImmovable = true;
        G.whips.add(G.player.whip1);
        G.whips.add(G.player.whip2);
        G.whips.add(G.player.whip3);

        //set up input
        G.cursors = this.input.keyboard.createCursorKeys();
        G.cursors.letter_left = this.input.keyboard.addKey("a");
        G.cursors.letter_right = this.input.keyboard.addKey("d");
        G.cursors.letter_up = this.input.keyboard.addKey("w");
        G.cursors.letter_down = this.input.keyboard.addKey("s");

        //set up camera
        let camera = this.cameras.main;
        camera.startFollow(G.player.sprite);
        camera.setBounds(0, 0, scene_width, scene_height);

        //set up collider groups
        this.physics.add.collider(G.player.sprite, G.platforms);
        this.physics.add.collider(G.player.sprite, G.breakable_platforms);
        this.physics.add.overlap(G.whips, G.breakable_platforms, this.whipHit, null, this);
    },

    whipHit: function(whip, breakable_platform) {
        if (whip.visible) {
            breakable_platform.destroy();
        }
    },

    playerDamage: function() {
        let G = this.myGameState;
        let dx = -196;
        if(!G.player.sprite.flipX) {
            dx = dx * -1;
        }
        G.player.sprite.anims.stop();
        G.player.sprite.setTexture('hit');
        G.player.ducking = false;
        G.player.attacking = false;
        G.player.sprite.setSize(16, 32);
        G.player.hit = true;
        G.player.sprite.setVelocityY(-608/2);
        G.player.sprite.setVelocityX(dx);
    },

    //--------------------------------------------------------------------------
    update: function() {
        let G = this.myGameState;

        G.player.whip1.body.x = G.player.sprite.body.right;
        G.player.whip1.setFlipX(G.player.sprite.flipX);
        if (G.player.sprite.flipX)
        {
            G.player.whip1.body.x = G.player.sprite.body.left - 64;
        }
        G.player.whip1.body.y = G.player.sprite.body.top;

        G.player.whip2.body.x = G.player.sprite.body.right;
        G.player.whip2.setFlipX(G.player.sprite.flipX);
        if (G.player.sprite.flipX)
        {
            G.player.whip2.body.x = G.player.sprite.body.left - 64;
        }
        G.player.whip2.body.y = G.player.sprite.body.top;

        G.player.whip3.body.x = G.player.sprite.body.left - 44*4;
        G.player.whip3.setFlipX(G.player.sprite.flipX);
        if (G.player.sprite.flipX)
        {
            G.player.whip3.body.x = G.player.sprite.body.right;
        }
        G.player.whip3.body.y = G.player.sprite.body.top + 8*4;

        if (!G.cursors.up.isDown) {
            G.player.ready_to_jump = true
        }
        if (!G.cursors.letter_left.isDown) {
            G.player.ready_to_attack = true;
        }

        if (!G.player.hit && G.cursors.letter_left.isDown && G.player.ready_to_attack && !G.player.attacking)
        {
            G.player.attacking = true;
            G.player.ready_to_attack = false;
            let attack_end = function () {
                G.player.attacking = false;
                G.player.whip1.visible = false;
                G.player.whip2.visible = false;
                G.player.whip3.visible = false;
            };
            let attack_update = function (animation, frame, gameObject) {
                if (frame.index === 2) {
                    G.player.whip1.visible = false;
                    G.player.whip2.visible = true;
                } else if (frame.index === 3) {
                    G.player.whip2.visible = false;
                    G.player.whip3.visible = true;
                }
            };
            G.player.sprite.on('animationcomplete-standing_whip', attack_end);
            G.player.sprite.on('animationcomplete-ducking_whip', attack_end);
            G.player.sprite.on('animationupdate-ducking_whip', attack_update);
            G.player.sprite.on('animationupdate-standing_whip', attack_update);
            if (!G.player.ducking) {
                G.player.sprite.anims.play('standing_whip', false);
            } else {
                G.player.sprite.anims.play('ducking_whip', false);
            }

            G.player.whip1.visible = true;
        }

        if (G.player.attacking && G.player.sprite.body.touching.down)
        {
            G.player.sprite.setVelocityX(0);
        }

        if (!G.player.attacking && !G.player.hit)
        {
            if (G.cursors.left.isDown) {
                G.player.sprite.setFlipX(false);
                G.player.sprite.setVelocityX(-196);
                if (!G.player.jumping) {
                    G.player.sprite.anims.play('walk', true);
                    G.player.ducking = false;
                    G.player.sprite.setSize(16, 32);
                }
            } else if (G.cursors.right.isDown) {
                G.player.sprite.setFlipX(true);
                G.player.sprite.setVelocityX(196);
                if (!G.player.jumping) {
                    G.player.sprite.anims.play('walk', true);
                    G.player.ducking = false;
                    G.player.sprite.setSize(16, 32);
                }
            } else {
                G.player.sprite.anims.stop();
                G.player.sprite.setVelocityX(0);
                if (!G.player.jumping) {
                    G.player.sprite.setTexture('simon1');
                    G.player.ducking = false;
                    G.player.sprite.setSize(16, 32);
                }
            }

            if (G.player.sprite.body.touching.down) {
                if (G.player.jumping) {
                    G.player.jumping = false;
                } else if (G.cursors.up.isDown && G.player.ready_to_jump) {
                    G.player.jumping = true;
                    G.player.ready_to_jump = false;
                    G.player.sprite.anims.stop();
                    G.player.sprite.setTexture('simon_ducking');
                    G.player.ducking = true;
                    G.player.sprite.setSize(16, 24);
                    G.player.sprite.setVelocityY(-512 - 96);
                }
                else if (G.cursors.down.isDown) {
                    G.player.sprite.anims.stop();
                    G.player.sprite.setTexture('simon_ducking');
                    G.player.ducking = true;
                    G.player.sprite.setSize(16, 24);
                    G.player.sprite.setVelocityX(0);
                }
            } else {
                if (!G.player.jumping) {
                    G.player.sprite.anims.stop();
                    G.player.sprite.setTexture('simon1');
                    G.player.ducking = false;
                    G.player.sprite.setSize(16, 32);
                } else {
                    G.player.sprite.anims.stop();
                    G.player.sprite.setTexture('simon_ducking');
                    G.player.ducking = true;
                    G.player.sprite.setSize(16, 24);
                }
            }
        }

        if (!G.player.hit && G.cursors.letter_right.isDown)
        {
            this.playerDamage();
        }
        if (G.player.hit)
        {
            if (G.player.sprite.body.touching.down)
            {
                G.player.hit = false;
            }
        }
    }
});

let config = {
    // backgroundColor: '#70D070',
    type: Phaser.AUTO,
    render: {
        pixelArt: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 20 * GRID_SIZE },
            debug: false
        }
    },
    scene: [ GameScene ]
};

let game = new Phaser.Game(config);