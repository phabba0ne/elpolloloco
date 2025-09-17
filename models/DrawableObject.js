/**
 * Base class for drawable objects
 */
export default class DrawableObject {
  /**
   * @param {object} options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=0] - Y position
   * @param {number} [options.width=100] - Width of object
   * @param {number} [options.height=100] - Height of object
   * @param {string|null} [options.type=null] - Object type
   * @param {string|null} [options.imgPath=null] - Optional image path
   */
  constructor({ x = 0, y = 0, width = 100, height = 100, type = null, imgPath = null } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.type = type ?? "drawable";
    this.img = null;
    this.imageCache = {};
    this.otherDirection = false;

    if (imgPath) {
      this.loadImage(imgPath);
    }
  }

  /**
   * Load single image
   */
  loadImage(path) {
    if (!path) return;
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Preload multiple sprites
   */
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
          img.onerror = (err) => reject(new Error(`Failed to load ${src}: ${err}`));
          img.src = src;
        });
      }
      return Promise.resolve(this.imageCache[src]);
    });

    await Promise.all(promises);
    return this.imageCache;
  }

  /**
   * Draw the object
   */
  draw(ctx) {
    if (!this.img) {
      ctx.fillStyle = "magenta";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    if (this.img.complete && this.img.naturalWidth > 0) {
      ctx.save();
      if (this.otherDirection) {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.img, 0, 0, this.width, this.height);
      } else {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      }
      ctx.restore();
    }
  }

  /** Get horizontal center */
  getCenterX() {
    return this.x + this.width / 2;
  }

  /** Get vertical center */
  getCenterY() {
    return this.y + this.height / 2;
  }

  /** Get bounding box */
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }
}