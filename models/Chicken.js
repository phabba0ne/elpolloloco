class Chicken extends MovableObject {
  y = 385;
  width = 60;
  height = 60;
  speedX = 80; // px/sec jetzt, nicht pro Frame
  strength = 10;

  constructor() {
    super();

    this.stateMachine = new StateMachine(AssetManager.CHICKEN_SPRITES, "walk", 10);
    this.loadSprites(AssetManager.CHICKEN_SPRITES);

    this.x = 700 + Math.random() * 1500;
  }

  update(deltaTime) {
    if (!this.isDead) {
      this.x -= this.speedX * deltaTime; // FPS-unabhängig
    }
    super.update(deltaTime);
  }
}