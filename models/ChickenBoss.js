class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;
  y = 160;

  constructor() {
    super();
    this.stateMachine = new StateMachine(AssetManager.CHICKENBOSS_SPRITES, "alert", 6);
    this.loadSprites(AssetManager.CHICKENBOSS_SPRITES); // ✅ Nutzt Superklasse

    this.x = 10000;
    this.moveLeft();
  }
}