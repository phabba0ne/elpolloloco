class Cloud extends MovableObject {
  y = 50;
  width = 500;
  height = 250;
  speed = 30;

  constructor() {
    super();
    this.x = Math.random() * 500;
    this.y = 20 + Math.random() * 120;
    this.loadImage("../assets/img/background/layers/clouds/one.png");
  }

  update(dt, canvasWidth) {
    this.x -= this.speed * dt;
    if (this.x + this.width < 0) {
      this.x = canvasWidth + Math.random() * 200;
      this.y = 20 + Math.random() * 120;
    }
  }
}