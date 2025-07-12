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