import DrawableObject from "./DrawableObject.js";
import AssetManager from "../services/AssetManager.js";

export default class MovableObject extends DrawableObject {
  constructor(options = {}) {
    super(options);

    this.speedX = options.speedX || 0;
    this.speedY = options.speedY || 0;
    this.otherDirection = options.otherDirection || false;
    this.gravity = options.gravity || 0;
    this.health = options.health || 100;
    this.isDead = false;

    // Kollisionsverwaltung
    this.collisionCooldown = 0;                 // verbleibende Zeit bis wieder Schaden möglich
    this.collisionInterval = options.collisionInterval || 100; // ms zwischen Schadentreffern

    // Animationssystem
    this.stateMachine = null;
    this.frameTimer = 0;
    this.frameInterval = options.frameInterval || 60;

    // Referenz zur Welt
    this.world = options.world || null;
  }

  /** 🔹 Gemeinsame Sprites laden */
  async loadSprites(sprites) {
    await super.loadSprites(sprites);
    if (this.stateMachine) {
      this.img = this.stateMachine.getFrame();
    }
  }

  /** 🔹 StateMachine updaten */
  updateStateMachine(deltaTime) {
    if (this.stateMachine) {
      this.stateMachine.update(deltaTime);
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;
    }
  }

  /** 🔹 Bewegung */
  move(deltaTime) {
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;
  }

  /** 🔹 Physik */
  updatePhysics(deltaTime) {
    if (this.gravity > 0) {
      this.speedY += this.gravity;
    }
    this.move(deltaTime);
  }

  /** 🔹 AABB-Kollision */
  isCollidingWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  /** 🔹 Kollisionsprüfung mit Cooldown */
  checkCollisions(objects, deltaTime) {
    if (this.isDead) return null;

    // Zeit herunterzählen
    this.collisionCooldown -= deltaTime * 1000;

    for (const obj of objects) {
      if (!obj || obj === this) continue;
      if (!this.isCollidingWith(obj)) continue;

      // ✅ Erste Kollision sofort behandeln, danach Sperre
      if (this.collisionCooldown <= 0) {
        if (this.type === "character" && obj.type === "enemy") {
          this.getDamage(obj);
        }
        if (this.type === "enemy" && obj.type === "character") {
          this.doDamage(obj);
        }

        this.collisionCooldown = this.collisionInterval;
        this.onCollision(obj);
      }
      return obj; // Nur ein Treffer pro Frame nötig
    }

    return null;
  }

  /** 🔹 Schaden nehmen */
  getDamage(source) {
    if (!source || this.isDead) return;

    this.health -= source.strength || 10; // Default-Schaden 10
    console.log(`[${this.type}] Took ${source.strength || 10} damage. Health: ${this.health}`);

    if (this.health <= 0) {
      this.die();
    } else {
      this.onDamage(source);
    }
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

    if (this.stateMachine && this.stateMachine.sprites.dead) {
      this.stateMachine.setState("dead");
    }

    console.log(`[${this.type}] Died`);
    this.onDeath();
  }

  /** 🔹 Gemeinsames Update */
  update(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") {
      this.updateStateMachine(deltaTime);
      return;
    }

    this.updatePhysics(deltaTime);
    this.updateStateMachine(deltaTime);
  }

  // Hooks – Subklassen können überschreiben
  onCollision(obj) {}
  onDamage(source) {}
  onDeath() {}
}