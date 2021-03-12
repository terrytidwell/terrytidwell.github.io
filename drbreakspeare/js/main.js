const GRID_SIZE = 50;
const SCREEN_WIDTH = 1200; //1025
const SCREEN_HEIGHT = 800; //576

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
        this.load.image('book', 'assets/open_storybook.png')
        this.load.spritesheet('hero', 'assets/16x16 knight 1 v3.png',
            { frameWidth: 64, frameHeight: 64 });

        scene.load.on('progress', function(percentage) {
            percentage = percentage * 100;
            loading_text.setText(Math.round(percentage) + "%");
        });
        scene.load.once('complete',  function() {
            scene.scene.start('GameScene');
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

        this.story = new inkjs.Story(this.cache.json.get("story"));
        scene.add.sprite(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, "book").setScale(2);
        /*
        let grid = scene.add.grid(SCREEN_WIDTH/2, SCREEN_HEIGHT/2,
            SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2, GRID_SIZE, GRID_SIZE, 0xFFFFFF)
            .setAltFillStyle(0xC0C0C0)
            .setOutlineStyle()
            .setAlpha(0.25);
         */

        // set up the style for the text
        this.textStyle = {
            fill: "#000000",
            font: GRID_SIZE/2 + "px SpecialElite",
            align: "left",
            wordWrap: { width: 400, useAdvancedWrap: true }
        }

        // set up the main text
        this.mainText = this.add.text(150, 100, "", this.textStyle);

        // create the button group
        this.buttonGroup = this.add.group();

        // start the story
        this.continueStory();
    },

    // custom functions for dealing with phaser & ink start here!

    continueStory: function() {
        let txt = ""; // holds all of the main paragraph text

        // fetch story data from json until there's nothing left, then show the choices
        // using a do...while loop to make sure single-line paragraphs are displayed
        do {
            // add lines to the text letiable
            txt += this.story.Continue(); // add the next line to the txt let

            // if this is the last line, render the text & the choices
            if (!this.story.canContinue) {
                // update the main paragraph text
                this.mainText.text = txt;

                // update the list of possible choices
                this.choiceList = this.story.currentChoices;

                // create the choices
                this.createChoices();
            }
        } while (this.story.canContinue);
    },

    createChoices: function() {
        // loop through the list of current choices
        let offset = 0;
        for (let i = 0; i < this.choiceList.length; i++) {
            // get a reference to the current choice
            let choice = this.choiceList[i];

            // create a button for each choice
            let topMargin = this.mainText.height;
            //let button = this.add.text(10, topMargin + (36 * i), "button", this.choiceClick, this, 1, 0, 0, 0, this.buttonGroup);
            // set a let on the button to keep track of which choice that button represents
            //button.choiceIndex = choice.index;

            // create a text object for each choice
            let choiceText = this.add.text(650, 100 + offset, choice.text, this.textStyle);
            offset += choiceText.getBounds().height + GRID_SIZE/2;
            choiceText.choiceIndex = choice.index;
            choiceText.setInteractive();
            choiceText.alpha = 0.5;
            choiceText.on('pointerover',function(pointer){
                {
                    this.alpha = 1;
                }
            });
            choiceText.on('pointerout',function(pointer){
                {
                    this.alpha = 0.5;
                }
            });
            let scene = this;
            choiceText.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                function () {
                    scene.story.ChooseChoiceIndex(choiceText.choiceIndex);
                    scene.buttonGroup.clear(true,true);
                    scene.continueStory();
                }
            );
            scene.buttonGroup.add(choiceText);
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
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
