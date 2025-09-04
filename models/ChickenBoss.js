class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;
  y = 160;
  speedX = 80; // px/sec

  constructor() {
    super();

    this.stateMachine = new StateMachine(AssetManager.CHICKENBOSS_SPRITES, "alert", 6);
    this.loadSprites(AssetManager.CHICKENBOSS_SPRITES);

    this.x = 2000; // Spawn off-screen
  }

  update(deltaTime) {
    // --- Move left optional ---
    // this.x -= this.speedX * deltaTime;

    // --- Sprites / Animation ---
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }
}