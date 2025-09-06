import DrawableObject from "./DrawableObject.js";
import AssetManager from "../services/AssetManager.js";

export default class MovableObject extends DrawableObject {
  speedX = 0;
  speedY = 0;
  gravity = 0;
  imageCache = {};
  otherDirection = false;
  health = 100;
  strength = 10;
  isDead = false;
  collisionCooldown = 0;
  collisionInterval = 150;
  debug = false;

  constructor(stateMachine, options = {}) {
    super(options);
    this.stateMachine = stateMachine;
    if (options.type) this.type = options.type;
    if (options.world) this.world = options.world;
  }

  // --- Sprites laden ---
  async loadSprites(sprites) {
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  // --- Update Animation & Bewegung ---
  update(deltaTime) {
    if (this.isDead) return;

    // Animation
    this.stateMachine?.update(deltaTime);
    const frame = this.stateMachine?.getFrame();
    if (frame) this.img = frame;

    // Bewegung
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;
    this.speedY += this.gravity * deltaTime;
  }

  // --- Draw ---
  draw(ctx) {
    if (this.img) {
      if (this.otherDirection) {
        ctx.save();
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.img, 0, 0, this.width, this.height);
        ctx.restore();
      } else {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      }
    } else {
      ctx.fillStyle = "magenta";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    if (this.debug) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }

  // --- Damage & Death ---
  getDamage(source) {
    if (!source || this.isDead) return;
    this.health -= source.strength;
    if (this.health <= 0) this.die();
  }

  doDamage(target) {
    if (!target || this.isDead) return;
    target.getDamage(this);
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stateMachine?.setState("dead");
  }

  // --- Kollision ---
  checkCollisions(objects, deltaTime) {
    if (this.isDead) return null;

    this.collisionCooldown -= deltaTime * 1000;
    if (this.collisionCooldown > 0) return null;
    this.collisionCooldown = this.collisionInterval;

    for (const obj of objects) {
      if (!obj || obj === this) continue;
      if (!isColliding(this, obj)) continue;

      // Schaden bei Character <-> Enemy
      if (this.type === "character" && obj.type === "enemy") this.getDamage(obj);
      if (this.type === "enemy" && obj.type === "character") this.getDamage(obj);

      return obj;
    }
    return null;
  }
}

// AABB-Kollision
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}