let WORLD = {
    'entrance_room': {
        map: [
            "------------",
            "------------",
            "------------",
            "------------",
            "----0000----",
            "0000000000--",
            "0000000000--",
            "----0000----",
            "-----00-----",
            "-----00-----",
            "-----00-----",
            "-----00-----"
        ],
        west_exit: 'beginner_1',
        south_exit: 'fights_1',
        create: (scene) => {},
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
            addPawn(scene, 3, 4)
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
            "-----00-----",
            "-----00-----",
            "------------",
            "------------"
        ],
        east_exit: 'fights_2',
        west_exit: 'fights_3',
        north_exit: 'entrance_room',
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
                addTeleportAtRandomSpot(scene, addBishopTeleport);
                addTeleportAtRandomSpot(scene, addBishopTeleport);
                addMobWatch(scene, 0, scene.__restoreExits)
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
                addTeleportAtRandomSpot(scene, addPawnTeleport);
                addTeleportAtRandomSpot(scene, addPawnTeleport);
                addTeleportAtRandomSpot(scene, addPawnTeleport);
                addTeleportAtRandomSpot(scene, addPawnTeleport);
                addMobWatch(scene, 0, scene.__restoreExits)
            });
        },
    },
};