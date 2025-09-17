/**
 * Level definition containing enemies, clouds and backgrounds
 */
export default class Level {
  /**
   * @param {object} options
   * @param {MovableObject[]} [options.enemies=[]] - Enemies in the level
   * @param {MovableObject[]} [options.clouds=[]] - Clouds in the level
   * @param {MovableObject[]} [options.backgrounds=[]] - Background layers
   * @param {number} [options.startX=120] - Level start X
   * @param {number} [options.endX=10000] - Level end X
   */
  constructor({ enemies = [], clouds = [], backgrounds = [], startX = 120, endX = 10000 } = {}) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgrounds = backgrounds;
    this.startX = startX;
    this.endX = endX;
    this.type = "level";
  }
}