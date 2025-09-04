class ChickenSmall extends Chicken {
  constructor() {
    super();

    // Override StateMachine für Small Chicken
    this.stateMachine = new StateMachine(AssetManager.CHICKENSMALL_SPRITES, "walk", 6);
    this.loadSprites(AssetManager.CHICKENSMALL_SPRITES);

    // Optional: Position zufällig
    this.x = 700 + Math.random() * 1500;
    this.y = 385; // Bodenhöhe
    this.width = 60;
    this.height = 60;
    this.speedX = 120; // px/sec
  }

  update(deltaTime) {
    this.x -= this.speedX * deltaTime; // FPS-unabhängig

    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }
}