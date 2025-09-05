class Level {
  enemies;
  clouds;
  backgrounds;
  endX=10000;
  startX=120;

  constructor(enemies = [], clouds = [], backgrounds = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgrounds = backgrounds;
  }
}
