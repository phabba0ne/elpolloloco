class Chicken extends MovableObject {
  y = 385;
  width = 60;
  height = 60;
  speedX = 2; // px per frame

  constructor() {
    super();

    this.stateMachine = new StateMachine(AssetManager.CHICKEN_SPRITES, "walk", 6);
    this.loadSprites(AssetManager.CHICKEN_SPRITES);

    this.x = 700 + Math.random() * 1500;
  }

  update(deltaTime) {
    // --- Move left ---
    this.x -= this.speedX;

    // --- Animate ---
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }
}