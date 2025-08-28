class Cloud extends MovableObject {
  y = 50;
  width = 500;
  height = 250;

  constructor() {
    super().loadImage("../assets/img/background/layers/clouds/one.png");

    this.x = Math.random() * 500;
    this.width = 500;
    this.animate();
  }
  animate() {
    setInterval(() => {
      this.x -= 0.15;
    }, 1000 / 60);
  }
}
