import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";
import IntervalHub from "../services/IntervalHub.js";

/**
 * @extends MovableObject
 */
export default class ChickenBoss extends MovableObject {
  /**
   * @param {object} options
   */
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
    this.player = player;
    this.moveSpeed = 100;
    this.speedX = 0;
    this.speedY = 0;
    this.currentBehavior = "alert";
    this.lastAttackTime = 0;
    this.attackCooldown = 1000;
    this.isFlashing = false;
    this.hasTriggeredBossBar = false;
    this.stateMachine = new StateMachine(sprites, "alert", 6);
    this.AudioHub.playOne("CHICKENBOSS_SOUNDS", "alert");
    this.loadSprites(sprites);
  }

  /** @param {object} sprites */
  async loadSprites(sprites) {
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  createFallbackImage() {
    const c = document.createElement("canvas");
    c.width = this.width;
    c.height = this.height;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#8B0000";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(this.width * 0.3, 0, this.width * 0.4, this.height * 0.2);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BOSS", this.width / 2, this.height / 2);
    this.img = c;
  }

  getHitbox() {
    return {
      x: this.x + this.hitboxOffsetX,
      y: this.y + this.hitboxOffsetY,
      width: this.hitboxWidth,
      height: this.hitboxHeight,
    };
  }

  isPlayerInRange(d = 2000) {
    return this.player ? Math.abs(this.player.x - this.x) <= d : false;
  }

  triggerBossEncounter() {
    if (this.hasTriggeredBossBar || !this.world) return;
    this.world.showBossBar = true;
    this.world.statusBars.boss?.setPercentage(
      (this.health / (this.maxHealth || 500)) * 100
    );
    this.hasTriggeredBossBar = true;
    this.AudioHub.playOne("CHICKENBOSS_SOUNDS", "approach");
  }

  updateBehavior() {
    if (this.isDead) {
      this.setStateIfNot("dead", 2, true);
      return;
    }
    if (!this.player) this.player = this.world?.character;
    if (!this.player) return;
    const dx = this.player.x - this.x,
      dy = this.player.y - this.y,
      dist = Math.abs(dx);
    if (this.isPlayerInRange(600)) this.triggerBossEncounter();
    if (this.health <= 0) {
      this.AudioHub.playOne("AMBIENT", "chickenAlarmCall");
      this.die();
      return;
    }
    if (dist < 200) {
      this.speedX = 0;
      this.setStateIfNot("attack", 6);
      if (performance.now() - this.lastAttackTime > this.attackCooldown) {
        this.performAttack();
        this.lastAttackTime = performance.now();
      }
      return;
    }
    if (dist < 500) {
      const dir = Math.sign(dx);
      this.speedX = dir * this.moveSpeed;
      this.otherDirection = dir > 0;
      this.setStateIfNot(
        "walk",
        Math.max(1, Math.round((Math.abs(this.speedX) / 100) * 6))
      );
      if (dy < -50 && this.isOnGround()) {
        this.speedY = -Math.min(20, Math.abs(dy));
        this.setStateIfNot("jump", 6);
      }
      return;
    }
    this.speedX = 0;
    this.setStateIfNot("alert", 6);
  }

  setStateIfNot(state, speed = 6, force = false) {
    if (!this.stateMachine) return;
    if (this.stateMachine.currentState !== state || force) {
      this.stateMachine.setState(state, speed);
      this.currentBehavior = state;
    }
  }

  update(dt, player = null) {
    if (player) this.player = player;
    if (!this.img) return;
    if (this.isDead) {
      this.speedY += this.gravity;
      this.y += this.speedY * dt;
      const g = this.world?.groundLevel || 200;
      if (this.y + this.height >= g) {
        this.y = g - this.height;
        this.speedY = 0;
      }
      this.stateMachine?.update(dt);
      const f = this.stateMachine?.getFrame();
      if (f) this.img = f;
      return;
    }
    this.updateBehavior();
    this.speedY += this.gravity;
    this.y += this.speedY * dt;
    this.x += this.speedX * dt;
    const g = this.world?.groundLevel || 200;
    if (this.y + this.height >= g) {
      this.y = g - this.height;
      this.speedY = 0;
    }
    const l0 = 0,
      l1 = this.world?.level?.endX || 4000;
    this.x = Math.max(l0, Math.min(l1 - this.width, this.x));
    this.stateMachine?.update(dt);
    const f = this.stateMachine?.getFrame();
    if (f) this.img = f;
    if (this.hasTriggeredBossBar)
      this.world?.statusBar?.updateBossHealth(this.health);
  }

  performAttack() {
    this.setState("attack", 6, true);
    if (this.player && Math.abs(this.player.x - this.x) < 100) {
      if (typeof this.player.getDamage === "function")
        this.player.getDamage(this);
      else if (this.player.health !== undefined)
        this.player.health = Math.max(0, this.player.health - this.strength);
    }
    const dur = this.stateMachine.getAnimationDuration?.("attack") || 1000;
    setTimeout(() => {
      if (!this.isDead) this.setState("alert", 3);
    }, dur);
  }

  getDamage(src) {
    if (this.isDead) return;
    super.getDamage(src);
    if (this.isDead) return;
    this.setState("hurt", 8);
    this.isFlashing = true;
    if (this.world?.statusBars?.boss)
      this.world.statusBars.boss.setPercentage(
        (this.health / (this.maxHealth || 500)) * 100
      );
    setTimeout(() => {
      this.isFlashing = false;
      if (!this.isDead) this.setState("alert", 3);
    }, 500);
  }

  die() {
    if (this.isDead) return;
    super.die();
    this.isDead = true;
    this.setState("dead", 2, true);
    this.speedX = 0;
    this.currentBehavior = "dead";
    this.world?.statusBar?.hideBossBar();
    this.destroy();
    window.showVictory?.();
    this.world?.onBossDefeated?.();
  }

  setState(state, speed = 10, force = false) {
    if (!this.stateMachine) return;
    if (this.stateMachine.currentState !== state || force) {
      this.stateMachine.setState(state, speed);
      this.currentBehavior = state;
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
    IntervalHub.stopIntervalsByType("chickenBoss");
    IntervalHub.stopIntervalsByType(this.constructor.name);
    this.isDestroyed = true;
  }
}
