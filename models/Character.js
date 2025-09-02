class Character extends MovableObject {
  height = 200;
  y = 230;
  sprites=[];

  constructor(sprites) {
    super();

    
   this.stateMachine = new StateMachine(AssetManager.PEPE_SPRITES, "walk", 6);
    this.stateMachine.setState("walk");
    // this.stateMachine.setState("longIdle");


    AssetManager.loadAll(Object.values(AssetManager.PEPE_SPRITES).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });

    this.animate();
  }

  animate() {
    this.moveRight();
  }

  jump() {
    // TODO: später mit y-Physik
  }
}
