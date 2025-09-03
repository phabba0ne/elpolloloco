class Character extends MovableObject {
  width = 100;
  height = 200;
  y = 250;

  constructor() {
    super();

    this.stateMachine = new StateMachine(AssetManager.PEPE_SPRITES, "idle", 10);
    this.loadSprites(AssetManager.PEPE_SPRITES);

    this.frameTimer = 0;
    this.frameInterval = 60;
    this.idleTimer = 0;
    this.longIdleThreshold = 6000;
  }

  update(deltaTime, moving = false) {
    if (!this.stateMachine) return;

    // --- Handle movement / idle states ---
    if (moving) {
      this.idleTimer = 0;
      if (this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk");
      }
    } else {
      this.idleTimer += deltaTime;
      if (this.idleTimer >= this.longIdleThreshold) {
        this.stateMachine.setState("longIdle");
      } else if (this.stateMachine.currentState !== "idle") {
        this.stateMachine.setState("idle");
      }
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;
    }
  }
}