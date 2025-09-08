import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";
import IntervalHub from "../services/IntervalHub.js";

export default class ChickenBoss extends MovableObject {
  constructor({
    x = 1200,
    y = 155,
    width = 300,
    height = 300,
    strength = 50, //TODO: doesnt work
    sprites = AssetManager.CHICKENBOSS_SPRITES,
    debug = true,
    player = null,
    spawnThreshold = 900,
    health = 500,
  } = {}) {
    super({
      x, y, width, height,
      health, strength,
      type: "chickenBoss",
      hitboxOffsetX: 30,
      hitboxOffsetY: 50,
      hitboxWidth: 240,
      hitboxHeight: 200,
      canBeInstakilled: false,
      canInstakillOthers: false
    });

    // BOSS PROPERTIES
    this.player = player;   // ✅ speichern
    this.active = true;
    this.speedX = 0;
    this.speedY = 0;
    this.moveSpeed = 40;

    // BEHAVIOR STATES
    this.currentBehavior = "sleeping";
    this.lastAttackTime = 0;
    this.attackCooldown = 3000;

    // VISUAL FX
    this.isFlashing = false;
    this.screenShake = { active: false, intensity: 0, duration: 0 };

    // DEBUG COUNTERS
    this.debug = debug;
    this.debugCounters = {
      updateCalls: 0,
      movementUpdates: 0,
      behaviorChanges: 0
    };

    // StateMachine setup
    this.stateMachine = new StateMachine(sprites, "alert", 3);

    this.initBoss();
  }

  async initBoss() {
    try {
      await this.loadSprites(AssetManager.CHICKENBOSS_SPRITES);
    } catch (error) {
      console.error("🐔👑 [ERROR] Boss init failed:", error);
    }
  }

  /** Bewegung Richtung Spieler */
  updateSimpleMovement() {
    if (!this.player) return;

    const distanceToPlayer = Math.abs(this.player.x - this.x);
    const direction = Math.sign(this.player.x - this.x);

    this.speedX = direction * this.moveSpeed;
    this.otherDirection = direction > 0;

    if (this.debug && this.debugCounters.movementUpdates % 30 === 0) {
      console.log("🐔👑 [DEBUG] Movement:", {
        playerX: this.player.x,
        bossX: this.x,
        distance: distanceToPlayer,
        direction,
        speedX: this.speedX
      });
    }
    this.debugCounters.movementUpdates++;

    if (distanceToPlayer > 50) {
      this.setState("walk", 4);
    } else {
      this.setState("attack", 6);
      this.speedX = 0;
    }
  }

  /** Hauptupdate */
  update(deltaTime) {
    this.debugCounters.updateCalls++;

  

    // Sprite Check
    if (!this.img) return;

    // Bewegung anwenden
    if (this.speedX !== 0) {
      this.x += this.speedX * deltaTime;
      if (this.x < 0) this.x = 0;
      if (this.x > 1200) this.x = 1200;
    }

    // Animation updaten
    if (this.stateMachine) {
      this.stateMachine.update(deltaTime);
      this.img = this.stateMachine.getFrame();
    }
  }


  getDamage(source) {
    console.log("🐔👑 [DEBUG] Boss taking damage from:", source.type);
    super.getDamage(source);

    if (!this.isDead) {
      this.setState("hurt", 8);
      this.isFlashing = true;
      setTimeout(() => this.isFlashing = false, 500);
    }
  }

  die() {
    console.log("🐔👑 [DEBUG] 💀 BOSS DYING!");
    super.die();
    this.setState("die", 2);
    this.speedX = 0;
    this.currentBehavior = "dead";
  }

  async loadSprites(sprites) {
    try {
      await AssetManager.loadAll(Object.values(sprites).flat());
      this.img = this.stateMachine.getFrame();
      console.log("🐔👑 [DEBUG] ✅ Sprites loaded successfully");
    } catch (error) {
      console.error("🐔👑 [DEBUG] ❌ Sprite loading failed:", error);
    }
  }

  setState(stateName, speed = 10) {
    if (this.stateMachine.currentState !== stateName) {
      if (this.debug) {
        console.log(`🐔👑 [DEBUG] State: ${this.stateMachine.currentState} → ${stateName}`);
      }
      this.stateMachine.setState(stateName, speed);
      this.debugCounters.behaviorChanges++;
    }
  }

  destroy() {
    console.log("🐔👑 [DEBUG] 🧹 Destroying boss...");
    IntervalHub.stopIntervalsByType("chickenBoss"); // ✅ nur eigene Intervalle killen
  }
}