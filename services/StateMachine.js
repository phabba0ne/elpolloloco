class StateMachine {
  constructor(states, initialState = "idle", frameRate = 10) {
    this.states = states;              
    this.currentState = initialState;
    this.currentFrame = 0;
    this.frameRate = frameRate;
    this.frameTimer = 0;
    this.frameInterval = 1 / frameRate;
    this.onceStates = new Set(); // Tracks states that should play once
  }

  // optional: once = true für einmalige Animation
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
    if (!frames || frames.length === 0) return;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.currentFrame++;

      // Wenn Animation „einmalig“ abgespielt wird, am Ende stehen bleiben
      if (this.onceStates.has(this.currentState)) {
        if (this.currentFrame >= frames.length) {
          this.currentFrame = frames.length - 1;
        }
      } else {
        // loop normal
        this.currentFrame %= frames.length;
      }
    }
  }

  getFrame() {
    const frames = this.states[this.currentState];
    if (!frames || frames.length === 0) return null;
    const path = frames[this.currentFrame];
    return AssetManager.getImage(path) || null;
  }
}