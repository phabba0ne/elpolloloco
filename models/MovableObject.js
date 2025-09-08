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

    // Kollisions-Cooldown (in ms)
    this.collisionCooldown = 0;
    this.collisionInterval = options.collisionInterval || 1000;
    this.lastCollidedWith = null;

    // Animationssystem
    this.stateMachine = null;

    // Welt-Referenz
    this.world = options.world || null;
    
    // Object identification
    this.type = options.type || "movable";
    this.id = options.id || `${this.type}_${Math.random().toString(36).substr(2, 9)}`;

    // Physics constraints
    this.maxSpeedX = options.maxSpeedX || Infinity;
    this.maxSpeedY = options.maxSpeedY || Infinity;
    this.friction = options.friction || 0;
  }

  /** 🔹 Physik / Bewegung */
  updatePhysics(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") {
      return; // Dead objects don't move unless death animation needs physics
    }

    // Apply gravity
    if (this.gravity > 0) {
      this.speedY = Math.min(this.speedY + (this.gravity * deltaTime), this.maxSpeedY);
    }

    // Apply friction
    if (this.friction > 0) {
      const frictionForce = this.friction * deltaTime;
      if (this.speedX > 0) {
        this.speedX = Math.max(0, this.speedX - frictionForce);
      } else if (this.speedX < 0) {
        this.speedX = Math.min(0, this.speedX + frictionForce);
      }
    }

    // Constrain speeds
    this.speedX = Math.max(-this.maxSpeedX, Math.min(this.maxSpeedX, this.speedX));
    this.speedY = Math.max(-this.maxSpeedY, Math.min(this.maxSpeedY, this.speedY));

    // Update position
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;

    // Ground collision if world provides ground level
    if (this.world && this.world.groundLevel !== undefined) {
      if (this.y + this.height > this.world.groundLevel) {
        this.y = this.world.groundLevel - this.height;
        this.speedY = 0;
        this.onGroundHit?.();
      }
    }
  }

  /** 🔹 StateMachine-Update */
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

  /** 🔹 Kollision mit Cooldown */
  checkCollisions(objects, deltaTime) {
    if (this.isDead || !Array.isArray(objects)) return null;
    
    // Update cooldown
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= deltaTime * 1000;
    }

    for (const obj of objects) {
      if (!obj || obj === this || obj.isDead) continue;
      
      // AABB collision detection
      if (this.isCollidingWith(obj)) {
        // Only process collision if cooldown has expired or it's a different object
        if (this.collisionCooldown <= 0 || this.lastCollidedWith !== obj) {
          this.handleCollision(obj, deltaTime);
          this.lastCollidedWith = obj;
          this.collisionCooldown = this.collisionInterval;
          
          return obj; // nur ein Treffer pro Frame
        }
      }
    }
    return null;
  }

  /** 🔹 Check if colliding with another object */
  isCollidingWith(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y
    );
  }

  /** 🔹 Handle collision with another object */
  handleCollision(obj, deltaTime) {
    if (this.type === "character" && obj.type === "enemy") this.getDamage(obj);
    if (this.type === "enemy" && obj.type === "character") this.doDamage(obj);

    this.onCollision(obj, deltaTime);
    
    // Notify the other object too
    if (obj.onCollision && typeof obj.onCollision === 'function') {
      obj.onCollision(this, deltaTime);
    }
  }

  /** 🔹 Schaden nehmen */
  getDamage(source, amount = null) {
    if (!source || this.isDead) return;
    
    const damage = amount !== null ? amount : (source.strength || 10);
    const oldHealth = this.health;
    
    this.health = Math.max(0, this.health - damage);

    if (this.world?.debug) {
      console.log(`${this.id} took ${damage} damage (${oldHealth} -> ${this.health})`);
    }

    if (this.health <= 0) {
      this.die();
    } else {
      this.onDamage(source, damage);
    }
  }

  /** 🔹 Schaden austeilen */
  doDamage(target, amount = null) {
    if (!target || this.isDead) return;
    
    if (typeof target.getDamage === 'function') {
      target.getDamage(this, amount);
    }
  }

  /** 🔹 Heal this object */
  heal(amount) {
    if (this.isDead) return;

    const oldHealth = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);

    if (this.world?.debug) {
      console.log(`${this.id} healed ${amount} (${oldHealth} -> ${this.health})`);
    }

    this.onHeal?.(amount);
  }

  /** 🔹 Sterben */
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

  /** 🔹 Revive this object */
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

  /** 🔹 Check if object is on ground */
  isOnGround() {
    if (!this.world || this.world.groundLevel === undefined) return false;
    return this.y + this.height >= this.world.groundLevel - 1;
  }

  /** 🔹 Apply a force to this object */
  applyForce(forceX, forceY) {
    if (this.isDead) return;
    
    this.speedX += forceX;
    this.speedY += forceY;
  }

  /** 🔹 Get health percentage */
  getHealthPercentage() {
    return this.maxHealth > 0 ? this.health / this.maxHealth : 0;
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
      const visibleObjects = this.world.getVisibleObjects();
      this.checkCollisions(visibleObjects, deltaTime);
    }

    this.updateStateMachine(deltaTime);
    
    // Call custom update hook
    this.onUpdate?.(deltaTime);
  }

  /** 🔹 Get debug information */
  getDebugInfo() {
    return {
      id: this.id,
      type: this.type,
      position: { x: Math.round(this.x), y: Math.round(this.y) },
      speed: { x: Math.round(this.speedX), y: Math.round(this.speedY) },
      health: `${this.health}/${this.maxHealth}`,
      isDead: this.isDead,
      collisionCooldown: Math.round(this.collisionCooldown),
      otherDirection: this.otherDirection
    };
  }

  // Hooks – Subklassen können überschreiben
  onCollision(obj, deltaTime) {}
  onDamage(source, damage) {}
  onDeath() {}
  onGroundHit() {}
  onUpdate(deltaTime) {}
}