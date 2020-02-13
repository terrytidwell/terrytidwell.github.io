const SCREEN_WIDTH = 832;
const SCREEN_HEIGHT = 576;
const GRID_SIZE = 64;
const PNG_GRID_SIZE = 16;
const PNG_TO_GRID_SCALE = GRID_SIZE/PNG_GRID_SIZE;
let CurrentRoom = 'Crypt1';
let CurrentEntrance = 0;
const LAYOUT = {
   MOBILE_VERTICAL : 0,
   MOBILE_HORIZONTAL : 1,
   DESKTOP : 2
};
const LAYOUT_NAMES = [
    "MOBILE_VERTICAL",
    "MOBILE_HORIZONTAL",
    "DESKTOP"
];

let currentLayout = LAYOUT.DESKTOP;

let Player = {
    initialize : function(screen,x,y,flip)
    {
        Player.sprite = null;
        Player.ready_to_jump = false;
        Player.jumping = false;
        Player.ducking = false;
        Player.attacking = false;
        Player.ready_to_attack = false;
        Player.hit = false;
        Player.can_recover_from_hit = true;
        Player.mercy_invicible = false;
        Player.whip1 = null;
        Player.whip2 = null;
        Player.whip3 = null;
        Player.sprite = screen.physics.add.sprite(x * GRID_SIZE, y * GRID_SIZE, 'simon1').setScale(4).setFlipX(flip);
        Player.sprite.originX = 0;
        Player.sprite.originY = 1;
        Player.sprite.body.setMaxVelocity(1100, 1100);

        Player.whip1 = screen.physics.add.sprite(Player.sprite.body.right, Player.sprite.body.top, 'whip1').setScale(4);
        Player.whip1.visible = false;
        Player.whip1.body.allowGravity = false;
        Player.whip1.body.immovable = true;
        Player.whip2 = screen.physics.add.sprite(Player.sprite.body.right, Player.sprite.body.top, 'whip2').setScale(4);
        Player.whip2.visible = false;
        Player.whip2.body.allowGravity = false;
        Player.whip2.body.immovable = true;
        Player.whip3 = screen.physics.add.sprite(Player.sprite.body.left - 44 * 4, Player.sprite.body.top + 8 * 4, 'whip3').setScale(4);
        Player.whip3.visible = false;
        Player.whip3.body.allowGravity = false;
        Player.whip3.body.immovable = true;
        Player.whip3.body.setOffset(0, -1);
    },
    update: function(screen)
    {
        let cursors = screen.myGameState.cursors;

        Player.whip1.body.x = Player.sprite.body.right;
        Player.whip1.setFlipX(Player.sprite.flipX);
        if (Player.sprite.flipX)
        {
            Player.whip1.body.x = Player.sprite.body.left - 64;
        }
        Player.whip1.body.y = Player.sprite.body.top;

        Player.whip2.body.x = Player.sprite.body.right;
        Player.whip2.setFlipX(Player.sprite.flipX);
        if (Player.sprite.flipX)
        {
            Player.whip2.body.x = Player.sprite.body.left - 64;
        }
        Player.whip2.body.y = Player.sprite.body.top;

        Player.whip3.body.x = Player.sprite.body.left - 44*4;
        Player.whip3.setFlipX(Player.sprite.flipX);
        if (Player.sprite.flipX)
        {
            Player.whip3.body.x = Player.sprite.body.right;
        }
        Player.whip3.body.y = Player.sprite.body.top + 8*4;

        if (!cursors.up.isDown) {
            Player.ready_to_jump = true
        }
        if (!cursors.letter_left.isDown) {
            Player.ready_to_attack = true;
        }

        if (!Player.hit && cursors.letter_left.isDown && Player.ready_to_attack && !Player.attacking)
        {
            Player.attacking = true;
            Player.ready_to_attack = false;
            let attack_end = function () {
                Player.attacking = false;
                Player.whip1.visible = false;
                Player.whip2.visible = false;
                Player.whip3.visible = false;
            };
            let attack_update = function (animation, frame, gameObject) {
                if (frame.index === 2) {
                    Player.whip1.visible = false;
                    Player.whip2.visible = true;
                } else if (frame.index === 3) {
                    Player.whip2.visible = false;
                    Player.whip3.visible = true;
                }
            };
            Player.sprite.on('animationcomplete-standing_whip', attack_end);
            Player.sprite.on('animationcomplete-ducking_whip', attack_end);
            Player.sprite.on('animationupdate-ducking_whip', attack_update);
            Player.sprite.on('animationupdate-standing_whip', attack_update);
            if (!Player.ducking) {
                Player.sprite.anims.play('standing_whip', false);
            } else {
                Player.sprite.anims.play('ducking_whip', false);
            }

            Player.whip1.visible = true;
        }

        if (Player.attacking && Player.sprite.body.blocked.down)
        {
            Player.sprite.setVelocityX(0);
        }

        if (!Player.attacking && !Player.hit)
        {
            if (cursors.left.isDown) {
                Player.sprite.setFlipX(false);
                Player.sprite.setVelocityX(-196);
                if (!Player.jumping) {
                    Player.sprite.anims.play('walk', true);
                    Player.ducking = false;
                    Player.sprite.setSize(16, 32);
                }
            } else if (cursors.right.isDown) {
                Player.sprite.setFlipX(true);
                Player.sprite.setVelocityX(196);
                if (!Player.jumping) {
                    Player.sprite.anims.play('walk', true);
                    Player.ducking = false;
                    Player.sprite.setSize(16, 32);
                }
            } else {
                Player.sprite.anims.stop();
                Player.sprite.setVelocityX(0);
                if (!Player.jumping) {
                    Player.sprite.setTexture('simon1');
                    Player.ducking = false;
                    Player.sprite.setSize(16, 32);
                }
            }

            if (Player.sprite.body.blocked.down) {
                if (Player.jumping) {
                    Player.jumping = false;
                } else if (cursors.up.isDown && Player.ready_to_jump) {
                    Player.jumping = true;
                    Player.ready_to_jump = false;
                    Player.sprite.anims.stop();
                    Player.sprite.setTexture('simon_ducking');
                    Player.ducking = true;
                    Player.sprite.setSize(16, 24);
                    Player.sprite.setVelocityY(-512 - 96);
                }
                else if (cursors.down.isDown) {
                    Player.sprite.anims.stop();
                    Player.sprite.setTexture('simon_ducking');
                    Player.ducking = true;
                    Player.sprite.setSize(16, 24);
                    Player.sprite.setVelocityX(0);
                }
            } else {
                if (!Player.jumping) {
                    Player.sprite.anims.stop();
                    Player.sprite.setTexture('simon1');
                    Player.ducking = false;
                    Player.sprite.setSize(16, 32);
                } else {
                    Player.sprite.anims.stop();
                    Player.sprite.setTexture('simon_ducking');
                    Player.ducking = true;
                    Player.sprite.setSize(16, 24);
                }
            }
        }

        if (!Player.hit && cursors.letter_right.isDown)
        {
            this.playerDamage(screen, Player.sprite, Player.sprite);
        }
        if (Player.hit && Player.can_recover_from_hit)
        {
            if (Player.sprite.body.blocked.down)
            {
                Player.hit = false;
            }
        }
    },

    hitPlayer: function(player, source) {
        if (source.shouldDamagePlayer && source.shouldDamagePlayer()) {
            let adjusted_height = Player.sprite.body.height * 3/4;
            let adjusted_y = Player.sprite.body.y + (Player.sprite.body.height * 1/8);
            let adjusted_width = Player.sprite.body.width * 1/2;
            let adjusted_x = Player.sprite.body.x + (Player.sprite.body.width * 1/4);
            if (source.body.x < adjusted_x + adjusted_width &&
                source.body.x + source.body.width > adjusted_x &&
                source.body.y < adjusted_y + adjusted_height &&
                source.body.y + source.body.height > adjusted_y)
            {
                Player.playerDamage(this, player, source);
            }
        }
    },

    playerDamage: function(screen, player, source) {
        if (Player.hit || Player.mercy_invicible)
        {
            return;
        }
        let sx = (source.body.left + source.body.right)/2;
        let sy = (source.body.top + source.body.bottom)/2;
        let px = (Player.sprite.body.left + Player.sprite.body.right)/2;
        let py = (Player.sprite.body.top + Player.sprite.body.bottom)/2;
        if (sx > px)
        {
            Player.sprite.setFlipX(true);
        }
        else if (sx < px)
        {
            Player.sprite.setFlipX(false);
        }
        let dx = -196;
        if(!Player.sprite.flipX) {
            dx = dx * -1;
        }
        Player.sprite.anims.stop();
        Player.sprite.setTexture('hit');
        Player.ducking = false;
        Player.attacking = false;
        Player.sprite.setSize(16, 32);
        Player.hit = true;
        Player.mercy_invicible = true;
        Player.can_recover_from_hit = false;
        screen.time.delayedCall(250, Player.playerCanRecover, [], this);
        screen.time.delayedCall(1000, Player.playerVulnerable, [], this);
        screen.time.delayedCall(750, Player.playerOpaque, [], this);
        Player.sprite.alpha = 0.5;
        Player.whip1.alpha = 0.5;
        Player.whip2.alpha = 0.5;
        Player.whip3.alpha = 0.5;
        Player.sprite.setVelocityY(-608/2);
        Player.sprite.setVelocityX(dx);
    },

    playerOpaque: function()
    {
        Player.sprite.alpha = 1;
        Player.whip1.alpha = 1;
        Player.whip2.alpha = 1;
        Player.whip3.alpha = 1;
    },


    playerCanRecover: function()
    {
        Player.can_recover_from_hit = true;
    },

    playerVulnerable: function()
    {
        Player.mercy_invicible = false;
        Player.playerOpaque();
    },
};

let RoomDictionary =
{
    'great_hall':
        {
            map: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
                [1,5,6,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,5,6,0,0,1],
                [1,2,3,1,1,1,1,1,1,0,0,0,0,0,5,6,0,0,0,0,0,2,3,0,0,1],
                [1,2,3,0,0,5,6,0,0,0,0,0,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [1,2,3,0,0,2,3,0,0,0,1,1,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [1,2,3,0,0,2,3,0,0,0,5,6,0,0,2,3,0,0,0,0,0,1,1,0,0,1],
                [1,2,3,0,0,2,3,0,0,0,2,3,0,0,1,1,0,0,0,0,0,5,6,0,0,1],
                [1,2,3,0,0,2,3,0,0,0,2,3,0,0,5,6,0,0,0,0,0,2,3,0,0,1],
                [1,2,3,0,0,2,3,0,0,0,1,1,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [1,2,3,0,0,1,1,0,0,0,5,6,0,0,2,3,0,0,0,0,0,1,1,0,0,1],
                [1,2,3,0,0,5,6,0,0,0,2,3,0,0,2,3,0,0,0,0,0,5,6,0,0,1],
                [1,1,1,0,0,2,3,0,0,0,2,3,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [1,5,6,0,0,2,3,0,0,0,2,3,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [1,2,3,0,0,1,1,0,0,0,2,3,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [1,2,3,0,0,5,6,0,0,0,2,3,0,0,2,3,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,0,0,2,3,0,0,0,2,3,0,0,2,3,0,0,0,0,0,5,6,0,0,1],
                [4,4,4,0,0,2,3,0,0,0,2,3,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [4,4,4,1,1,1,1,0,0,0,2,3,0,0,2,3,0,0,0,0,0,2,3,0,0,1],
                [4,4,4,4,4,4,4,0,0,0,2,3,0,0,2,3,0,0,0,0,0,2,3,0,0,0],
                [4,4,4,4,4,4,4,1,1,1,2,3,0,0,2,3,0,0,0,0,0,2,3,0,0,0],
                [4,4,4,4,4,4,4,4,4,4,2,3,0,0,1,1,0,0,0,0,0,2,3,0,0,0],
                [4,4,4,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ],
            exits: [
                {x:27, y:24, w:1, h:3, dest:'Crypt3', entrance_index:1},
                {x:27, y:3, w:1, h:3, dest:'side_hall', entrance_index:0},
                {x:-2, y:3, w:1, h:3, dest:'small_room2', entrance_index:0},
            ],
            entrances: [
                {x:0, y:5, flip: true},
                {x:25, y:5, flip: false},
                {x:25, y:26, flip: false}
            ],
            create : function (screen)
            {
                screen.addGhost(26 - 8,27 - 8);
                screen.addSkeleton(14,24);
                screen.addSkeleton(12,25);
                screen.addSkeleton(10,10);
                screen.addBat(-13, 23);
                screen.addBat(-11, 24);
            }
        },
    'side_hall':
        {
            map: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,5,6,0,0,0,0,0,0,0,0,1],
                [1,0,0,1,1,1,1,1,1,1,1,0,0,2,3,0,0,1,1,1,1,1,1,1,1,0,0,0,2,3,0,0,0,1,1,1,1,1,1],
                [1,0,0,0,0,0,5,6,0,0,0,0,0,2,3,0,0,0,0,0,5,6,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,1],
            ],
            exits: [
                {x:-2, y:3, w:1, h:3, dest:'great_hall', entrance_index:1}
            ],
            entrances: [
                {x:0, y:5, flip: true}
            ]
        },
    'small_room2':
        {
            map: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0,0,0,0,1,1],
                [1,0,0,0,0,0,0,0,0,1,1,0,0],
                [1,0,0,0,0,0,0,1,1,0,0,0,0],
                [1,1,1,1,1,1,1,0,0,0,0,0,0]
            ],
            exits: [
                {x:14, y:3, w:1, h:3, dest:'great_hall', entrance_index:0}
            ],
            entrances: [
                {x:12, y:5, flip: false}
            ]
        },
    'Crypt1':
        {
            map_key: 'Crypt1',
            tile_key: 'crypt_tiles',
            exits: [
                {x:-2, y:24, w:1, h:3, dest:'Crypt2', entrance_index:0}
            ],
            entrances: [
                {x:6, y:5, flip: false},
                {x:0, y:26, flip: true}
            ],
            create : function (screen)
            {
                screen.addSkeleton(3,8);
                screen.addSkeleton(5,19);
                //screen.addSkeleton(4,17);
                //screen.addSkeleton(8,23);
            }
        },
    'Crypt2':
        {
            map_key: 'Crypt2',
            tile_key: 'crypt_tiles',
            exits: [
                {x:27, y:6, w:1, h:3, dest:'Crypt1', entrance_index:1},
                {x:27, y:15, w:1, h:3, dest:'Crypt3', entrance_index:0}
            ],
            entrances: [
                {x:25, y:8, flip: false},
                {x:25, y:17, flip: false}
            ],
            create : function (screen)
            {
                screen.addSkeleton(15,7);
                screen.addSkeleton(10,7).setFlipX(true);
                screen.addSkeleton(6,9).setFlipX(true);
                screen.addSkeleton(10,14);
            }
        },
    'Crypt3':
        {
            map_key: 'Crypt3',
            tile_key: 'crypt_tiles',
            exits: [
                {x:-2, y:24, w:1, h:3, dest:'great_hall', entrance_index:2},
                {x:-2, y:6, w:1, h:3, dest:'Crypt2', entrance_index:1}
            ],
            entrances: [
                {x:0, y:8, flip: true},
                {x:0, y:26, flip: true}
            ],
            create : function (screen)
            {
            }
        },
}


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

let  StartScreen = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'StartScreen', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        this.input.addPointer(5);
        let self = this;
        let font_size = 48;
        let font_size_str = '' + font_size + 'px';

        let entrances = [];
        let current_entrance_index = 0;
        let max_width = 0;

        this.entrance_select = this.add.text(
            SCREEN_WIDTH / 2, SCREEN_HEIGHT * 3/4,
            LAYOUT_NAMES[currentLayout], { fontSize: font_size_str, fill: '#FFF' })
            .setOrigin(0.5, 0.5);
        this.entrance_select.alpha = 0.5;
        /*
        this.entrance_select.setInteractive();
        this.entrance_select.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.entrance_select.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
         */

        for (var room in RoomDictionary) {
            if (Object.prototype.hasOwnProperty.call(RoomDictionary, room)) {
                if (RoomDictionary[room].entrances) {
                    for (let i = 0; i < RoomDictionary[room].entrances.length; i++)
                    {
                        let name = room + "." + i;
                        entrances.push({
                            name: name,
                            room: room,
                            index: i
                        });
                        this.entrance_select.setText(name);
                        max_width = Math.max(max_width, this.entrance_select.width);
                        if (room === CurrentRoom && CurrentEntrance === i)
                        {
                            current_entrance_index = entrances.length - 1;
                        }
                    }
                }
            }
        }
        this.entrance_select.setText(entrances[current_entrance_index].name);

        this.play_button = this.add.text(
            SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
            LAYOUT_NAMES[currentLayout], { fontSize: font_size_str, fill: '#FFF' })
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
        this.play_button.on('pointerup',
            function() {
                self.sys.game.destroy(true);

                let start_width = SCREEN_WIDTH;
                let start_height = SCREEN_HEIGHT;

                CurrentRoom = entrances[current_entrance_index].room;
                CurrentEntrance = entrances[current_entrance_index].index;

                if (currentLayout == LAYOUT.DESKTOP) {
                    //nothing
                } else if (currentLayout == LAYOUT.MOBILE_VERTICAL) {
                    start_height = SCREEN_HEIGHT*2;
                } else if (currentLayout == LAYOUT.MOBILE_HORIZONTAL) {
                    start_width = SCREEN_WIDTH*2;
                }

                let config = {
                    backgroundColor: '#050505',
                    type: Phaser.AUTO,
                    render: {
                        pixelArt: true
                    },
                    scale: {
                        mode: Phaser.Scale.FIT,
                        parent: 'phaser-example2',
                        autoCenter: Phaser.Scale.CENTER_BOTH,
                        width: start_width,
                        height: start_height,
                    },
                    physics: {
                        default: 'arcade',
                        arcade: {
                            gravity: { y: 20 * GRID_SIZE },
                            debug: false
                        }
                    },
                    scene: [ GameScene, UIScene ]
                };

                let el = document.getElementById('phaser-example');
                el.remove();

                game = new Phaser.Game(config);

            }, this
        );

        for (let i = 0; i < LAYOUT_NAMES.length; i++)
        {
            this.play_button.setText(LAYOUT_NAMES[i]);
            max_width = Math.max(max_width, this.play_button.width);
        }
        this.play_button.setText(LAYOUT_NAMES[currentLayout]);

        this.previous = this.add.text(SCREEN_WIDTH / 2 - max_width / 2 - font_size/2,
            SCREEN_HEIGHT / 2,
            "<<", { fontSize: font_size_str, fill: '#FFF' })
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
                currentLayout-=1;
                if (currentLayout < 0)
                {
                    currentLayout = LAYOUT_NAMES.length - 1;
                }
                this.play_button.setText(LAYOUT_NAMES[currentLayout]);
            }, this
        );

        this.next = this.add.text(SCREEN_WIDTH / 2 + max_width / 2 + font_size/2,
            SCREEN_HEIGHT / 2,
            ">>", { fontSize: font_size_str, fill: '#FFF' })
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
                currentLayout+=1;
                if (currentLayout >= LAYOUT_NAMES.length)
                {
                    currentLayout = 0;
                }
                this.play_button.setText(LAYOUT_NAMES[currentLayout]);
            }, this
        );

        this.previous_entrance = this.add.text(SCREEN_WIDTH / 2 - max_width / 2 - font_size/2,
            SCREEN_HEIGHT * 3/4,
            "<<", { fontSize: font_size_str, fill: '#FFF' })
            .setOrigin(1 , 0.5);
        this.previous_entrance.setInteractive();
        this.previous_entrance.alpha = 0.5;
        this.previous_entrance.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.previous_entrance.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.previous_entrance.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                current_entrance_index-=1;
                if (current_entrance_index < 0)
                {
                    current_entrance_index = entrances.length - 1;
                }
                this.entrance_select.setText(entrances[current_entrance_index].name);
            }, this
        );

        this.next_entrance = this.add.text(SCREEN_WIDTH / 2 + max_width / 2 + font_size/2,
            SCREEN_HEIGHT * 3/4,
            ">>", { fontSize: font_size_str, fill: '#FFF' })
            .setOrigin(0 , 0.5);
        this.next_entrance.setInteractive();
        this.next_entrance.alpha = 0.5;
        this.next_entrance.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        this.next_entrance.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        this.next_entrance.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event) {
                current_entrance_index+=1;
                if (current_entrance_index >= entrances.length)
                {
                    current_entrance_index = 0;
                }
                this.entrance_select.setText(entrances[current_entrance_index].name);
            }, this
        );
    },
});

let  UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: true  });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
        this.load.image('d-pad', 'assets/shadedDark04.png');
        this.load.image('fullscreen', 'assets/shadedDark30.png');
        this.load.image('a-button', 'assets/shadedDark36.png');
        this.load.image('b-button', 'assets/shadedDark37.png');
    },

    updateLayout : function ()
    {
        if (currentLayout == LAYOUT.DESKTOP) {
            this.cameras.main.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            this.visible = false;
        } else if (currentLayout == LAYOUT.MOBILE_VERTICAL) {
            this.cameras.main.setViewport(0,SCREEN_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT*2);
            this.visible = true;
        } else if (currentLayout == LAYOUT.MOBILE_HORIZONTAL) {
            this.cameras.main.setViewport(0,0, SCREEN_WIDTH * 2, SCREEN_HEIGHT);
            this.visible = true;
        }
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        let UIScene = this;
        this.input.addPointer(5);
        this.updateLayout();

        //this.cameras.main.setBackgroundColor("#100000");
        let game_width = SCREEN_WIDTH;
        let game_height = SCREEN_HEIGHT;
        if (currentLayout == LAYOUT.DESKTOP) {
            //nothing
        } else if (currentLayout == LAYOUT.MOBILE_VERTICAL) {
            //nothing
        } else if (currentLayout == LAYOUT.MOBILE_HORIZONTAL) {
            game_width = SCREEN_WIDTH * 2;
        }

        let fullscreen = this.add.sprite(game_width-GRID_SIZE/2, GRID_SIZE/2, 'fullscreen');
        fullscreen.setInteractive();
        fullscreen.alpha = 0.5;
        fullscreen.on('pointerover',function(pointer){
            {
                this.alpha = 1;
            }
        });
        fullscreen.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
            }
        });
        fullscreen.on('pointerdown',function(pointer){
            {
                UIScene.scale.startFullscreen();
            }
        });

        if (currentLayout === LAYOUT.DESKTOP)
        {
            return;
        }



        let dpad = this.add.sprite(SCREEN_WIDTH/4, SCREEN_HEIGHT/2, 'd-pad').setScale(3);
        dpad.setInteractive();
        dpad.alpha = 0.5;
        let dpad_pointer = function (pointer){
            let dx = pointer.worldX - this.x;
            let dy = pointer.worldY - this.y;
            this.alpha = 1;
            if (dx > dy && dy > -dx) {
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.right.isDown = true;
                cursors.left.isDown = false;
                //cursors.up.isDown = false;
                cursors.down.isDown = false;
            } else if (dx < dy && dy < -dx) {
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.right.isDown = false;
                cursors.left.isDown = true;
                //cursors.up.isDown = false;
                cursors.down.isDown = false;
            } else if (dx < dy && dy > -dx) {
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.right.isDown = false;
                cursors.left.isDown = false;
                //cursors.up.isDown = false;
                cursors.down.isDown = true;
            } else if (dx > dy && dy < -dx) {
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.right.isDown = false;
                cursors.left.isDown = false;
                //cursors.up.isDown = true;
                cursors.down.isDown = false;
            }else {
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.right.isDown = false;
                cursors.left.isDown = false;
                //cursors.up.isDown = false;
                cursors.down.isDown = false;
            }
        }
        dpad.on('pointerover', dpad_pointer);
        dpad.on('pointermove', dpad_pointer);
        dpad.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.right.isDown = false;
                cursors.left.isDown = false;
                //cursors.up.isDown = false;
                cursors.down.isDown = false;
            }
        });

        //this.add.sprite(game_width-(SCREEN_WIDTH*1/4), SCREEN_HEIGHT*1/4, 'b-button').setScale(2);
        //this.add.sprite(game_width-(SCREEN_WIDTH*1/4), SCREEN_HEIGHT*3/4, 'b-button').setScale(2);

        let jump = this.add.sprite(game_width-(SCREEN_WIDTH*1/8), SCREEN_HEIGHT/2, 'b-button').setScale(2);
        jump.setInteractive();
        jump.alpha = 0.5;
        jump.on('pointerover',function(pointer){
            {
                this.alpha = 1;
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.up.isDown = true;
            }
        });
        jump.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.up.isDown = false;
            }
        });

        let attack = this.add.sprite(game_width-(SCREEN_WIDTH*3/8), SCREEN_HEIGHT/2, 'a-button').setScale(2);
        attack.setInteractive();
        attack.alpha = 0.5;
        attack.on('pointerover',function(pointer){
            {
                this.alpha = 1;
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.letter_left.isDown = true;
            }
        });
        attack.on('pointerout',function(pointer){
            {
                this.alpha = 0.5;
                let GameScene = UIScene.scene.get('GameScene');
                let cursors = GameScene.myGameState.mobile_cursors;
                cursors.letter_left.isDown = false;
            }
        });
    },

    //--------------------------------------------------------------------------
    update: function()
    {
    },
});

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
        this.load.image('bricks', 'assets/bricks.png');
        this.load.image('bat1', 'assets/bat1.png');
        this.load.image('bat2', 'assets/bat2.png');
        this.load.image('bat3', 'assets/bat3.png');
        this.load.image('ghost1', 'assets/ghost1.png');
        this.load.image('ghost2', 'assets/ghost2.png');
        this.load.image('ghost3', 'assets/ghost3.png');
        this.load.image('ghost4', 'assets/ghost4.png');
        this.load.image('skeleton1', 'assets/skeleton1.png');
        this.load.image('skeleton2', 'assets/skeleton2.png');
        this.load.image('skeleton_death1', 'assets/skeleton_death1.png');
        this.load.image('skeleton_death2', 'assets/skeleton_death2.png');
        this.load.image('skeleton_death3', 'assets/skeleton_death3.png');
        this.load.tilemapTiledJSON('Crypt1', 'assets/Crypt1.json');
        this.load.tilemapTiledJSON('Crypt2', 'assets/Crypt2.json');
        this.load.tilemapTiledJSON('Crypt3', 'assets/Crypt3.json');
        this.load.image('crypt_tiles', 'assets/crypt_tiles.png');
    },

    addBlock: function(group, x, y)
    {
        let block = this.add.sprite(x, y, 'block').setScale(PNG_TO_GRID_SCALE);
        group.add(block);
        fix_object(block, GRID_SIZE, GRID_SIZE);
        return block;
    },

    addGhost: function(x,y)
    {
        let G = this.myGameState;
        let ghost = this.physics.add.sprite(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'ghost3').setScale(4);
        G.updatables.add(ghost);
        G.hittables.add(ghost);
        G.dangerous.add(ghost);
        ghost.anims.play('ghost_walk', false);
        ghost.body.allowGravity = false;
        ghost.body.onCollide = false;
        ghost.setData("state", 0);
        ghost.update = function () {
            if (ghost.getData("state") !== 0) {
                return;
            }
            let gx = (ghost.body.left + ghost.body.right)/2;
            let gy = (ghost.body.top + ghost.body.bottom)/2;
            let px = (Player.sprite.body.left + Player.sprite.body.right)/2;
            let py = (Player.sprite.body.top + Player.sprite.body.bottom)/2;
            let dx = px - gx;
            let dy = py - gy;
            let l = Math.sqrt(dx * dx + dy * dy);
            if (dx > SCREEN_WIDTH || dy > SCREEN_HEIGHT)
            {
                ghost.setVelocity(0,0);
                return;
            }
            if (dx > 0)
            {
                ghost.setFlipX(true);
            } else
            {
                ghost.setFlipX(false)
            }

            ghost.setVelocityX(dx / l * 64);
            ghost.setVelocityY(dy / l * 64);
        };
        ghost.hit = function () {
            if (ghost.getData("state") !== 0)
            {
                return false;
            }
            ghost.setData("state", 1);
            ghost.setVelocity(0,0);
            ghost.on('animationcomplete-ghost_disappear', function(){
                ghost.setData("state", 0);
                ghost.anims.play('ghost_walk', false);
            });
            ghost.anims.play('ghost_disappear', false);
            return true;
        };
        ghost.shouldDamagePlayer = function(player, source) {
            return ghost.getData("state") === 0;
        };
    },
    
    addBat: function(x,y) {
        let G = this.myGameState;
        let bat = this.physics.add.sprite(x * GRID_SIZE + GRID_SIZE / 2, y * GRID_SIZE + GRID_SIZE / 2, 'bat1').setScale(4).setFlipX(true);
        G.dangerous.add(bat);
        G.hittables.add(bat);
        this.tweens.add({
            targets: bat,
            y: 22 * GRID_SIZE + GRID_SIZE / 2,
            ease: 'Sine.easeInOut',
            duration: 1000,
            repeat: -1,
            yoyo: true
        });
        bat.setVelocityX(GRID_SIZE * 4);
        bat.body.allowGravity = false;
        bat.anims.play('bat_walk');
        bat.hit = function () {
            bat.destroy();
            return true;
        };
        bat.shouldDamagePlayer = function (player, source) {
            return true;
        };
    },

    addSkeleton : function (x, y)
    {
        let G = this.myGameState;
        let skeleton = this.physics.add.sprite(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE, 'skeleton_death3').setScale(4);
        let skeleton_guide_left = this.physics.add.sprite((x-1) * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE, "block").setScale(4);
        let skeleton_guide_right = this.physics.add.sprite((x+1) * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE, "block").setScale(4);
        G.updatables.add(skeleton);
        G.hittables.add(skeleton);
        G.dangerous.add(skeleton);
        G.platform_hit.add(skeleton);
        G.platform_hit.add(skeleton_guide_left);
        G.platform_hit.add(skeleton_guide_right);
        //skeleton.anims.play('skeleton_walk', false);
        const SKELETON_SLEEP = 2;
        const SKELETON_WAKE = 3;
        const SKELETON_WALK = 0;
        const SKELETON_DEATH = 1;
        skeleton.setData('state', SKELETON_SLEEP);

        skeleton.body.allowGravity = true;
        skeleton_guide_left.body.allowGravity = false;
        skeleton_guide_right.body.allowGravity = false;
        skeleton_guide_right.visible = false;
        skeleton_guide_left.visible = false;
        skeleton.body.setVelocityX(0);
        skeleton.update = function()
        {
            skeleton_guide_left.body.x = skeleton.body.x - GRID_SIZE;
            skeleton_guide_right.body.x = skeleton.body.x + GRID_SIZE;
            skeleton_guide_left.body.y = skeleton.body.y + GRID_SIZE;
            skeleton_guide_right.body.y = skeleton.body.y + GRID_SIZE;

            if (skeleton.getData('state') === SKELETON_SLEEP) {
                let sx = (skeleton.body.left + skeleton.body.right)/2;
                let sy = (skeleton.body.top + skeleton.body.bottom)/2;
                let px = (Player.sprite.body.left + Player.sprite.body.right)/2;
                let py = (Player.sprite.body.top + Player.sprite.body.bottom)/2;
                let dx = px - sx;
                let dy = py - sy;
                let l = Math.sqrt(dx * dx + dy * dy);
                let min_dist = Math.sqrt(SCREEN_HEIGHT * SCREEN_HEIGHT + SCREEN_WIDTH + SCREEN_WIDTH)/2;
                if (l < min_dist) {
                    skeleton.setData('state', SKELETON_WAKE);
                    skeleton.on('animationcomplete-skeleton_wake', function() {
                        skeleton.setData('state',SKELETON_WALK);
                        skeleton.anims.play('skeleton_walk', false);
                        skeleton_guide_left.body.allowGravity = true;
                        skeleton_guide_right.body.allowGravity = true;
                        if (!skeleton.flipX) {
                            skeleton.body.setVelocityX(-196 / 2);
                        } else {
                            skeleton.body.setVelocityX(196 / 2);
                        }
                    });
                    skeleton.anims.play('skeleton_wake', false);
                }
            }
            else if (skeleton.getData('state') === SKELETON_DEATH) {
                skeleton.body.setVelocityX(0);
            }
            else if (skeleton.getData('state') === SKELETON_WAKE) {
                //do nothing
            }
            else if (skeleton.getData('state') === SKELETON_WALK) {
                if (skeleton.body.blocked.left || !skeleton_guide_left.body.blocked.down) {
                    skeleton.setFlipX(true);
                    skeleton.body.setVelocityX(196 / 2);
                } else if (skeleton.body.blocked.right || !skeleton_guide_right.body.blocked.down) {
                    skeleton.setFlipX(false);
                    skeleton.body.setVelocityX(-196 / 2);
                }
            }
        };
        skeleton.hit = function()
        {
            if (skeleton.getData('state')===SKELETON_WALK)
            {
                skeleton.body.setVelocityX(0);
                skeleton.on('animationcomplete-skeleton_death', function() {
                    skeleton.destroy();
                    skeleton_guide_left.destroy();
                    skeleton_guide_right.destroy();
                });
                skeleton.setData('state', SKELETON_DEATH);
                skeleton.anims.play('skeleton_death', false);
                return true;
            }
            return false;
        };
        skeleton.shouldDamagePlayer = function(player, source) {
            return skeleton.getData("state") === SKELETON_WALK;
        };
        return skeleton;
    },

    addExit : function (x, y, w, h, room, entrance_index) {
        let G = this.myGameState;
        let self = this;
        let exit = this.add.zone(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2).setSize(GRID_SIZE * w, h * GRID_SIZE);
        G.dangerous.add(exit);
        exit.body.allowGravity = false;
        exit.shouldDamagePlayer = function(player, source) {
            CurrentEntrance = entrance_index;
            CurrentRoom = room;
            self.scene.stop('GameScene');
            self.scene.start('GameScene');
            return false;
        };
    },

    addLegacyMap : function () {
        let G = this.myGameState;
        let room = RoomDictionary[CurrentRoom];
        let map = room.map;
        let scene_height = map.length * GRID_SIZE;
        let scene_width = 0;
        for (let y = 0; y < map.length; ++y)
        {
            scene_width = Math.max(scene_width,  map[y].length*GRID_SIZE);
            for (let x = 0; x < map[y].length; ++x)
            {
                if (map[y][x] === 2) {
                    this.add.sprite(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE);
                }
                if (map[y][x] === 3) {
                    this.add.sprite(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE).setFlipX(true);
                }
                if (map[y][x] === 4) {
                    this.add.sprite(x * GRID_SIZE + GRID_SIZE / 2, y * GRID_SIZE + GRID_SIZE / 2, 'bricks').setScale(PNG_TO_GRID_SCALE).setTint(0x404040);
                }
                if (map[y][x] === 5) {
                    this.add.sprite(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE).setTint(0x404040);
                }
                if (map[y][x] === 6) {
                    this.add.sprite(x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2, 'column_left').setScale(PNG_TO_GRID_SCALE).setFlipX(true).setTint(0x404040);
                }
            }
        }

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
        this.cameras.main.setBounds(0, 0, scene_width, scene_height);

    },

    addTileMap : function ()
    {
        let G = this.myGameState;
        let room = RoomDictionary[CurrentRoom];
        let map_key = room.map_key;
        let tile_key = room.tile_key;
        let map = this.make.tilemap({ key: map_key });
        let tileset = map.addTilesetImage(tile_key, tile_key, 16, 16);
        let layer = map.createStaticLayer('Bg', tileset, 0, 0);
        layer.setScale(4);
        layer = map.createStaticLayer('Walls', tileset, 0, 0);
        G.platforms = layer;
        layer.setScale(4);
        layer.setCollisionByProperty({ collides: true });
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 4, map.heightInPixels * 4);
    },

    updateLayout : function ()
    {
        if (currentLayout == LAYOUT.DESKTOP) {
            this.cameras.main.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        } else if (currentLayout == LAYOUT.MOBILE_VERTICAL) {
            this.cameras.main.setViewport(0,0, SCREEN_WIDTH, SCREEN_HEIGHT);
        } else if (currentLayout == LAYOUT.MOBILE_HORIZONTAL) {
            this.cameras.main.setViewport(SCREEN_WIDTH/2,0, SCREEN_WIDTH, SCREEN_HEIGHT);
        }
    },


    //--------------------------------------------------------------------------
    create: function ()
    {
        let room = RoomDictionary[CurrentRoom];
        let self = this;

        this.myGameState = {
            platforms: null,
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

        this.anims.create({
            key: 'ghost_walk',
            frames: [
                { key: 'ghost3' },
                { key: 'ghost4' }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'skeleton_walk',
            frames: [
                { key: 'skeleton1' },
                { key: 'skeleton2' }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'ghost_disappear',
            frames: [
                { key: 'ghost2' },
                { key: 'ghost1' },
                { key: 'ghost1' },
                { key: 'ghost1' },
                { key: 'ghost1' },
                { key: 'ghost1' },
                { key: 'ghost2' }
            ],
            frameRate: 4,
            repeat: 0
        });
        this.anims.create({
            key: 'skeleton_death',
            frames: [
                { key: 'skeleton_death1' },
                { key: 'skeleton_death2' },
                { key: 'skeleton_death3' }
            ],
            frameRate: 4,
            repeat: 0
        });
        this.anims.create({
            key: 'skeleton_wake',
            frames: [
                { key: 'skeleton_death2' },
                { key: 'skeleton_death1' },
                { key: 'skeleton1' }
            ],
            frameRate: 4,
            repeat: 0
        });
        this.anims.create({
            key: 'bat_walk',
            frames: [
                { key: 'bat1' },
                { key: 'bat2' },
                { key: 'bat3' }
            ],
            frameRate: 4,
            repeat: -1
        });

        //let bg = this.physics.add.staticGroup();
        G.platforms = this.physics.add.staticGroup();
        G.updatables = this.physics.add.group();
        G.hittables = this.physics.add.group();
        G.dangerous = this.physics.add.group();
        G.platform_hit = this.physics.add.group();

        if(room.map)
        {
            this.addLegacyMap();
        }
        else
        {
            this.addTileMap();
        }


        for (exit of room.exits)
        {
            this.addExit(exit.x, exit.y, exit.w, exit.h, exit.dest, exit.entrance_index);
        }

        if (room.create) {
            room.create(this);
        }

        //set up player
        let start_x = room.entrances[CurrentEntrance].x;
        let start_y = room.entrances[CurrentEntrance].y;
        let start_flip = room.entrances[CurrentEntrance].flip;
        Player.initialize(this, start_x, start_y, start_flip);
        this.cameras.main.startFollow(Player.sprite, true, 1, 1, 0, +64);
        this.updateLayout();

        G.whips = this.physics.add.group();
        G.whips.defaults.setAllowGravity = false;
        G.whips.defaults.setImmovable = true;
        G.whips.add(Player.whip3);

        //set up input

        G.mobile_cursors = {
            left : { isDown : false },
            right : { isDown : false },
            up : { isDown : false },
            down : { isDown : false },
            letter_left : { isDown : false },
            letter_right : { isDown : false },
        };

        // /*
        G.desktop_cursors = this.input.keyboard.createCursorKeys();
        G.desktop_cursors.letter_left = this.input.keyboard.addKey("a");
        G.desktop_cursors.letter_right = this.input.keyboard.addKey("d");
        G.desktop_cursors.letter_up = this.input.keyboard.addKey("w");
        G.desktop_cursors.letter_down = this.input.keyboard.addKey("s");
        // */

        //set up collider groups
        this.physics.add.collider(Player.sprite, G.platforms);
        this.physics.add.collider(G.platform_hit, G.platforms);
        this.physics.add.overlap(G.whips, G.hittables, this.whipHit, null, this);
        this.physics.add.overlap(Player.sprite, G.dangerous, Player.hitPlayer, null, this);
    },


    whipHit: function(whip, hittable) {
        if (whip.visible && hittable.hit) {
            let hit_landed = hittable.hit();
            if (hit_landed) {
                //this.cameras.main.shake(100,0.01);
            }
        }
    },

    mergeCursors : function() {
        let G = this.myGameState;

        G.cursors = {
            left : { isDown : false },
            right : { isDown : false },
            up : { isDown : false },
            down : { isDown : false },
            letter_left : { isDown : false },
            letter_right : { isDown : false },
        };

        G.cursors.left.isDown = G.mobile_cursors.left.isDown || G.desktop_cursors.left.isDown;
        G.cursors.right.isDown = G.mobile_cursors.right.isDown || G.desktop_cursors.right.isDown;
        G.cursors.up.isDown = G.mobile_cursors.up.isDown || G.desktop_cursors.up.isDown;
        G.cursors.down.isDown = G.mobile_cursors.down.isDown || G.desktop_cursors.down.isDown;
        G.cursors.letter_left.isDown = G.mobile_cursors.letter_left.isDown || G.desktop_cursors.letter_left.isDown;
        G.cursors.letter_right.isDown = G.mobile_cursors.letter_right.isDown || G.desktop_cursors.letter_right.isDown;
    },

    //--------------------------------------------------------------------------
    update: function() {
        let G = this.myGameState;

        G.updatables.children.each(function(updatable) {
            if (updatable.update)
            {
                updatable.update();
            }
        }, this);

        this.mergeCursors();

        Player.update(this);
    }
});

let launcher_config = {
    backgroundColor: '#050505',
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    scene: [ StartScreen ]
};

let launcher_game = new Phaser.Game(launcher_config);