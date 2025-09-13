import IntervalHub from "../services/IntervalHub.js";
import Character from "../models/Character.js";
import Cloud from "../models/Cloud.js";
import ItemSpawner from "../services/ItemSpawner.js";
import AssetManager from "../services/AssetManager.js";
import StatusBar from "../services/StatusBar.js";
import StompPopup from "../services/StompPopup.js";

export default class World {
  debug = true;
  camera_x = 0;

  constructor({ canvas, keyboard, level, character, debug = true } = {}) {
    if (!canvas || !keyboard || !level || !character)
      throw new Error("World requires { canvas, keyboard, level, character }");

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.level = level;
    this.character = character;
    this.debug = debug;

    this.enemies = level.enemies;
    this.clouds = level.clouds;
    this.backgrounds = level.backgrounds;

    this.movableObjects = [];
    this.stompCombo = 0;
    this.stompTimer = 100;
    this.stompDisplayDuration = 1200; // ms
    this.stompPopups = [];

    this.items = new ItemSpawner({
      world: this,
      coinCount: 100,
      salsaCount: 10,
      debug,
    });

    this.character.world = this;
    this.character.otherDirection = true;
    this.character.type = "character";

    this.enemies.forEach((enemy) => {
      enemy.otherDirection = false;
      enemy.type = "enemy";
      enemy.world = this;
      if (enemy.subtype === "chickenBoss") enemy.player = this.character;
    });

    this.showBossBar = false;
    this.statusBars = {};
    this.initStatusBars();

    // Starte Hauptloop
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

    let currentX = spacing;
    this.statusBars.health = new StatusBar({
      x: currentX,
      y: topY,
      width: barWidth,
      height: barHeight,
      sprites: AssetManager.STATUSBARS_PEPE.healthOrange,
    });

    currentX += barWidth + spacing;
    this.statusBars.salsa = new StatusBar({
      x: currentX,
      y: topY,
      width: barWidth,
      height: barHeight,
      sprites: AssetManager.STATUSBARS_PEPE.bottleOrange,
    });

    const bossBarWidth = 300;
    const bossBarHeight = 70;
    this.statusBars.boss = new StatusBar({
      x: this.canvas.width / 2,
      y: topY, // etwas Abstand nach unten
      width: bossBarWidth,
      height: bossBarHeight,
      sprites: AssetManager.STATUSBARS_CHICKENBOSS,
    });
  }

  addMovableObject(obj) {
    if (!this.movableObjects) this.movableObjects = [];
    this.movableObjects.push(obj);
  }

  getVisibleEnemies() {
    const margin = 200;
    const left = -this.camera_x - margin;
    const right = -this.camera_x + this.canvas.width + margin;
    return this.enemies.filter((e) => e.x + e.width > left && e.x < right);
  }

  update(deltaTime) {
    // Combo-Timer
    if (this.stompTimer > 0) {
      this.stompTimer -= deltaTime * 1000;
      if (this.stompTimer <= 0) {
        this.stompCombo = 0;
      }
    }

    // Popups updaten
    this.stompPopups.forEach((p) => p.update(delta));
    this.stompPopups = this.stompPopups.filter((p) => !p.isExpired);
    const visibleEnemies = this.getVisibleEnemies();
    this.character.checkCollisions(visibleEnemies, deltaTime);

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

    // Attacke (Salsa werfen)
    if (this.keyboard.attack) this.character.throwSalsa();

    // MovableObjects updaten + Kollision
    this.movableObjects = this.movableObjects.filter((obj) => {
      obj.update(deltaTime, this.enemies);

      visibleEnemies.forEach((enemy) => {
        const salsaHitbox = {
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
        };
        const enemyHitbox = enemy.getHitbox();

        if (
          salsaHitbox.x < enemyHitbox.x + enemyHitbox.width &&
          salsaHitbox.x + salsaHitbox.width > enemyHitbox.x &&
          salsaHitbox.y < enemyHitbox.y + enemyHitbox.height &&
          salsaHitbox.y + salsaHitbox.height > enemyHitbox.y
        ) {
          if (enemy.subtype === "chickenBoss") {
            enemy.getDamage({ strength: 20 }); // nutzt die Boss-Logik inkl. Bar-Update
          } else {
            enemy.isDead = true;
          }

          // Combo-Timer starten
          this.stompCombo++;
          this.stompTimer = this.stompDisplayDuration;
          this.stompX = enemy.x + enemy.width / 2;
          this.stompY = enemy.y;

          obj.hasHitAnimationFinished = true;
        }
      });

      return !obj.hasHitAnimationFinished;
    });

    // Combo zurücksetzen
    if (this.stompTimer > 0) {
      this.stompTimer -= deltaTime;
      if (this.stompTimer <= 0) this.stompCombo = 0;
    }

    // Items einsammeln
    this.items.coins.forEach((coin) => coin.tryCollect(this.character));
    this.items.salsas.forEach((s) => s.tryCollect(this.character));

    // Updates
    this.character.update(deltaTime, moving, this.keyboard.jump, moveDir);
    visibleEnemies.forEach((e) => e.update(deltaTime, this.character));
    this.items.update(deltaTime);
    this.updateClouds(deltaTime);
    this.updateGoldDisplay(deltaTime);
    this.updateCharacterStats();

    // Kamera
    this.camera_x = -this.character.x + this.canvas.width / 6;
    this.keyboard.update();
  }

  updateClouds(deltaTime) {
    this.clouds.forEach((c) => c.moveLeft(deltaTime));
  }

  updateCharacterStats() {
    if (!this.character) return;
    const maxHealth = 100,
      maxCoins = 100,
      maxSalsas = 5;

    this.statusBars.health?.setPercentage(
      (this.character.health / maxHealth) * 100
    );
    this.statusBars.coins?.setPercentage(
      (this.character.gold / maxCoins) * 100
    );
    this.statusBars.salsa?.setPercentage(
      (this.character.salsas / maxSalsas) * 100
    );
  }

  updateGoldDisplay(deltaTime) {
    if (!this.character) return;
    const speed = 100 * deltaTime;
    if (this.character.displayGold < this.character.gold) {
      this.character.displayGold += speed;
      if (this.character.displayGold > this.character.gold)
        this.character.displayGold = this.character.gold;
    }
  }

  onCharacterSpotted(boss) {
    this.showBossBar = true;
    this.statusBars.boss?.setPercentage((boss.health / boss.maxHealth) * 100);
  }

  onBossDefeated() {
    this.showBossBar = false;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Combo-Anzeige
    if (this.stompCombo > 0) {
      this.ctx.save();
      this.ctx.font = "32px 'Boogaloo'";
      this.ctx.fillStyle = "yellow";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "bottom";
      this.ctx.fillText(`x${this.stompCombo}`, this.stompX, this.stompY - 10);
      this.ctx.restore();
    }

    // Backgrounds
    this.backgrounds.forEach((bg) => {
      if (!bg.img?.complete) return;
      const bgWidth = bg.width || 1440;
      const offset = Math.floor((this.camera_x * bg.speedFactor) % bgWidth);
      this.ctx.drawImage(bg.img, offset, bg.y, bgWidth, bg.height);
      if (offset > 0)
        this.ctx.drawImage(bg.img, offset - bgWidth, bg.y, bgWidth, bg.height);
      if (offset < 0)
        this.ctx.drawImage(bg.img, offset + bgWidth, bg.y, bgWidth, bg.height);
    });

    this.ctx.save();
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);
    this.addObjectsToMap(this.movableObjects);
    this.items.draw(this.ctx);
    this.ctx.restore();

    // StatusBars
    Object.values(this.statusBars).forEach((bar) => {
      if (bar && (bar !== this.statusBars.boss || this.showBossBar))
        bar.draw(this.ctx);
    });

    // Coins-Anzeige
    if (this.character) {
      const bar = this.statusBars.health;
      const x = bar ? bar.x : 20;
      const y = bar ? bar.y + bar.height + 10 : 50;
      const iconSize = 32;

      this.ctx.save();
      this.ctx.font = "32px 'Boogaloo'";
      this.ctx.fillStyle = "yellow";
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "middle";

      const coinImg = AssetManager.getImage(
        AssetManager.STATUSBARS_PEPE.icons[0]
      );
      if (coinImg) this.ctx.drawImage(coinImg, x, y, iconSize, iconSize);

      const textX = x + iconSize + 8;
      const textY = y + iconSize / 2;
      this.ctx.fillText(
        `x ${Math.floor(this.character.displayGold)}`,
        textX,
        textY
      );
      this.stompPopups.forEach((p) => p.draw(ctx));
      this.ctx.restore();
    }
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => this.addToMap(o));
  }

  addToMap(mo) {
    if (!mo) return;
    if (mo.img instanceof Image && mo.img.complete && mo.img.naturalWidth) {
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
