export default class Level {
  constructor({
    enemies = [],
    clouds = [],
    backgrounds = [],
    startX = 120,
    endX = 10000
  } = {}) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgrounds = backgrounds;
    this.startX = startX;
    this.endX = endX;
  }
}