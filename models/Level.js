class Level {
  enemies;
  clouds;
  backgrounds;
  endX=700;
  startX=0;

  constructor(enemies = [], clouds = [], backgrounds = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgrounds = backgrounds;
  }
}
