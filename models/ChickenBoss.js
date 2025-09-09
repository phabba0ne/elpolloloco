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
    type = "enemy",
    subtype = "chickenBoss",
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
      type,
      subtype,
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
    this.attackCooldown = 3000; // ms

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

  /** Gibt die aktuelle Hitbox zurück */
  getHitbox() {
    return {
      x: this.x + this.hitboxOffsetX,
      y: this.y + this.hitboxOffsetY,
      width: this.hitboxWidth,
      height: this.hitboxHeight,
    };
  }

  /** Verhalten & States */

  updateBehavior() {
    if (this.isDead) return;
    if (!this.player) {
      if (this.world?.character) {
        this.player = this.world.character;
      } else {
        return;
      }
    }

    const distance = Math.abs(this.player.x - this.x);

    // --- Dead ---
    if (this.health <= 0) {
      this.setState("dead", 2);
      this.die();
      return;
    }

    // --- Attack ---
    if (distance < 200) {
      this.setState("attack", 6);
      this.speedX = 0;

      const now = performance.now();
      if (now - this.lastAttackTime > this.attackCooldown) {
        this.performAttack();
        this.lastAttackTime = now;
      }
      return;
    }

    // --- Walk ---
    if (distance < 500) {
      this.setState("walk", 4);
      const dir = Math.sign(this.player.x - this.x);
      this.speedX = dir * this.moveSpeed;
      this.otherDirection = dir > 0;
      return;
    }

    // --- Alert (Idle) ---
    this.setState("alert", 3);
    this.speedX = 0;
  }

  performAttack() {
    if (this.debug) console.log("🐔👑 [ATTACK] Boss greift an!");

    // Animation immer neu starten
    this.setState("attack", 6, true);

    // Optional: nach Attacke zurück zu alert
    setTimeout(() => {
      if (!this.isDead) this.setState("alert", 3);
    }, this.stateMachine.getAnimationDuration("attack"));
  }

  /** Hauptupdate */
  update(deltaTime) {
    if (!this.img || this.isDead) return;

    this.updateBehavior();

    // Bewegung anwenden
    this.x += this.speedX * deltaTime;
    this.x = Math.max(0, Math.min(4000, this.x)); // Level-Bounds

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

      // Boss-Bar updaten
      if (this.world?.statusBarManager) {
        this.world.statusBarManager.updateBossHealth(this.health);
      }

      setTimeout(() => (this.isFlashing = false), 500);
    }
  }

  /** Todesevent */
  die() {
    super.die();
    this.setState("dead", 2);
    this.speedX = 0;
    this.currentBehavior = "dead";

    if (this.world?.statusBarManager) {
      this.world.statusBarManager.hideBossBar();
    }

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
      this.currentBehavior = stateName;
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
