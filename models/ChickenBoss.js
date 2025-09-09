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
    strength = 50,
    health = 500,
    sprites = AssetManager.CHICKENBOSS_SPRITES,
    player = null,
    debug = true,
  } = {}) {
    super({
      x,
      y,
      width,
      height,
      strength,
      health,
      type: "chickenBoss",
      hitboxOffsetX: 30,
      hitboxOffsetY: 50,
      hitboxWidth: 240,
      hitboxHeight: 200,
      canBeInstakilled: false,
      canInstakillOthers: false,
    });

    // BOSS PROPERTIES
    this.player = player;
    this.debug = debug;

    this.moveSpeed = 40;
    this.speedX = 0;
    this.speedY = 0;

    this.currentBehavior = "alert";
    this.lastAttackTime = 0;
    this.attackCooldown = 3000;

    this.isFlashing = false;

    // StateMachine
    this.stateMachine = new StateMachine(sprites, "alert", 3);

    this.loadSprites(sprites);
  }

  /** Lädt alle Boss-Sprites */
  async loadSprites(sprites) {
    try {
      await AssetManager.loadAll(Object.values(sprites).flat());
      this.img = this.stateMachine.getFrame();
      if (this.debug) {
        console.log("🐔👑 [DEBUG] Sprites geladen");
      }
    } catch (err) {
      console.error("🐔👑 [ERROR] Sprites konnten nicht geladen werden:", err);
    }
  }

  /** Bewegung Richtung Spieler */
  updateMovement() {
    if (!this.player || this.isDead) return;

    const distanceToPlayer = Math.abs(this.player.x - this.x);
    const direction = Math.sign(this.player.x - this.x);

    this.speedX = direction * this.moveSpeed;
    this.otherDirection = direction > 0;

    if (distanceToPlayer > 80) {
      this.setState("walk", 4);
    } else {
      this.setState("attack", 6);
      this.speedX = 0;
    }
  }

  /** Hauptupdate */
  update(deltaTime) {
    if (!this.img || this.isDead) return;

    this.updateMovement();

    // Bewegung anwenden
    this.x += this.speedX * deltaTime;
    this.x = Math.max(0, Math.min(1200, this.x));

    // Animation updaten
    this.stateMachine.update(deltaTime);
    this.img = this.stateMachine.getFrame();
  }

  /** Schaden erhalten */
  getDamage(source) {
    super.getDamage(source);

    if (!this.isDead) {
      this.setState("hurt", 8);
      this.isFlashing = true;
      setTimeout(() => (this.isFlashing = false), 500);
    }
  }

  /** Todesevent */
  die() {
    super.die();
    this.setState("die", 2);
    this.speedX = 0;
    this.currentBehavior = "dead";
    if (this.debug) {
      console.log("🐔👑 [DEBUG] Boss gestorben");
    }
  }

  /** State wechseln */
  setState(stateName, speed = 10) {
    if (this.stateMachine.currentState !== stateName) {
      if (this.debug) {
        console.log(
          `🐔👑 [DEBUG] State: ${this.stateMachine.currentState} → ${stateName}`
        );
      }
      this.stateMachine.setState(stateName, speed);
    }
  }

  /** Boss sauber entfernen */
  destroy() {
    if (this.debug) {
      console.log("🐔👑 [DEBUG] Boss zerstört");
    }
    IntervalHub.stopIntervalsByType("chickenBoss");
  }
}