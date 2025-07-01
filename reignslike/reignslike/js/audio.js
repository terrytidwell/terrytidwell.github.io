let PLAY_AUDIO_EVENT = 'GAME_EVENTS.PLAY_AUDIO';
let PLAY_AMBIENCE = 'GAME_EVENTS.PLAY_AMBIENCE';
let STOP_AMBIENCE = 'GAME_EVENTS.STOP_AMBIENCE';
let DAMPEN_AMBIENCE = 'GAME_EVENTS.DAMPEN_AMBIENCE';

let AUDIO_ROOT = 'assets/sounds/';

let SOUND_KEYS = {
    'Crab Bucket Games Intro': {
        volume: 0.50,
        asset: 'Crab Bucket Games Intro.mp3',
        loop: false,
    },
    'Set Scale Music Full Mix': {
        volume: 0.15,
        asset: 'Set Scale Music Full Mix.mp3',
        loop: true,
    },
    'Ocean and Wind BGs': {
        volume: 0.75,
        asset: 'Ocean and Wind BGs.mp3',
        loop: true,
    },
    'Book Close_4 V2': {
        volume: 0.50,
        asset: 'Book Page Flips/Book Close_4 V2.wav',
        loop: false,
    },
    'Book Page Flips_1 V2': {
        volume: 0.50,
        asset: 'Book Page Flips/Book Page Flips_1 V2.wav',
        loop: false,
    },
    'Book Page Flips_2 V2': {
        volume: 0.50,
        asset: 'Book Page Flips/Book Page Flips_2 V2.wav',
        loop: false,
    },
    'Book Page Flips_3 V2': {
        volume: 0.50,
        asset: 'Book Page Flips/Book Page Flips_3 V2.wav',
        loop: false,
    },
    'Cargo Manifest Paper Flips_1 V2': {
        volume: 0.50,
        asset: 'Cargo Manifest Page Flips/Cargo Manifest Paper Flips_1 V2.wav',
        loop: false,
    },
    'Cargo Manifest Paper Flips_2 V2': {
        volume: 0.50,
        asset: 'Cargo Manifest Page Flips/Cargo Manifest Paper Flips_2 V2.wav',
        loop: false,
    },
    'Cargo Manifest Paper Flips_3 V2': {
        volume: 0.50,
        asset: 'Cargo Manifest Page Flips/Cargo Manifest Paper Flips_3 V2.wav',
        loop: false,
    },
    'Cargo Manifest Paper Flips_4 V2': {
        volume: 0.50,
        asset: 'Cargo Manifest Page Flips/Cargo Manifest Paper Flips_4 V2.wav',
        loop: false,
    },
    'Place Cargo on Scale_1': {
        volume: 0.50,
        asset: 'Place Cargo on Scale/Place Cargo on Scale_1.wav',
        loop: false,
    },
    'Place Cargo on Scale_2': {
        volume: 0.50,
        asset: 'Place Cargo on Scale/Place Cargo on Scale_2.wav',
        loop: false,
    },
    'Place Cargo on Scale_3': {
        volume: 0.50,
        asset: 'Place Cargo on Scale/Place Cargo on Scale_3.wav',
        loop: false,
    },
    'Place Cargo on Scale_4': {
        volume: 0.50,
        asset: 'Place Cargo on Scale/Place Cargo on Scale_4.wav',
        loop: false,
    },
    'Very soft splash_1': {
        volume: 0.50,
        asset: 'Splashes/Very soft splash_1.wav',
        loop: false,
    },
    'Very soft splash_2': {
        volume: 0.50,
        asset: 'Splashes/Very soft splash_2.wav',
        loop: false,
    },
    'Soft splash_1': {
        volume: 0.50,
        asset: 'Splashes/Soft Splash_1.wav',
        loop: false,
    },
    'Soft splash_2': {
        volume: 0.50,
        asset: 'Splashes/Soft Splash_2.wav',
        loop: false,
    },
    'Medium splash_1': {
        volume: 0.50,
        asset: 'Splashes/Medium Splash_1.wav',
        loop: false,
    },
    'Medium splash_2': {
        volume: 0.50,
        asset: 'Splashes/Medium Splash_2.wav',
        loop: false,
    },
    'Large splash_1': {
        volume: 0.50,
        asset: 'Splashes/Large Splash_1.wav',
        loop: false,
    },
    'Large splash_2': {
        volume: 0.50,
        asset: 'Splashes/Large Splash_2.wav',
        loop: false,
    },
    'STAMP_1': {
        volume: 1,
        asset: 'STAMP/STAMP_1.wav',
        loop: false,
    },
    'STAMP_2': {
        volume: 1,
        asset: 'STAMP/STAMP_2.wav',
        loop: false,
    },
    'Accept Cargo_1': {
        volume: 1,
        asset: 'Accept Cargo_1.wav',
        loop: false,
    },
    'Deny Cargo_1': {
        volume: 1,
        asset: 'Deny Cargo_1.wav',
        loop: false,
    },
    'Penalty Received_1': {
        volume: 1,
        asset: 'Penalty Received_1.wav',
        loop: false,
    },
    'Scale Medium Gesture_1': {
        volume: 1,
        asset: 'Scale Rocking SFX/Scale Medium Gesture_1.wav',
        loop: false,
    },
    'Scale Short Gesture_1': {
        volume: 1,
        asset: 'Scale Rocking SFX/Scale Short Gesture_1.wav',
        loop: false,
    },
    'Scale Short Gesture_2': {
        volume: 1,
        asset: 'Scale Rocking SFX/Scale Short Gesture_2.wav',
        loop: false,
    },
    'Scale Short Gesture_3': {
        volume: 1,
        asset: 'Scale Rocking SFX/Scale Short Gesture_3.wav',
        loop: false,
    },
};

let load_audio = (scene) => {
    scene.load.setPath(AUDIO_ROOT);
    Object.keys(SOUND_KEYS).forEach((key) => {
        scene.load.audio(key, [SOUND_KEYS[key].asset]);
    });
};

let play_audio = (key) => {
    game.events.emit(PLAY_AUDIO_EVENT, key);
};

let play_ambience = (key) => {
    game.events.emit(PLAY_AMBIENCE, key);
};

let stop_ambience = (key) => {
    game.events.emit(PLAY_AMBIENCE, key);
};

let dampen_ambience = (key) => {
    game.events.emit(DAMPEN_AMBIENCE, key);
};

let add_audio_handler = (scene) => {
    let sound_dictionary = {};
    let ambiences = {};

    Object.keys(SOUND_KEYS).forEach((key) => {
        let config = SOUND_KEYS[key].loop ?
            {loop: true}: {loop: false};
        let sound = scene.sound.add(key, config);
        sound.setVolume(SOUND_KEYS[key].volume);
        sound_dictionary[key] = sound;
    });

    bind_event(scene, game.events,
        PLAY_AUDIO_EVENT,
        (sound_key) => {
            if(sound_dictionary[sound_key]) {
                sound_dictionary[sound_key].play();
            } else {
                console.log('sound key "' + sound_key + '" not found')
            }
        });

    bind_event(scene, game.events,
        PLAY_AMBIENCE,
        (sound_key) => {
            Object.keys(ambiences).forEach((key) => {
                ambiences[key].setVolume(0);
            });
            if(!ambiences[sound_key]) {
                if (SOUND_KEYS[sound_key] && SOUND_KEYS[sound_key].loop) {
                    ambiences[sound_key] = sound_dictionary[sound_key];
                    ambiences[sound_key].play();
                }
            }
            if (ambiences[sound_key]) {
                ambiences[sound_key].setVolume(
                    SOUND_KEYS[sound_key].volume
                );
            }
        });

    bind_event(scene, game.events,
        STOP_AMBIENCE,
        () => {
            Object.keys(ambiences).forEach((key) => {
                ambiences[key].setVolume(0);
            });
        });

    bind_event(scene, game.events,
        DAMPEN_AMBIENCE, () => {
            Object.keys(ambiences).forEach((key) => {
                if (ambiences[key].volume !== 0) {
                    ambiences[key].volume =
                        SOUND_KEYS[key].volume/2;
                }
            });
        });
};