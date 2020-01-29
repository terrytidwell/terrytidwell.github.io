let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    m_grid_color: 0xffffff,

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
    },

    addBlock: function(group, x, y)
    {
        let block = this.add.sprite(x, y, 'block').setScale(4);
        group.add(block);
        block.body.setSize(4*16,4*16);
        block.body.setOffset(-24,-24)
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
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

        G.platforms = this.physics.add.staticGroup();
        G.breakable_platforms = this.physics.add.staticGroup();
        this.addBlock(G.breakable_platforms, 400-64*6,300-64);
        this.addBlock(G.breakable_platforms, 400-64*6,300-128);

        this.addBlock(G.platforms, 400-64*6,300);
        this.addBlock(G.platforms, 400-64*7,300);
        this.addBlock(G.platforms, 400-64*8,300);
        this.addBlock(G.platforms, 400-64*5,300);
        this.addBlock(G.platforms, 400-64*4,300);
        this.addBlock(G.platforms, 400,300);
        this.addBlock(G.platforms, 400-64,300+128);
        this.addBlock(G.platforms, 400-128,300+196);
        this.addBlock(G.platforms, 400-196,300+196);
        this.addBlock(G.platforms, 464,300);
        this.addBlock(G.platforms, 528,300);

        this.addBlock(G.platforms, 596,300-128);
        let bg = this.physics.add.staticGroup();
        this.addBlock(bg, 596,300-64);

        G.player.sprite = this.physics.add.sprite(400, 100, 'simon1').setScale(4);
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
        //G.player.sprite.body.setSize(16*4,32*4);
        
        G.cursors = this.input.keyboard.createCursorKeys();

        G.cursors.letter_left = this.input.keyboard.addKey("a");
        G.cursors.letter_right = this.input.keyboard.addKey("d");
        G.cursors.letter_up = this.input.keyboard.addKey("w");
        G.cursors.letter_down = this.input.keyboard.addKey("s");

        let camera = this.cameras.main;
        camera.startFollow(G.player.sprite);

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
    type: Phaser.AUTO,
    render: {
        pixelArt: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1024+256 },
            debug: false
        }
    },
    scene: [ GameScene ]
};

let game = new Phaser.Game(config);