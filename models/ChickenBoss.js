class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;
  y = 160;
  speedX = 1.5; // pixels per frame

  constructor() {
    super();
    this.stateMachine = new StateMachine(AssetManager.CHICKENBOSS_SPRITES, "alert", 6);
    this.loadSprites(AssetManager.CHICKENBOSS_SPRITES);

    this.x = 2000; // spawn off-screen
  }

  update(deltaTime) {
    // Move left
    // this.x -= this.speedX;

    // Animate
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }
}