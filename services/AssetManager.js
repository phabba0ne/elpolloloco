export default class AssetManager {
  static imageCache = new Map();
  static audioCache = new Map();
  static loadQueue = [];
  static isLoading = false;
  static eventBus = null;

  static AMBIENT = {
    bossLanded: ["assets/sounds/ambient/bossLanded.mp3Í"],
    bottleClink: ["assets/sounds/ambient/bottleClink.mp3"],
    cartoonJump: ["assets/sounds/ambient/cartoonJump.mp3"],
    chickenAlarmCall: ["assets/sounds/ambient/chickenAlarmCall.mp3"],
    levelOneSong: ["assets/sounds/ambient/levelOneSong.mp3"],
    throwItem: ["assets/sounds/ambient/throwItem.mp3"],
    titleSong: ["assets/sounds/ambient/titleSong.mp3"],
    wind: ["assets/sounds/ambient/wind.mp3"],
    wind2: ["assets/sounds/ambient/wind2.mp3"],
  };

  static GAME_OVER = {
    over: [
      "assets/img/youWonYouLost/gameOver.png",
      "assets/img/youWonYouLost/gameOverA.png",
    ],
    win: [
      "assets/img/youWonYouLost/youWinA.png",
      "assets/img/youWonYouLost/youWinB.png",
    ],
    won: [
      "assets/img/youWonYouLost/youWonA.png",
      "assets/img/youWonYouLost/youWonB.png",
    ],
    lost: [
      "assets/img/youWonYouLost/youLost.png",
      "assets/img/youWonYouLost/youLostA.png",
    ],
  };

  static STATUSBARS_CHICKENBOSS = {
    healthOrange: [
      "assets/img/statusBars/statusBarEndBoss/orange/orangeZero.png",
      "assets/img/statusBars/statusBarEndBoss/orange/orangeTwenty.png",
      "assets/img/statusBars/statusBarEndBoss/orange/orangeForty.png",
      "assets/img/statusBars/statusBarEndBoss/orange/orangeSixty.png",
      "assets/img/statusBars/statusBarEndBoss/orange/orangeEighty.png",
      "assets/img/statusBars/statusBarEndBoss/orange/orangeHundred.png",
    ],
    healthBlue: [
      "assets/img/statusBars/statusBarEndBoss/blue/blueZero.png",
      "assets/img/statusBars/statusBarEndBoss/blue/blueTwenty.png",
      "assets/img/statusBars/statusBarEndBoss/blue/blueForty.png",
      "assets/img/statusBars/statusBarEndBoss/blue/blueSixty.png",
      "assets/img/statusBars/statusBarEndBoss/blue/blueEighty.png",
      "assets/img/statusBars/statusBarEndBoss/blue/blueHundred.png",
    ],
    healthGreen: [
      "assets/img/statusBars/statusBarEndBoss/green/greenZero.png",
      "assets/img/statusBars/statusBarEndBoss/green/greenTwenty.png",
      "assets/img/statusBars/statusBarEndBoss/green/greenForty.png",
      "assets/img/statusBars/statusBarEndBoss/green/greenSixty.png",
      "assets/img/statusBars/statusBarEndBoss/green/greenEighty.png",
      "assets/img/statusBars/statusBarEndBoss/green/greenHundred.png",
    ],
  };

  static STATUSBARS_PEPE = {
    healthOrange: [
      "assets/img/statusBars/statusBar/statusBarHealth/orange/zero.png",
      "assets/img/statusBars/statusBar/statusBarHealth/orange/twenty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/orange/forty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/orange/sixty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/orange/eighty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/orange/hundred.png",
    ],
    coinBlue: [
      "assets/img/statusBars/statusBar/statusBarHealth/blue/zero.png",
      "assets/img/statusBars/statusBar/statusBarHealth/blue/twenty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/blue/forty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/blue/sixty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/blue/eighty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/blue/hundred.png",
    ],
    coinGreen: [
      "assets/img/statusBars/statusBar/statusBarHealth/green/zero.png",
      "assets/img/statusBars/statusBar/statusBarHealth/green/twenty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/green/forty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/green/sixty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/green/eighty.png",
      "assets/img/statusBars/statusBar/statusBarHealth/green/hundred.png",
    ],
    coinOrange: [
      "assets/img/statusBars/statusBar/statusBarCoin/orange/zero.png",
      "assets/img/statusBars/statusBar/statusBarCoin/orange/twenty.png",
      "assets/img/statusBars/statusBar/statusBarCoin/orange/forty.png",
      "assets/img/statusBars/statusBar/statusBarCoin/orange/sixty.png",
      "assets/img/statusBars/statusBar/statusBarCoin/orange/eighty.png",
      "assets/img/statusBars/statusBar/statusBarCoin/orange/hundred.png",
    ],
    bottleOrange: [
      "assets/img/statusBars/statusBar/statusBarBottle/orange/zero.png",
      "assets/img/statusBars/statusBar/statusBarBottle/orange/twenty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/orange/forty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/orange/sixty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/orange/eighty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/orange/hundred.png",
    ],
    bottleBlue: [
      "assets/img/statusBars/statusBar/statusBarBottle/blue/zero.png",
      "assets/img/statusBars/statusBar/statusBarBottle/blue/twenty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/blue/forty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/blue/sixty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/blue/eighty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/blue/hundred.png",
    ],
    bottleGreen: [
      "assets/img/statusBars/statusBar/statusBarBottle/green/zero.png",
      "assets/img/statusBars/statusBar/statusBarBottle/green/twenty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/green/forty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/green/sixty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/green/eighty.png",
      "assets/img/statusBars/statusBar/statusBarBottle/green/hundred.png",
    ],
    orange: [
      "assets/img/statusBars/barElements/statusBarEmpty.png",
      "assets/img/statusBars/barElements/statusBarOrange.png",
    ],
    blue: [
      "assets/img/statusBars/barElements/statusBarEmpty.png",
      "assets/img/statusBars/barElements/statusBarBlue.png",
    ],
    green: [
      "assets/img/statusBars/barElements/statusBarEmpty.png",
      "assets/img/statusBars/barElements/statusBarGreen.png",
    ],
    icons: [
      "assets/img/statusBars/icons/iconCoin.png",
      "assets/img/statusBars/icons/iconHealth.png",
      "assets/img/statusBars/icons/iconHealthEndBoss.png",
      "assets/img/statusBars/icons/iconSalsaBottle.png",
    ],
  };

  static SALSABOTTLE = {
    spawn: [
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

  static SALSASOUNDS = {
    spawn: [""],
    collect: ["assets/sounds/collectibles/bottleCollectSound.wav"],
    spin: [""],
    hit: [""],
  };

  static COIN_SPRITES = {
    idle: ["assets/img/coin/coinOne.png", "assets/img/coin/coinTwo.png"],
  };

  static COIN_SOUNDS = {
    collect: ["assets/sounds/collectibles/collectSound.wav"],
  };

  static CHICKEN_SPRITES = {
    walk: [
      "assets/img/enemiesChicken/chickenNormal/walk/oneW.png",
      "assets/img/enemiesChicken/chickenNormal/walk/twoW.png",
      "assets/img/enemiesChicken/chickenNormal/walk/threeW.png",
    ],
    dead: ["assets/img/enemiesChicken/chickenNormal/dead/dead.png"],
  };

  static CHICKEN_SOUNDS = {
    spawn: [""],
    walk: [""],
    dead: ["assets/sounds/chicken/chickenDead.mp3"],
  };

  static CHICKENSMALL_SPRITES = {
    walk: [
      "assets/img/enemiesChicken/chickenSmall/walk/oneW.png",
      "assets/img/enemiesChicken/chickenSmall/walk/twoW.png",
      "assets/img/enemiesChicken/chickenSmall/walk/threeW.png",
    ],
    dead: ["assets/img/enemiesChicken/chickenSmall/dead/dead.png"],
  };

  static CHICKENSMALL_SOUNDS = {
    spawn: [""],
    walk: [""],
    dead: ["assets/sounds/chicken/chickenDead2.mp3"],
  };

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

  static CHICKENBOSS_SOUNDS = {
    approach: ["assets/sounds/endboss/endbossApproach.wav"],
    alert: [""],
    attack: [""],
    walk: [""],
    hurt: [""],
    dead: [""],
  };

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

  static PEPE_SOUNDS = {
    walk: ["assets/sounds/character/characterRun.mp3"],
    jump: ["assets/sounds/character/characterJump.wav"],
    longIdle: ["assets/sounds/character/characterSnoring.mp3"],
    hurt: ["assets/sounds/character/characterDamage.mp3"],
    dead: ["assets/sounds/character/characterDead.wav"],
    throw: [""],
  };

  // NEW: Set EventBus for notifications
  static setEventBus(eventBus) {
    this.eventBus = eventBus;
  }

  // IMPROVED: Preload with priority system
static async preload(priority = "normal") {
  // Alle Asset-Gruppen automatisch sammeln
  const assetGroups = [
    { group: this.GAME_OVER, priority: "low" },
    { group: this.STATUSBARS_CHICKENBOSS, priority: "medium" },
    { group: this.STATUSBARS_PEPE, priority: "high" },
    { group: this.SALSABOTTLE, priority: "high" },
    { group: this.SALSASOUNDS, priority: "high" },
    { group: this.COIN_SPRITES, priority: "high" },
    { group: this.COIN_SOUNDS, priority: "high" },
    { group: this.CHICKEN_SPRITES, priority: "high" },
    { group: this.CHICKEN_SOUNDS, priority: "high" },
    { group: this.CHICKENSMALL_SPRITES, priority: "high" },
    { group: this.CHICKENSMALL_SOUNDS, priority: "medium" },
    { group: this.CHICKENBOSS_SPRITES, priority: "medium" },
    { group: this.CHICKENBOSS_SOUNDS, priority: "low" },
    { group: this.PEPE_SPRITES, priority: "high" },
    { group: this.PEPE_SOUNDS, priority: "high" },
    { group: this.AMBIENT, priority: "high" },
  ];

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  assetGroups.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Alle Pfade automatisch sammeln
  let totalAssets = 0;
  let loadedAssets = 0;
  const allAssetPaths = [];

  for (const { group, priority: groupPriority } of assetGroups) {
    // Filter nach gewünschter Preload-Priorität
    if (priority === "high" && groupPriority !== "high") continue;
    if (priority === "medium" && groupPriority === "low") continue;

    // Alle Keys dynamisch flatten
    Object.values(group).forEach(value => {
      if (Array.isArray(value)) {
        value.filter(Boolean).forEach(path => allAssetPaths.push(path));
      }
    });
  }

  totalAssets = allAssetPaths.length;
  console.log(`[AssetManager] Preloading ${totalAssets} assets (minPriority=${priority})`);

  // Lade alle Assets mit Fortschritts-Callback
  await this.loadAll(allAssetPaths, (loaded, total) => {
    loadedAssets += loaded;
    if (this.eventBus) this.eventBus.emit("asset-progress", {
      loaded: loadedAssets,
      total: totalAssets,
      percentage: Math.round((loadedAssets / totalAssets) * 100),
    });
  });

  console.log("✅ AssetManager: Alle Assets geladen.");
  if (this.eventBus) this.eventBus.emit("assets-loaded");
}

  // IMPROVED: Load with progress callback
  static async loadAll(assets, progressCallback = null) {
    const imagePaths = assets.filter((a) => a.match(/\.(png|jpg|jpeg|gif)$/));
    const audioPaths = assets.filter((a) => a.match(/\.(mp3|ogg|wav)$/));

    let loadedCount = 0;
    const totalCount = imagePaths.length + audioPaths.length;

    const updateProgress = () => {
      loadedCount++;
      if (progressCallback) {
        progressCallback(loadedCount, totalCount);
      }
    };

    await Promise.all([
      this.loadImages(imagePaths, updateProgress),
      this.loadAudios(audioPaths, updateProgress),
    ]);
  }

  // IMPROVED: Better error handling and progress tracking
  static getImageSafely(path) {
    const img = this.getImage(path);
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }

  static loadImage(path, onLoad = null) {
    if (this.imageCache.has(path)) {
      if (onLoad) onLoad();
      return Promise.resolve(this.imageCache.get(path));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.imageCache.set(path, img);
        if (onLoad) onLoad();
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${path}`);
        // Create placeholder image
        const placeholder = new Image();
        placeholder.width = 64;
        placeholder.height = 64;
        this.imageCache.set(path, placeholder);
        if (onLoad) onLoad();
        resolve(placeholder);
      };
    });
  }

  static async loadImages(paths, onEachLoad = null) {
    return Promise.all(paths.map((p) => this.loadImage(p, onEachLoad)));
  }

  static getImage(path) {
    return this.imageCache.get(path);
  }

  static loadAudio(path, onLoad = null) {
    if (this.audioCache.has(path)) {
      if (onLoad) onLoad();
      return Promise.resolve(this.audioCache.get(path));
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = path;
      audio.oncanplaythrough = () => {
        this.audioCache.set(path, audio);
        if (onLoad) onLoad();
        resolve(audio);
      };
      audio.onerror = () => {
        console.error(`Failed to load audio: ${path}`);
        // Create silent placeholder
        const placeholder = new Audio();
        this.audioCache.set(path, placeholder);
        if (onLoad) onLoad();
        resolve(placeholder);
      };
    });
  }

  static async loadAudios(paths, onEachLoad = null) {
    return Promise.all(paths.map((p) => this.loadAudio(p, onEachLoad)));
  }

  static getAudio(path) {
    return this.audioCache.get(path);
  }

  // NEW: Memory management
  static clearCache(type = "all") {
    if (type === "all" || type === "images") {
      this.imageCache.clear();
    }
    if (type === "all" || type === "audio") {
      this.audioCache.clear();
    }
    console.log(`AssetManager: Cleared ${type} cache`);
  }

  // NEW: Get cache statistics
  static getCacheStats() {
    return {
      images: this.imageCache.size,
      audio: this.audioCache.size,
      total: this.imageCache.size + this.audioCache.size,
    };
  }
}
