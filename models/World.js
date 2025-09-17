import IntervalHub from "../services/IntervalHub.js";
import Character from "../models/Character.js";
import ItemSpawner from "../services/ItemSpawner.js";
import AssetManager from "../services/AssetManager.js";
import StatusBar from "../services/StatusBar.js";
import AudioHub from "../services/AudioHub.js";

export default class World {
  camera_x = 0;
  stompCombo = 0;
  stompTimer = 0;
  stompDisplayDuration = 1200;

  constructor({ canvas, keyboard, level, character } = {}) {
    if (!canvas || !keyboard || !level || !character)
      throw new Error("World requires { canvas, keyboard, level, character }");

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.level = level;
    this.character = character;
    this.groundLevel = canvas.height - 80;

    this.enemies = level.enemies;
    this.clouds = level.clouds;
    this.backgrounds = level.backgrounds;
    this.movableObjects = [];
    this.stompPopups = [];

    this.items = new ItemSpawner({ world: this, coinCount: 100, salsaCount: 10 });

    this.character.world = this;
    this.character.otherDirection = true;

    this.enemies.forEach((enemy) => {
      enemy.otherDirection = false;
      enemy.world = this;
      enemy.type = "enemy";
      if (enemy.subtype === "chickenBoss") enemy.player = this.character;
    });

    this.showBossBar = false;
    this.statusBars = {};
    this.initStatusBars();

    IntervalHub.startCentralLoop({
      onUpdate: (deltaTime) => this.update(deltaTime),
      onRender: () => this.draw(),
      targetFPS: 60,
    });
  }

  initStatusBars() {
    const spacing = 10;
    const barWidth = 120;
    const barHeight = 40;
    const topY = 10;
    let x = spacing;

    const addBar = (sprites) => {
      const bar = new StatusBar({ x, y: topY, width: barWidth, height: barHeight, sprites });
      x += barWidth + spacing;
      return bar;
    };

    this.statusBars.health = addBar(AssetManager.STATUSBARS_PEPE.healthOrange);
    this.statusBars.salsa = addBar(AssetManager.STATUSBARS_PEPE.bottleOrange);
    this.statusBars.coins = addBar(AssetManager.STATUSBARS_PEPE.coinOrange);
    this.statusBars.boss = new StatusBar({
      x: this.canvas.width / 2,
      y: topY,
      width: 300,
      height: 70,
      sprites: AssetManager.STATUSBARS_CHICKENBOSS,
    });
  }

  addMovableObject(obj) {
    this.movableObjects.push(obj);
  }

  getVisibleEnemies(margin = 200) {
    const left = -this.camera_x - margin;
    const right = -this.camera_x + this.canvas.width + margin;
    return this.enemies.filter((e) => e.x + e.width > left && e.x < right);
  }

  update(deltaTime) {
    const enemies = this.getVisibleEnemies();

    if (this.stompTimer > 0) {
      this.stompTimer -= deltaTime * 1000;
      if (this.stompTimer <= 0) this.stompCombo = 0;
    }

    this.stompPopups.forEach((p) => p.update(deltaTime));
    this.stompPopups = this.stompPopups.filter((p) => !p.isExpired);

    this.character.checkCollisions(enemies, deltaTime);

    let moving = false,
      moveDir = 0;
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

    if (this.keyboard.attack) this.character.throwSalsa();

    this.movableObjects = this.movableObjects.filter((obj) => {
      obj.update(deltaTime, enemies);
      return !obj.hasHitAnimationFinished;
    });

    this.items.coins.forEach((c) => c.tryCollect(this.character));
    this.items.salsas.forEach((s) => s.tryCollect(this.character));

    this.character.update(deltaTime, moving, this.keyboard.jump, moveDir);
    enemies.forEach((e) => e.update(deltaTime, this.character));
    this.items.update(deltaTime);
    this.clouds.forEach((c) => c.moveLeft(deltaTime));

    this.updateGoldDisplay(deltaTime);
    this.updateCharacterStats();

    this.camera_x = -this.character.x + this.canvas.width / 6;
    this.keyboard.update();
  }

  updateCharacterStats() {
    if (!this.character) return;
    const maxHealth = 100,
      maxCoins = 100,
      maxSalsas = 5;
    this.statusBars.health?.setPercentage((this.character.health / maxHealth) * 100);
    this.statusBars.coins?.setPercentage((this.character.gold / maxCoins) * 100);
    this.statusBars.salsa?.setPercentage((this.character.salsas / maxSalsas) * 100);
  }

  updateGoldDisplay(deltaTime) {
    if (!this.character) return;
    const speed = 100 * deltaTime;
    this.character.displayGold = Math.min(this.character.gold, this.character.displayGold + speed);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgrounds();
    this.ctx.save();
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);
    this.addObjectsToMap(this.movableObjects);
    this.items.draw(this.ctx);
    this.ctx.restore();
    this.drawUI();
  }

  drawBackgrounds() {
    this.backgrounds.forEach((bg) => {
      if (!bg.img?.complete) return;
      const w = bg.width || 1440;
      const offset = Math.floor((this.camera_x * bg.speedFactor) % w);
      this.ctx.drawImage(bg.img, offset, bg.y, w, bg.height);
      if (offset > 0) this.ctx.drawImage(bg.img, offset - w, bg.y, w, bg.height);
      if (offset < 0) this.ctx.drawImage(bg.img, offset + w, bg.y, w, bg.height);
    });
  }

  drawUI() {
    Object.values(this.statusBars).forEach((bar) => {
      if (bar && (bar !== this.statusBars.boss || this.showBossBar)) bar.draw(this.ctx);
    });

    if (!this.character) return;
    const bar = this.statusBars.health;
    const x = bar ? bar.x : 20;
    const y = bar ? bar.y + bar.height + 10 : 50;
    const size = 32;

    this.ctx.save();
    this.ctx.font = "32px 'Boogaloo'";
    this.ctx.fillStyle = "yellow";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    const coinImg = AssetManager.getImage(AssetManager.STATUSBARS_PEPE.icons[0]);
    if (coinImg) this.ctx.drawImage(coinImg, x, y, size, size);
    this.ctx.fillText(`x ${Math.floor(this.character.displayGold)}`, x + size + 8, y + size / 2);

    this.stompPopups.forEach((p) => p.draw(this.ctx));
    this.ctx.restore();
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => this.addToMap(o));
  }

  addToMap(mo) {
    if (!mo) return;
    if (mo.img?.complete) {
      this.ctx.save();
      if (mo instanceof Character && !mo.otherDirection) {
        this.ctx.translate(mo.x + mo.width, mo.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(mo.img, 0, 0, mo.width, mo.height);
      } else this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = "magenta";
      this.ctx.fillRect(mo.x, mo.y, mo.width, mo.height);
    }
  }
}