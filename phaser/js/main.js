let LevelArray = [
    {
        name: "Test Level (Hard)",
        //   0                   1                   2                   3
        //   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //00
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //01
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //02
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //03
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //04
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //05
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1], //06
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //07
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //08
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //09
            [1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //10
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //11
            [1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //12
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //13
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //14
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //15
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //16
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //17
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //18
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  //19
        ],
        create: function (screen)
        {
            let G = screen.myGameState;
            screen.addBreakable(26, 16);
            screen.addBreakable(25, 16);
            screen.addBreakable(24, 16);
            screen.addBreakable(24, 15);
            screen.addStar(25, 15);
            screen.addBreakable(26, 15);
            screen.addBreakable(26, 14);
            screen.addBreakable(25, 14);
            screen.addBreakable(24, 14);

            screen.addBreakable(26, 11);
            screen.addBreakable(25, 11);
            screen.addBreakable(24, 11);
            screen.addBreakable(24, 10);
            screen.addStar(25, 10);
            screen.addBreakable(26, 10);
            screen.addBreakable(26, 9);
            screen.addBreakable(25, 9);
            screen.addBreakable(24, 9);

            screen.addBumper(15, 5);
            screen.addBumper(18, 1);
            screen.addBumper(21, 5);
            screen.addBumper(24, 1);
            screen.addBumper(27, 5);

            screen.addBomb(27, 17);

            for (let x = 1; x < 14; x++) {
                for (let y = 1; y < 10; y++)
                {
                    screen.addStar(x,y);
                }
            }

            screen.addStar(29, 1 );
            screen.addStar(29, 2 );
            screen.addStar(29, 3 );
            screen.addStar(29, 4 );
            screen.addStar(29, 5 );

        },
        player_x: 2,
        player_y: 14
    },
    {
        name: "Maze",
        //   0                   1                   2                   3
        //   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //00
            [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //01
            [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //02
            [1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1], //03
            [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1], //04
            [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1], //05
            [1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //06
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //07
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //08
            [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //09
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1], //10
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1], //11
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1], //12
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1], //13
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1], //14
            [1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,0,0,1], //15
            [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1], //16
            [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1], //17
            [1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,0,0,1,0,0,1], //18
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1], //19
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1], //20
            [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //21
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //22
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //23
            [1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], //24
            [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1], //25
            [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1], //26
            [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1], //27
            [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1], //28
            [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1], //29
            [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1], //30
            [1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1], //31
            [1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1], //32
            [1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1], //33
            [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1], //34
            [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1], //35
            [1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1], //36
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1], //37
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1], //38
            [1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1], //39
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //40
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], //41
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  //42
        ],
        create: function (screen)
        {
            screen.addBomb(1,41);
            screen.addBomb(32, 1);
            screen.addBomb(32, 41);
            for ( let y = 0; y < LevelArray[currentLevelIndex].map.length; ++y )
            {
                for (let x = 0; x < LevelArray[currentLevelIndex].map[y].length; ++x )
                {
                    if (Math.random() < 0.1) {
                        screen.addStar(x, y);
                    }
                }
            }
        },
        player_x: 1,
        player_y: 1,
    },
    {
        name: "Broken Physics Tests Case",
        //   0                   1                   2                   3
        //   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3
        map: [
            [1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1],
        ],
        create: function (screen)
        {
            screen.addLedge(3,3,4,1);
            screen.addLedge(7,3,1,4);
            screen.addLedge(4,7,4,1);
            screen.addLedge(3,4,1,4);
            screen.addBomb(1,41);
            screen.addBomb(32, 1);
            screen.addBomb(32, 41);

            screen.myGameState.player.setX(44);
            screen.myGameState.player.setY(309);
            screen.myGameState.gravity = 117;
            screen.myGameState.gravity += screen.myGameState.MAX_ROTATION/2;
            if (screen.myGameState.gravity >= screen.myGameState.MAX_ROTATION)
            {
                screen.myGameState.gravity -= screen.myGameState.MAX_ROTATION;
            }
            screen.setGravity();
            screen.myGameState.gameOver = true;
        },
        player_x: 5,
        player_y: 1,
    },
];

let currentLevelIndex = 0;

let  LevelSelectScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'LevelSelectScene', active: true });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;
        this.cameras.main.scrollY = 0;
        this.cameras.main.setBackgroundColor("#000000");
        let offset = 18;

        this.play_button = this.add.text(
            game_width / 2, game_height / 2,
            LevelArray[currentLevelIndex].name, { fontSize: '24px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);
        this.play_button.alpha = 0.5;
        this.play_button.setInteractive();
        this.play_button.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.play_button.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.play_button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                this.scene.start('GameScene');
                this.scene.start('UIScene');
                this.scene.stop('LevelSelectScene');
            }, this
        );

        this.previous = this.add.text(this.play_button.x - this.play_button.width / 2 - 12,
            game_height / 2,
            "<<", { fontSize: '24px', fill: '#FFF' })
            .setOrigin(1 , 0.5);
        this.previous.setInteractive();
        this.previous.alpha = 0.5;
        this.previous.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.previous.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.previous.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                currentLevelIndex-=1;
                if (currentLevelIndex < 0)
                {
                    currentLevelIndex = LevelArray.length - 1;
                }
                this.play_button.setText(LevelArray[currentLevelIndex].name);
                this.previous.setX(this.play_button.x - this.play_button.width/2 - 12);
                this.next.setX(this.play_button.x + this.play_button.width/2 + 12);
            }, this
        );

        this.next = this.add.text(this.play_button.x + this.play_button.width / 2 + 12,
            game_height / 2,
            ">>", { fontSize: '24px', fill: '#FFF' })
            .setOrigin(0 , 0.5);
        this.next.setInteractive();
        this.next.alpha = 0.5;
        this.next.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.next.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.next.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                currentLevelIndex+=1;
                if (currentLevelIndex >= LevelArray.length)
                {
                    currentLevelIndex = 0;
                }
                this.play_button.setText(LevelArray[currentLevelIndex].name);
                this.previous.setX(this.play_button.x - this.play_button.width/2 - 12);
                this.next.setX(this.play_button.x + this.play_button.width/2 + 12);
            }, this
        );
    },

    //--------------------------------------------------------------------------
    update: function()
    {
        /*
        this.previous.setX(this.play_button.x - this.play_button.width/2 - 12);
        this.next.setX(this.play_button.x + this.play_button.width/2 + 12);
         */
    },
});

let UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: false });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        let game_width = this.game.config.width;
        this.back_button = this.add.text(
            0, 0,
            "<<", { fontSize: '24px', fill: '#FFF' })
            .setOrigin(0, 0);
        this.back_button.alpha = 0.5;
        this.back_button.setInteractive();
        this.back_button.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.back_button.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.back_button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                this.scene.stop('GameScene');
                this.scene.stop('UIScene');
                this.scene.start('LevelSelectScene');
            }, this
        );
        this.score = this.add.text(
            game_width, 0, "0/0", { fontSize: '24px', fill: '#FFF' })
            .setOrigin(1, 0);
    },

    //--------------------------------------------------------------------------
    update: function()
    {
        let GameScene = this.scene.get('GameScene');
        if (GameScene.myGameState && GameScene.myGameState.stars)
        {
            let stars = GameScene.myGameState.stars;
            this.score.setText(stars.countActive(false) + "/"+stars.getLength(true));
        }

    },
});

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
        this.load.image('sky', 'assets/sky.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('blocks', 'assets/stone.png', { frameWidth: 32, frameHeight: 32 });
    },

//--------------------------------------------------------------------------
    //add a ledge of blocks, at x,y block offset and height by width blocks
    addLedge : function (x,y,width,height)
    {
        let group = this.myGameState.platforms;
        let block_size=32;
        let ledge_width = width * block_size;
        let ledge_height = height * block_size;
        let center_x = x * block_size + ledge_width/2;
        let center_y = y * block_size + ledge_height/2;
        let platform = this.add.tileSprite(center_x, center_y, ledge_width, ledge_height, 'blocks', 1);
        let colors = [
            0xefc7c2,
            0xffe5d4,
            0xbfd3c1,
            0x68a691,
            0x695f5d
        ];
        platform.setTint(colors[Math.floor(Math.random()*colors.length)]);
        group.add(platform);
    },

    //--------------------------------------------------------------------------
    addBomb: function (x, y)
    {
        let group = this.myGameState.bombs;
        let block_size = 32;
        group.create(block_size * x + block_size/2,block_size * y + block_size/2, 'bomb').setBounce(0.2);
    },

    //--------------------------------------------------------------------------
    addBreakable: function (x, y)
    {
        let group = this.myGameState.breakables;
        let block_size = 32;
        group.create(block_size * x + block_size/2,block_size * y + block_size/2, 'blocks',5).setImmovable(true);
    },

    //--------------------------------------------------------------------------
    addBumper: function (x, y)
    {
        let group = this.myGameState.bumpers;
        let block_size = 32;
        group.create(block_size * x + block_size/2,block_size * y + block_size/2, 'blocks',25).setImmovable(true);
    },

    //--------------------------------------------------------------------------
    addStar: function (x, y)
    {
        let group = this.myGameState.stars;
        let block_size = 32;
        group.create(block_size * x + block_size/2,block_size * y + block_size/2, 'star').setImmovable(true);
    },

    //--------------------------------------------------------------------------
    calculateImpact: function (player, breakables)
    {
        let pv = player.body.velocity;
        let speed = player.body.speed;
        //alert("speed?"+pv.length()+"=?"+speed);
        let pp = player.body.center;
        let bp = breakables.body.center;
        let dp = pp.subtract(bp);
        let impact = dp.dot(pv);
        //alert("impact="+impact);
        if (speed > 500)
        {
            breakables.disableBody(true, true);
        }
    },

    //--------------------------------------------------------------------------
    bounce: function (player, bumper)
    {
        let px = player.body.x;
        let py = player.body.y;
        let bx = bumper.body.x;
        let by = bumper.body.y;
        let dx = bx - px;
        let dy = by - py;
        let dist = Math.sqrt(dx * dx + dy * dy);
        dx = dx / dist * 450;
        dy = dy / dist * 450;
        let vx = player.body.velocity.x;
        let vy = player.body.velocity.y;
        player.body.setVelocity(vx - dx, vy - dy);
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        this.myGameState = {
            gameOver : false,
            flip : false,
            MAX_ROTATION : 128,
            gravity : 0,
            player : null,
            cursors : null,

            platforms : null,
            breakables : null,
            bumpers : null,
            stars : null,
            bombs : null,
        };
        let G = this.myGameState;

        G.platforms = this.physics.add.staticGroup();
        G.breakables = this.physics.add.group();
        G.bumpers = this.physics.add.group();
        G.stars = this.physics.add.group();
        G.bombs = this.physics.add.group();

        let self=this;

        let currentLevel = LevelArray[currentLevelIndex];

        (function (original_map, func) {
            //we modify the map, make a deep copy
            let map = [];
            let map_height = original_map.length;
            let map_width = original_map[0].length;
            for (let y = 0; y < map_height; ++y)
            {
                map[y] = original_map[y].concat();
            }

            function find_test_points(x, y, height, width, dx, dy)
            {
                let points = [];
                if (dx !== 0)
                {
                    let x_offset = dx > 0 ? width-1 : 0;
                    for (let i = 0; i < height; ++i)
                    {
                        points.push({y: y+i, x:x+x_offset+dx})
                    }
                }
                if (dy !== 0)
                {
                    let y_offset = dy > 0 ? height-1 : 0;
                    for (let i = 0; i < width; ++i)
                    {
                        points.push({y:y+y_offset+dy, x:x+i})
                    }
                }
                if (dx !== 0 && dy !== 0)
                {
                    let x_offset = dx > 0 ? width-1 : 0;
                    let y_offset = dy > 0 ? height-1 : 0;
                    points.push({y:y+y_offset+dy, x:x+x_offset+dx})
                }
                return points;
            };

            function test_points(points)
            {
                for (let i = 0; i < points.length; ++i)
                {
                    if (points[i].x >= 0 && points[i].x < map_width &&
                        points[i].y >= 0 && points[i].y < map_height &&
                        map[points[i].y][points[i].x] == 1)
                    {
                        //no conflict yet
                    }
                    else
                    {
                        return false;
                    }
                }
                return true;
            }

            function expand(x, y, height, width) {
                let diag = [
                    [-1,-1],
                    [-1, 1],
                    [1, -1],
                    [1, 1],
                    [0,-1],
                    [0, 1],
                    [-1, 0],
                    [1, 0],
                ];
                for (let i = 0; i < diag.length; ++i)
                {
                    let dx = diag[i][0];
                    let dy = diag[i][1];
                    let test_set = find_test_points(x,y,height,width,dx, dy);
                    let passed = test_points(test_set);
                    if (passed)
                    {
                        //new shape
                        if (dx != 0)
                        {
                            width++;
                            if (dx < 0)
                            {
                                x--;
                            }
                        }
                        if (dy != 0)
                        {
                            height++;
                            if (dx < 0)
                            {
                                y--;
                            }
                        }
                        return expand(x,y,height,width)
                    }
                }

                return {x:x, y:y, height:height, width:width};
            }

            function erase(x, y, height, width)
            {
                for (let dy = 0; dy < height; ++dy)
                {
                    for (let dx = 0; dx < width; ++dx)
                    {
                        map[y+dy][x+dx]=0;
                    }
                }
            }

            for (let y = 0; y < map.length; ++y)
            {
                for (let x = 0; x < map[y].length; ++x)
                {
                    if (map[y][x] == 1)
                    {
                        let poly = expand(x,y,1,1);
                        func(poly);
                        //alert(JSON.stringify(expand(x,y,1,1)));
                        erase(poly.x, poly.y, poly.height, poly.width);
                    }
                }
            }
        })(currentLevel.map, function(poly) {
            self.addLedge(poly.x, poly.y, poly.width, poly.height);
        });

        G.player = this.physics.add.sprite(currentLevel.player_x * 32 + 16, currentLevel.player_y * 32 + 16, 'star');
        G.player.setBounce(0.2);
        G.player.setTint(0x00a7e6)

        G.cursors = this.input.keyboard.createCursorKeys();

        G.cursors.letter_left = this.input.keyboard.addKey("a");
        G.cursors.letter_right = this.input.keyboard.addKey("d");
        G.cursors.letter_up = this.input.keyboard.addKey("w");
        G.cursors.letter_down = this.input.keyboard.addKey("s");

        this.physics.add.collider(G.player, G.platforms);
        this.physics.add.collider(G.bombs, G.platforms);
        this.physics.add.collider(G.bombs, G.breakables);
        this.physics.add.collider(G.bombs, G.bombs);
        this.physics.add.collider(G.bombs, G.bumpers, this.bounce, null, this);
        this.physics.add.collider(G.player, G.breakables, this.calculateImpact, null, this);
        this.physics.add.collider(G.player, G.bumpers, this.bounce, null, this);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(G.player, G.stars, this.collectStar, null, this);

        this.physics.add.collider(G.player, G.bombs, this.hitBomb, null, this);
        let camera = this.cameras.main;
        camera.startFollow(G.player);

        currentLevel.create(this);
    },

    //--------------------------------------------------------------------------
    collectStar : function (player, star)
    {
        star.disableBody(true, true);
    },

    //--------------------------------------------------------------------------
    hitBomb : function (player, bomb)
    {
        let G = this.myGameState;
        this.physics.pause();

        G.player.setTint(0xff0000);

        G.gameOver = true;
    },

    //--------------------------------------------------------------------------
    rotateGravity: function (amount)
    {
        let G = this.myGameState;
        G.gravity+=amount;
        while (G.gravity < 0 || G.gravity >= G.MAX_ROTATION) {
            if (G.gravity < 0) {
                G.gravity += G.MAX_ROTATION;
            } else {
                //gravity >= MAX_GRAVITY
                G.gravity -= G.MAX_ROTATION;
            }
        }
    },

    //--------------------------------------------------------------------------
    setGravity: function ()
    {
        let G = this.myGameState;
        let x = Math.sin(2 * Math.PI * G.gravity/G.MAX_ROTATION);
        let y = Math.cos(2 * Math.PI * G.gravity/G.MAX_ROTATION);
        G.player.body.setGravity(Math.round(x*300),Math.round(y*300));
        G.bombs.children.each(function(bomb) {
            bomb.body.setGravity(Math.round(x*300),Math.round(y*300));
        }, this);
        this.cameras.main.setRotation(2 * Math.PI * G.gravity/G.MAX_ROTATION);
    },

    //--------------------------------------------------------------------------
    update: function()
    {
        let G = this.myGameState;
        if (G.gameOver)
        {
            return;
        }

        if (G.player.body.speed > 500)
        {
            this.cameras.main.shake(500, 0.003)
        }
        else if (G.player.body.speed < 500)
        {
            this.cameras.main.shake(0, 0)
        }
        if (G.cursors.left.isDown)
        {
            this.rotateGravity(-1);
            this.setGravity();
        }
        else if (G.cursors.right.isDown)
        {
            this.rotateGravity(1);
            this.setGravity();
        }
        else
        {
        }

        if(G.cursors.letter_up.isDown)
        {
            this.cameras.main.setZoom(this.cameras.main.zoom+0.01);
        }
        if(G.cursors.letter_down.isDown)
        {
            this.cameras.main.setZoom(this.cameras.main.zoom-0.01);
        }

        if (!G.flip && (G.cursors.up.isDown || G.cursors.down.isDown))
        {
            G.flip = true;
            G.gravity += G.MAX_ROTATION/2;
            if (G.gravity >= G.MAX_ROTATION)
            {
                G.gravity -= G.MAX_ROTATION;
            }
            this.setGravity();
            //player.setVelocityY(-330);
        }
        else if (!G.cursors.up.isDown && !G.cursors.down.isDown)
        {
            G.flip = false;
        }
    }
});

let config = {
    type: Phaser.AUTO,
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
            debug: false
        }
    },
    scene: [ LevelSelectScene, GameScene, UIScene ]
};

let game = new Phaser.Game(config);