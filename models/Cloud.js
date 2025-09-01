class Cloud extends MovableObject {
  y = 50;
  width = 500;
  height = 250;
  speed = 30;

  SPRITES = [
    "/assets/img/background/layers/clouds/one.png",
    "/assets/img/background/layers/clouds/two.png",
    "/assets/img/background/layers/clouds/full.png",
  ];

  constructor() {
    super();
    this.x = Math.random() * 500;
    this.y = 20 + Math.random() * 120;
    this.setRandomSprite(); // erstes Bild setzen
  }

  /**
   * Wählt ein zufälliges Bild aus und lädt es
   */
  setRandomSprite() {
    const randomSprite = this.SPRITES[
      Math.floor(Math.random() * this.SPRITES.length)
    ];
    this.loadImage(randomSprite);
  }

  update(dt, canvasWidth) {
    this.x -= this.speed * dt;

    // Wolke verlässt den linken Rand → rechts wieder einfügen
    if (this.x + this.width < 0) {
      this.x = canvasWidth + Math.random() * 200;
      this.y = 20 + Math.random() * 120;
      this.setRandomSprite(); // neues Bild beim Respawn
    }
  }
}