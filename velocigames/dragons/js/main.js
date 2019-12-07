let game_model = {
    m_global_resources: {
        m_gold: 0,
        m_cows: 0,
    },
    m_village_area: new VillageArea(),
    m_selected_tile: null,
};

let layout_info = {
    m_score_height: 64,
    m_action_height: 64 * 2,
    m_cell_width: 64,
    m_cell_height: 64,
};

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    m_grid_size_x: 20,
    m_grid_size_y: 20,
    m_grid_color: 0xffffff,
    m_cell_width: layout_info.m_cell_width,
    m_cell_height: layout_info.m_cell_height,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'GameScene' });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
        this.load.image('farm_tile', 'assets/farm.png');
        this.load.image('mine_tile', 'assets/mine2.png');
        this.load.image('mountains_tile', 'assets/mountains.png');
        this.load.image('plains_tile', 'assets/plains.png');
        this.load.image('selection_overlay', 'assets/selection_box/selection_box.png');
        this.load.image('hover_overlay', 'assets/selection_box/selection_box_hover.png');
        this.load.spritesheet('terrain', 'assets/terrain-v7.png',
            { frameWidth: 32, frameHeight: 32 });
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
        this.m_tile_map_view.attachTileMap(
            game_model.m_village_area.m_tile_map);

        // Set camera bounds.
        this.cameras.main.setBounds(
            0, 0, 
            this.m_grid_size_x * this.m_cell_width,
            this.m_grid_size_y * this.m_cell_height);
        this.cameras.main.setPosition(0, layout_info.m_score_height, 0);
        this.cameras.main.setSize(
            game_width,
            game_height - layout_info.m_score_height - layout_info.m_action_height);

        this.m_cursor_keys = this.input.keyboard.createCursorKeys();
        this.m_cursor_keys.letter_left = this.input.keyboard.addKey("a");
        this.m_cursor_keys.letter_right = this.input.keyboard.addKey("d");
        this.m_cursor_keys.letter_up = this.input.keyboard.addKey("w");
        this.m_cursor_keys.letter_down = this.input.keyboard.addKey("s");
    },

    //--------------------------------------------------------------------------
    update: function()
    {
        if (this.m_cursor_keys.left.isDown
            || this.m_cursor_keys.letter_left.isDown)
        {
            this.cameras.main.scrollX -= 8;
        }
        if (this.m_cursor_keys.right.isDown
            || this.m_cursor_keys.letter_right.isDown)
        {
            this.cameras.main.scrollX += 8;
        }
        if (this.m_cursor_keys.up.isDown
            || this.m_cursor_keys.letter_up.isDown)
        {
            this.cameras.main.scrollY -= 8;
        }
        if (this.m_cursor_keys.down.isDown
            || this.m_cursor_keys.letter_down.isDown)
        {
            this.cameras.main.scrollY += 8;
        }
    }
});

let UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: true });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
        this.load.image('action_texture', 'assets/black_texture.jpg');
        this.load.image('score_texture', 'assets/white_leather_texture.jpg');
        this.load.image('coin', 'assets/coin/coin_straight_on.png');
        this.load.image('button_passive', 'assets/buttons/button_grey.png');
        this.load.image('button_active',
            'assets/buttons/button_grey_active.png');
        this.load.svg('volume_off',
            'assets/volume_off-24px.svg');
        this.load.svg('volume_on',
            'assets/volume_up-24px.svg');
        this.load.audio('bgm', 'assets/Suonatore_di_Liuto.mp3');
    },

    //--------------------------------------------------------------------------
    create_score_area: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;
        let game_scene = this.scene.get("GameScene");

        this.textures.get("score_texture").add(
            "score_area", 0, 0, 0, game_width, layout_info.m_score_height);
        let background = this.add.image(
            0, 0,
            "score_texture", "score_area");
        background.setOrigin(0, 0);

        let gold_text = this.add.text(
            50, 10, "Gold: 0", { font: "46px Arial", fill: "#000000" });
        this.add.image(
            30, layout_info.m_score_height / 2 + 2, "coin");
        let cows_text = this.add.text(
            400, 10, "Cows: 0", { font: "46px Arial", fill: "#000000" });

        game_scene.events.on('update_global_resources',
            function ()
            {
                gold_text.setText(
                    "Gold: " + game_model.m_global_resources.m_gold);
                cows_text.setText(
                    "Cows: " + game_model.m_global_resources.m_cows);
            }, this);

        this.create_volume_control();
    },

    //--------------------------------------------------------------------------
    create_volume_control: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;

        let bgm = this.sound.add('bgm');
        bgm.setLoop(true);
        this.sound.pauseOnBlur = false;

        let icon_size = 24;
        let icon_scale = 2;
        let icon_right_padding = 10;
        icon_size *= icon_scale;
        let volume_control = this.add.sprite(
            game_width - icon_size - icon_right_padding,
            (layout_info.m_score_height - icon_size) / 2, 'volume_off');
        volume_control.setOrigin(0, 0);
        volume_control.scale = icon_scale;

        volume_control.setInteractive();
        volume_control.my_state = {on:false};
        volume_control.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event)
            {
                event.stopPropagation();
                if (volume_control.my_state.on)
                {
                    volume_control.my_state.on = false;
                    volume_control.setTexture('volume_off');
                    bgm.stop()
                }
                else
                {
                    if (this.load.isLoading())
                    {
                        return;
                    }
                    bgm.play();
                    volume_control.my_state.on = true;
                    volume_control.setTexture('volume_on');
                }
            }, this);

    },

    //--------------------------------------------------------------------------
    create_action_area: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;
        let game_scene = this.scene.get("GameScene");
        let action_area_top = game_height - layout_info.m_action_height;

        this.textures.get("action_texture").add(
            "action_area", 0, 0, 0, game_width, layout_info.m_action_height);
        let background = this.add.image(
            0, action_area_top,
            "action_texture", "action_area");
        background.setOrigin(0, 0);

        let tile_label_text = this.add.text(
            40 + layout_info.m_cell_width / 2, action_area_top + 5,
            "", { font: "30px Arial", fill: "#FFFF00" });
        tile_label_text.setOrigin(0.5, 0);
        let action_state = {
            m_game_scene: game_scene,
            m_tile_game_object: null,
            m_destroyables: null,
        };
        game_scene.events.on("update_selected_tile",
            function (tile)
            {
                if (null !== action_state.m_tile_game_object)
                {
                    action_state.m_tile_game_object.destroy();
                    for (let key in action_state.m_destroyables)
                    {
                        let destroyable = action_state.m_destroyables[key];
                        destroyable.destroy();
                    }
                }

                game_model.m_selected_tile = tile;
                action_state.m_tile_game_object = tile.createGameObject(
                    this);
                action_state.m_tile_game_object.setPosition(
                    40 + layout_info.m_cell_width / 2,
                    action_area_top + 40 + layout_info.m_cell_height / 2);
                tile_label_text.setText(tile.getDisplayName());

                let actions = tile.getActions();
                for (let key in actions)
                {
                    if (null == action_state.m_destroyables)
                    {
                        action_state.m_destroyables = [];
                    }
                    let action = actions[key];
                    let button_text_str = action.getButtonText();
                    let botton_game_object = this.add.image(
                        300, layout_info.m_action_height / 2 + action_area_top,
                        "button_passive");
                    action_state.m_destroyables.push(botton_game_object);
                    let text_game_object = this.add.text(
                        300, layout_info.m_action_height / 2 + action_area_top,
                        button_text_str, { font: "20px Arial", fill: "#FFFFff", background:"#808080" });
                    text_game_object.setOrigin(0.5, 0.5);
                    action_state.m_destroyables.push(text_game_object);

                    botton_game_object.setInteractive();
                    botton_game_object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
                        function ()
                        {
                            botton_game_object.setTexture("button_active");
                        });
                    botton_game_object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
                        function ()
                        {
                            botton_game_object.setTexture("button_passive");
                        });
                    botton_game_object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                        function ()
                        {
                            text_game_object.setText(action.getActiveText());
                            // todo sleep
                            action.getExecuteFn()(action_state.m_game_scene);
                        })
                }

            }, this);
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        this.create_score_area();
        this.create_action_area();
    }
});

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#70D070',
    autoFocus: true,
    render: {pixelArt: true},
    scene: [ GameScene, UIScene ]
};

let game = new Phaser.Game(config);
