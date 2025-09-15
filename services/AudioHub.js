import AssetManager from "../services/AssetManager.js";

export default class AudioHub {
    /**
     * Lädt alle Audio-Dateien aus AssetManager.audioCache
     * -> alle Soundgruppen durchgehen
     */
    static async preload() {
        const allSoundGroups = [
            AssetManager.SALSASOUNDS,
            AssetManager.COIN_SOUNDS,
            AssetManager.CHICKEN_SOUNDS,
            AssetManager.CHICKENSMALL_SOUNDS,
            AssetManager.CHICKENBOSS_SOUNDS,
            AssetManager.PEPE_SOUNDS
        ];

        // Sammle alle Pfade
        const allPaths = allSoundGroups
            .flatMap(group => Object.values(group).flat())
            .filter(Boolean); // leere Strings rausfiltern

        // Lade alle Sounds in den Cache
        await AssetManager.loadAudios(allPaths);

        this.allPaths = allPaths;
    }

    /**
     * Holt Sound anhand von Gruppe + Key
     * Beispiel: getSound("PEPE_SOUNDS", "walk")
     */
    static getSound(groupName, key) {
        const group = AssetManager[groupName];
        if (!group) {
            console.warn(`AudioHub: Sound-Gruppe '${groupName}' existiert nicht`);
            return null;
        }
        const paths = group[key];
        if (!paths || paths.length === 0) {
            console.warn(`AudioHub: Kein Sound unter '${groupName}.${key}'`);
            return null;
        }
        const path = paths[0]; // nimm den ersten Sound-Pfad
        return AssetManager.getAudio(path);
    }

    /**
     * Spielt eine einzelne Audiodatei
     */
    static playOne(groupName, key, instrumentId = null) {
        const sound = this.getSound(groupName, key);
        if (!sound) return;

        sound.volume = 0.2;
        sound.currentTime = 0;
        sound.play();

        if (instrumentId) {
            const instrumentImg = document.getElementById(instrumentId);
            if (instrumentImg) instrumentImg.classList.add("active");
        }
    }

    /**
     * Stoppt ALLE Sounds
     */
    static stopAll() {
        this.allPaths.forEach(path => {
            const sound = AssetManager.getAudio(path);
            if (sound) sound.pause();
        });

        const volumeSlider = document.getElementById("volume");
        if (volumeSlider) volumeSlider.value = 0.2;

        const instrumentImages = document.querySelectorAll(".sound_img");
        instrumentImages.forEach(img => img.classList.remove("active"));
    }

    /**
     * Stoppt EINEN Sound
     */
    static stopOne(groupName, key, instrumentId = null) {
        const sound = this.getSound(groupName, key);
        if (sound) sound.pause();

        if (instrumentId) {
            const instrumentImg = document.getElementById(instrumentId);
            if (instrumentImg) instrumentImg.classList.remove("active");
        }
    }

    /**
     * Setzt die Lautstärke aller Sounds
     */
    static objSetVolume() {
        let volumeValue = document.getElementById("volume").value;
        this.allPaths.forEach(path => {
            const sound = AssetManager.getAudio(path);
            if (sound) sound.volume = volumeValue;
        });
    }
}

// Preload vor Spielstart
// await AudioHub.preload();

// Pepe springt
// AudioHub.playOne("PEPE_SOUNDS", "jump");

// Chicken stirbt
// AudioHub.playOne("CHICKEN_SOUNDS", "dead");

// Alles stoppen
// AudioHub.stopAll();