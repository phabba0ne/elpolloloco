// Chicken Klasse - Normale Hühner
class Chicken extends MovableObject {
  y = 100;
  width = 60;
  height = 60;
  speedX = 60; // px/sec
  strength = 10;

  constructor(x = null, y = null) {
    super();
    
    // StateMachine mit Chicken Sprites
    this.stateMachine = new StateMachine(AssetManager.CHICKEN_SPRITES, "walk", 10);
    this.loadSprites(AssetManager.CHICKEN_SPRITES);
    
    // Position setzen
    this.x = x || (700 + Math.random() * 1500);
    if (y) this.y = y;
  }

  update(deltaTime) {
    if (!this.isDead) {
      this.x -= this.speedX * deltaTime; // FPS-unabhängig
    }
    super.update(deltaTime);
  }
}