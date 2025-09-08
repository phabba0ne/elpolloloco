import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class SalsaBottle extends MovableObject {
  width = 70;
  height = 70;
  gravity = 0.5;
  rotation = 0;
  rotationSpeed = 0.3;
  damage = 50;

  constructor({ 
    x = 0, 
    y = 0, 
    collectable = true,   // 👈 NEU: liegt rum, Pepe kann sammeln
    direction = 1, 
    debug = false, 
  } = {}) {
    super({ x, y });
    this.type = "salsa";
    this.collectable = collectable;
    this.thrown = false;      // wird auf true gesetzt, wenn Pepe wirft
    this.enabled = true;
    this.speedX = 0;
    this.speedY = 0;

    // StateMachine für Animations-Frames
    this.stateMachine = new StateMachine({
      spin: AssetManager.SALSABOTTLE.spin,
      hit: AssetManager.SALSABOTTLE.hit,
      spawn: AssetManager.SALSABOTTLE.spawn
    }, "spawn", 0);

    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  update(deltaTime, objects = []) {
    if (!this.enabled) return;

    // Wenn Flasche geworfen wurde → Physik + Kollisions-Check
    if (this.thrown) {
      this.x += this.speedX;
      this.speedY += this.gravity;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      for (const obj of objects) {
        if (obj !== this && this.isCollidingWith(obj)) {
          if (typeof obj.getDamage === "function") {
            obj.getDamage(this); // Gegner Schaden zufügen
          }
          this.explode();
          break;
        }
      }
    }

    // Animations-Frame wechseln
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  explode() {
    this.thrown = false;
    this.stateMachine.setState("hit");
    this.stateMachine.currentFrame = 0;
  }

  draw(ctx) {
    if (!this.enabled || !this.img) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Nur geworfene Flaschen drehen sich
    if (this.thrown) {
      ctx.rotate(this.rotation);
    }

    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }

  /**
   * Wird von World/ItemSpawner aufgerufen.
   * Falls Pepe die Flasche berührt und sie sammelbar ist → einsammeln.
   */
  tryCollect(character) {
    if (!this.collectable || !this.enabled) return false;

    if (this.isCollidingWith(character)) {
      this.enabled = false;
      if (!character.salsas) character.salsas = 0; // falls noch nicht existiert
      character.salsas += 1;
      console.log("Collected SalsaBottle! Total:", character.salsas);
      return true;
    }
    return false;
  }

  /**
   * Standard Rechteck-Kollisionscheck
   */
  isCollidingWith(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y
    );
  }
}