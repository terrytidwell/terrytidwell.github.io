const GRID_SIZE = 64;
const SCREEN_WIDTH = 20*GRID_SIZE; //1025
const SCREEN_HEIGHT = 12*GRID_SIZE; //576

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        let loading_text = scene.add.text(
            SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
            "0%", { fontSize: GRID_SIZE/2 + 'px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.json("story", "ink/storybook_rpg_draft_2.json");
        this.load.image('book', 'assets/open_storybook.png');
        this.load.spritesheet('hero', 'assets/16x16 knight 1 v3.png',
            { frameWidth: 64, frameHeight: 64 });

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('GameScene');
            scene.scene.start('BattleScene');
            let battle_scene = scene.scene.get('BattleScene')
            battle_scene.scene.pause();
            scene.scene.stop('LoadScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.anims.create({
            key: 'hero_idle',
            frames: [
                { key: 'hero', frame: 0 },
                { key: 'hero', frame: 1 },
                { key: 'hero', frame: 2 },
                { key: 'hero', frame: 3 },
                { key: 'hero', frame: 4 },
            ],
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'hero_run',
            frames: [
                { key: 'hero', frame: 8 },
                { key: 'hero', frame: 9 },
                { key: 'hero', frame: 10 },
                { key: 'hero', frame: 11 },
                { key: 'hero', frame: 12 },
                { key: 'hero', frame: 13 },
                { key: 'hero', frame: 14 },
                { key: 'hero', frame: 15 },
            ],
            skipMissedFrames: false,
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'hero_attack',
            frames: [
                { key: 'hero', frame: 32 },
                { key: 'hero', frame: 33 },
                { key: 'hero', frame: 34 },
                { key: 'hero', frame: 35 },
                { key: 'hero', frame: 36 },
                { key: 'hero', frame: 37 },
            ],
            skipMissedFrames: false,
            frameRate: 12,
            repeat: 0
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'BattleScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let CHARACTER_SPRITE_SIZE = 3;

        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle();

        scene.__shadow = scene.add.ellipse(0,0,
            12*CHARACTER_SPRITE_SIZE,4*CHARACTER_SPRITE_SIZE,0x000000, 0.5);

        scene.__character_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__character_y_offset = -16*CHARACTER_SPRITE_SIZE;
        scene.__character = scene.add.sprite(0,0,
            'hero', 0)
            .setScale(CHARACTER_SPRITE_SIZE);

        scene.__hitbox_x_offset = 0*CHARACTER_SPRITE_SIZE;
        scene.__hitbox_y_offset = -8*CHARACTER_SPRITE_SIZE;
        scene.__hitbox = scene.add.rectangle(0, 0,
            6*CHARACTER_SPRITE_SIZE,20*CHARACTER_SPRITE_SIZE,0x00ff00, 0.0);

        //scene.__solidbox_x_offset = 0*CHARACTER_SPRITE_SIZE;
        //scene.__solidbox_y_offset = 13*CHARACTER_SPRITE_SIZE;
        scene.__solidbox = scene.add.rectangle(0,0,
            12*CHARACTER_SPRITE_SIZE,4*CHARACTER_SPRITE_SIZE,0xff0000, 0.0);
        scene.physics.add.existing(scene.__solidbox);



        scene.__align_player_group = function () {
            let center_x = scene.__solidbox.body.x + scene.__solidbox.width / 2;
            let center_y = scene.__solidbox.body.y + scene.__solidbox.height / 2;

            scene.__character.x = center_x + scene.__character_x_offset;
            scene.__character.y =  center_y + scene.__character_y_offset;
            scene.__shadow.x = center_x;
            scene.__shadow.y =  center_y;
            scene.__hitbox.x = center_x + scene.__hitbox_x_offset;
            scene.__hitbox.y =  center_y + scene.__hitbox_y_offset;
        };
        scene.__align_player_group();

        scene.input.addPointer(5);
        //scene.input.setPollAlways();

        /*
        let mouse_vector = new Phaser.Math.Vector2(0, 0);

        scene.input.on(Phaser.Input.Events.POINTER_MOVE, function(pointer) {
            let dx = pointer.worldX - scene.__gun.x;
            let dy = pointer.worldY - scene.__gun.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            dx = dx / d * GRID_SIZE/SPRITE_SCALE/2;
            dy = dy / d * GRID_SIZE/SPRITE_SCALE/2;
            mouse_vector.x = dx;
            mouse_vector.y = dy;
            scene.__character.setFlipX(dx < 0);
        });
         */

        scene.__cursor_keys = scene.input.keyboard.createCursorKeys();
        scene.__cursor_keys.letter_left = scene.input.keyboard.addKey("a");
        scene.__cursor_keys.letter_right = scene.input.keyboard.addKey("d");
        scene.__cursor_keys.letter_up = scene.input.keyboard.addKey("w");
        scene.__cursor_keys.letter_down = scene.input.keyboard.addKey("s");
        scene.__cursor_keys.letter_one = scene.input.keyboard.addKey("q");

        scene.__moving = false;
        scene.__hitting = false;

        scene.cameras.main.setBounds(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, 2*SCREEN_WIDTH, 2*SCREEN_HEIGHT);
        scene.cameras.main.startFollow(scene.__character, true, 1, 1, 0, 0);

        //scene.physics.add.collider(scene.__solidbox, platforms);

        /*
        let platforms = scene.physics.add.staticGroup();
        let overlaps = scene.physics.add.staticGroup();

        scene.G.player.data.values.addCollider(scene.physics, platforms);
        scene.G.player.data.values.addOverlap(scene.physics, overlaps);d
         */
        scene.__character.play('hero_idle');
        scene.cameras.main.x = SCREEN_WIDTH;
        scene.scene.pause();
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        if (scene.__hitting) {
            return;
        }

        if (scene.__cursor_keys.letter_one.isDown) {
            scene.__solidbox.body.setVelocity(0,0);
            scene.__character.anims.stop();
            scene.__character.play('hero_attack');
            scene.__hitting = true;
            scene.__moving = false;
            scene.time.delayedCall(500, function () {
                scene.__hitting = false;
                scene.__character.anims.stop();
                scene.__character.play('hero_idle');
            });
            return;
        }

        let dx = 0;
        let dy = 0;
        if (scene.__cursor_keys.left.isDown ||
            scene.__cursor_keys.letter_left.isDown) {
            dx -= 1;
        }
        if (scene.__cursor_keys.right.isDown ||
            scene.__cursor_keys.letter_right.isDown) {
            dx += 1;
        }
        if (scene.__cursor_keys.up.isDown ||
            scene.__cursor_keys.letter_up.isDown) {
            dy -= 1;
        }
        if (scene.__cursor_keys.down.isDown ||
            scene.__cursor_keys.letter_down.isDown) {
            dy += 1;
        }
        //normalize
        let d = Math.sqrt(dx * dx + dy * dy);
        let v = 90*GRID_SIZE/16;
        if (d !== 0) {
            dx = dx / d * v;
            dy = dy / d * v;
        }



        let moving = false;
        if (dx !== 0 || dy !== 0) {
            moving = true;
        }
        if (moving !== scene.__moving) {
            scene.__moving = moving;
            if (moving) {
                scene.__character.anims.stop();
                scene.__character.play('hero_run');
            } else {
                scene.__character.anims.stop();
                scene.__character.play('hero_idle');
                //scene.__character.setTexture('hero', 0);
            }
        }
        if (dx < 0) {
            scene.__character.setFlipX(true);
        } else if (dx > 0) {
            scene.__character.setFlipX(false);
        }
        scene.__solidbox.body.setVelocity(dx,dy);
        scene.__align_player_group()
    },
});

let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'GameScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        let CHARACTER_SPRITE_SIZE = 3;

        scene.input.addPointer(5);

        scene.__story = new inkjs.Story(this.cache.json.get("story"));
        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, "book").setScale(2);

        /*
        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle()
            .setAlpha(0.25);
         */

        // set up the style for the text
        scene.__textStyle = {
            fill: "#000000",
            font: GRID_SIZE/2 + "px SpecialElite",
            align: "left",
            wordWrap: { width: 6*GRID_SIZE, useAdvancedWrap: true }
        };

        // set up the main text
        scene.__mainText = scene.add.text(3*GRID_SIZE, 2*GRID_SIZE, "", scene.__textStyle);

        // create the button group
        scene.__buttonGroup = scene.add.group();

        // start the story
        scene.__continueStory();
    },

    // custom functions for dealing with phaser & ink start here!

    __continueStory: function() {
        let scene = this;
        let txt = ""; // holds all of the main paragraph text

        // fetch story data from json until there's nothing left, then show the choices
        // using a do...while loop to make sure single-line paragraphs are displayed
        do {
            // add lines to the text letiable
            txt += scene.__story.Continue(); // add the next line to the txt let

            // if this is the last line, render the text & the choices
            if (!scene.__story.canContinue) {
                // update the main paragraph text
                scene.__mainText.text = txt;

                // create the choices
                scene.__createChoices(scene.__story.currentChoices);
            }
        } while (scene.__story.canContinue);
    },

    __createChoices: function(choiceList) {

        let scene = this;
        if (0 === choiceList.length) {

            let battle_scene = scene.scene.get('BattleScene');
            scene.add.tween({
                targets: battle_scene.cameras.main,
                x: battle_scene.cameras.main.x - SCREEN_WIDTH,
                onComplete: function() {
                    battle_scene.scene.resume();
                }
            });
            scene.add.tween({
                targets: scene.cameras.main,
                x: scene.cameras.main.x - SCREEN_WIDTH,
                onComplete: function() {
                    scene.scene.pause();
                }
            });
        }

        // loop through the list of current choices
        let offset = 0;
        for (let choice of choiceList) {
            // create a button for each choice
            let topMargin = scene.__mainText.height;

            // create a text object for each choice
            let choiceText = scene.add.text(11*GRID_SIZE, 2*GRID_SIZE + offset, choice.text, scene.__textStyle);
            offset += choiceText.getBounds().height + GRID_SIZE/2;
            choiceText.choiceIndex = choice.index;
            choiceText.setInteractive();
            choiceText.alpha = 0.5;
            choiceText.on('pointerover',function(){ this.alpha = 1;  });
            choiceText.on('pointerout',function(){ this.alpha = 0.5; });
            choiceText.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                function () {
                    scene.__story.ChooseChoiceIndex(choiceText.choiceIndex);
                    scene.__buttonGroup.clear(true,true);
                    scene.__continueStory();
                }
            );
            scene.__buttonGroup.add(choiceText);
        }
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;
    },
});

let config = {
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    render: {
        pixelArt: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ LoadScene, GameScene, BattleScene ]
};

game = new Phaser.Game(config);