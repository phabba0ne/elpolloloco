class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;
  y = 160;
  speedX = 80; // px/sec
  strength = 20;

  constructor() {
    super();
    this.stateMachine = new StateMachine(AssetManager.CHICKENBOSS_SPRITES, "alert", 6);
    this.loadSprites(AssetManager.CHICKENBOSS_SPRITES);

    this.x = 2000; // Spawn off-screen
  }

  update(deltaTime) {
    if (!this.isDead) {
      this.x -= this.speedX * deltaTime; // FPS-unabhängig
    }
    super.update(deltaTime);
  }
}