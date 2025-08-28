class Cloud extends MovableObject {
  y = 20;
  height = 250;

  constructor() {
    super().loadImage("assets/img/background/layers/clouds/one.png");

    this.x = Math.random() * 500;
    this.width = 500;
  }
}
