class MovableObject {
  x = 120;
  y = 280;
  height = 150;
  width = 100;
  imageCache = {};
  currentImage = 0;
  otherDirection = false;

  // TODO: startInterval_EPL

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(paths) {
    paths.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

move(direction) {
  if (this._moveFrame) cancelAnimationFrame(this._moveFrame);

  let lastTime = performance.now();
  const speed = 30; // Pixel pro Sekunde (langsamer machen = kleinerer Wert)
  const frameDuration = 1000 / this.stateMachine.frameRate; // Animationsgeschwindigkeit
  let frameTimer = 0;

  const loop = (time) => {
    const delta = time - lastTime;
    lastTime = time;

    // ---- Animation ----
    frameTimer += delta;
    if (frameTimer >= frameDuration) {
      frameTimer = 0;
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;
    }

    // ---- Bewegung ----
    if (this.stateMachine.currentState === "walk") {
      this.x += direction * (speed * (delta / 1000));
      // delta/1000 = Sekunden seit letztem Frame → framerate-unabhängig
    }

    this._moveFrame = requestAnimationFrame(loop);
  };

  this._moveFrame = requestAnimationFrame(loop);
}

moveLeft() {
  this.move(-1);
}

moveRight() {
  this.move(1);
}

stop() {
  if (this._moveFrame) cancelAnimationFrame(this._moveFrame);
  this._moveFrame = null;
}

    die() {
    this.stateMachine.setState("dead");
  }
}