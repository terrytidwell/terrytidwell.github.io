var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            //gravity: { y: 300 },
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
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var gravity = 0;
var camera;
var flip;
const MAX_ROTATION = 128;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'star');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    /*
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    */
    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    //this.physics.add.collider(stars, platforms);
    //this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    //this.physics.add.overlap(player, stars, collectStar, null, this);

    //this.physics.add.collider(player, bombs, hitBomb, null, this);
    camera = this.cameras.main;
    camera.startFollow(player);
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
    camera.setRotation(2 * Math.PI * gravity/MAX_ROTATION);
}

function update ()
{
    if (gameOver)
    {
        return;
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

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}