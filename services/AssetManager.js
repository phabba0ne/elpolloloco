/**
 * AssetManager
 * ------------
 * Central hub for preloading and caching images & audio.
 * Ensures assets are available before the game world initializes.
 */
class AssetManager {
  // ---------- Caches ----------
  static imageCache = new Map();
  static audioCache = new Map();

  // ---------- Sprite definitions ----------
  static PEPE_SPRITES = {
    walk: [
      "assets/img/characterPepe/walk/wTwentyOne.png",
      "assets/img/characterPepe/walk/wTwentyTwo.png",
      "assets/img/characterPepe/walk/wTwentyThree.png",
      "assets/img/characterPepe/walk/wTwentyFour.png",
      "assets/img/characterPepe/walk/wTwentyFive.png",
      "assets/img/characterPepe/walk/wTwentySix.png",
    ],
    jump: [
      "assets/img/characterPepe/jump/jThirtyOne.png",
      "assets/img/characterPepe/jump/jThirtyTwo.png",
      "assets/img/characterPepe/jump/jThirtyThree.png",
      "assets/img/characterPepe/jump/jThirtyFour.png",
      "assets/img/characterPepe/jump/jThirtyFive.png",
      "assets/img/characterPepe/jump/jThirtySix.png",
      "assets/img/characterPepe/jump/jThirtySeven.png",
      "assets/img/characterPepe/jump/jThirtyEight.png",
      "assets/img/characterPepe/jump/jThirtyNine.png",
    ],
    idle: [
      "assets/img/characterPepe/idle/idle/iOne.png",
      "assets/img/characterPepe/idle/idle/iTwo.png",
      "assets/img/characterPepe/idle/idle/iThree.png",
      "assets/img/characterPepe/idle/idle/iFour.png",
      "assets/img/characterPepe/idle/idle/iFive.png",
      "assets/img/characterPepe/idle/idle/iSix.png",
      "assets/img/characterPepe/idle/idle/iSeven.png",
    ],
    longIdle: [
      "assets/img/characterPepe/idle/longIdle/iEleven.png",
      "assets/img/characterPepe/idle/longIdle/iTwelve.png",
      "assets/img/characterPepe/idle/longIdle/iThirteen.png",
      "assets/img/characterPepe/idle/longIdle/iFourteen.png",
      "assets/img/characterPepe/idle/longIdle/iFifteen.png",
      "assets/img/characterPepe/idle/longIdle/iSixteen.png",
      "assets/img/characterPepe/idle/longIdle/iSeventeen.png",
      "assets/img/characterPepe/idle/longIdle/iEighteen.png",
      "assets/img/characterPepe/idle/longIdle/iNineteen.png",
      "assets/img/characterPepe/idle/longIdle/iTwenty.png",
    ],
    hurt: [
      "assets/img/characterPepe/hurt/hFortyOne.png",
      "assets/img/characterPepe/hurt/hFortyTwo.png",
      "assets/img/characterPepe/hurt/hFortyThree.png",
    ],
    dead: [
      "assets/img/characterPepe/dead/dFiftyOne.png",
      "assets/img/characterPepe/dead/dFiftyTwo.png",
      "assets/img/characterPepe/dead/dFiftyThree.png",
    ],
  };

  static CHICKEN_SPRITES = {
    walk: [
      "assets/img/enemiesChicken/chickenNormal/walk/oneW.png",
      "assets/img/enemiesChicken/chickenNormal/walk/twoW.png",
      "assets/img/enemiesChicken/chickenNormal/walk/threeW.png",
    ],
    dead: ["assets/img/enemiesChicken/chickenNormal/dead/dead.png"],
  };

static preloadLevelAssets(level) {
  const allAssets = [
    ...level.backgrounds.map(bg => bg.imagePath),
    ...level.clouds.map(cloud => cloud.imagePath),
    ...level.enemies.map(enemy => enemy.getSpritePaths()).flat(),
    // Character sprites separat laden
  ];
  return this.loadImages(allAssets);
}

static getImageSafely(path) {
  const img = this.getImage(path);
  return img && img.complete && img.naturalWidth > 0 ? img : null;
}

  // ---------- Images ----------
  static loadImage(path) {
    if (this.imageCache.has(path)) return Promise.resolve(this.imageCache.get(path));

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.imageCache.set(path, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    });
  }

  static async loadImages(paths) {
    return Promise.all(paths.map((p) => this.loadImage(p)));
  }

  static getImage(path) {
    return this.imageCache.get(path);
  }

  // ---------- Audio ----------
  static loadAudio(path) {
    if (this.audioCache.has(path)) return Promise.resolve(this.audioCache.get(path));

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = path;
      audio.oncanplaythrough = () => {
        this.audioCache.set(path, audio);
        resolve(audio);
      };
      audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
    });
  }

  static async loadAudios(paths) {
    return Promise.all(paths.map((p) => this.loadAudio(p)));
  }

  static getAudio(path) {
    return this.audioCache.get(path);
  }

  // ---------- Generic ----------
  static async loadAll(assets) {
    const imagePaths = assets.filter((a) => a.match(/\.(png|jpg|jpeg|gif)$/));
    const audioPaths = assets.filter((a) => a.match(/\.(mp3|ogg|wav)$/));

    await Promise.all([this.loadImages(imagePaths), this.loadAudios(audioPaths)]);
  }
}

window.AssetManager = AssetManager;