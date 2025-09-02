class Character extends MovableObject {
  height = 200;
  y = 230;
  sprites=[];

  constructor() {
    super();

    
   this.stateMachine = new StateMachine(AssetManager.PEPE_SPRITES, "idle", 10);
    this.stateMachine.setState("walk");
    // this.stateMachine.setState("longIdle");


    AssetManager.loadAll(Object.values(AssetManager.PEPE_SPRITES).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });
    this.moveRight();
  }

  jump() {
    // TODO: später mit y-Physik
  }
}
