class StateMachine {
  constructor(states, initialState = "idle", frameRate = 6) {
    this.states = states;            // { walk: [path1, path2], dead: [...] }
    this.currentState = initialState;
    this.currentFrame = 0;
    this.frameRate = frameRate;
  }

  setState(newState) {
    if (this.states[newState]) {
      this.currentState = newState;
      this.currentFrame = 0;
    }
  }

  getFrame() {
    const frames = this.states[this.currentState];
    if (!frames || frames.length === 0) return null;

    const path = frames[this.currentFrame % frames.length];
    this.currentFrame++;
    const img = AssetManager.getImage(path);
    return img || null; // liefert direkt HTMLImage oder null
  }
}