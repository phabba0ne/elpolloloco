import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Chicken extends MovableObject {
  y = 100;
  width = 60;
  height = 60;
  speedX = 60; // px/sec
  strength = 10;

  constructor({ x = null, y = null, sprites = AssetManager.CHICKEN_SPRITES } = {}) {
    super();
    this.type = "enemy"; // wichtig für World

    // Position setzen
    this.x = x ?? 700 + Math.random() * 1500;
    this.y = y ?? this.y;

    // StateMachine initialisieren
    this.stateMachine = new StateMachine(sprites, "walk", 4);
    this.loadSprites(sprites);
  }

  async loadSprites(sprites) {
    // Alle Sprites preloaden
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame(); // Startframe
  }

  update(deltaTime) {
    if (!this.isDead) {
      this.x -= this.speedX * deltaTime; // FPS-unabhängig
    }
    this.stateMachine.update(deltaTime); // Animation updaten
    this.img = this.stateMachine.getFrame(); // aktuelles Frame setzen
    super.update(deltaTime);
  }

  draw(ctx) {
    if (!this.img) return;

    ctx.save();
    // Optional: spiegeln, falls andere Richtung benötigt
    if (this.otherDirection) {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(this.img, 0, 0, this.width, this.height);
    } else {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
    ctx.restore();

    // Debugbox
    if (this.debug) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }
}