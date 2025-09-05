class MovableObject {
  x = 120;
  y = 280;
  width = 100;
  height = 150;
  imageCache = {};
  otherDirection = false;
  health = 100;
  strength = 10;

  constructor(stateMachine) {
    this.stateMachine = stateMachine;
  }

  // ✅ Sprite loading
  loadSprites(sprites) {
    return AssetManager.loadAll(Object.values(sprites).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });
  }
  //TODO: AssetManager call
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  // --- Update Animation ---
  update(deltaTime) {
    if (this.isDead) return; // keine Bewegung mehr
    this.stateMachine?.update(deltaTime);
    const frame = this.stateMachine?.getFrame();
    if (frame) this.img = frame;
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

    console.log(
        `${this.constructor.name} took ${source.strength} damage from ${source.constructor.name}. Health now: ${this.health}`
    );

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
    this.stateMachine?.setState("dead");
    console.log(`${this.constructor.name} died.`);
}

  /**
   * 🔹 Collision detection ignoring clouds
   * @param {MovableObject[]} objects
   * @returns {MovableObject|null} first collision found, or null
   */
  checkCollisions(objects) {
    for (const obj of objects) {
      // Ignore clouds
      if (this.world?.clouds?.includes(obj)) continue;

      if (obj !== this && isColliding(this, obj)) {
        if (this.debug) console.log("Collision detected with", obj);

        // 🔹 Wenn Character kollidiert → Schaden nehmen
        if (this instanceof Character) {
          this.getDamage(obj);
        }

        return obj;
      }
    }
    return null;
  }

  toggleDebug(value) {
    this.debug = value !== undefined ? value : !this.debug;
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
