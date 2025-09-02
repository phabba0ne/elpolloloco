class Background extends MovableObject {
  width = 1440;
  height = 480;
  speedFactor = 1;

  constructor(imgPath, x, speedFactor = 1) {
    super();
    this.loadImage(imgPath);
    this.x = x;
    this.y = 480 - this.height;
    this.speedFactor = speedFactor;
  }
}