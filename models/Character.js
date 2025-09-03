class Character extends MovableObject {
  height = 200;
  y = 230;

  constructor() {
    super();

    this.stateMachine = new StateMachine(AssetManager.PEPE_SPRITES, "idle", 10);

    AssetManager.loadAll(Object.values(AssetManager.PEPE_SPRITES).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });

    this.frameTimer = 0;           // timer for animation frames
    this.frameInterval = 600;      // ms per frame

    this.idleTimer = 0;            // timer for standing still
    this.longIdleThreshold = 6000; // ms → 6 seconds
  }

  update(deltaTime, moving = false) {
    if (!this.stateMachine) return;

    // --- Handle movement / idle states ---
    if (moving) {
      // Reset idle timer when moving
      this.idleTimer = 0;
      if (this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk");
      }
    } else {
      // Standing still → idle
      this.idleTimer += deltaTime;
      if (this.idleTimer >= this.longIdleThreshold) {
        this.stateMachine.setState("longIdle");
      } else if (this.stateMachine.currentState !== "idle") {
        this.stateMachine.setState("idle");
      }
    }

    // --- Update animation frames ---
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.img = this.stateMachine.getFrame();
    }
  }

  jump() {
    // TODO: later with physics
  }
}