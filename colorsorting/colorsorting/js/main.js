const SCREEN_HEIGHT = 1080; //500;
const SCREEN_WIDTH = 1920; //630;

const GRID_SIZE = 96; //40;
const DEPTHS = {
    BG: 0,
    CUSTOMERS: 500,
    MG: 750,
    FG: 1500,
    THUMB: 1800,
    DRAG: 1850,
    ARM: 1900,
    UI: 2000,
    PACK_OVERLAY: 3000,
};

let GAME_EVENTS = {
    money_change: "GAME_EVENTS.money_change",
};
let getFont = (align = "center", fontSize = GRID_SIZE/2, color="#FFFFFF", wrap_length= SCREEN_WIDTH/2) => {
    return {font: '' + fontSize + 'px m5x7', fill: color, align: align,
        wordWrap: {width: wrap_length, useAdvancedWrap: true}};
};

let getLogoFont = getFont;

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
        scene.input.addPointer(5);

        //max enforcable difference between two colors is 221.70
        let getDistanceBetweenColors = (colorA, colorB) => {
            return Math.sqrt(
                Math.pow(colorA.r - colorB.r, 2) +
                Math.pow(colorA.g - colorB.g, 2) +
                Math.pow(colorA.b - colorB.b, 2)
            );
        }

        let isColorDistanceInRange = (colorA, colorB, min, max) => {
            let d = getDistanceBetweenColors(colorA, colorB);
            console.log('Distance between: ', colorA, colorB, d);
            let result = d >= min && d <= max;
            console.log('Result: ', result)
            return result
        }

        let bgColor = {r:0, g:0, b:0};
        let startColor = Phaser.Display.Color.RandomRGB();
        let endColor = Phaser.Display.Color.RandomRGB();

        //while (!isColorDistanceInRange(startColor, bgColor, 30, 40)) {
        while (getDistanceBetweenColors(startColor, bgColor) < 40) {
            startColor = Phaser.Display.Color.RandomRGB();
        }

        //while (!isColorDistanceInRange(startColor, endColor, 200, 210)) {
        while (getDistanceBetweenColors(startColor, endColor) < 200 ||
            getDistanceBetweenColors(endColor, bgColor) < 40) {
            endColor = Phaser.Display.Color.RandomRGB();
        }

        const steps = 6;
        let x_locations = [];
        let colors = [];
        for (let i = 0; i < steps; i++) {
            x_locations.push(SCREEN_WIDTH/2 + (GRID_SIZE * 2 * (-(steps/2) + i + 0.5)));
            const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(
                startColor,
                endColor,
                steps - 1,
                i
            );

            const colorHex = Phaser.Display.Color.GetColor(
                Math.floor(interpolated.r),
                Math.floor(interpolated.g),
                Math.floor(interpolated.b)
            );
            colors.push({color: colorHex, solved_position: i});
        }

        Phaser.Utils.Array.Shuffle(colors);

        let allow_interaction = false;

        let containers = scene.add.group();

        let check_solved = () => {
            let check_solved_normal = () => {
                for (let c of containers.children.entries) {
                    if (c.__current_position !== c.__solved_position) {
                        return false;
                    }
                }
                return true;
            }

            let check_solved_inverted = () => {
                for (let c of containers.children.entries) {
                    if (c.__current_position !== steps - c.__solved_position - 1) {
                        return false;
                    }
                }
                return true;
            }

            return check_solved_normal() || check_solved_inverted();
        };

        let celebration_animation = () => {
            allow_interaction = false;
            for (let c of containers.children.entries) {
                scene.tweens.add({
                    targets: c,
                    yoyo: true,
                    scale: 1.2,
                    duration: 250,
                    delay: c.__current_position * 100,
                });
                let total_delay = steps*100 + 250;
                total_delay += 500;
                scene.tweens.add({
                    targets: c,
                    duration: 500,
                    delay: total_delay + (steps - c.__current_position - 1) * 100,
                    y: SCREEN_HEIGHT/2 - GRID_SIZE/2,
                    alpha: 0
                });
                total_delay += steps*100 + 500;
                total_delay += 500;
                scene.time.delayedCall(total_delay, () => {
                    scene.scene.restart();
                })
            }
        };

        for (let i = 0; i < steps; i++) {
            // Phaser's interpolation function takes an index and the total steps to calculate intermediate colors

            let container = scene.add.container(
                x_locations[i],
                SCREEN_HEIGHT/2 + GRID_SIZE/2,
            );
            containers.add(container);
            let rect = scene.add.rectangle(
                0, 0,
                GRID_SIZE, GRID_SIZE,
                colors[i].color);
            container.setSize(GRID_SIZE*2, SCREEN_HEIGHT*3/4);
            container.setInteractive();
            container.add(rect);
            container.setAlpha(0);
            container.setDepth(DEPTHS.DRAG);
            container.__current_position = i;
            container.__solved_position = colors[i].solved_position;

            scene.tweens.add({
                targets: container,
                y: SCREEN_HEIGHT/2,
                alpha: 1,
                delay: i * 100,
                duration: 500
            });

            let move_container = (container, i) => {
                container.__current_position = i;
                scene.tweens.killTweensOf(container);
                scene.tweens.add({
                    targets: container,
                    x: x_locations[container.__current_position],
                    duration: 100
                });
            };

            /*
            let handle_press = (direction) => {
                if (!allow_interaction) {
                    return;
                }
                let desired_position = container.__current_position + direction;
                if (desired_position < 0 || desired_position >= steps) {
                    return;
                }
                let found_container = null;
                for (let candidate of containers.children.entries) {
                    if (candidate.__current_position === desired_position) {
                        found_container = candidate;
                    }
                }
                if (!found_container) {
                    return;
                }

                container.setDepth(DEPTHS.DRAG+1);
                allow_interaction = false;
                scene.tweens.add({
                    targets: container,
                    x: x_locations[desired_position],
                    duration: 100,
                    onComplete: () => {
                        allow_interaction = true;
                        container.setDepth(DEPTHS.DRAG);
                        found_container.__current_position = container.__current_position;
                        container.__current_position = desired_position;
                        if (check_solved()) {
                            celebration_animation();
                        }
                    }
                });
                scene.tweens.add({
                    targets: found_container,
                    x: x_locations[container.__current_position],
                    duration: 100,
                });
            }

            let left = scene.add.zone(
                -GRID_SIZE/2, 0,
                GRID_SIZE, 2*GRID_SIZE
            );
            container.add(left);
            left.setInteractive();
            left.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                console.log("Left pushed: ", container.__current_position);
                handle_press(-1);
            });
            let right = scene.add.zone(
                GRID_SIZE/2, 0,
                GRID_SIZE, 2*GRID_SIZE
            );
            container.add(right);
            right.setInteractive();
            right.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                console.log("Right pushed: ", container.__current_position);
                handle_press(1);
            });

            */
        }
        scene.time.delayedCall(steps*100 + 500,
            () => {allow_interaction = true});

        // Enable dragging on all containers
        scene.input.setDraggable(containers.getChildren());

// Listen for drag events
        let active_container = null;
        let active_pointer = null;
        scene.input.on('dragstart', function(pointer, container) {
            if (!allow_interaction) return;
            if (active_container) return;
            scene.tweens.killTweensOf(container);
            active_container = container;
            active_pointer = pointer.id;
            container.setDepth(DEPTHS.DRAG + 1);
        });

        scene.input.on('drag', function(pointer, container, dragX, dragY) {
            if (!allow_interaction) return;
            if (active_container !== container) return;
            if (active_pointer !== pointer.id) return;
            // Move the container with the pointer (we only care about x movement here)
            container.x = dragX;
            let currentIndex = container.__current_position;

            // Check if we should swap with the left neighbor:
            if (currentIndex > 0) {
                let leftX = x_locations[currentIndex - 1];
                let midPoint = (x_locations[currentIndex] + leftX) / 2;
                if (container.x < midPoint) {
                    let leftContainer = containers.getChildren().find(c => c.__current_position === currentIndex - 1);
                    if (leftContainer) {
                        // Kill any active tweens on the neighbor before starting a new one
                        scene.tweens.killTweensOf(leftContainer);
                        leftContainer.__current_position = currentIndex;
                        container.__current_position = currentIndex - 1;
                        scene.tweens.add({
                            targets: leftContainer,
                            x: x_locations[currentIndex],
                            duration: 100
                        });
                    }
                }
            }

            // Check if we should swap with the right neighbor:
            if (currentIndex < steps - 1) {
                let rightX = x_locations[currentIndex + 1];
                let midPoint = (x_locations[currentIndex] + rightX) / 2;
                if (container.x > midPoint) {
                    let rightContainer = containers.getChildren().find(c => c.__current_position === currentIndex + 1);
                    if (rightContainer) {
                        scene.tweens.killTweensOf(rightContainer);
                        rightContainer.__current_position = currentIndex;
                        container.__current_position = currentIndex + 1;
                        scene.tweens.add({
                            targets: rightContainer,
                            x: x_locations[currentIndex],
                            duration: 100
                        });
                    }
                }
            }
        });

        scene.input.on('dragend', function(pointer, container) {
            if (!allow_interaction) return;
            if (active_container !== container) return;
            if (active_pointer !== pointer.id) return;
            // Snap the container to the correct x location for its current slot
            if (check_solved()) {
                allow_interaction = false;
            }
            active_container = null;
            active_pointer = null;

            scene.tweens.add({
                targets: container,
                x: x_locations[container.__current_position],
                duration: 100,
                onComplete: () => {
                    container.setDepth(DEPTHS.DRAG);
                    if (check_solved()) {
                        celebration_animation();
                    }
                }
            });
        });

    },


    update: function () {
    },
});

let ControllerScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'ControllerScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        scene.scene.launch('LogoScene');
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});


let LogoScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LogoScene', active: false});
    },

    //--------------------------------------------------------------------------
    preload: function () {
    },

    //--------------------------------------------------------------------------
    create: function () {
        let scene = this;
        addLogo(scene);
        scene.time.delayedCall(2500, () => {
            scene.scene.start('GameScene');
        })
    },

    //--------------------------------------------------------------------------
    update: function () {
    }
});

let LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function () {
        Phaser.Scene.call(this, {key: 'LoadScene', active: true});
    },

    //--------------------------------------------------------------------------
    preload: function () {
        let scene = this;

        scene.load.spritesheet('phaser_logo', 'assets/phaser-pixel-medium-flat.png',
            { frameWidth: 104, frameHeight: 22 });

        scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 0.5)
            .setOrigin(0, 0.5);
        let loading_bar = scene.add.rectangle(
            SCREEN_WIDTH/4, SCREEN_HEIGHT / 2,
            SCREEN_WIDTH/2, GRID_SIZE/4,
            0xFFFFFF, 1)
            .setOrigin(0, 0.5)
            .setScale(0,1);
        scene.load.on(Phaser.Loader.Events.PROGRESS, function(percentage) {
            loading_bar.setScale(percentage,1);
        });

        scene.load.on('complete', function() {
            scene.scene.start('ControllerScene');
        });
    },

    //--------------------------------------------------------------------------
    create: function () {
    },

    //--------------------------------------------------------------------------
    update: function() {
    },
});

let config = {
    backgroundColor: 0x000000,
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
            gravity: { y: 0},
            debug: false,
        }
    },
    scene: [ LoadScene, LogoScene, ControllerScene, GameScene]
};

let game = new Phaser.Game(config);
