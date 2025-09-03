class Chicken extends MovableObject {
  y = 385;
  width = 60;
  height = 60;

  constructor() {
    super();
    
    this.stateMachine = new StateMachine(AssetManager.CHICKEN_SPRITES, "walk", 6);
    this.loadSprites(AssetManager.CHICKEN_SPRITES); // ✅ Nutzt Superklasse

    this.x = 700 + Math.random() * 1500;
    this.moveLeft();
  }
}