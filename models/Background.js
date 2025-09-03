class Background extends MovableObject {
  height = 480;
  // bestimmt, wie stark jeder Hintergrund mitscrollt
  speedFactor=1;

  constructor(imgPath, x, speedFactor = 1) {
    super();
    this.loadImage(imgPath);
    this.x = x;
    this.y = 480 - this.height;
    this.speedFactor = speedFactor;
  }
}