class MovableObject {
  x = 120;
  y = 280;
  width = 100;
  height = 150;
  imageCache = {};
  otherDirection = false;

  constructor(stateMachine) {
    this.stateMachine = stateMachine;
    this.world = null; // optional, set by World
  }

  // ✅ Sprite loading
  loadSprites(sprites) {
    return AssetManager.loadAll(Object.values(sprites).flat()).then(() => {
      this.img = this.stateMachine.getFrame();
    });
  }

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  startMoving(direction) {
    this.stop();

    let lastTime = performance.now();
    const speed = 60;
    const frameDuration = 1000 / this.stateMachine.frameRate;
    let frameTimer = 0;

    const loop = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      // ---- Animation ----
      frameTimer += delta;
      if (frameTimer >= frameDuration) {
        frameTimer = 6;
        const frame = this.stateMachine.getFrame();
        if (frame) this.img = frame;
      }

      // ---- Movement ----
      if (this.stateMachine.currentState === "walk") {
        this.x += direction * speed * (delta / 1000);
      }

      // ---- Debug hitbox ----
      if (this.debug && this.world?.ctx) {
        const ctx = this.world.ctx;
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.restore();
      }

      this._moveFrame = requestAnimationFrame(loop);
    };

    this._moveFrame = requestAnimationFrame(loop);
  }

  moveLeft() {
    this.startMoving(-1);
  }

  moveRight() {
    this.startMoving(1);
  }

  stop() {
    if (this._moveFrame) cancelAnimationFrame(this._moveFrame);
    this._moveFrame = null;
  }

  die() {
    this.stop();
    this.stateMachine.setState("dead");
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