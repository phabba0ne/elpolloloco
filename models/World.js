import IntervalHub from "../services/IntervalHub.js";
import Character from "./Character.js";
import Cloud from "./Cloud.js";
import ItemSpawner from "../services/ItemSpawner.js";

export default class World {
  debug = true;
  camera_x = 0;

  constructor({ canvas, keyboard, level, character, debug = true } = {}) {
    if (!canvas || !keyboard || !level || !character) {
      throw new Error("World requires { canvas, keyboard, level, character }");
    }
    this.IntervalHub = new IntervalHub();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.level = level;
    this.enemies = level.enemies;
    this.clouds = level.clouds;
    this.backgrounds = level.backgrounds;
    this.character = character;
    this.debug = debug;

    // Items
    this.items = new ItemSpawner({
      world: this,
      coinCount: 10,
      salsaCount: 5,
      debug,
    });

    this.lastTime = performance.now();
    this.running = true;

    // Character koppeln
    this.setWorld();

    // Startausrichtung
    this.character.otherDirection = true;
    this.character.type = "character"; // wichtig für Kollisionslogik

    // Gegner initialisieren
    this.enemies.forEach((enemy) => {
      enemy.otherDirection = false;
      enemy.type = "enemy"; // wichtig für Kollisionslogik
      enemy.world = this;
    });

    this.start();
  }

  setWorld() {
    this.character.world = this;
  }

  start() {
    this._loop = this.loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  getVisibleEnemies() {
    const margin = 200; // etwas Puffer links/rechts
    const leftBound = -this.camera_x - margin;
    const rightBound = -this.camera_x + this.canvas.width + margin;

    return this.enemies.filter(
      (e) => e.x + e.width > leftBound && e.x < rightBound
    );
  }

  loop(currentTime = performance.now()) {
    if (!this.running) return;

    // Zeitdifferenz in Sekunden berechnen
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 1. Nur Gegner im Viewport prüfen (Performance)
    const visibleEnemies = this.getVisibleEnemies();

    // 2. Kollisionsprüfung (mit Rate-Limit, falls eingebaut)
    const collided = this.character.checkCollisions(visibleEnemies, deltaTime);
    if (collided && this.debug) {
      console.log("Character collided with:", collided);
    }

    // 3. Input verarbeiten
    let moving = false;
    let moveDir = 0;
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
    if (this.keyboard.debug) this.debug = !this.debug;


    this.items.salsas.forEach((salsa) => {
      salsa.tryCollect(this.character);
    });

    // 4. Updates (deltaTime wichtig!)
    this.character.update(deltaTime, moving, jumpInput, moveDir);
    visibleEnemies.forEach((e) => e.update(deltaTime, this.character));
    this.items.update(deltaTime);
    this.updateClouds(deltaTime);

    // Kamera folgt Charakter
    this.camera_x = -this.character.x + this.canvas.width / 6;

    // Tastaturstatus refreshen
    this.keyboard.update();

    // 5. Zeichnen
    this.draw();

    // Nächsten Frame anfordern
    requestAnimationFrame((t) => this.loop(t));
  }

  updateClouds() {
    this.clouds.forEach((c) => c.moveLeft());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Backgrounds
    this.backgrounds.forEach((bg) => {
      if (!bg.img || !bg.img.complete) return;

      const bgWidth = 1440;
      let offset = Math.floor((this.camera_x * bg.speedFactor) % bgWidth);

      this.ctx.drawImage(bg.img, offset, bg.y, bgWidth, bg.height);
      if (offset > 0)
        this.ctx.drawImage(bg.img, offset - bgWidth, bg.y, bgWidth, bg.height);
      if (offset < 0)
        this.ctx.drawImage(bg.img, offset + bgWidth, bg.y, bgWidth, bg.height);
    });

    // Alle Objekte in Kamera transformieren
    this.ctx.save();
    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);

    // Coins & Salsas zeichnen
    this.items.draw(this.ctx);

    this.ctx.restore();
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => this.addToMap(o));
  }

  addToMap(mo) {
    if (!mo) return;

    if (
      mo.img instanceof Image &&
      mo.img.complete &&
      mo.img.naturalWidth !== 0
    ) {
      this.ctx.save();
      if (mo instanceof Character && !mo.otherDirection) {
        this.ctx.translate(mo.x + mo.width, mo.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(mo.img, 0, 0, mo.width, mo.height);
      } else {
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
      }
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = "magenta";
      this.ctx.fillRect(mo.x, mo.y, mo.width, mo.height);
    }

    if (mo.debug || (this.debug && !(mo instanceof Cloud))) {
      this.ctx.save();
      this.ctx.strokeStyle = "red";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(mo.x, mo.y, mo.width, mo.height);
      this.ctx.restore();
    }
  }
}
