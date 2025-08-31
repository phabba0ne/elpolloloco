/**
 * AssetManager
 * ------------
 * Central hub for preloading and caching images & audio.
 * Ensures assets are available before the game world initializes.
 */
class AssetManager {
  static imageCache = new Map();
  static audioCache = new Map();

  // ---------- Images ----------
  static loadImage(path) {
    if (this.imageCache.has(path)) {
      return Promise.resolve(this.imageCache.get(path));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.imageCache.set(path, img);
        resolve(img);
      };
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${path}`));
    });
  }

  static async loadImages(paths) {
    return Promise.all(paths.map(p => this.loadImage(p)));
  }

  static getImage(path) {
    return this.imageCache.get(path);
  }

  // ---------- Audio ----------
  static loadAudio(path) {
    if (this.audioCache.has(path)) {
      return Promise.resolve(this.audioCache.get(path));
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = path;
      audio.oncanplaythrough = () => {
        this.audioCache.set(path, audio);
        resolve(audio);
      };
      audio.onerror = () =>
        reject(new Error(`Failed to load audio: ${path}`));
    });
  }

  static async loadAudios(paths) {
    return Promise.all(paths.map(p => this.loadAudio(p)));
  }

  static getAudio(path) {
    return this.audioCache.get(path);
  }

  // ---------- Generic ----------
  static async loadAll(assets) {
    const imagePaths = assets.filter(a => a.match(/\.(png|jpg|jpeg|gif)$/));
    const audioPaths = assets.filter(a => a.match(/\.(mp3|ogg|wav)$/));

    await Promise.all([
      this.loadImages(imagePaths),
      this.loadAudios(audioPaths),
    ]);
  }
}

window.AssetManager = AssetManager;