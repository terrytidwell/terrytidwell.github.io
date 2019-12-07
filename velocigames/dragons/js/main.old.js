var config = {
    type: Phaser.AUTO,
    width: 32*30,
    height: 32*20,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
	autoCenter: Phaser.Scale.CENTER_BOTH,
	mode: Phaser.Scale.FIT,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var breakables;
var bumpers;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var gravity = 0;
var camera;
var flip;
var shake;
const MAX_ROTATION = 128;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('blocks', 'assets/stone.png', { frameWidth: 32, frameHeight: 32 });
}

//add a ledge of blocks, at x,y block offset and height by width blocks
function addLedge(scene, group, x,y,width,height)
{
    let block_size=32;
    let ledge_width = width * block_size;
    let ledge_height = height * block_size;
    let center_x = x * block_size + ledge_width/2;
    let center_y = y * block_size + ledge_height/2;
    let platform = scene.add.tileSprite(center_x, center_y, ledge_width, ledge_height, 'blocks', 1);
    group.add(platform);
}

function addBreakable(x, y)
{
    let block_size = 32;
    breakables.create(block_size * x - block_size/2,block_size * y - block_size/2, 'blocks',5).setImmovable(true);
}


function addBumper(x, y)
{
    let block_size = 32;
    bumpers.create(block_size * x - block_size/2,block_size * y - block_size/2, 'blocks',25).setImmovable(true);
}

function addStar(x, y)
{
    let block_size = 32;
    stars.create(block_size * x - block_size/2,block_size * y - block_size/2, 'star').setImmovable(true);
}

function create ()
{
    platforms = this.physics.add.staticGroup();
    breakables = this.physics.add.group();
    bumpers = this.physics.add.group();
    stars = this.physics.add.group();
    bombs = this.physics.add.group();

    addLedge(this, platforms, 0, 0, 1, 20);
    addLedge(this, platforms, 30, 0, 1, 20);
    addLedge(this, platforms, 1, 0, 29, 1);
    addLedge(this, platforms, 1, 19, 29, 1);

    addLedge(this, platforms, 1, 10, 8, 1);
    addLedge(this, platforms, 9, 12, 5, 1);
    addLedge(this, platforms, 18, 6, 12, 1);
    addLedge(this, platforms, 14, 1, 1, 10);

    addBreakable(27, 17);
    addBreakable(26, 17);
    addBreakable(25, 17);
    addBreakable(25, 16);
    addStar(26, 16);
    addBreakable(27, 16);
    addBreakable(27, 15);
    addBreakable(26, 15);
    addBreakable(25, 15);

    addBreakable(27, 12);
    addBreakable(26, 12);
    addBreakable(25, 12);
    addBreakable(25, 11);
    addStar(26, 11);
    addBreakable(27, 11);
    addBreakable(27, 10);
    addBreakable(26, 10);
    addBreakable(25, 10);

    addBumper(16, 6);
    addBumper(19, 2);
    addBumper(22, 6);
    addBumper(25, 2);
    addBumper(28, 6);

    player = this.physics.add.sprite(3 * 32 - 16, 15 * 32 - 16, 'star');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    bombs.create(32*28 - 16, 32*18 - 16, 'bomb').setBounce(0.2).setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, breakables);
    this.physics.add.collider(bombs, bumpers, bounce, null, this);
    this.physics.add.collider(player, breakables, calculateImpact, null, this);
    this.physics.add.collider(player, bumpers, bounce, null, this);

    for (let x = 2; x < 15; x++) {
        for (let y = 2; y < 11; y++)
        {
            addStar(x,y);
        }
    }

    addStar(30, 2 );
    addStar(30, 3 );
    addStar(30, 4 );
    addStar(30, 5 );
    addStar(30, 6 );


    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
    camera = this.cameras.main;
    camera.startFollow(player);
}

function calculateImpact(player, breakables)
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
}

function rotateGravity(amount)
{
    gravity+=amount;
    while (gravity < 0 || gravity >= MAX_ROTATION) {
        if (gravity < 0) {
            gravity += MAX_ROTATION;
        } else {
            //gravity >= MAX_GRAVITY
            gravity -= MAX_ROTATION;
        }
    }
}

function setGravity(phaser)
{
    let x = Math.sin(2 * Math.PI * gravity/MAX_ROTATION);
    let y = Math.cos(2 * Math.PI * gravity/MAX_ROTATION);
    player.body.setGravity(Math.round(x*300),Math.round(y*300));
    bombs.children.each(function(bomb) {
        bomb.body.setGravity(Math.round(x*300),Math.round(y*300));
    }, this);
    camera.setRotation(2 * Math.PI * gravity/MAX_ROTATION);
}

function bounce(player, bumper)
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
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (player.body.speed > 500)
    {
        camera.shake(500, 0.003)
    }
    else if (player.body.speed < 500)
    {
        camera.shake(0, 0)
    }

    if (cursors.left.isDown)
    {
        rotateGravity(-1);
        setGravity(this);
        //player.setVelocityX(-160);

        //player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        rotateGravity(1);
        setGravity(this);
        //player.setVelocityX(160);

        //player.anims.play('right', true);
    }
    else
    {
        //player.setVelocityX(0);

        //player.anims.play('turn');
    }

    if (!flip && (cursors.up.isDown || cursors.down.isDown))
    {
        flip = true;
        gravity += MAX_ROTATION/2;
        if (gravity >= MAX_ROTATION)
        {
            gravity -= MAX_ROTATION;
        }
        setGravity(this);
        //player.setVelocityY(-330);
    }
    else if (!cursors.up.isDown && !cursors.down.isDown)
    {
        flip = false;
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}