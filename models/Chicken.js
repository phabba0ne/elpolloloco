// Nur Chicken-spezifische Logik
import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Chicken extends MovableObject {
  constructor({
    x = null,
    y = 100,
    width = 100,
    height = 100,
    speedX = 60,
    strength = 20,
    sprites = AssetManager.CHICKEN_SPRITES,
  } = {}) {
    super({
      x: x ?? 700 + Math.random() * 1500,
      y:345,
      width,
      height,
      speedX,
      strength,
      type: "chicken",
    });

    // StateMachine für Chicken
    this.stateMachine = new StateMachine(sprites, "walk", 6);
    this.loadSprites(sprites);
  }

  checkStomp(character) {
  const characterFeet = character.y + character.height;
  const chickenHead = this.y + 10; // Default-Hitbox (großes Huhn)
  const horizontalOverlap =
    character.x + character.width >= this.x &&
    character.x <= this.x + this.width;

  if (
    characterFeet >= this.y &&
    characterFeet <= chickenHead &&
    horizontalOverlap &&
    character.speedY > 0
  ) {
    this.die();
    character.speedY = -character.jumpPower * 1;
    console.log(`[${this.type.toUpperCase()}] Stomped by Pepe!`);
  }
}

  update(deltaTime, character) {
    if (!this.isDead) {
      // Chicken moves left
      this.x -= this.speedX * deltaTime;

      // Minimal: Pepe von oben drauf prüfen
      if (character && !character.isDead) {
       this.checkStomp(character);
      }
    }
    this.updateStateMachine(deltaTime);
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stateMachine.setState("dead", 6);
  }
}
