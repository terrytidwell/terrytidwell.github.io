let WORLD = {
    'entrance_room': {
        map: [
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "----0000----",
            "000000000000",
            "000000000000",
            "----0000----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----"
        ],
        west_exit: 'beginner_1',
        east_exit: 'dungeon_1',
        south_exit: 'fights_4',
        north_exit: 'puzzles_1',
        create: (scene) => {
        },
    },
    'beginner_1': {
        map: [
            "------------",
            "------------",
            "------------",
            "------------",
            "--00000000--",
            "000000000000",
            "000000000000",
            "--00000000--",
            "------------",
            "------------",
            "------------",
            "------------"
        ],
        east_exit: 'entrance_room',
        west_exit: 'beginner_2',
        create: (scene) => {
            addPawn(scene, 3, 4);
        },
    },
    'beginner_2': {
        map: [
            "-----00-----",
            "-----00-----",
            "--00000000--",
            "--00000000--",
            "--00----00--",
            "0000-00-0000",
            "0000-00-0000",
            "--00----00--",
            "--00000000--",
            "--00000000--",
            "-----00-----",
            "-----00-----"
        ],
        east_exit: 'beginner_1',
        north_exit: 'beginner_3',
        south_exit: 'beginner_4',
        west_exit: 'beginner_5',
        create: (scene) => {
            addPawn(scene, 8, 8)
        },
    },
    'beginner_3': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00----00--",
            "--00-00-00--",
            "--00-00-00--",
            "--00----00--",
            "--00000000--",
            "--00000000--",
            "-----00-----",
            "-----00-----"
        ],
        south_exit: 'beginner_2',
        create: (scene) => {
            addPawn(scene, 8, 5)
        },
    },
    'beginner_4': {
        map: [
            "-----00-----",
            "-----00-----",
            "--00000000--",
            "--00000000--",
            "--00----00--",
            "--00-00-00--",
            "--00-00-00--",
            "--00----00--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        north_exit: 'beginner_2',
        create: (scene) => {
            addPawn(scene, 3, 5)
        },
    },
    'beginner_5': {
        map: [
            "------------",
            "------------",
            "--000000----",
            "--000000-0--",
            "--000000-0--",
            "--000000--00",
            "--000000--00",
            "--000000-0--",
            "--000000-0--",
            "--000000----",
            "------------",
            "------------"
        ],
        east_exit: 'beginner_2',
        create: (scene) => {
            addBishop(scene, 4, 7)
        },
    },
    'fights_1': {
        map: [
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "----0000----",
            "000000000000",
            "000000000000",
            "----0000----",
            "------------",
            "------------",
            "------------",
            "------------"
        ],
        east_exit: 'fights_2',
        west_exit: 'fights_3',
        north_exit: 'fights_4',
        create: (scene) => {},
    },
    'fights_2': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "0000000000--",
            "0000000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        west_exit: 'fights_1',
        create: (scene) => {
            addZoneTrigger(scene, 5.5, 5.5, 8, 8, () => {
                scene.__removeExits();
                addFightSequence(scene, scene.__restoreExits)
                    .addTimerGuard(4000, () => {
                        addTeleportAtRandomSpot(scene, addBishopTeleport);
                        addTeleportAtRandomSpot(scene, addBishopTeleport);
                    })
                    .start();
            });
        },
    },
    'fights_3': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--0000000000",
            "--0000000000",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        east_exit: 'fights_1',
        create: (scene) => {
            addZoneTrigger(scene, 5.5, 5.5, 8, 8, () => {
                scene.__removeExits();
                addFightSequence(scene, scene.__restoreExits)
                    .addTimerGuard(4000, () => {
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                    })
                    .start();
            });
        },
    },
    'fights_4': {
        map: [
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "----0000----",
            "----00000000",
            "----00000000",
            "----0000----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----"
        ],
        east_exit: 'fights_5',
        north_exit: 'entrance_room',
        south_exit: 'fights_1',
        create: (scene) => {},
    },
    'fights_5': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "0000000000--",
            "0000000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        west_exit: 'fights_4',
        create: (scene) => {
            addZoneTrigger(scene, 5.5, 5.5, 8, 8, () => {
                scene.__removeExits();
                addFightSequence(scene, scene.__restoreExits)
                    .addTimerGuard(4000, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(0, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(0, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .start();
            });
        },
    },
    'dungeon_1': {
        map: [
            "-----00-----",
            "-----00-----",
            "--0---0000--",
            "--00--0000--",
            "--00--0000--",
            "0000---00000",
            "00000--00000",
            "--000--000--",
            "--000---00--",
            "--000---00--",
            "------------",
            "------------"
        ],
        west_exit: 'entrance_room',
        east_exit: 'dungeon_2',
        north_exit: 'dungeon_3',
        create: (scene) => {
            let squares = [
                addDisappearingPlatform(scene, 6, 9, 20000),
            ];

            let reset_blocks = function() {
                Phaser.Utils.Array.Each(squares,
                    (square) => square.data.values.beginCountdown(),
                    scene);
            };
            addButton(scene, [{x:2, y:2}, {x:9, y:2}],
                reset_blocks,
                20000,
                null,
                reset_blocks);
        },
    },
    'dungeon_2': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "0000000000--",
            "0000000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        west_exit: 'dungeon_1',
        create: (scene) => {
            addButtonGroup(scene, [
                {x:5,y:8},
                {x:6,y:8},
                {x:4,y:7},
                {x:7,y:7},
                {x:5,y:6},
                {x:6,y:6},
                {x:5,y:5},
                {x:6,y:5},
                {x:4,y:4},
                {x:7,y:4},
                {x:5,y:3},
                {x:6,y:3},
            ], () => console.log('COMPLETED!'));
        },
    },
    'dungeon_3': {
        map: [
            "-----00-----",
            "-----00-----",
            "----0--0----",
            "------------",
            "------------",
            "------------",
            "------------",
            "------------",
            "------------",
            "----0--0----",
            "-----00-----",
            "-----00-----"
        ],
        north_exit: 'dungeon_4',
        south_exit: 'dungeon_1',
        create: (scene) => {
            addDisapperaingPlatformSequence(scene,
                [
                    [{x:5, y: 7}, {x:6, y: 7}],
                    [{x:3, y: 6}, {x:8, y: 6}],
                    [{x:2, y: 4}, {x:9, y: 4}],
                    [{x:4, y: 5}, {x:7, y: 5}],
                    [{x:5, y: 4}, {x:6, y: 4}],
                    [{x:4, y: 6}, {x:7, y: 6}],
                ],
                3000,1000, 1000);
        },
    },
    'dungeon_4': {
        map: [
            "------------",
            "------------",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00000--",
            "-----00000--",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----"
        ],
        south_exit: 'dungeon_3',
        create: (scene) => {
        },
    },
    'puzzles_1': {
        map: [
            "-----00-----",
            "-----00-----",
            "--00000000--",
            "--00000000--",
            "--00----00--",
            "0000----0000",
            "0000----0000",
            "--00----00--",
            "--00000000--",
            "--00000000--",
            "-----00-----",
            "-----00-----"
        ],
        south_exit: 'entrance_room',
        north_exit: 'puzzles_2',
        west_exit: 'puzzles_3',
        east_exit: 'puzzles_4',
        create: (scene) => {},
    },
    'puzzles_2': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "-----00-----",
            "-----00-----"
        ],
        south_exit: 'puzzles_1',
        create: (scene) => {
            addButtonGroup(scene, [
                {x:3,y:6},
                {x:4,y:6},
                {x:4,y:5},
                {x:4,y:4},
                {x:5,y:4},
                {x:6,y:4},
                {x:6,y:5},
                {x:6,y:6},
                {x:7,y:6},
            ], () => console.log('COMPLETED!'));
        },
    },
    'puzzles_3': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--0000000000",
            "--0000000000",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        east_exit: 'puzzles_1',
        create: (scene) => {
            addButtonGroup(scene, [
                {x:3,y:3},
                {x:3,y:4},
                {x:3,y:5},
                {x:4,y:3},
                {x:4,y:5},
                {x:5,y:3},
                {x:5,y:4},
                {x:5,y:5},
                {x:5,y:6},
                {x:5,y:7},
                {x:6,y:5},
                {x:6,y:7},
                {x:7,y:5},
                {x:7,y:6},
                {x:7,y:7},
            ], () => console.log('COMPLETED!'));
        },
    },
    'puzzles_4': {
        map: [
            "------------",
            "------------",
            "----000000--",
            "----000000--",
            "--0-000000--",
            "000-000000--",
            "000-000000--",
            "--0-000000--",
            "----000000--",
            "----000000--",
            "------------",
            "------------"
        ],
        west_exit: 'puzzles_1',
        create: (scene) => {
            addPawnStatue(scene, 7, 4);
            addButton(scene,[{x:8,y:4}], () => {}, 50);
            addButton(scene,[{x:6,y:7}], () => {}, 50);
            addBishopStatue(scene, 7, 7);
        },
    },

};