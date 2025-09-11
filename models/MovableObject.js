import DrawableObject from "./DrawableObject.js";

export default class MovableObject extends DrawableObject {
  constructor(options = {}) {
    super(options);

    this.speedX = options.speedX || 0;
    this.speedY = options.speedY || 0;
    this.gravity = options.gravity || 0;
    this.otherDirection = options.otherDirection || false;
    this.health = options.health || 100;
    this.maxHealth = options.maxHealth || this.health;
    this.isDead = false;
    this.strength = options.strength || 10;

    this.collisionInterval = options.collisionInterval || 1000;
    this.lastCollidedWith = null;
    this.stateMachine = null;
    this.world = options.world || null;
    this.type = options.type || "movable";
    this.id =
      options.id || `${this.type}_${Math.random().toString(36).substr(2, 9)}`;
    this.maxSpeedX = options.maxSpeedX || Infinity;
    this.maxSpeedY = options.maxSpeedY || Infinity;
    this.friction = options.friction || 0;
  }

  updatePhysics(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") {
      return; // Dead objects don't move unless death animation needs physics
    }
    if (this.gravity > 0) {
      this.speedY = Math.min(
        this.speedY + this.gravity * deltaTime,
        this.maxSpeedY
      );
    }

    if (this.friction > 0) {
      const frictionForce = this.friction * deltaTime;
      if (this.speedX > 0) {
        this.speedX = Math.max(0, this.speedX - frictionForce);
      } else if (this.speedX < 0) {
        this.speedX = Math.min(0, this.speedX + frictionForce);
      }
    }

    this.speedX = Math.max(
      -this.maxSpeedX,
      Math.min(this.maxSpeedX, this.speedX)
    );
    this.speedY = Math.max(
      -this.maxSpeedY,
      Math.min(this.maxSpeedY, this.speedY)
    );

    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;

    if (this.world && this.world.groundLevel !== undefined) {
      if (this.y + this.height > this.world.groundLevel) {
        this.y = this.world.groundLevel - this.height;
        this.speedY = 0;
        this.onGroundHit?.();
      }
    }
  }

  updateStateMachine(deltaTime) {
    if (!this.stateMachine) return;

    try {
      this.stateMachine.update(deltaTime);
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;
    } catch (error) {
      if (this.world?.debug) {
        console.error(`StateMachine error for ${this.id}:`, error);
      }
    }
  }

  getHitbox() {
    return {
      x: this.x + (this.hitboxOffsetX || 0),
      y: this.y + (this.hitboxOffsetY || 0),
      width: this.hitboxWidth || this.width,
      height: this.hitboxHeight || this.height,
    };
  }

  checkCollisions(objects, deltaTime) {
    if (this.isDead || !Array.isArray(objects)) return null;

    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= deltaTime * 1000;
    }

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

  isCollidingWith(obj) {
    const a = this.getHitbox();
    const b = obj.getHitbox();
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  handleCollision(obj, deltaTime) {
    if (this.type === "character" && obj.type === "enemy") this.getDamage(obj);
    if (this.type === "enemy" && obj.type === "character") this.doDamage(obj);

    this.onCollision(obj, deltaTime);

    if (obj.onCollision && typeof obj.onCollision === "function") {
      obj.onCollision(this, deltaTime);
    }
  }

  getDamage(source, amount = null) {
    if (!source || this.isDead) return;

    const damage = amount !== null ? amount : source.strength || 10;
    const oldHealth = this.health;

    this.health = Math.max(0, this.health - damage);

    if (this.world?.debug) {
      console.log(
        `${this.id} took ${damage} damage (${oldHealth} -> ${this.health})`
      );
    }

    if (this.health <= 0) {
      this.die();
    } else {
      this.onDamage(source, damage);
    }
  }

  doDamage(target, amount = null) {
    if (!target || this.isDead) return;

    if (typeof target.getDamage === "function") {
      target.getDamage(this, amount);
    }
  }

  heal(amount) {
    if (this.isDead) return;

    const oldHealth = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);

    if (this.world?.debug) {
      console.log(
        `${this.id} healed ${amount} (${oldHealth} -> ${this.health})`
      );
    }

    this.onHeal?.(amount);
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;
    this.health = 0;
    this.speedX = 0; // Stop movement when dead

    if (this.stateMachine?.sprites?.dead) {
      this.stateMachine.setState("dead");
    }

    if (this.world?.debug) {
      console.log(`${this.id} died`);
    }

    this.onDeath();
  }

  revive(health = null) {
    if (!this.isDead) return;

    this.isDead = false;
    this.health = health !== null ? health : this.maxHealth;
    this.collisionCooldown = 0;
    this.lastCollidedWith = null;

    if (this.stateMachine?.sprites?.idle) {
      this.stateMachine.setState("idle");
    }

    if (this.world?.debug) {
      console.log(`${this.id} revived with ${this.health} health`);
    }

    this.onRevive?.();
  }

  isOnGround() {
    if (!this.world || this.world.groundLevel === undefined) return false;
    return this.y + this.height >= this.world.groundLevel - 1;
  }

  applyForce(forceX, forceY) {
    if (this.isDead) return;

    this.speedX += forceX;
    this.speedY += forceY;
  }

  getHealthPercentage() {
    return this.maxHealth > 0 ? this.health / this.maxHealth : 0;
  }

  update(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") {
      this.updateStateMachine(deltaTime);
      return;
    }

    this.updatePhysics(deltaTime);

    if (this.world?.getVisibleObjects) {
      const visibleObjects = this.world.getVisibleObjects();
      this.checkCollisions(visibleObjects, deltaTime);
    }

    this.updateStateMachine(deltaTime);

    this.onUpdate?.(deltaTime);
  }

  // Hooks – Subklassen können überschreiben
  onCollision(obj, deltaTime) {}
  onDamage(source, damage) {
    if (this.type === "enemy" && this.world?.statusBar) {
      this.world.statusBar.updateBossHealth(this.health);
    }
  }
  onDeath() {}
  onGroundHit() {}
  onUpdate(deltaTime) {}
}
