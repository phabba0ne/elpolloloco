//all about drawing, rendering and helpers

// pulled common attributes out
export default class DrawableObject {
  constructor({
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    debug = false,
    type = null,
    imgPath = null
  } = {}) {
    // Position & Dimensionen - GEMEINSAM für alle
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Rendering - GEMEINSAM für alle
    this.img = null;
    this.debug = debug;
    this.type = type;
    
    // Image-Cache für alle Klassen verfügbar
    this.imageCache = {};
    
    // Image sofort laden falls Pfad gegeben
    if (imgPath) {
      this.loadImage(imgPath);
    }
  }

  // ALLE Image-Loading Methoden hier - gemeinsam verwendet
  loadImage(path) {
    if (!path) return;
    this.img = new Image();
    this.img.src = path;
  }

  // Async Sprites laden mit Cache - VON ALLEN SUBKLASSEN VERWENDET
  async loadSprites(sprites) {
    const allSprites = Object.values(sprites).flat();
    const promises = allSprites.map(src => {
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

  // KOMPLETTE Draw-Logik hier - alle verwenden das gleiche Pattern
  draw(ctx) {
    if (!this.img) {
      // Fallback für fehlende Bilder
      ctx.fillStyle = "magenta";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else if (this.img.complete && this.img.naturalWidth > 0) {
      // Normal drawing oder gespiegelt
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

    // Debug-Box - ALLE verwenden das gleiche
    if (this.debug) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }

  // Utility-Methoden
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
      bottom: this.y + this.height
    };
  }
}
