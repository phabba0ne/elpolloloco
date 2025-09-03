class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;

  y = 160;

  constructor() {
    super();
    this.stateMachine = new StateMachine(
      AssetManager.CHICKENBOSS_SPRITES,
      "alert",
      6
    );

    AssetManager.loadAll(
      Object.values(AssetManager.CHICKENBOSS_SPRITES).flat()
    ).then(() => {
      this.img = this.stateMachine.getFrame();
    });

    this.x = 700;
    this.moveLeft();
  }
}
