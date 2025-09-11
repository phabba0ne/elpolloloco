import DrawableObject from "../models/DrawableObject.js";
import AssetManager from "../services/AssetManager.js";

export default class StatusBar extends DrawableObject {
  constructor({
    x = 0,
    y = 0,
    width = 200,
    height = 60,
    sprites = [],
    icon = null,
    type = "statusBar",
  } = {}) {
    super({ x, y, width, height, type });

    this.percentage = 100;
    this.icon = icon ? AssetManager.getImage(icon) : null;

    // sprites kann jetzt Array oder Objekt von Arrays sein
    if (Array.isArray(sprites)) {
      this.IMAGES = sprites;
    } else if (typeof sprites === "object") {
      this.IMAGES = Object.values(sprites).flat();
    } else {
      throw new Error("StatusBar: sprites must be an array or object of arrays");
    }

    // Preload images
    AssetManager.loadAll(this.IMAGES).then(() => {
      this.setPercentage(100);
    });
  }

  setPercentage(percentage) {
    this.percentage = Math.max(0, Math.min(100, percentage));
    const path = this.IMAGES[this.resolveImageIndex()];
    this.img = AssetManager.getImage(path);
  }

  resolveImageIndex() {
    if (this.percentage === 100) return 5;
    if (this.percentage >= 80) return 4;
    if (this.percentage >= 60) return 3;
    if (this.percentage >= 40) return 2;
    if (this.percentage >= 20) return 1;
    return 0;
  }

  draw(ctx) {
    if (this.icon) {
      ctx.drawImage(this.icon, this.x - 40, this.y, 32, 32);
    }

    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    } else {
      // fallback
      ctx.fillStyle = "gray";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}