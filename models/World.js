class World {
  debug = true; // global debug flag
  canvas;
  ctx;
  camera_x = 0;
  keyboard;
  character;

  constructor(canvas, keyboard) {
    this.level = level1;
    this.enemies = level1.enemies;
    this.clouds = level1.clouds;
    this.backgrounds = level1.backgrounds;
    this.character = new Character();
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.lastTime = performance.now();
    this.running = true;
    this.setWorld();

    // Character schaut zu Beginn nach rechts
    this.character.otherDirection = true;

    // Alle Chickens laufen von rechts nach links
    this.enemies.forEach((chicken) => (chicken.otherDirection = false)); // ✅ Das ist OK

    this.start();
  }

  //koppelt world an character
  setWorld() {
    this.character.world = this;
  }

  //IntervalHub
  start() {
    // Hauptloop per requestAnimationFrame
    this._loop = this.loop.bind(this);
    requestAnimationFrame(this._loop);

    // Clouds bewegen sich alle 50ms
    IntervalHub.startInterval(() => this.updateClouds(), 50);

    //test
    // setTimeout(() => IntervalHub.stopAllIntervals(), 3000);
  }

  loop() {
    if (!this.running) return;

    const currentTime = performance.now();
    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // FPS messen
    this.fps = Math.round(1 / deltaTime);

    const enemiesAndObjects = [...this.enemies]; // ...world.items (any collidable objects)
    const collided = this.character.checkCollisions(enemiesAndObjects);
    if (collided) {
      console.log("Hit something!", collided);
    }

    //Input
    let moving = false;
    let moveDir = 0; // -1 = left, +1 = right
    const jumpInput = this.keyboard.jump;

    if (this.keyboard.left && this.character.x > this.level.startX) {
      moving = true;
      moveDir = -1;
      this.character.otherDirection = false;
    }
    if (this.keyboard.right && this.character.x < this.level.endX) {
      moving = true;
      moveDir = 1;
      this.character.otherDirection = true;
    }
    if (this.keyboard.debug) {
      this.debug = !this.debug;
      // Toggle debug für alle relevanten Objekte
      this.character.toggleDebug(this.debug);
      this.enemies.forEach((e) => e.toggleDebug(this.debug));
      this.clouds.forEach((c) => c.toggleDebug(this.debug)); // optional
    }

    // Single update call handles movement + jump + gravity
    this.character.update(deltaTime, moving, jumpInput, moveDir);

    // Update enemies
    this.enemies.forEach((enemy) => enemy.update?.(deltaTime));

    // Camera
    this.camera_x = -this.character.x + this.canvas.width / 6;

    this.keyboard.update();
    this.draw();

    // FPS anzeigen
    this.ctx.fillStyle = "brown";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);

    requestAnimationFrame(this._loop);
  }

  updateClouds() {
    this.clouds.forEach((c) => c.moveLeft());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.backgrounds.forEach((bg) => {
      if (bg.img && bg.img.complete) {
        // Modulo sorgt dafür, dass der Layer endlos wiederholt wird
        const bgWidth = 1440;
        const offset = (this.camera_x * bg.speedFactor) % bgWidth;

        // Bild zeichnen
        this.ctx.drawImage(bg.img, offset, bg.y, bgWidth, bg.height);

        // zweite Kopie rechts zeichnen, falls nötig
        if (offset > 0) {
          this.ctx.drawImage(
            bg.img,
            offset - bgWidth,
            bg.y,
            bgWidth,
            bg.height
          );
        }
        // zweite Kopie links zeichnen, falls nötig
        if (offset < 0) {
          this.ctx.drawImage(
            bg.img,
            offset + bgWidth,
            bg.y,
            bgWidth,
            bg.height
          );
        }
      }
    });

    // --- Clouds, Character, Enemies mit Kamera-Offset ---
    this.ctx.save();
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);
    this.ctx.restore();
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  addToMap(mo) {
    if (!mo) return;

    if (
      mo.img instanceof Image &&
      mo.img.complete &&
      mo.img.naturalWidth !== 0
    ) {
      this.ctx.save();

      // Wenn es ein Character ist → Richtungsflag beachten
      if (mo instanceof Character) {
        if (!mo.otherDirection) {
          this.ctx.translate(mo.x + mo.width, mo.y);
          this.ctx.scale(-1, 1);
          this.ctx.drawImage(mo.img, 0, 0, mo.width, mo.height);
        } else {
          this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
        }
      } else {
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
      }
      if (mo.debug || this.debug) {
        this.ctx.save();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(mo.x, mo.y, mo.width, mo.height);
        this.ctx.restore();
      }
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = "magenta";
      this.ctx.fillRect(mo.x, mo.y, mo.width, mo.height);
    }
  }
}
