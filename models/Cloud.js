import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";


// TODO: REFAC 
export default class Cloud extends MovableObject {
  static DEFAULT_SPRITES = [
    "assets/img/background/layers/clouds/one.png",
    "assets/img/background/layers/clouds/two.png",
    "assets/img/background/layers/clouds/full.png",
  ];

  constructor({
    x = 0,
    y = 0,
    width = 480,
    height = 250,
    speed = 10,
    sprites = null,
  } = {}) {
    super();
    this.type = "cloud"; // wichtig für World

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.SPRITES = sprites || Cloud.DEFAULT_SPRITES;

    this.setRandomSprite();
  }

  async setRandomSprite() {
    const randomSprite =
      this.SPRITES[Math.floor(Math.random() * this.SPRITES.length)];
    // AssetManager lädt das Bild, falls noch nicht vorhanden
    await AssetManager.loadImage(randomSprite);
    this.img = AssetManager.getImage(randomSprite);
  }

  moveLeft() {
    this.x -= this.speed / 10; // optional: skalieren mit speed
    if (this.x + this.width < 0) {
      this.x = 800; // reset rechts
      this.setRandomSprite(); // optional: neue Wolke auswählen
    }
  }
}