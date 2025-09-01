class Chicken extends MovableObject {
  y = 370;
  width = 60;
  height = 60;

  constructor() {
    super();

    const SPRITES = {
      walk: [
        "assets/img/enemiesChicken/chickenNormal/walk/oneW.png",
        "assets/img/enemiesChicken/chickenNormal/walk/twoW.png",
        "assets/img/enemiesChicken/chickenNormal/walk/threeW.png",
      ],
      dead: [
        "assets/img/enemiesChicken/chickenNormal/dead/dead.png",
      ],
    };

    this.stateMachine = new StateMachine(SPRITES, "walk", 6);
    // this.stateMachine.setState("dead");
    
    // preload aller frames
    AssetManager.loadAll(Object.values(SPRITES).flat()).then(() => {
      this.img = this.stateMachine.getFrame(); // erstes Frame
    });

    this.x = 200 + Math.random() * 500;
    this.animate();
  }

  animate() {
    setInterval(() => {
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame; // immer ein HTMLImage
    }, 1000 / this.stateMachine.frameRate);

    setInterval(() => {
      if (this.stateMachine.currentState === "walk") this.x -= 0.5;
    }, 1000 / 60);
  }

  die() {
    this.stateMachine.setState("dead");
  }
}