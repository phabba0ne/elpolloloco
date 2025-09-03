class Character extends MovableObject {
  height = 200;
  y = 230;


  constructor() {
    super();

    
   this.stateMachine = new StateMachine(AssetManager.PEPE_SPRITES, "idle", 10);


    AssetManager.loadAll(Object.values(AssetManager.PEPE_SPRITES).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });
  }

  jump() {
    // TODO: später mit y-Physik
  }
}
