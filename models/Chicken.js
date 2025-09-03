class Chicken extends MovableObject {
  y = 385;
  width = 60;
  height = 60;

  constructor() {
    super();
    
    this.frameInterval = 1000 / 6; // ✅ 6 FPS
    this.stateMachine = new StateMachine(AssetManager.CHICKEN_SPRITES, "walk", 6);
    this.loadSprites(AssetManager.CHICKEN_SPRITES); // ✅ Nutzt Superklasse

    this.x = 200 + Math.random() * 500;
    this.moveLeft();
  }
}