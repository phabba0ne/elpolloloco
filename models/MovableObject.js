import DrawableObject from "./DrawableObject.js";
import AudioHub from "../services/AudioHub.js";

/**
 * Movable game object with physics, collisions and state machine
 */
export default class MovableObject extends DrawableObject {
  /**
   * @param {object} options
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {number} [options.width=100]
   * @param {number} [options.height=100]
   * @param {number} [options.speedX=0]
   * @param {number} [options.speedY=0]
   * @param {number} [options.gravity=0]
   * @param {boolean} [options.otherDirection=false]
   * @param {number} [options.health]
   * @param {number} [options.maxHealth=options.health]
   * @param {number} [options.strength]
   * @param {number} [options.collisionInterval=1000]
   * @param {string} [options.type="movable"]
   * @param {object} [options.world]
   * @param {number} [options.maxSpeedX=Infinity]
   * @param {number} [options.maxSpeedY=Infinity]
   * @param {number} [options.friction=0]
   */
  constructor(options = {}) {
    super(options);
    const {
      speedX = 0,
      speedY = 0,
      gravity = 0,
      otherDirection = false,
      health,
      maxHealth = health,
      strength,
      collisionInterval = 1000,
      world = null,
      type = "movable",
      id = `${type}_${Math.random().toString(36).substr(2, 9)}`,
      maxSpeedX = Infinity,
      maxSpeedY = Infinity,
      friction = 0,
    } = options;
    this.speedX = speedX;
    this.speedY = speedY;
    this.gravity = gravity;
    this.otherDirection = otherDirection;
    this.health = health;
    this.maxHealth = maxHealth;
    this.strength = strength;
    this.collisionInterval = collisionInterval;
    this.world = world;
    this.type = type;
    this.id = id;
    this.maxSpeedX = maxSpeedX;
    this.maxSpeedY = maxSpeedY;
    this.friction = friction;
    this.AudioHub = AudioHub;
    this.isDead = false;
    this.active = false;
    this.lastCollidedWith = null;
    this.stateMachine = null;
  }

  /** Update physics: gravity, friction, speed and position */
  updatePhysics(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") return;
    if (this.gravity > 0) {
      this.speedY = Math.min(this.speedY + this.gravity * deltaTime, this.maxSpeedY);
    }
    if (this.friction > 0) {
      const f = this.friction * deltaTime;
      this.speedX = this.speedX > 0 ? Math.max(0, this.speedX - f) : Math.min(0, this.speedX + f);
    }
    this.speedX = Math.max(-this.maxSpeedX, Math.min(this.maxSpeedX, this.speedX));
    this.speedY = Math.max(-this.maxSpeedY, Math.min(this.maxSpeedY, this.speedY));
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;
    if (this.world?.groundLevel !== undefined && this.y + this.height > this.world.groundLevel) {
      this.y = this.world.groundLevel - this.height;
      this.speedY = 0;
      this.onGroundHit?.();
    }
  }

  /** Update state machine and set current frame */
  updateStateMachine(deltaTime) {
    if (!this.stateMachine) return;
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  /** Get current hitbox rectangle */
  getHitbox() {
    return {
      x: this.x + (this.hitboxOffsetX || 0),
      y: this.y + (this.hitboxOffsetY || 0),
      width: this.hitboxWidth || this.width,
      height: this.hitboxHeight || this.height,
    };
  }

  /** Check collisions with objects */
  checkCollisions(objects, deltaTime) {
    if (this.isDead || !Array.isArray(objects)) return null;
    if (this.collisionCooldown > 0) this.collisionCooldown -= deltaTime * 1000;
    for (const obj of objects) {
      if (!obj || obj === this || obj.isDead) continue;
      if (this.isCollidingWith(obj)) {
        if (this.collisionCooldown <= 0 || this.lastCollidedWith !== obj) {
          this.handleCollision(obj, deltaTime);
          this.lastCollidedWith = obj;
          this.collisionCooldown = this.collisionInterval;
          return obj;
        }
      }
    }
    return null;
  }

  /** Axis-aligned bounding box collision */
  isCollidingWith(obj) {
    const a = this.getHitbox(), b = obj.getHitbox();
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }

  /** Handle collision logic with another object */
  handleCollision(obj, deltaTime) {
    if (this.type === "character" && obj.type === "enemy") this.getDamage(obj);
    if (this.type === "enemy" && obj.type === "character") this.doDamage(obj);
    this.onCollision(obj, deltaTime);
    if (typeof obj.onCollision === "function") obj.onCollision(this, deltaTime);
  }

  /** Apply damage from source */
  getDamage(source, amount = null) {
    if (!source || this.isDead) return;
    const damage = amount ?? source.strength ?? 10;
    this.health = Math.max(0, this.health - damage);
    this.health <= 0 ? this.die() : this.onDamage(source, damage);
  }

  /** Deal damage to a target */
  doDamage(target, amount = null) {
    if (!target || this.isDead) return;
    if (typeof target.getDamage === "function") target.getDamage(this, amount);
  }

  /** Heal object */
  heal(amount) {
    if (this.isDead) return;
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.onHeal?.(amount);
  }

  /** Kill object */
  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;
    this.speedX = 0;
    if (this.stateMachine?.sprites?.dead) {
      this.stateMachine.setState("dead");
      this.AudioHub.stopAll();
    }
    this.onDeath();
  }

  /** Revive object */
  revive(health = null) {
    if (!this.isDead) return;
    this.isDead = false;
    this.health = health ?? this.maxHealth;
    this.collisionCooldown = 0;
    this.lastCollidedWith = null;
    if (this.stateMachine?.sprites?.idle) this.stateMachine.setState("idle");
    this.onRevive?.();
  }

  /** Check if object is on ground */
  isOnGround() {
    return this.world?.groundLevel !== undefined &&
           this.y + this.height >= this.world.groundLevel - 1;
  }

  /** Apply external force */
  applyForce(forceX, forceY) {
    if (!this.isDead) {
      this.speedX += forceX;
      this.speedY += forceY;
    }
  }

  /** Get health percentage (0..1) */
  getHealthPercentage() {
    return this.maxHealth > 0 ? this.health / this.maxHealth : 0;
  }

  /** Update full object state */
  update(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") {
      this.updateStateMachine(deltaTime);
      return;
    }
    this.updatePhysics(deltaTime);
    if (this.world?.getVisibleObjects) {
      this.checkCollisions(this.world.getVisibleObjects(), deltaTime);
    }
    this.updateStateMachine(deltaTime);
    this.onUpdate?.(deltaTime);
  }

  /** Hooks for subclasses */
  onCollision() {}
  onDamage() {
    if (this.type === "enemy" && this.world?.statusBar) {
      this.world.statusBar.updateBossHealth(this.health);
    }
  }
  onDeath() {}
  onGroundHit() {}
}