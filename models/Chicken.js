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
    this.stateMachine = new StateMachine(sprites, "walk", 10);
    this.loadSprites(sprites);
  }

  async loadSprites(sprites) {
    // Alle Sprites preloaden und Startbild setzen
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  update(deltaTime) {
    if (!this.isDead) {
      this.x -= this.speedX * deltaTime; // FPS-unabhängig
    }
    super.update(deltaTime);
  }
}