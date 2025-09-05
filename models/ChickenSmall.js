class ChickenSmall extends Chicken {
  strength = 5;

  constructor(x = null, y = null) {
    super();
    
    // Override StateMachine für Small Chicken
    this.stateMachine = new StateMachine(AssetManager.CHICKENSMALL_SPRITES, "walk", 12);
    this.loadSprites(AssetManager.CHICKENSMALL_SPRITES);
    
    // Position und Eigenschaften
    this.x = x || (800 + Math.random() * 1200);
    this.y = 396;
    this.width = 48;
    this.height = 48;
    this.speedX = 40; // px/sec - schneller als normale Chicken
  }

  update(deltaTime) {
    if (!this.isDead) {
      this.x -= this.speedX * deltaTime;
    }
    super.update(deltaTime);
  }
}