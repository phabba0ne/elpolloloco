// ChickenBoss Klasse - Großer Endgegner
class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;
  y = 155;
  speedX = 80;
  strength = 20;

  constructor(x = null, y = null) {
    super();
    
    // StateMachine mit Boss Sprites
    this.stateMachine = new StateMachine(AssetManager.CHICKENBOSS_SPRITES, "alert", 6);
    this.loadSprites(AssetManager.CHICKENBOSS_SPRITES);
    
    // Position setzen
    this.x = x || 2000; // Spawn off-screen
    if (y) this.y = y;
  }

  update(deltaTime) {
    if (!this.isDead) {
      // Boss bewegt sich langsamer oder gar nicht
      // this.x -= this.speedX * deltaTime;
    }
    super.update(deltaTime);
  }
}