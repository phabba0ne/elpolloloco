import MovableObject from "./MovableObject.js";

/**
 * Background object for parallax layers
 */
export default class Background extends MovableObject {
  /**
   * @param {Object} config
   * @param {string} config.imgPath - Path to background image
   * @param {number} [config.x=0] - X position
   * @param {number} [config.y=null] - Y position, defaults bottom-aligned
   * @param {number} [config.width=1440] - Width of background
   * @param {number} [config.height=480] - Height of background
   * @param {number} [config.speedFactor=1] - Parallax speed factor
   */
  constructor({
    imgPath,
    x = 0,
    y = null,
    width = 1440,
    height = 480,
    speedFactor = 1,
  } = {}) {
    super({ x, y: y ?? 480 - height, width, height, imgPath });
    this.type = "background";
    this.speedFactor = speedFactor;
  }
}