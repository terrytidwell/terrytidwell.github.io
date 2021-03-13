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
        this.load.image('book', 'assets/open_storybook.png')

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
        let scene = this
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
    scene: [ LoadScene, GameScene ]
};

game = new Phaser.Game(config);
