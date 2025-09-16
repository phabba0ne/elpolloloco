export default class DrawableObject {
  constructor({
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    type = null,
    imgPath = null,
  } = {}) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.img = null;
    this.type = type;

    this.imageCache = {};
    this.type = "drawable";

    if (imgPath) {
      this.loadImage(imgPath);
    }
  }

  loadImage(path) {
    if (!path) return;
    this.img = new Image();
    this.img.src = path;
  }

  async loadSprites(sprites) {
    const allSprites = Object.values(sprites).flat();
    const promises = allSprites.map((src) => {
      if (!this.imageCache[src]) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            this.imageCache[src] = img;
            resolve(img);
          };
          img.onerror = reject;
          img.src = src;
        });
      }
      return Promise.resolve(this.imageCache[src]);
    });

    await Promise.all(promises);
    return this.imageCache;
  }

  draw(ctx) {
    if (!this.img) {

      ctx.fillStyle = "magenta";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else if (this.img.complete && this.img.naturalWidth > 0) {

      if (this.otherDirection) {
        ctx.save();
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.img, 0, 0, this.width, this.height);
        ctx.restore();
      } else {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      }
    }
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }
}
