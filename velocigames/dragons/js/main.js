// todo: container object
let villageArea = new VillageArea();

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    m_grid_size_x: 20,
    m_grid_size_y: 20,
    m_grid_color: 0xffffff,
    m_cell_width: 64,
    m_cell_height: 64,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'GameScene' });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
        this.load.image('bg', 'assets/sky.png');

        this.load.image('farm_tile', 'assets/Farm.png');
        this.load.image('mine_tile', 'assets/mine2.png');
        this.load.image('mountains_tile', 'assets/mountains.png');
        this.load.image('plains_tile', 'assets/plains.png');
        this.load.image('selection_overlay', 'assets/selection_box.png');
    },

    //--------------------------------------------------------------------------
    addGridOverlay: function ()
    {
        // Draw map exterior rectangle.
        let graphics = this.add.graphics();
        graphics.lineStyle(2, this.m_grid_color, 1);
        graphics.strokeRect(0, 0, 
            this.m_grid_size_x * this.m_cell_width, 
            this.m_grid_size_y * this.m_cell_height);

        graphics.beginPath();
        // Draw vertical lines.
        for (let i = 1; i < this.m_grid_size_x; i++)
        {
            graphics.moveTo(i * this.m_cell_width, 0);
            graphics.lineTo(i * this.m_cell_width, 
                this.m_grid_size_y * this.m_cell_height);
        }

        // Draw horizontal lines.
        for (let j = 1; j < this.m_grid_size_y; j++)
        {
            graphics.moveTo(0, j * this.m_cell_height);
            graphics.lineTo(this.m_grid_size_x * this.m_cell_width, 
                j * this.m_cell_height);
        }
        graphics.closePath();
        graphics.strokePath();

        // Add text to each cell of map.
        for (let i = 0; i < this.m_grid_size_x; i++)
        {
            for (let j = 0; j < this.m_grid_size_y; j++)
            {
                let text = this.add.text(
                    (i + 0.5) * this.m_cell_width, 
                    (j + 0.5) * this.m_cell_height, 
                    i + "," + j);
                text.setOrigin(0.5, 0.5);
            }
        }
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;

        this.m_tile_map_view = new TileMapView(
            this, this.m_cell_width, this.m_cell_height);
        this.m_tile_map_view.attachTileMap(villageArea.m_tile_map);

        // Set camera bounds.
        this.cameras.main.setBounds(
            0, 0, 
            this.m_grid_size_x * this.m_cell_width, 
            this.m_grid_size_y * this.m_cell_height);

        this.m_cursor_keys = this.input.keyboard.createCursorKeys();
    },

    //--------------------------------------------------------------------------
    clickHandler: function (pointer, box)
    {
        //  Disable our box
        box.input.enabled = false;
        box.setVisible(false);

        //  Dispatch a Scene event
        this.events.emit('addScore');
    },

    //--------------------------------------------------------------------------
    update: function()
    {
        if (this.m_cursor_keys.left.isDown)
        {
            this.cameras.main.scrollX -= 4;
        }
        else if (this.m_cursor_keys.right.isDown)
        {
            this.cameras.main.scrollX += 4;
        }
        else if (this.m_cursor_keys.up.isDown)
        {
            this.cameras.main.scrollY -= 4;
        }
        else if (this.m_cursor_keys.down.isDown)
        {
            this.cameras.main.scrollY += 4;
        }
    }
});

let UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: true });

        this.score = 0;
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
        this.load.image('platform', 'assets/platform.png');
    },

    //--------------------------------------------------------------------------
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
    autoFocus: true,
    scene: [ GameScene, UIScene ]
};

let game = new Phaser.Game(config);
