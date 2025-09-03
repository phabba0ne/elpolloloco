class World {
  canvas;
  ctx;
  camera_x = 0;
  keyboard = new Keyboard();
  character = new Character();
  enemies = [new Chicken(), new Chicken(), new Chicken(), new Chicken()];
  clouds = [new Cloud()];

backgrounds = [
  new Background("assets/img/background/layers/air.png", 0, 0.3),
  new Background("assets/img/background/layers/air.png", 1440, 0.3),
  new Background("assets/img/background/layers/thirdLayer/full.png", 0, 0.5),
  new Background("assets/img/background/layers/thirdLayer/full.png", 1440, 0.5),
  new Background("assets/img/background/layers/secondLayer/full.png", 0, 0.7),
  new Background("assets/img/background/layers/secondLayer/full.png", 1440, 0.7),
  new Background("assets/img/background/layers/firstLayer/full.png", 0, 1.0),
  new Background("assets/img/background/layers/firstLayer/full.png", 1440, 1.0),
];

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

    // Optional: Gegner-Spawn alle 3 Sekunden
    IntervalHub.startInterval(() => this.spawnEnemy(), 3000);
  }

  stop() {
    this.running = false;
    IntervalHub.stopAllIntervals(); // ALLE Intervalle aufräumen
  }

  loop() {
    if (!this.running) return;

    if (this.keyboard.left) {
      this.character.otherDirection = false; // nach links → spiegeln
      this.character.stateMachine.setState("walk");
      this.character.moveLeft();
    }
    if (this.keyboard.right) {
      this.character.otherDirection = true; // nach rechts → normal
      this.character.stateMachine.setState("walk");
      this.character.moveRight();
    }

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

  spawnEnemy() {
    this.enemies.push(new Chicken());
  }

draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.backgrounds.forEach(bg => {
        if (bg.img && bg.img.complete) {
            // Modulo sorgt dafür, dass der Layer endlos wiederholt wird
            const offset = (this.camera_x * bg.speedFactor) % 1440;
            
            // Bild zeichnen
            this.ctx.drawImage(bg.img, offset, bg.y, 1440, bg.height);

            // zweite Kopie rechts zeichnen, falls nötig
            if (offset > 0) {
                this.ctx.drawImage(bg.img, offset - 1440, bg.y, 1440, bg.height);
            }
            // zweite Kopie links zeichnen, falls nötig
            if (offset < 0) {
                this.ctx.drawImage(bg.img, offset + 1440, bg.y, 1440, bg.height);
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
