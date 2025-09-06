import IntervalHub from "../services/IntervalHub.js";
import Character from "./Character.js";
import Cloud from "./Cloud.js";
import CoinSpawner from "../services/CoinSpawner.js";

export default class World {
  debug = true;
  camera_x = 0;

  constructor({ canvas, keyboard, level, character, debug = true } = {}) {
    if (!canvas || !keyboard || !level || !character) {
      throw new Error("World requires { canvas, keyboard, level, character }");
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.level = level;
    this.enemies = level.enemies;
    this.clouds = level.clouds;
    this.backgrounds = level.backgrounds;
    this.character = character;
    this.debug = debug;

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

    // Münzmaschine
    this.coinSpawner = new CoinSpawner({
      world: this,
      count: 15,
      respawn: false,
      debug,
    });

    this.start();
  }

  setWorld() {
    this.character.world = this;
  }

  start() {
    this._loop = this.loop.bind(this);
    requestAnimationFrame(this._loop);
    IntervalHub.startInterval(() => this.updateClouds(), 50);
  }

  loop() {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.fps = Math.round(1 / deltaTime);

    const collided = this.character.checkCollisions(
      [...this.enemies],
      deltaTime
    );

    if (collided && this.debug)
      console.log("Character collided with:", collided);

    // Input
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
    if (this.keyboard.debug) {
      this.debug = !this.debug;
    }

    this.character.update(deltaTime, moving, jumpInput, moveDir);
    this.enemies.forEach((enemy) => enemy.update?.(deltaTime));
    this.coinSpawner.update(deltaTime);
    this.camera_x = -this.character.x + this.canvas.width / 6;
    this.keyboard.update();
    this.draw();

    // FPS
    this.ctx.fillStyle = "red";
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
      if (!bg.img || !bg.img.complete) return;

      const bgWidth = 1440;
      let offset = (this.camera_x * bg.speedFactor) % bgWidth;
      offset = Math.floor(offset);

      this.ctx.drawImage(bg.img, offset, bg.y, bgWidth, bg.height);

      if (offset > 0)
        this.ctx.drawImage(bg.img, offset - bgWidth, bg.y, bgWidth, bg.height);
      if (offset < 0)
        this.ctx.drawImage(bg.img, offset + bgWidth, bg.y, bgWidth, bg.height);
    });

    this.coinSpawner.draw(this.ctx);
    this.ctx.save();
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);
    this.coinSpawner.draw(this.ctx);
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
