class World {
  level = level1;
  canvas;
  ctx;
  camera_x = 0;
  keyboard = new Keyboard();
  character = new Character();
  enemies = level1.enemies;
  clouds = level1.clouds;
  backgrounds = level1.backgrounds;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.lastTime = performance.now();
    this.running = true;
    this.setWorld();

    // Character schaut zu Beginn nach rechts
    this.character.otherDirection = true;

    // Alle Chickens laufen von rechts nach links
    this.enemies.forEach((chicken) => (chicken.otherDirection = false));

    this.start();
  }

  //koppelt world an character
  setWorld() {
    this.character.world = this.world;
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

    let moving = false;

    // Nach links: unsichtbare Wand am Levelanfang
    if (this.keyboard.left && this.character.x > this.level.startX) {
      this.character.otherDirection = false;
      this.character.moveLeft();
      moving = true;
    }

    // Nach rechts: nur bis Levelende
    if (this.keyboard.right && this.character.x < this.level.endX) {
      this.character.otherDirection = true;
      this.character.moveRight();
      moving = true;
    }

    // Character update mit moving Parameter - ER macht setState!
    const deltaTime = performance.now() - this.lastTime;
    this.character.update(deltaTime, moving);
    this.lastTime = performance.now();

    

    // verschiebt die Welt so, dass der Charakter der Bezugspunkt ist (10: offset -> Charakter wie weit weg vom linken Rand weg?)
    this.camera_x = -this.character.x + this.canvas.width / 6;
    // this.camera_x = -this.character.x + this.canvas.width / 3;

    this.keyboard.update();
    this.draw();

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

      this.ctx.restore();
    } else {
      this.ctx.fillStyle = "magenta";
      this.ctx.fillRect(mo.x, mo.y, mo.width, mo.height);
    }
  }
}
