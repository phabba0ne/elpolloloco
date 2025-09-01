class World {
  canvas;
  ctx;

  //spawn character
  character = new Character();
  enemies = [new Chicken(), new Chicken(), new Chicken(), new Chicken()];
  clouds = [new Cloud()];
  backgrounds = [
    new Background("assets/img/background/layers/air.png", 0),
    new Background("assets/img/background/layers/thirdLayer/one.png", 0),
    new Background("assets/img/background/layers/secondLayer/one.png", 0),
    new Background("assets/img/background/layers/firstLayer/one.png", 0),
  ];

  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;

    // loop-Timing
    this.lastTime = performance.now();
    this.running = true;

    // Optional: Warte, bis mindestens ein wichtiges Asset geladen ist, oder starte sofort
    this.start();
  }

  start() {
    // bind the loop so 'this' stimmt im rAF callback
    this._loop = this.loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  stop() {
    this.running = false;
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastTime) / 1000); // dt in Sekunden, clamped
    this.lastTime = now;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this._loop);
  }

  update(dt) {
    const W = this.canvas.width;
    // update clouds centrally (kein setInterval pro cloud)
    this.clouds.forEach((c) => {
      if (typeof c.update === "function") c.update(dt, W);
    });

    // update enemies / player etc. falls du update-Funktionen hast
    this.enemies.forEach((e) => {
      if (typeof e.update === "function") e.update(dt);
    });
    if (typeof this.character.update === "function") this.character.update(dt);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw backgrounds (zuerst)
    this.addObjectsToMap(this.backgrounds);
    // Clouds sollten hinter dem Character, aber vor Hintergründen? Du hattest clouds zuletzt; passe an
    this.addObjectsToMap(this.clouds);
    // Character & enemies & so weiter
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => this.addToMap(o));
  }

  addToMap(mo) {
    if (!mo) return;
    // Sicherstellen, dass das Image geladen ist
    if (
      mo.img instanceof Image &&
      mo.img.complete &&
      mo.img.naturalWidth !== 0
    ) {
      this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    } else {
      // Platzhalter-Rechteck, falls Bild noch nicht da ist (vermeidet Exceptions)
      this.ctx.fillStyle = "magenta";
      this.ctx.fillRect(mo.x, mo.y, mo.width, mo.height);
    }
  }
}
