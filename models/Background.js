class Background extends MovableObject {
  width = 720;
  height = 400;

  constructor(imgPath, x, y) {
    super().loadImage(imgPath);
    this.x = x;
    this.y = y;
  }
}
