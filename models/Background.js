class Background extends MovableObject {
  width = 720;
  height = 400;

  constructor(imgPath, x) {
    super().loadImage(imgPath);
    this.x = x;
    this.y = 480 - this.height;
  }
}
