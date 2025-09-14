import AssetManager from "../services/AssetManager.js";

/**
 * Verwaltet die Animationen (States) eines MovableObjects.
 * Ein State besteht aus einer Liste von Frames (Bildern).
 */
export default class StateMachine {
  constructor(states, initialState = "idle", fps = 6) {
    this.states = states;              // { idle: [..], walk: [..], attack: [..] }
    this.currentState = initialState;  // aktueller State
    this.currentFrame = 0;             // aktuelles Frame
    this.fps = fps;                    // Frames pro Sekunde
    this.frameTimer = 0;               // Zeitakkumulator
    this.frameInterval = 1 / fps;      // Sekunden pro Frame
    this.onceStates = new Set();       // States, die nur einmal durchlaufen werden
  }

  /**
   * Setzt den State
   * @param {string} newState - Name des States
   * @param {boolean} once - ob Animation nur einmal ablaufen soll
   * @param {boolean} forceReset - Neustart erzwingen
   */
  setState(newState, once = false, forceReset = false) {
    if (forceReset || this.currentState !== newState) {
      this.currentState = newState;
      this.currentFrame = 0;
      this.frameTimer = 0;

      if (once) this.onceStates.add(newState);
      else this.onceStates.delete(newState);
    }
  }

  /**
   * Aktualisiert die Frame-Logik
   * @param {number} deltaTime - Zeit seit letztem Frame (Sekunden)
   */
  update(deltaTime) {
    const frames = this.states[this.currentState];
    if (!frames?.length) return;

    this.frameTimer += deltaTime;

    while (this.frameTimer >= this.frameInterval) {
      this.frameTimer -= this.frameInterval;
      this.currentFrame++;

      if (this.onceStates.has(this.currentState)) {
        // einmalige Animation -> am letzten Frame stoppen
        if (this.currentFrame >= frames.length) {
          this.currentFrame = frames.length - 1;
        }
      } else {
        // Endlosschleife
        this.currentFrame %= frames.length;
      }
    }
  }

  /**
   * Gibt das aktuelle Frame als Image zurück
   */
  getFrame() {
    const frames = this.states[this.currentState];
    if (!frames?.length) return null;
    return AssetManager.getImage(frames[this.currentFrame]) || null;
  }

  /**
   * Dauer einer Animation in ms (praktisch für Attack/Hurt-Animationen)
   */
  getAnimationDuration(stateName) {
    const frames = this.states[stateName] || [];
    return frames.length * this.frameInterval * 1000;
  }
}