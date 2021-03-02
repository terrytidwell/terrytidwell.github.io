const GRID_SIZE = 64;
//const SPRITE_SCALE = GRID_SIZE/32;
const GRID_COLS = 12;
const GRID_ROWS = 12;
const SCREEN_WIDTH = GRID_SIZE * GRID_COLS; //845 + 400; //845; //1025
const SCREEN_HEIGHT = GRID_SIZE * GRID_COLS; //542 + 150; //542; //576
const DEPTHS = {
    BOARD: 0,
    SURFACE: 1,
    ENTITIES: 1000,
}
const DIRECTIONS = {
    RIGHT: {dx: 1, dy: 0},
    LEFT: {dx: -1, dy: 0},
    UP: {dx: 0, dy: -1},
    DOWN: {dx: 0, dy: 1},

    UP_LEFT : {dx: -1, dy: -1},
    UP_RIGHT : {dx: 1, dy: -1},
    DOWN_LEFT : {dx: 1, dy: -1},
    DOWN_RIGHT : {dx: 1, dy: 1},
};

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

        this.load.spritesheet('floor', 'assets/Wood 1 TD 64x72.png', { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('pieces', 'assets/White - Rust 1 128x128.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('impact', 'assets/Impact.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('frame', 'assets/frame.png');

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
            key: 'impact_anim',
            frames: [
                { key: 'impact', frame: 0 },
                { key: 'impact', frame: 1 },
                { key: 'impact', frame: 2 },
                { key: 'impact', frame: 3 },
                { key: 'impact', frame: 4 },
                { key: 'impact', frame: 5 },
            ],
            skipMissedFrames: false,
            frameRate: 24,
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

        //----------------------------------------------------------------------
        //FUNCTIONS
        //----------------------------------------------------------------------

        let gridX = function(x) {
            return x * GRID_SIZE + GRID_SIZE/2;
        };

        let gridY = function(y) {
            return y * GRID_SIZE + GRID_SIZE/2;
        };

        let characterY = function(y) {
            return gridY(y - .5);
        };

        let isGridPassable = function(x,y) {
            return x >= 0 && x < 12 &&
                y >= 0 && y < 12 &&
                grid[x][y].visible;
        };

        //----------------------------------------------------------------------
        //GAME h SETUP
        //----------------------------------------------------------------------

        let grid = [];
        let hittables = scene.physics.add.group();
        //let dangerous_touchables = scene.physics.add.group();

        let index_image = Phaser.Utils.Array.NumberArray(0,3);
        for (let x = 0; x < 12; x++)
        {
            grid.push([]);
            for (let y = 0; y < 12; y++)
            {
                let offset = 4 * ((x + y) % 2);
                let tile = Phaser.Utils.Array.Shuffle(index_image)[0] + offset;
                let square = scene.add.sprite(gridX(x), gridY(y), 'floor', tile);
                square.setDepth(DEPTHS.BOARD);
                square.setVisible(false);
                if (x >= 2 && x < 10 &&
                    y >= 2 && y < 10)
                {
                    square.setVisible(true);
                }
                grid[x].push(square);
            }
        }

        let addPlayer = function(x,y) {
            let character = scene.add.rectangle(0,0,GRID_SIZE-2,GRID_SIZE-2,0x00ff00,0.0);
            character.setData('x',x);
            character.setData('dx',0);
            character.setData('y',y);
            character.setData('dy',0);
            character.setData('z',-1000);
            character.setData('update', function() {
                let x = character.data.values.x;
                let y = character.data.values.y;
                let z = character.data.values.z;
                sprite.setPosition(gridX(x), characterY(y)+z);
                sprite.setDepth(DEPTHS.ENTITIES + y);
                shadow.setPosition(gridX(x),gridY(y));
                character.setPosition(gridX(Math.round(x)),gridY(Math.round(y)));
                for (let i = 0; i < frames.length; i++) {
                    let frame = frames[i];
                    let frame_x = x + frame.data.values.dx;
                    let frame_y = y + frame.data.values.dy;
                    frame.setPosition(gridX(frame_x),
                        gridY(frame_y));
                    frame.setVisible(playerMoveAllowed &&
                        isGridPassable(frame_x,frame_y));
                }
            });

            let impact = function() {
                impact_sprite.setPosition(
                    gridX(Math.round(character.data.values.x)),
                    gridY(Math.round(character.data.values.y)));
                impact_sprite.play('impact_anim');
            };

            let movePlayer = function(x, y) {
                character.setData('dx', x - character.data.values.x);
                character.setData('dy', y - character.data.values.y);
                if (character.data.values.dx === 2) {
                    setOrientation(orientation.RIGHT);
                }
                if (character.data.values.dy === -2) {
                    setOrientation(orientation.UP);
                }
                if (character.data.values.dy === 2) {
                    setOrientation(orientation.DOWN);
                }
                if (character.data.values.dx === -2) {
                    setOrientation(orientation.LEFT);
                }

                playerMoveAllowed = false;
                let z_height = -64;
                let tweenX = scene.tweens.add({
                    targets: { x: character.data.values.x},
                    props: { x: x },
                    duration: 100,
                    onUpdate: function() {
                        character.setData('x',tweenX.getValue());
                    }
                });
                let tweenY = scene.tweens.add({
                    targets: { y: character.data.values.y},
                    props: { y: y },
                    duration: 100,
                    onUpdate: function() {
                        character.setData('y',tweenY.getValue());
                    }
                });
                let timeline = scene.tweens.createTimeline();
                timeline.add({
                    targets: { z: character.data.values.z},
                    props: { z: z_height },
                    duration: 100,
                    onUpdate: function() {
                        character.setData('z',this.getValue());
                    },
                    onComplete: function() {
                        playerDangerous = true;
                    }
                });
                timeline.add({
                    targets: { z: z_height},
                    props: { z: 0 },
                    duration: 50,
                    onUpdate: function() {
                        character.setData('z',this.getValue());
                    },
                    onComplete: function()
                    {
                        impact();
                        playerMoveAllowed = true;
                        playerDangerous = false;
                    }
                });
                timeline.play();
            };

            let orientation = {
                RIGHT: 0,
                UP: 1,
                DOWN: 2,
                LEFT: 3
            };
            let setOrientation = function(orientation) {
                sprite.setTexture('pieces', 4 + orientation);
            }

            let tryMovePlayer = function(x, y) {
                if (!playerMoveAllowed) {
                    return;
                }
                if (x !== character.data.values.x &&
                    y !== character.data.values.y &&
                    3 === Phaser.Math.Distance.Snake(x, y,
                        character.data.values.x, character.data.values.y) ) {
                    movePlayer(x, y);
                }
            };

            let playerMoveAllowed = false;
            let playerDangerous = false;
            let tweenZ = scene.tweens.add({
                targets: { z: character.data.values.z},
                props: { z: 0 },
                duration: 1000,
                onUpdate: function() {
                    character.setData('z', tweenZ.getValue());
                },
                onComplete: function() {
                    impact();
                    playerMoveAllowed = true;
                }
            });

            character.setData('isVulnerable', function() {
                return playerMoveAllowed;
            });

            character.setData('isHitting', function() {
                return playerDangerous;
            });

            let moves = [
                {dx: -2, dy: -1},
                {dx: -2, dy: 1},
                {dx: 2, dy: -1},
                {dx: 2, dy: 1},
                {dx: -1, dy: -2},
                {dx: 1, dy: -2},
                {dx: -1, dy: 2},
                {dx: 1, dy: 2}
            ];
            let frames = [];
            for (let i = 0; i < moves.length; i++) {
                let frame = scene.add.sprite(0,0,'frame').setScale(2);
                frames.push(frame);
                frame.setData('dx', moves[i].dx);
                frame.setData('dy', moves[i].dy);
                frame.setInteractive();
                frame.setDepth(DEPTHS.SURFACE);
                frame.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
                    function () {
                        tryMovePlayer(character.data.values.x + frame.data.values.dx,
                            character.data.values.y + frame.data.values.dy);
                    }
                );
            }
            let sprite = scene.add.sprite(0, 0, 'pieces', 4);;
            scene.physics.add.existing(character);
            let impact_sprite = scene.add.sprite(0,0, 'impact', 5).setVisible(true).setScale(2);
            let shadow = scene.add.ellipse(0, 0,
                GRID_SIZE*.70,GRID_SIZE*.57,0x000000, 0.5);
            shadow.setDepth(DEPTHS.SURFACE);

            character.data.values.update();
            return character;
        };

        let addPawn = function(x,y) {
            let pawn = scene.add.sprite(gridX(0), characterY(0), 'pieces', 12);
            let m_x = x;
            let m_y = y;
            let m_z = 0;
            let m_dx = 0;
            let m_dy = 0;
            let m_impact_x = 0;
            let m_impact_y = 0;
            let m_prefer_horizontal = Phaser.Math.Between(0,99) < 50;
            //cancel tweens with tween.remove();
            //cancel timeline with timeline.stop();
            //cancel with delayedCall.remove(false) <-- if you don't want callback

            let tweens = [];
            let timelines = [];
            let delayedCalls = [];

            let STATES = {
                MOVING: 0,
                IDLE: 1,
                PRE_ATTACK: 2,
                ATTACK: 3,
                POST_ATTACK_IDLE: 4,
                STUNNED: 5
            };
            let current_state = STATES.IDLE;

            let enter_state = function() {
                switch(current_state) {
                    case STATES.MOVING:
                        enter_move();
                        break;
                    case STATES.IDLE:
                        delayedCalls.push(scene.time.delayedCall(1000, change_state, [STATES.MOVING]));
                        break;
                      case STATES.POST_ATTACK_IDLE:
                        delayedCalls.push(scene.time.delayedCall(1000, change_state, [STATES.MOVING]));
                        break;
                    case STATES.PRE_ATTACK:
                        tweens.push(scene.tweens.add({
                                targets: {z : 0},
                                props: {z: -8},
                                yoyo: true,
                                repeat: 1,
                                duration: 100,
                                onUpdate: function() {
                                    m_z = this.getValue();
                                },
                                onComplete: function () {
                                    change_state(STATES.ATTACK);
                                },
                        }));
                        break;
                    case STATES.ATTACK:
                        let deltaX = Math.round(scene.__character.data.values.x)
                            - Math.round(m_x);
                        let deltaY = Math.round(scene.__character.data.values.y)
                            - Math.round(m_y);
                        if ((deltaX === -1 && deltaY === -1) ||
                                (deltaX === 1 && deltaY === 1) ||
                                (deltaX === 1 && deltaY === -1) ||
                                (deltaX === -1 && deltaY === 1)) {
                                m_dx = deltaX;
                                m_dy = deltaY;
                                if (isGridPassable(m_x + m_dx, m_y + m_dy)) {
                                    let rendevous = 0;
                                    let rendevous_complete = function() {
                                        rendevous++;
                                        if (rendevous === 2) {
                                            change_state(STATES.POST_ATTACK_IDLE);
                                        }
                                    };
                                    tweens.push(scene.tweens.add({
                                        targets: { x: m_x},
                                        props: { x: m_x+m_dx/2 },
                                        duration: 100,
                                        yoyo: true,
                                        onUpdate: function() {
                                            m_x = this.getValue();
                                        },
                                        onComplete: rendevous_complete
                                    }));
                                    tweens.push(scene.tweens.add({
                                        targets: { y: m_y},
                                        props: { y: m_y+m_dy/2 },
                                        duration: 100,
                                        yoyo: true,
                                        onUpdate: function() {
                                            m_y = this.getValue();
                                        },
                                        onComplete: rendevous_complete
                                    }));
                                    return;
                                }
                        }
                        //so we didn't do it, return to idle
                        change_state(STATES.IDLE);
                        break;
                    case STATES.STUNNED:
                        m_z = 0;
                        m_y = Math.round(m_y);
                        m_x = Math.round(m_x);
                        pawn.alpha = 0.5;
                        let directions = [
                            {d:DIRECTIONS.UP, m:0},
                            {d:DIRECTIONS.LEFT, m:0},
                            {d:DIRECTIONS.RIGHT, m:0},
                            {d:DIRECTIONS.DOWN, m:0}
                        ];
                        for(let direction of directions) {
                            direction.m = direction.d.dx * m_impact_x +
                                direction.d.dy * m_impact_y;
                        }
                        directions.sort(function(a,b) {
                            if(a.m > b.m) {
                                return -1;
                            }
                            if (a.m < b.m) {
                                return 1;
                            }
                            return 0;
                            });
                        for(let direction of directions) {
                            if (isGridPassable(m_x+direction.d.dx, m_y+direction.d.dy)) {
                                m_dx = direction.d.dx;
                                m_dy = direction.d.dy;
                                m_x += m_dx;
                                m_y += m_dy;
                                break;
                            }
                        }
                        tweens.push(scene.tweens.add({
                            targets: pawn,
                            alpha: 0,
                            yoyo: true,
                            duration: 50,
                            repeat: -1,
                        }));
                        delayedCalls.push(scene.time.delayedCall(2000, change_state, [STATES.MOVING]));
                        break;
                    default:
                        break;
                }
            };

            let exit_state = function() {
                switch(current_state) {
                    case STATES.STUNNED:
                        pawn.alpha = 1;
                        break;
                    default:
                        break;
                }
            };

            let change_state = function(new_state) {
                //clear async calls
                Phaser.Utils.Array.Each(tweens, function(tween) { tween.remove(); }, pawn);
                Phaser.Utils.Array.Each(timelines, function(timeline) { timeline.stop(); }, pawn);
                Phaser.Utils.Array.Each(delayedCalls, function(delayedCall) { delayedCall.remove(false); }, pawn);
                tweens = [];
                timelines = [];
                delayedCalls = [];

                exit_state();
                current_state = new_state;
                enter_state();
            };

            let swap_direction = function(directions, a, b) {
                let temp = directions[a];
                directions[a] =
                    directions[b];
                directions[b] = temp;
            }

            let general_move_ai = function(deltaX, deltaY, directions) {
                if (Phaser.Math.Between(0, 99) < 80) {
                    m_prefer_horizontal = !m_prefer_horizontal;
                }
                let primary_vertical_index = 0;
                let primary_horizontal_index = 1;
                let secondary_vertical_index = 2;
                let secondary_horizontal_index = 3;
                directions = [
                    DIRECTIONS.UP,
                    DIRECTIONS.LEFT,
                    DIRECTIONS.DOWN,
                    DIRECTIONS.RIGHT];
                if (m_prefer_horizontal) {
                    primary_horizontal_index = 0;
                    primary_vertical_index = 1;
                    secondary_horizontal_index = 2;
                    secondary_vertical_index = 3;
                    directions = [
                        DIRECTIONS.LEFT,
                        DIRECTIONS.UP,
                        DIRECTIONS.RIGHT,
                        DIRECTIONS.DOWN];
                }
                if (deltaX > 0 || (deltaX === 0 && Phaser.Math.Between(0, 99) < 50)) {
                    //swap horizontals
                    swap_direction(directions, primary_horizontal_index,
                        secondary_horizontal_index);
                }
                if (deltaY > 0 || (deltaY === 0 && Phaser.Math.Between(0, 99) < 50)) {
                    //swap vertical
                    swap_direction(directions, primary_vertical_index,
                        secondary_vertical_index);
                }
                return directions;
            };

            let enter_move = function() {
                let directions = [
                    DIRECTIONS.UP,
                    DIRECTIONS.LEFT,
                    DIRECTIONS.DOWN,
                    DIRECTIONS.RIGHT];
                let deltaX = Math.round(scene.__character.data.values.x)
                    - Math.round(m_x);
                let deltaY = Math.round(scene.__character.data.values.y)
                    - Math.round(m_y);
                if (deltaX === 0 && deltaY === 0) {
                    //on top movement AI
                    Phaser.Utils.Array.Shuffle(directions);
                } else if (Math.abs(deltaX)+Math.abs(deltaY) === 1) {
                    //adjacent movement AI
                    //[x]   [x]
                    //   [p]
                    //[x]   [x]
                    //target those squares around player
                    if(deltaY === 0) {
                        directions = [
                            DIRECTIONS.UP,
                            DIRECTIONS.DOWN,
                            DIRECTIONS.LEFT,
                            DIRECTIONS.RIGHT
                        ];
                    } else if(deltaX === 0) {
                        directions = [
                            DIRECTIONS.LEFT,
                            DIRECTIONS.RIGHT,
                            DIRECTIONS.UP,
                            DIRECTIONS.DOWN
                        ];
                    }
                    //now randomize
                    if (Phaser.Math.Between(0,99) < 50) {
                        swap_direction(directions, 0, 1);
                    }
                    if (Phaser.Math.Between(0,99) < 50) {
                        swap_direction(directions, 2, 3);
                    }
                } else {
                    directions = general_move_ai(deltaX,  deltaY, directions);
                }

                m_dx = 0;
                m_dy = 0;
                for (let direction of directions) {
                    if (isGridPassable(m_x+direction.dx, m_y+direction.dy)) {
                        m_dx = direction.dx;
                        m_dy = direction.dy;
                        let rendevous = 0;
                        let rendevous_complete = function() {
                            rendevous++;
                            if (rendevous === 2) {
                                change_state(STATES.IDLE);
                            }
                        };
                        tweens.push(scene.tweens.add({
                            targets: { x: m_x},
                            props: { x: m_x+m_dx },
                            duration: 200,
                            onUpdate: function() {
                                m_x = this.getValue();
                            },
                            onComplete: rendevous_complete
                        }));
                        tweens.push(scene.tweens.add({
                            targets: { y: m_y},
                            props: { y: m_y+m_dy },
                            duration: 200,
                            onUpdate: function() {
                                m_y = this.getValue();
                            },
                            onComplete: rendevous_complete
                        }));
                        return; //<------ RETURN to end function
                    }
                }
                //no direction worked?
                change_state(STATES.IDLE);
            };

            let bounding_box = scene.add.rectangle(0,0,GRID_SIZE-2,GRID_SIZE-2,0x00ff00,0.0);
            hittables.add(bounding_box);
            bounding_box.setData('onHit',function(dx, dy) {
                m_impact_x = dx;
                m_impact_y = dy;
                change_state(STATES.STUNNED);
            });

            let shadow = scene.add.ellipse(0, 0,
                GRID_SIZE*.70,GRID_SIZE*.57,0x000000, 0.5);

            pawn.setData('update', function() {
                let deltaX = Math.round(scene.__character.data.values.x)
                    - Math.round(m_x);
                let deltaY = Math.round(scene.__character.data.values.y)
                    - Math.round(m_y);
                if (current_state === STATES.IDLE &&
                    scene.__character.data.values.isVulnerable()) {
                    if ((deltaX === -1 && deltaY === -1) ||
                        (deltaX === 1 && deltaY === 1) ||
                        (deltaX === 1 && deltaY === -1) ||
                        (deltaX === -1 && deltaY === 1)) {
                        change_state(STATES.PRE_ATTACK);
                    }
                }
                pawn.setPosition(gridX(m_x),characterY(m_y) + m_z);
                shadow.setPosition(gridX(m_x),gridY(m_y));
                shadow.setVisible(m_z < 0);
                pawn.setDepth(DEPTHS.ENTITIES + m_y);
                bounding_box.setPosition(gridX(Math.round(m_x)),gridY(Math.round(m_y)));
            });

            enter_state();
            pawn.data.values.update();
            return pawn;
        };

        scene.__character = addPlayer(5,7);
        scene.__pawn = addPawn(9,9);


        //----------------------------------------------------------------------
        //SETUP INPUTS
        //----------------------------------------------------------------------

        scene.input.addPointer(5);

        //----------------------------------------------------------------------
        //SETUP PHYSICS
        //----------------------------------------------------------------------

        scene.physics.add.overlap(scene.__character, hittables, function(character, hittable) {
            if (character.data.values.isHitting()) {
                hittable.data.values.onHit(character.data.values.dx,
                    character.data.values.dy);
            }
        });
    },

    //--------------------------------------------------------------------------
    update: function() {
        let scene = this;

        scene.__character.data.values.update();
        scene.__pawn.data.values.update();
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
