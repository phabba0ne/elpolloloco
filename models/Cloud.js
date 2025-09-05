class Cloud extends MovableObject {
  y = 50;
  width = 500;
  height = 250;
  speed = 30;

  SPRITES = [
    "assets/img/background/layers/clouds/one.png",
    "assets/img/background/layers/clouds/two.png", 
    "assets/img/background/layers/clouds/full.png",
  ];

  constructor(x = null, y = null) {
    super();
    
    // Position setzen
    this.x = x || Math.random() * 500;
    this.y = y || (20 + Math.random() * 120);
    
    this.setRandomSprite();
  }

  setRandomSprite() {
    const randomSprite = this.SPRITES[Math.floor(Math.random() * this.SPRITES.length)];
    this.loadImage(randomSprite);
  }

  moveLeft() {
    this.x -= 2;
    if (this.x + this.width < 0) {
      this.x = 800;
    }
  }
}