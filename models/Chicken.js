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
      type: "enemy",
    });

    // StateMachine für Chicken
    this.stateMachine = new StateMachine(sprites, "walk", 6);
    this.loadSprites(sprites);
  }

  update(deltaTime, character) {
    if (!this.isDead) {
      // Chicken moves left
      this.x -= this.speedX * deltaTime;

      // Minimal: Pepe von oben drauf prüfen
      if (character && !character.isDead) {
        const characterFeet = character.y + character.height;
        const chickenHead = this.y + 10; // Kopfzone
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
          character.speedY = -character.jumpPower * 1.2; // kräftiger Instant-Bounce
          console.log("[CHICKEN] Stomped by Pepe!");
        }
      }
    }

    // Update StateMachine
    this.updateStateMachine(deltaTime);
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    // ✅ Dead-State aktivieren

    this.stateMachine.setState("dead", 6); // Animation speed z.B. 6
    this.stateMachine.getFrame("dead"); // Frames für dead laden

    console.log("[CHICKEN] Dead");
  }
}
