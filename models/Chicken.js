class Chicken extends MovableObject {
  y = 385;
  width = 60;
  height = 60;

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
