class Chicken extends MovableObject {
  x;
  y = 370;
  width = 60;
  height = 60;
  speed=0.5;
  constructor() {
    super();

    this.stateMachine = new StateMachine(AssetManager.CHICKEN_SPRITES, "walk", 6);
    // this.stateMachine.setState("dead");
    
    AssetManager.loadAll(Object.values(AssetManager.CHICKEN_SPRITES).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });

    this.x = 200 + Math.random() * 500;
    this.moveLeft();
  }
}
