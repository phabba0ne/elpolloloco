class Chicken extends MovableObject {
  x;
  y = 370;
  width = 60;
  height = 60;
  speed = 10;
  Í
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
  update() {
  // 1. Animation aktualisieren
  const frame = this.stateMachine.getFrame();
  if (frame) this.img = frame;

  // 2. Bewegung anwenden
  if (this.stateMachine.currentState === "walk") {
    this.x -= 0.5;
  }
}
}
