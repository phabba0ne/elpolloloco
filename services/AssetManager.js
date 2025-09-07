/**
 * AssetManager
 * ------------
 * Central hub for preloading and caching images & audio.
 * Ensures assets are available before the game world initializes.
 */

export default class AssetManager {
  // ---------- Caches ----------
  static imageCache = new Map();
  static audioCache = new Map();

  // (DOC: New Character STEP 1 - Define Sprites)

  // #region bottle

  static SALSABOTTLE = {
    spawn:[
      "assets/img/salsaBottle/salsaBottle.png",
      "assets/img/salsaBottle/salsaBottleOnGround.png",
      "assets/img/salsaBottle/salsaBottleOnGroundTwo.png",

    ],
    
    spin: [
      "assets/img/salsaBottle/bottleRotation/bottleRotationOne.png",
      "assets/img/salsaBottle/bottleRotation/bottleRotationTwo.png",
      "assets/img/salsaBottle/bottleRotation/bottleRotationThree.png",
      "assets/img/salsaBottle/bottleRotation/bottleRotationFour.png",
    ],
    hit: [
      "assets/img/salsaBottle/bottleRotation/bottleSplashOne.png",
      "assets/img/salsaBottle/bottleRotation/bottleSplashTwo.png",
      "assets/img/salsaBottle/bottleRotation/bottleSplashThree.png",
      "assets/img/salsaBottle/bottleRotation/bottleSplashFour.png",
      "assets/img/salsaBottle/bottleRotation/bottleSplashFive.png",
      "assets/img/salsaBottle/bottleRotation/bottleSplashSix.png",
    ],
  };

  // #endregion bottle

  // #region coin

  static COIN_SPRITES = {
    idle: ["assets/img/coin/coinOne.png", "assets/img/coin/coinTwo.png"],
  };

  // #endregion coin

  // #region chickenNormal
  
    static CHICKEN_SPRITES = {
    walk: [
      "assets/img/enemiesChicken/chickenNormal/walk/oneW.png",
      "assets/img/enemiesChicken/chickenNormal/walk/twoW.png",
      "assets/img/enemiesChicken/chickenNormal/walk/threeW.png",
    ],
    dead: ["assets/img/enemiesChicken/chickenNormal/dead/dead.png"],
  };

  // #endregion chickenNormal

  // #region chickenSmall

  static CHICKENSMALL_SPRITES = {
    walk: [
      "assets/img/enemiesChicken/chickenSmall/walk/oneW.png",
      "assets/img/enemiesChicken/chickenSmall/walk/twoW.png",
      "assets/img/enemiesChicken/chickenSmall/walk/threeW.png",
    ],
    dead: ["assets/img/enemiesChicken/chickenSmall/dead/dead.png"],
  };

  // #endregion chickenSmall

// #region chickenBoss

  static CHICKENBOSS_SPRITES = {
    alert: [
      "assets/img/enemyBossChicken/alert/gFive.png",
      "assets/img/enemyBossChicken/alert/gSix.png",
      "assets/img/enemyBossChicken/alert/gSeven.png",
      "assets/img/enemyBossChicken/alert/gEight.png",
      "assets/img/enemyBossChicken/alert/gNine.png",
      "assets/img/enemyBossChicken/alert/gTen.png",
      "assets/img/enemyBossChicken/alert/gEleven.png",
      "assets/img/enemyBossChicken/alert/gTwelve.png",
    ],
    attack: [
      "assets/img/enemyBossChicken/attack/gThirteen.png",
      "assets/img/enemyBossChicken/attack/gFourteen.png",
      "assets/img/enemyBossChicken/attack/gFifteen.png",
      "assets/img/enemyBossChicken/attack/gSixteen.png",
      "assets/img/enemyBossChicken/attack/gSeventeen.png",
      "assets/img/enemyBossChicken/attack/gEighteen.png",
      "assets/img/enemyBossChicken/attack/gNineteen.png",
      "assets/img/enemyBossChicken/attack/gTwenty.png",
    ],
    dead: [
      "assets/img/enemyBossChicken/dead/gTwentyFour.png",
      "assets/img/enemyBossChicken/dead/gTwentyFive.png",
      "assets/img/enemyBossChicken/dead/gTwentySix.png",
    ],
    hurt: [
      "assets/img/enemyBossChicken/hurt/gTwentyOne.png",
      "assets/img/enemyBossChicken/hurt/gTwentyTwo.png",
      "assets/img/enemyBossChicken/hurt/gTwentyThree.png",
    ],
    walk: [
      "assets/img/enemyBossChicken/walk/gOne.png",
      "assets/img/enemyBossChicken/walk/gTwo.png",
      "assets/img/enemyBossChicken/walk/gThree.png",
      "assets/img/enemyBossChicken/walk/gFour.png",
    ],
  };

  // #endregion chickenBoss

  //#region pepe

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
      "assets/img/characterPepe/idle/idle/iEight.png",
      "assets/img/characterPepe/idle/idle/iNine.png",
      "assets/img/characterPepe/idle/idle/iTen.png",
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
      "assets/img/characterPepe/dead/dFiftyFour.png",
      "assets/img/characterPepe/dead/dFiftyFive.png",
      "assets/img/characterPepe/dead/dFiftySix.png",
      "assets/img/characterPepe/dead/dFiftySeven.png",

    ],
  };

  //#endregion pepe

    /**
   * Preload all known assets defined in static sprite maps
   */
  static async preload() {
    const assetGroups = [
      this.SALSABOTTLE,
      this.COIN_SPRITES,
      this.CHICKEN_SPRITES,
      this.CHICKENSMALL_SPRITES,
      this.CHICKENBOSS_SPRITES,
      this.PEPE_SPRITES,
    ];

    // Alle Arrays extrahieren und flatten
    const allPaths = assetGroups
      .map(group => Object.values(group).flat())
      .flat();

    console.log(`AssetManager: Preloading ${allPaths.length} assets...`);

    await this.loadAll(allPaths);

    console.log("✅ AssetManager: Alle Assets geladen.");
  }

  static getImageSafely(path) {
    const img = this.getImage(path);
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }

  // ---------- Images ----------
  static loadImage(path) {
    if (this.imageCache.has(path))
      return Promise.resolve(this.imageCache.get(path));

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
    if (this.audioCache.has(path))
      return Promise.resolve(this.audioCache.get(path));

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

    await Promise.all([
      this.loadImages(imagePaths),
      this.loadAudios(audioPaths),
    ]);
  }
}


