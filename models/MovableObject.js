import DrawableObject from "./DrawableObject.js";

export default class MovableObject extends DrawableObject {
  constructor(options = {}) {
    super(options);

    this.speedX = options.speedX || 0;
    this.speedY = options.speedY || 0;
    this.gravity = options.gravity || 0;
    this.otherDirection = options.otherDirection || false;
    this.health = options.health || 100;
    this.isDead = false;

    // Kollisions-Cooldown (in ms)
    this.collisionCooldown = 0;
    this.collisionInterval = options.collisionInterval || 1000;

    // Animationssystem
    this.stateMachine = null;

    // Welt-Referenz
    this.world = options.world || null;
  }

  /** 🔹 Physik / Bewegung */
  updatePhysics(deltaTime) {
    if (this.gravity > 0) this.speedY += this.gravity;
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;
  }

  /** 🔹 StateMachine-Update */
  updateStateMachine(deltaTime) {
    if (this.stateMachine) {
      this.stateMachine.update(deltaTime);
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;
    }
  }

  /** 🔹 Kollision mit Cooldown */
  checkCollisions(objects, deltaTime) {
    if (this.isDead) return null;
    this.collisionCooldown -= deltaTime * 1000;

    for (const obj of objects) {
      if (!obj || obj === this) continue;
      if (this.x < obj.x + obj.width &&
          this.x + this.width > obj.x &&
          this.y < obj.y + obj.height &&
          this.y + this.height > obj.y) {

        if (this.collisionCooldown <= 0) {
          if (this.type === "character" && obj.type === "enemy") this.getDamage(obj);
          if (this.type === "enemy" && obj.type === "character") this.doDamage(obj);

          this.collisionCooldown = this.collisionInterval;
          this.onCollision(obj);
        }
        return obj; // nur ein Treffer pro Frame
      }
      
    }
    return null;
  }

  /** 🔹 Schaden nehmen */
  getDamage(source) {
    if (!source || this.isDead) return;
    this.health -= source.strength || 10;
    if (this.health <= 0) this.die();
    else this.onDamage(source);
  }

  /** 🔹 Schaden austeilen */
  doDamage(target) {
    if (!target || this.isDead) return;
    target.getDamage(this);
  }

  /** 🔹 Sterben */
  die() {
    if (this.isDead) return;
    this.isDead = true;
    if (this.stateMachine?.sprites.dead) this.stateMachine.setState("dead");
    this.onDeath();
  }

  /** 🔹 Update 60FPS-ready */
  update(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") {
      this.updateStateMachine(deltaTime);
      return;
    }

    this.updatePhysics(deltaTime);

    // Kollisionen nur mit sichtbaren Objekten
    if (this.world?.getVisibleObjects) {
      const visibleObjects = this.world.getVisibleObjects(this);
      this.checkCollisions(visibleObjects, deltaTime);
    }

    this.updateStateMachine(deltaTime);
  }

  // Hooks – Subklassen können überschreiben
  onCollision(obj) {}
  onDamage(source) {}
  onDeath() {}
}