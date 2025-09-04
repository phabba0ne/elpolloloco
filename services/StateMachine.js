class StateMachine {
  constructor(states, initialState = "idle", frameRate = 10) {
    this.states = states;              // { walk: [...], idle: [...], ... }
    this.currentState = initialState;
    this.currentFrame = 0;
    this.frameRate = frameRate;        // frames per second
    this.frameTimer = 0;               // ms elapsed
    this.frameInterval = 1000 / frameRate;
  }

  setState(newState) {
    if (this.states[newState] && this.currentState !== newState) {
      this.currentState = newState;
      this.currentFrame = 0;
      this.frameTimer = 0;
    }
  }

  update(deltaTime) {
    if (!this.states[this.currentState] || this.states[this.currentState].length === 0) return;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.states[this.currentState].length;
    }
  }

  getFrame() {
    const frames = this.states[this.currentState];
    if (!frames || frames.length === 0) return null;

    const path = frames[this.currentFrame];
    const img = AssetManager.getImage(path);
    return img || null;
  }
}