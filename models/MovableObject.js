class MovableObject {
  x = 120;
  y = 280;
  height = 150;
  width = 100;
  imageCache = {};
  otherDirection = false;

  constructor(stateMachine) {
    this.stateMachine = stateMachine;
  }

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Startet die Bewegung + Animation in eine Richtung
   * @param {number} direction -1 = links, +1 = rechts
   */
  startMoving(direction) {
    this.stop(); // immer erst altes loop beenden

    let lastTime = performance.now();
    const speed = 60; // px/s
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

      // ---- Bewegung ----
      if (this.stateMachine.currentState === "walk") {
        this.x += direction * speed * (delta / 1000);
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
  
}
function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}