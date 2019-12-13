let LevelArray = [
    {
        name: "Test Level",
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
            screen.addBreakable(27, 17);
            screen.addBreakable(26, 17);
            screen.addBreakable(25, 17);
            screen.addBreakable(25, 16);
            screen.addStar(26, 16);
            screen.addBreakable(27, 16);
            screen.addBreakable(27, 15);
            screen.addBreakable(26, 15);
            screen.addBreakable(25, 15);

            screen.addBreakable(27, 12);
            screen.addBreakable(26, 12);
            screen.addBreakable(25, 12);
            screen.addBreakable(25, 11);
            screen.addStar(26, 11);
            screen.addBreakable(27, 11);
            screen.addBreakable(27, 10);
            screen.addBreakable(26, 10);
            screen.addBreakable(25, 10);

            screen.addBumper(16, 6);
            screen.addBumper(19, 2);
            screen.addBumper(22, 6);
            screen.addBumper(25, 2);
            screen.addBumper(28, 6);

            screen.addBomb(28, 18);

            for (let x = 2; x < 15; x++) {
                for (let y = 2; y < 11; y++)
                {
                    screen.addStar(x,y);
                }
            }

            screen.addStar(30, 2 );
            screen.addStar(30, 3 );
            screen.addStar(30, 4 );
            screen.addStar(30, 5 );
            screen.addStar(30, 6 );

        },
        player_x: 3,
        player_y: 15
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
            [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1], //12
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
            screen.addBomb(2,42);
            screen.addBomb(33, 2);
            screen.addBomb(33, 42);
        },
        player_x: 2,
        player_y: 2,
    },
];

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    m_grid_color: 0xffffff,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'GameScene', active: true });
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
            0xff0000,
            0x00ff00,
            0x0000ff,
            0xffff00,
            0xff00ff,
            0x00ffff
        ];
        platform.setTint(colors[Math.floor(Math.random()*colors.length)]);
        group.add(platform);
    },

    //--------------------------------------------------------------------------
    addBomb: function (x, y)
    {
        let group = this.myGameState.bombs;
        let block_size = 32;
        group.create(block_size * x - block_size/2,block_size * y - block_size/2, 'bomb').setBounce(0.2);
    },

    //--------------------------------------------------------------------------
    addBreakable: function (x, y)
    {
        let group = this.myGameState.breakables;
        let block_size = 32;
        group.create(block_size * x - block_size/2,block_size * y - block_size/2, 'blocks',5).setImmovable(true);
    },

    //--------------------------------------------------------------------------
    addBumper: function (x, y)
    {
        let group = this.myGameState.bumpers;
        let block_size = 32;
        group.create(block_size * x - block_size/2,block_size * y - block_size/2, 'blocks',25).setImmovable(true);
    },

    //--------------------------------------------------------------------------
    addStar: function (x, y)
    {
        let group = this.myGameState.stars;
        let block_size = 32;
        group.create(block_size * x - block_size/2,block_size * y - block_size/2, 'star').setImmovable(true);
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
        let level = LevelArray[1];

        level.create(this);

        (function (map, func) {
            let map_height = map.length;
            let map_width = map[0].length;

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
        })(level.map, function(poly) {
            self.addLedge(poly.x, poly.y, poly.width, poly.height);
        });

        G.player = this.physics.add.sprite(level.player_x * 32 - 16, level.player_y * 32 - 16, 'star');
        G.player.setBounce(0.2);

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
            this.setGravity(this);
        }
        else if (G.cursors.right.isDown)
        {
            this.rotateGravity(1);
            this.setGravity(this);
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
            this.setGravity(this);
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
    scene: [ GameScene ]
};

let game = new Phaser.Game(config);