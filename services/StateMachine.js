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

  setState(newState, once = false) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.currentFrame = 0;
      this.frameTimer = 0;
      if (once) this.onceStates.add(newState);
      else this.onceStates.delete(newState);
    }
  }

  update(deltaTime) {
    const frames = this.states[this.currentState];
    if (!frames?.length) return;

    // FrameTimer inkrementieren mit deltaTime
    this.frameTimer += deltaTime;

    // Solange wir ein Frame überspringen müssen (deltaTime > frameInterval)
    while (this.frameTimer >= this.frameInterval) {
      this.frameTimer -= this.frameInterval;
      this.currentFrame++;

      if (this.onceStates.has(this.currentState)) {
        if (this.currentFrame >= frames.length) this.currentFrame = frames.length - 1;
      } else {
        this.currentFrame %= frames.length;
      }
    }
  }

  getFrame() {
    const frames = this.states[this.currentState];
    if (!frames?.length) return null;
    const path = frames[this.currentFrame];
    return AssetManager.getImage(path) || null;
  }
}