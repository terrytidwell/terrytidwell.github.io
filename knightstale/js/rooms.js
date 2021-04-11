let WORLD = {
    'chess_room' : {
        map: [
            "------------",
            "------------",
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "------------",
            "---0--------",
            "------------",
            "------------"
        ],
        create: (scene) => {
            for (let x = 2; x <= 9; x++) {
                addNpc(scene, x, 8, 'black_pieces', PIECE_SPRITES.PAWN);
                addNpc(scene, x, 3, 'white_pieces', PIECE_SPRITES.PAWN);
            }
            addNpc(scene, 2, 2, 'white_pieces', PIECE_SPRITES.ROOK);
            addNpc(scene, 3, 2, 'white_pieces', PIECE_SPRITES.KNIGHT_DOWN);
            addNpc(scene, 4, 2, 'white_pieces', PIECE_SPRITES.BISHOP_DOWN);
            addNpc(scene, 5, 2, 'white_pieces', PIECE_SPRITES.QUEEN);
            addNpc(scene, 6, 2, 'white_pieces', PIECE_SPRITES.KING_HORIZONTAL);
            addNpc(scene, 7, 2, 'white_pieces', PIECE_SPRITES.BISHOP_DOWN);
            addNpc(scene, 8, 2, 'white_pieces', PIECE_SPRITES.KNIGHT_DOWN);
            addNpc(scene, 9, 2, 'white_pieces', PIECE_SPRITES.ROOK);
            addNpc(scene, 2, 9, 'black_pieces', PIECE_SPRITES.ROOK);
            addNpc(scene, 4, 9, 'black_pieces', PIECE_SPRITES.BISHOP_UP);
            addNpc(scene, 5, 9, 'black_pieces', PIECE_SPRITES.QUEEN);
            addNpc(scene, 6, 9, 'black_pieces', PIECE_SPRITES.KING_HORIZONTAL);
            addNpc(scene, 7, 9, 'black_pieces', PIECE_SPRITES.BISHOP_UP);
            addNpc(scene, 8, 9, 'black_pieces', PIECE_SPRITES.KNIGHT_UP);
            addNpc(scene, 9, 9, 'black_pieces', PIECE_SPRITES.ROOK);
            let player_status = scene.scene.get('ControllerScene').__player_status;
            player_status.health_bar.hide();
            player_status.do_enter_animation = false;

            player_status.orientation = PIECE_SPRITES.KNIGHT_UP;
            addPlayer(scene, 3, 9);
            player_status.playerMoveAllowed = false;
            scene.time.delayedCall(1000, () => {
                addDialogue(scene, ['I had the strangest dream last night...']);
            });
            scene.time.delayedCall(2000, () => {
                addDialogue(scene, ['You were there too, you and all your siblings. We were all just ' +
                'standing there...']);
            });
            scene.time.delayedCall(3000, () => {
                addDialogue(scene, ['No one spoke. No one moved. And lined up across from us was the ' +
                'white army. We were just... staring at each other. It was surreal.']);
            });
            scene.time.delayedCall(4000, () => {
                addDialogue(scene, ['Suddenly, I could move again.']);
                player_status.playerMoveAllowed = true;
            });
            /*
            scene.time.delayedCall(5000, () => {
                scene.cameras.main.fadeOut(2000);
                scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function (camera) {
                    scene.scene.get('ControllerScene').__fade_transition('entrance_room');
                    player_status.do_enter_animation = true;
                    player_status.x = 5;
                    player_status.y = 7;
                    player_status.orientation = PIECE_SPRITES.KNIGHT_RIGHT;
                    player_status.health_bar.show();
                }, scene);
            });
             */
        },
    },
    'entrance_room': {
        map: [
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "----000-----",
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
        init: (scene) => {
            scene.__character = addPlayer(scene,5,7);
        },
        create: (scene) => {
            addNpc(scene, 7, 4, 'black_pieces', PIECE_SPRITES.PAWN).add_diag([
                'Gwen!? What are you doing all the way out here?',
                'Thank goodness you are here - not that I was scared mind you!',
                'I scouted the place out for you - you should probably start heading west, it looks ' +
                'pretty safe that way.',
                'I tried going north, but was stopped by some tricky puzzles.',
                'Out east there seems to be some sort of fiery spooky place.',
                'And I would NOT recommend going south, that place is crawling with baddies!'
            ]);
            //addKey(scene, 7, 5);
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
                    .addTimerGuard(8000, () => {
                        addTeleportAtRandomSpot(scene, addBishopTeleport);
                    })
                    .addTimerGuard(8000, () => {
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
                    .addMobCountGuard(0, () => {
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                    })
                    .addMobCountGuard(1, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(1, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(1, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(1, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(1, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(1, () => addTeleportAtRandomSpot(scene, addPawnTeleport))
                    .addMobCountGuard(0, () => {
                        addTeleportAtRandomSpot(scene, addPawnTeleport)
                        addTeleportAtRandomSpot(scene, addPawnTeleport)
                        addTeleportAtRandomSpot(scene, addPawnTeleport)
                        addTeleportAtRandomSpot(scene, addPawnTeleport)
                    })
                    .addMobCountGuard(0, () => addTeleportAtRandomSpot(scene, addBishopTeleport))
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
            ], () => addKey(scene, 9, 9));
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
            "-----00-----",
            "-----00-----",
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
        north_exit: 'dungeon_5',
        east_exit: 'dungeon_6',
        create: (scene) => {
            let unlock = function() {
                scene.__toggleGrid(11, 5);
                scene.__toggleGrid(10, 5);
                scene.__toggleGrid(10, 6);
                scene.__toggleGrid(11, 6);
            }
            addKeyHole(scene, [{x:9,y:5},{x:9,y:6}], unlock);
        },
    },
    'dungeon_5': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--0--00--0--",
            "--0--00--0--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "-----00-----",
            "-----00-----"
        ],
        south_exit: 'dungeon_4',
        create: (scene) => {
            addPawn(scene, 3, 8);
            addPawn(scene, 8, 6);
            addMobWatch(scene, 0, () => addKey(scene, 9, 9));
        },
    },
    'dungeon_6': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00----00--",
            "0000----0000",
            "0000----0000",
            "--00----00--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        west_exit: 'dungeon_4',
        east_exit: 'dungeon_7',
        create: (scene) => {
            addLavaPool(scene,4,4,4,4);
        },
    },
    'dungeon_7': {
        map: [
            "------------",
            "------------",
            "--00000000--",
            "--00000000--",
            "--00000-00--",
            "000000000000",
            "000000000000",
            "--00000000--",
            "--00000000--",
            "--00000000--",
            "------------",
            "------------"
        ],
        west_exit: 'dungeon_6',
        east_exit: 'dungeon_8',
        create: (scene) => {
            let lava = addLavaPool(scene,7,4,1,1);
            lava.stop();
            addZoneTrigger(scene, 5.5, 5.5, 8, 8, () => {
                scene.__removeExits();
                lava.start();
                addFightSequence(scene, () => {
                    scene.__restoreExits();
                    lava.stop();
                })
                    .addTimerGuard(4000, () => {
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                        addTeleportAtRandomSpot(scene, addPawnTeleport);
                    })
                    .start();
            });
        },
    },
    'dungeon_8': {
        map: [
            "------------",
            "------------",
            "------------",
            "------------",
            "-----00-----",
            "00000000----",
            "00000000----",
            "-----00-----",
            "------------",
            "------------",
            "------------",
            "------------"
        ],
        west_exit: 'dungeon_7',
        create: (scene) => {
            addGem(scene, 6, 6, 1);
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
            ], () => addGem(scene, 2,2, 0));
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
            ], () =>  addGem(scene, 2,9, 0));
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
            addRookStatue(scene, 7, 4);
            addSimultaneousButtonGroup(scene,
                [{x:8,y:4}, {x:6,y:7}, {x: 2, y:4}],
                () =>  addGem(scene, 9,9, 0))
            addBishopStatue(scene, 7, 7);
        },
    },
};