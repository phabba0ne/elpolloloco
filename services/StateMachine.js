import AssetManager from "../services/AssetManager.js";

export default class StateMachine {
  constructor(states, initialState = "idle", frameRate = 10) {
    this.states = states;
    this.currentState = initialState;
    this.currentFrame = 0;
    this.frameRate = frameRate;
    this.frameTimer = 0;
    this.frameInterval = 1 / frameRate; // Sekunden pro Frame
    this.onceStates = new Set(); // für einmalige Animationen
  }

  /**
   * Setzt den State
   * @param {string} newState - Name des States
   * @param {boolean} once - einmalige Animation
   * @param {boolean} forceReset - erzwingt Neustart, selbst wenn aktueller State gleich
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
   * Aktualisiert die Animation
   * @param {number} deltaTime - Zeit seit letztem Frame in Sekunden
   */
  update(deltaTime) {
    const frames = this.states[this.currentState];
    if (!frames?.length) return;

    this.frameTimer += deltaTime;

    while (this.frameTimer >= this.frameInterval) {
      this.frameTimer -= this.frameInterval;
      this.currentFrame++;

      if (this.onceStates.has(this.currentState)) {
        if (this.currentFrame >= frames.length)
          this.currentFrame = frames.length - 1;
      } else {
        this.currentFrame %= frames.length;
      }
    }
  }

  updateCamera() {
    const boss = this.enemies.find((e) => e.subtype === "chickenBoss");
    if (!boss) return;

    const margin = 200; // Abstand von Bildschirmrand
    const canvasWidth = this.canvas.width;

    if (this.character.x > boss.x) {
      // Pepe rechts vom Boss → Kamera auf die linke Seite des Boss
      this.camera_x = -boss.x + margin;
    } else {
      // Pepe links vom Boss → Kamera auf die rechte Seite des Boss
      this.camera_x = -boss.x + canvasWidth - boss.width - margin;
    }
  }

  /**
   * Gibt das aktuelle Frame als Image zurück
   */
  getFrame() {
    const frames = this.states[this.currentState];
    if (!frames?.length) return null;
    const path = frames[this.currentFrame];
    return AssetManager.getImage(path) || null;
  }

  /**
   * Optional: Dauer einer Animation in ms
   */
  getAnimationDuration(stateName) {
    const frames = this.states[stateName] || [];
    return frames.length * this.frameInterval * 1000; // ms
  }
}
