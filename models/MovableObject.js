class MovableObject extends DrawableObject{
  x = 120;
  y = 280;
  width = 100;
  height = 150;
  imageCache = {};
  otherDirection = false;
  health = 100;
  strength = 10;
  isDead = false;
  debug = false;

  constructor(stateMachine) {
    super();
    this.stateMachine = stateMachine;
  }

  // --- Sprites ---
  loadSprites(sprites) {
    return AssetManager.loadAll(Object.values(sprites).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });
  }

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  // --- Update Animation ---
  update(deltaTime) {
    // Immer Animation updaten, auch wenn tot
    this.stateMachine?.update(deltaTime);
    const frame = this.stateMachine?.getFrame();
    if (frame) this.img = frame;

    // Bewegung & Logik nur, wenn lebendig
    if (this.isDead) return;
  }

  // --- Zeichnen + Debug-Hitbox ---
  draw(ctx) {
    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
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

  // --- Damage System ---
  getDamage(source) {
    if (!source || !(source instanceof MovableObject)) return;
    if (this.isDead) return;

    this.health -= source.strength;

    if (this.debug) {
      console.log(
        `${this.constructor.name} took ${source.strength} damage from ${source.constructor.name}. Health now: ${this.health}`
      );
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  doDamage(target) {
    if (this.isDead) return;
    if (!target || !(target instanceof MovableObject)) return;

    console.log(
      `%c${this.constructor.name} attacks ${target.constructor.name} for ${this.strength} damage`,
      "color:orange"
    );
    target.getDamage(this);
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stateMachine.setState("dead");
    console.log(`${this.constructor.name} died.`);
  }

  // --- Collision detection ---
 collisionCooldown = 0;     // ms bis zur nächsten Kollisionsprüfung
  collisionInterval = 150;   // alle 150 ms prüfen

  // --- Collision detection ---
  checkCollisions(objects, deltaTime) {
    if (this.isDead) return null;

    // Countdown runterzählen
    this.collisionCooldown -= deltaTime * 1000; // deltaTime in Sekunden → ms
    if (this.collisionCooldown > 0) return null;

    // Reset Cooldown
    this.collisionCooldown = this.collisionInterval;

    // Charakter Invulnerable? Dann Kollision überspringen
    if (this instanceof Character && this.isInvulnerable) {
      if (this.debug) console.log(`[SKIP] ${this.constructor.name} is invulnerable, skipping collision checks.`);
      return null;
    }

    for (const obj of objects) {
      if (this.world?.clouds?.includes(obj)) continue;
      if (obj !== this && isColliding(this, obj)) {
        if (this.debug) console.log("Collision detected with", obj);

        if (this instanceof Character && !this.isInvulnerable) {
          this.getDamage(obj);
        }
        return obj;
      }
    }
    return null;
  }
}

/**
 * Axis-Aligned Bounding Box
 */
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
