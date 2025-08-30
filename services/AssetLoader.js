class AssetLoader {
  constructor() {
    this.cache = new Map();
  }

  loadImage(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    const img = new Image();
    const prom = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Fehler beim Laden: " + path));
    });
    img.src = path;
    this.cache.set(path, prom);
    return prom;
  }

  // mehrere auf einmal
  loadAll(paths) {
    return Promise.all(paths.map((p) => this.loadImage(p)));
  }
}

// Singleton-Loader exportieren
window.Loader = new AssetLoader();