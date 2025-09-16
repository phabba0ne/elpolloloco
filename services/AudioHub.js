/**
 * Audio Management System
 * Centralizes all game audio operations, providing an interface for playing and managing sounds.
 * @module AudioHub
 */

import AssetManager from "./AssetManager.js";

export default class AudioHub {
  /** @type {string[]} List of all sound paths loaded */
  static allPaths = [];
  
  /** @type {boolean} Global mute state */
  static isMuted = false;
  
  /** @type {number} Global volume (0-1) */
  static volume = 0.2;
  
  /** @type {Map<string, HTMLAudioElement>} Currently playing sounds */
  static activeSounds = new Map();

  /**
   * Preload all game audio from AssetManager
   * @async
   * @returns {Promise<void>}
   */
  static async preload() {
    console.log("AudioHub: Preloading sounds...");
    
    const allSoundGroups = [
      AssetManager.SALSASOUNDS,
      AssetManager.COIN_SOUNDS,
      AssetManager.CHICKEN_SOUNDS,
      AssetManager.CHICKENSMALL_SOUNDS,
      AssetManager.CHICKENBOSS_SOUNDS,
      AssetManager.PEPE_SOUNDS,
      AssetManager.AMBIENT,
    ];
    
    // Collect all valid paths
    const allPaths = allSoundGroups
      .flatMap((group) => Object.values(group).flat())
      .filter(Boolean); // Filter out empty strings
    
    // Load all sounds into the cache
    await AssetManager.loadAudios(allPaths);
    this.allPaths = allPaths;
    
    console.log(`AudioHub: Preloaded ${allPaths.length} sounds`);
  }

  /**
   * Get a sound from a specific group and key
   * @param {string} groupName - Asset group name (e.g. "PEPE_SOUNDS")
   * @param {string} key - Sound key within the group (e.g. "jump")
   * @returns {HTMLAudioElement|null} The audio element or null if not found
   */
  static getSound(groupName, key) {
    const group = AssetManager[groupName];
    if (!group) {
      console.warn(`AudioHub: Sound group '${groupName}' does not exist`);
      return null;
    }
    
    const paths = group[key];
    if (!paths || paths.length === 0) {
      console.warn(`AudioHub: No sound found under '${groupName}.${key}'`);
      return null;
    }
    
    const path = paths[0]; // Use the first sound path
    return AssetManager.getAudio(path);
  }

  /**
   * Play a single audio file
   * @param {string} groupName - Asset group name
   * @param {string} key - Sound key within the group
   * @param {string|null} [instrumentId=null] - Optional ID for visual feedback
   * @returns {HTMLAudioElement|null} The playing audio element or null if failed
   */
  static playOne(groupName, key, instrumentId = null) {
    if (this.isMuted) return null;
    
    const sound = this.getSound(groupName, key);
    if (!sound) return null;
    
    // Create a clone to allow overlapping sounds
    const soundClone = sound.cloneNode();
    soundClone.volume = this.volume;
    
    try {
      const promise = soundClone.play();
      if (promise) {
        promise.catch(error => {
          console.warn(`AudioHub: Error playing ${groupName}.${key}:`, error);
        });
      }
      
      // Track active sounds
      const soundId = `${groupName}_${key}_${Date.now()}`;
      this.activeSounds.set(soundId, soundClone);
      
      // Remove from tracking when finished
      soundClone.addEventListener('ended', () => {
        this.activeSounds.delete(soundId);
      });
      
      // Visual feedback if needed
      if (instrumentId) {
        const instrumentImg = document.getElementById(instrumentId);
        if (instrumentImg) {
          instrumentImg.classList.add("active");
          
          // Remove active class when sound ends
          soundClone.addEventListener('ended', () => {
            instrumentImg.classList.remove("active");
          });
        }
      }
      
      return soundClone;
    } catch (error) {
      console.error(`AudioHub: Failed to play ${groupName}.${key}:`, error);
      return null;
    }
  }

  /**
   * Stop all sounds
   */
  static stopAll() {
    // Stop tracked sounds
    this.activeSounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    this.activeSounds.clear();
    
    // Also stop any cached sounds (as backup)
    this.allPaths.forEach((path) => {
      const sound = AssetManager.getAudio(path);
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
    
    // Reset any visual indicators
    const instrumentImages = document.querySelectorAll(".sound_img");
    instrumentImages.forEach((img) => img.classList.remove("active"));
  }

  /**
   * Stop a specific sound
   * @param {string} groupName - Asset group name
   * @param {string} key - Sound key within the group
   * @param {string|null} [instrumentId=null] - Optional ID for visual feedback
   */
  static stopOne(groupName, key, instrumentId = null) {
    const sound = this.getSound(groupName, key);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
    
    // Also stop any playing clones of this sound
    this.activeSounds.forEach((sound, soundId) => {
      if (soundId.startsWith(`${groupName}_${key}`)) {
        sound.pause();
        sound.currentTime = 0;
        this.activeSounds.delete(soundId);
      }
    });
    
    // Visual feedback
    if (instrumentId) {
      const instrumentImg = document.getElementById(instrumentId);
      if (instrumentImg) instrumentImg.classList.remove("active");
    }
  }

  /**
   * Set global mute state
   * @param {boolean} muted - Whether audio should be muted
   */
  static setMute(muted) {
    this.isMuted = muted;
    
    if (muted) {
      this.stopAll();
    }
  }

  /**
   * Set global volume for all sounds
   * @param {number} volume - Volume level (0-1)
   */
  static setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update currently playing sounds
    this.activeSounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }

  /**
   * Get a list of all currently playing sounds
   * @returns {string[]} List of sound IDs
   */
  static getActiveSounds() {
    return Array.from(this.activeSounds.keys());
  }
}