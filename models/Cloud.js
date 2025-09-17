import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";

/**
 * Cloud background object
 */
export default class Cloud extends MovableObject {
  static DEFAULT_SPRITES = [
    "assets/img/background/layers/clouds/one.png",
    "assets/img/background/layers/clouds/two.png",
    "assets/img/background/layers/clouds/full.png",
  ];

  /**
   * @param {object} options
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {number} options.width - Cloud width
   * @param {number} options.height - Cloud height
   * @param {number} options.speed - Cloud horizontal speed
   * @param {string[]} options.sprites - Override sprite list
   */
  constructor({
    x = 0,
    y = 0,
    width = 480,
    height = 350,
    speed = 10,
    sprites = null,
  } = {}) {
    super({ x, y, width, height, type: "cloud" });
    this.speed = speed;
    this.sprites = sprites || Cloud.DEFAULT_SPRITES;
    this.setRandomSprite();
  }

  /**
   * Load and assign a random sprite from the set
   */
  async setRandomSprite() {
    const randomSprite = this.sprites[Math.floor(Math.random() * this.sprites.length)];
    await AssetManager.loadImage(randomSprite);
    this.img = AssetManager.getImage(randomSprite);
  }

  /**
   * Move cloud left, reset when offscreen
   */
  moveLeft() {
    this.x -= this.speed / 10;
    if (this.x + this.width < 0) {
      this.x = 1200;
      this.setRandomSprite();
    }
  }
}