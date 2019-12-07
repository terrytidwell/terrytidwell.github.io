let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    grid_size_x: 20,
    grid_size_y: 20,
    grid_color: 0xffffff,
    cell_width: 64,
    cell_height: 64,

    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'GameScene' });
    },

    preload: function ()
    {
        this.load.image('bg', 'assets/sky.png');
        this.load.image('crate', 'assets/star.png');
        this.load.image('farm', 'assets/Farm.png');
    },

    create: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;

        // Background image.
        //this.add.image(game_width / 2, game_height / 2, 'bg');

        // Stars.
        for (let i = 0; i < 64; i++)
        {
            let x = Phaser.Math.Between(0, game_width);
            let y = Phaser.Math.Between(0, game_height);

            let box = this.add.image(x, y, 'crate');

            //  Make them all input enabled
            box.setInteractive();
        }

        // Draw map exterior rectangle.
        let graphics = this.add.graphics();
        graphics.lineStyle(2, this.grid_color, 1);
        graphics.strokeRect(0, 0, this.grid_size_x * this.cell_width, this.grid_size_y * this.cell_height);

        graphics.beginPath();
        // Draw vertical lines.
        for (let i = 1; i < this.grid_size_x; i++)
        {
            graphics.moveTo(i * this.cell_width, 0);
            graphics.lineTo(i * this.cell_width, this.grid_size_y * this.cell_height);
        }

        // Draw horizontal lines.
        for (let j = 1; j < this.grid_size_y; j++)
        {
            graphics.moveTo(0, j * this.cell_height);
            graphics.lineTo(this.grid_size_x * this.cell_width, j * this.cell_height);
        }
        graphics.closePath();
        graphics.strokePath();

        // Add text to each cell of map.
        for (let i = 0; i < this.grid_size_x; i++)
        {
            for (let j = 0; j < this.grid_size_y; j++)
            {
                let text = this.add.text((i + 0.5) * this.cell_width, (j + 0.5) * this.cell_height, i + "," + j);
                text.setOrigin(0.5, 0.5);
            }
        }

        // Set camera bounds.
        this.cameras.main.setBounds(0, 0, this.grid_size_x * this.cell_width, this.grid_size_y * this.cell_height);

        // Add a farm image to a cell.
        this.add_image_to_cell(3, 3, "farm");

        // Setup click handler.
        this.input.on('gameobjectup', this.clickHandler, this);
        this.cursors = this.input.keyboard.createCursorKeys();
    },

    add_image_to_cell(i, j, name)
    {
        this.add.sprite(this.cell_width * (i + 0.5), this.cell_height * (j + 0.5), name)
    },

    clickHandler: function (pointer, box)
    {
        //  Disable our box
        box.input.enabled = false;
        box.setVisible(false);

        //  Dispatch a Scene event
        this.events.emit('addScore');
    },

    update: function()
    {
        if (this.cursors.left.isDown)
        {
            this.cameras.main.scrollX -= 4;
        }
        else if (this.cursors.right.isDown)
        {
            this.cameras.main.scrollX += 4;
        }
        else if (this.cursors.up.isDown)
        {
            this.cameras.main.scrollY -= 4;
        }
        else if (this.cursors.down.isDown)
        {
            this.cameras.main.scrollY += 4;
        }
    }
});

let UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function ()
        {
            Phaser.Scene.call(this, { key: 'UIScene', active: true });

            this.score = 0;
        },

    preload: function ()
    {
        this.load.image('platform', 'assets/platform.png');
    },

    create: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;

        // Our Text object to display the Score
        let info = this.add.text(10, 10, 'Score: 0', { font: '48px Arial', fill: '#000000' });

        // Draw actions at the bottom of the screen here.
        let platform = this.add.sprite(game_width / 2, game_height - 50, "platform");

        // Grab a reference to the Game Scene
        let ourGame = this.scene.get('GameScene');

        // Listen for events from it
        ourGame.events.on('addScore', function () {

            this.score += 10;

            info.setText('Score: ' + this.score);

        }, this);
    }
});

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#70D070',
    parent: 'phaser-example',
    scene: [ GameScene, UIScene ]
};

let game = new Phaser.Game(config);
