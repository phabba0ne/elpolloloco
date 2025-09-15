import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";
import IntervalHub from "../services/IntervalHub.js";

export default class ChickenBoss extends MovableObject {

  constructor({
    x = 1200,
    y,
    width = 300,
    height = 300,
    strength = 50,
    health = 50,
    sprites = AssetManager.CHICKENBOSS_SPRITES,
    type = "enemy",
    subtype = "chickenBoss",
    player = null,
    debug = true,
  } = {}) {
    super({
      x,
      y: y ?? groundLevel - height,
      width,
      height,
      strength,
      health,
      type,
      subtype,
      hitboxOffsetX: 20,
      hitboxOffsetY: 20,
      hitboxWidth: 0,
      hitboxHeight: 0,
      canBeInstakilled: false,
      canInstakillOthers: false,
    });

    // BOSS PROPERTIES
    this.player = player;
    this.debug = debug;

    this.moveSpeed = 100;
    this.speedX = 0;
    this.speedY = 0;

    this.currentBehavior = "alert";
    this.AudioHub.playOne("AMBIENT","chickenAlarmCall");
    this.lastAttackTime = 0;
    this.attackCooldown = 1000; // ms

    this.isFlashing = false;
    this.hasTriggeredBossBar = false;

    // StateMachine
    this.stateMachine = new StateMachine(sprites, "alert", 6);

    // Initialize sprites
    this.loadSprites(sprites);
  }

  /** Lädt alle Boss-Sprites */
  async loadSprites(sprites) {
    try {
      await AssetManager.loadAll(Object.values(sprites).flat());
      this.img = this.stateMachine.getFrame();
      if (this.debug) console.log("🐔👑 [DEBUG] ChickenBoss sprites loaded");
    } catch (err) {
      console.error("🐔👑 [ERROR] ChickenBoss sprites failed to load:", err);
      this.createFallbackImage();
    }
  }

  /** Fallback image */
  createFallbackImage() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#8B0000"; // Dark red body
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "#FFD700"; // Gold crown
    ctx.fillRect(this.width * 0.3, 0, this.width * 0.4, this.height * 0.2);

    ctx.fillStyle = "#FFFFFF"; // Text
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BOSS", this.width / 2, this.height / 2);

    this.img = canvas;
  }

  getHitbox() {
    return {
      x: this.x + this.hitboxOffsetX,
      y: this.y + this.hitboxOffsetY,
      width: this.hitboxWidth,
      height: this.hitboxHeight,
    };
  }

  isPlayerInRange(detectionRange = 2000) {
    if (!this.player) return false;
    const distance = Math.abs(this.player.x - this.x);
    return distance <= detectionRange;
  }

  triggerBossEncounter() {
    if (!this.hasTriggeredBossBar && this.world) {
      this.world.showBossBar = true;
      this.world.statusBars.boss?.setPercentage(
        (this.health / (this.maxHealth || 500)) * 100
      );
      this.hasTriggeredBossBar = true;

      if (this.debug) console.log("🐔👑 [DEBUG] Boss encounter triggered!");
    }
  }

  /** Verhalten & States */
  updateBehavior(deltaTime) {
    if (this.isDead) {
      this.setStateIfNot("dead", 2, true);
      return;
    }

    if (!this.player && this.world?.character) {
      this.player = this.world.character;
    }
    if (!this.player) return;

    const playerDistanceX = this.player.x - this.x;
    const playerDistanceY = this.player.y - this.y;
    const distance = Math.abs(playerDistanceX);

    if (this.isPlayerInRange(600)) this.triggerBossEncounter();

    // --- Death ---
    if (this.health <= 0) {
      this.die();
      return;
    }

    // --- Attack ---
    if (distance < 200) {
      this.setStateIfNot("attack", 6);
      this.speedX = 0;

      const now = performance.now();
      if (now - this.lastAttackTime > this.attackCooldown) {
        this.performAttack();
        this.lastAttackTime = now;
      }
      return;
    }

    // --- Walk / Follow ---
    if (distance < 500) {
      const dir = Math.sign(playerDistanceX);
      this.speedX = dir * this.moveSpeed;
      this.otherDirection = dir > 0;

      const baseSpeed = 100;
      const animSpeed = Math.max(
        1,
        Math.round((Math.abs(this.speedX) / baseSpeed) * 6)
      );
      this.setStateIfNot("walk", animSpeed);

      if (playerDistanceY < -50 && this.isOnGround()) {
        this.speedY = -Math.min(20, Math.abs(playerDistanceY));
        this.setStateIfNot("jump", 6);
      }
      return;
    }

    // --- Alert ---
    this.speedX = 0;
    this.setStateIfNot("alert", 6);
  }

  setStateIfNot(stateName, speed = 6, forceRestart = false) {
    if (!this.stateMachine) return;
    if (this.stateMachine.currentState !== stateName || forceRestart) {
      this.stateMachine.setState(stateName, speed);
      this.currentBehavior = stateName;
    }
  }

  /** Update Loop */
  update(deltaTime, player = null) {
    if (player) this.player = player;
    if (!this.img) return;

    // --- Dead State: weiterfallen + Dead-Anim ---
    if (this.isDead) {
      this.speedY += this.gravity;
      this.y += this.speedY * deltaTime;

      const groundLevel = this.world?.groundLevel || 200;
      if (this.y + this.height >= groundLevel) {
        this.y = groundLevel - this.height;
        this.speedY = 0;
      }

      if (this.stateMachine) {
        this.stateMachine.update(deltaTime);
        const newFrame = this.stateMachine.getFrame();
        if (newFrame) this.img = newFrame;
      }
      return;
    }

    // --- Alive Behavior ---
    this.updateBehavior(deltaTime);

    this.speedY += this.gravity;
    this.y += this.speedY * deltaTime;
    this.x += this.speedX * deltaTime;

    const groundLevel = this.world?.groundLevel || 200;
    if (this.y + this.height >= groundLevel) {
      this.y = groundLevel - this.height;
      this.speedY = 0;
    }

    const levelStartX = 0;
    const levelEndX = this.world?.level?.endX || 4000;
    this.x = Math.max(levelStartX, Math.min(levelEndX - this.width, this.x));

    if (this.stateMachine) {
      this.stateMachine.update(deltaTime);
      const newFrame = this.stateMachine.getFrame();
      if (newFrame) this.img = newFrame;
    }

    if (this.hasTriggeredBossBar && this.world?.statusBar) {
      this.world.statusBar.updateBossHealth(this.health);
    }
  }

  performAttack() {
    if (this.debug) console.log("🐔👑 [ATTACK] Boss attacks!");
    this.setState("attack", 6, true);

    if (this.player && Math.abs(this.player.x - this.x) < 100) {
      if (typeof this.player.getDamage === "function") {
        this.player.getDamage(this);
      } else if (this.player.health !== undefined) {
        this.player.health = Math.max(0, this.player.health - this.strength);
        if (this.debug)
          console.log(`🐔👑 [ATTACK] Player health: ${this.player.health}`);
      }
    }

    const attackDuration = this.stateMachine.getAnimationDuration
      ? this.stateMachine.getAnimationDuration("attack")
      : 1000;

    setTimeout(() => {
      if (!this.isDead) this.setState("alert", 3);
    }, attackDuration);
  }

  getDamage(source) {
    if (this.isDead) return;

    super.getDamage(source);

    if (!this.isDead) {
      this.setState("hurt", 8);
      this.isFlashing = true;

      if (this.world?.statusBars?.boss) {
        const percentage = (this.health / (this.maxHealth || 500)) * 100;
        this.world.statusBars.boss.setPercentage(percentage);
      }

      setTimeout(() => {
        this.isFlashing = false;
        if (!this.isDead) this.setState("alert", 3);
      }, 500);

      if (this.debug)
        console.log(
          `🐔👑 [DAMAGE] Boss health: ${this.health}/${this.maxHealth || 500}`
        );
    }
  }

  die() {
    if (this.isDead) return;

    super.die();
    this.isDead = true;
    this.setState("dead", 2, true);
    this.speedX = 0;
    this.currentBehavior = "dead";

    if (this.world?.statusBar) {
      this.world.statusBar.hideBossBar();
    }

    this.destroy();

    if (this.debug) console.log("🐔👑 [DEBUG] ChickenBoss defeated!");

    if (this.world && typeof this.world.onBossDefeated === "function") {
      this.world.onBossDefeated();
    }
  }

  setState(stateName, speed = 10, forceRestart = false) {
    if (!this.stateMachine) return;
    if (this.stateMachine.currentState !== stateName || forceRestart) {
      if (this.debug)
        console.log(
          `🐔👑 [DEBUG] State: ${this.stateMachine.currentState} → ${stateName}`
        );
      this.stateMachine.setState(stateName, speed);
      this.currentBehavior = stateName;
    }
  }

  isAlive() {
    return !this.isDead && this.health > 0;
  }

  getBossInfo() {
    return {
      health: this.health,
      maxHealth: this.maxHealth || 500,
      state: this.currentBehavior,
      position: { x: Math.round(this.x), y: Math.round(this.y) },
      speed: { x: Math.round(this.speedX), y: Math.round(this.speedY) },
      isAlive: this.isAlive(),
      hasTriggeredEncounter: this.hasTriggeredBossBar,
      playerDistance: this.player
        ? Math.round(Math.abs(this.player.x - this.x))
        : null,
      facingDirection: this.otherDirection ? "right" : "left",
      attackCooldownRemaining: Math.max(
        0,
        this.attackCooldown - (performance.now() - this.lastAttackTime)
      ),
    };
  }

  destroy() {
    if (this.debug) console.log("🐔👑 [DEBUG] ChickenBoss destroyed");
    IntervalHub.stopIntervalsByType("chickenBoss");
    IntervalHub.stopIntervalsByType(this.constructor.name);
    this.isDestroyed = true;
  }
}