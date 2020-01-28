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
        this.load.image('block', 'assets/block.png');
    },

    addBlock: function(x, y)
    {
        let G = this.myGameState;
        let block = this.add.sprite(x, y, 'block').setScale(4);
        G.platforms.add(block);
        block.body.setSize(4*16,4*16);
        block.body.setOffset(-24,-24)
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        this.myGameState = {
            platforms: null,
            player : null,
            cursors : null,
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

        G.platforms = this.physics.add.staticGroup();
        this.addBlock(400,300);
        this.addBlock(464,300);
        this.addBlock(528,300);
        this.addBlock(596,300-64);
        this.addBlock(596,300-128);
        G.player = this.physics.add.sprite(400, 150, 'simon1').setScale(4);
        //G.player.body.setSize(16*4,32*4);
        G.cursors = this.input.keyboard.createCursorKeys();

        G.cursors.letter_left = this.input.keyboard.addKey("a");
        G.cursors.letter_right = this.input.keyboard.addKey("d");
        G.cursors.letter_up = this.input.keyboard.addKey("w");
        G.cursors.letter_down = this.input.keyboard.addKey("s");

        let camera = this.cameras.main;
        camera.startFollow(G.player);

        this.physics.add.collider(G.player, G.platforms);
    },

    //--------------------------------------------------------------------------
    update: function()
    {
        let G = this.myGameState;

        if (G.cursors.left.isDown )
        {
            G.player.setFlipX(false);
            G.player.x = G.player.x - 2;
            G.player.anims.play('walk', true)
        }
        else if (G.cursors.right.isDown)
        {
            G.player.setFlipX(true);
            G.player.x = G.player.x + 2;
            G.player.anims.play('walk', true)
        }
        else
        {
            G.player.anims.stop();
            G.player.setTexture('simon1');
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
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: [ GameScene ]
};

let game = new Phaser.Game(config);