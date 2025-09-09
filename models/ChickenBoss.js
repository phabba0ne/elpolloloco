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
      hitboxOffsetX: 0,
      hitboxOffsetY: 0,
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
    this.lastAttackTime = 0;
    this.attackCooldown = 1000; // ms

    this.isFlashing = false;
    this.hasTriggeredBossBar = false; // Track if boss bar was shown

    // StateMachine
    this.stateMachine = new StateMachine(sprites, "alert", 10);

    // Initialize sprites loading
    this.loadSprites(sprites);
  }

  /** Lädt alle Boss-Sprites */
  async loadSprites(sprites) {
    try {
      await AssetManager.loadAll(Object.values(sprites).flat());
      this.img = this.stateMachine.getFrame();
      if (this.debug) {
        console.log("🐔👑 [DEBUG] ChickenBoss sprites loaded");
      }
    } catch (err) {
      console.error("🐔👑 [ERROR] ChickenBoss sprites failed to load:", err);
      // Fallback: create a simple colored rectangle
      this.createFallbackImage();
    }
  }

  /** Create fallback image if sprites fail to load */
  createFallbackImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple boss representation
    ctx.fillStyle = '#8B0000'; // Dark red
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = '#FFD700'; // Gold crown
    ctx.fillRect(this.width * 0.3, 0, this.width * 0.4, this.height * 0.2);
    
    ctx.fillStyle = '#FFFFFF'; // White text
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', this.width / 2, this.height / 2);
    
    this.img = canvas;
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

  /** Check if player is in detection range */
  isPlayerInRange(detectionRange = 2000) {
    if (!this.player) return false;
    const distance = Math.abs(this.player.x - this.x);
    return distance <= detectionRange;
  }

  /** Trigger boss bar when player is detected */
  triggerBossEncounter() {
    if (!this.hasTriggeredBossBar && this.world?.statusBarManager) {
      this.world.statusBarManager.showBossBar();
      this.world.statusBarManager.updateBossHealth(this.health);
      this.hasTriggeredBossBar = true;
      
      if (this.debug) {
        console.log("🐔👑 [DEBUG] Boss encounter triggered!");
      }
    }
  }

  /** Verhalten & States */
  updateBehavior() {
    if (this.isDead) return;
    
    // Get player reference if not set
    if (!this.player) {
      if (this.world?.character) {
        this.player = this.world.character;
      } else {
        return;
      }
    }

    const distance = Math.abs(this.player.x - this.x);

    // Trigger boss bar if player is in detection range
    if (this.isPlayerInRange(600)) {
      this.triggerBossEncounter();
    }

    // --- Dead ---
    if (this.health <= 0) {
      this.setState("dead", 6);
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
      this.setState("walk", 6);
      const dir = Math.sign(this.player.x - this.x);
      this.speedX = dir * this.moveSpeed;
      this.otherDirection = dir > 0;
      return;
    }

    // --- Alert (Idle) ---
    this.setState("alert", 6);
    this.speedX = 0;
  }

  performAttack() {
    if (this.debug) console.log("🐔👑 [ATTACK] Boss attacks!");

    // Always restart attack animation
    this.setState("attack", 6, true);

    // Deal damage to player if in range
    if (this.player && Math.abs(this.player.x - this.x) < 100) {
      // Check if player has getDamage method
      if (typeof this.player.getDamage === 'function') {
        this.player.getDamage(this);
      } else if (this.player.health !== undefined) {
        // Fallback: directly reduce health
        this.player.health = Math.max(0, this.player.health - this.strength);
        if (this.debug) {
          console.log(`🐔👑 [ATTACK] Player health: ${this.player.health}`);
        }
      }
    }

    // Return to alert after attack animation
    const attackDuration = this.stateMachine.getAnimationDuration ? 
      this.stateMachine.getAnimationDuration("attack") : 1000;
    
    setTimeout(() => {
      if (!this.isDead) this.setState("alert", 3);
    }, attackDuration);
  }

  /** Hauptupdate */
  update(deltaTime, player = null) {
    // Update player reference if provided
    if (player) {
      this.player = player;
    }

    if (!this.img || this.isDead) return;

    this.updateBehavior();

    // Apply movement
    this.x += this.speedX * deltaTime;
    
    // Level bounds - adjust these to match your level
    const levelStartX = 0;
    const levelEndX = this.world?.level?.endX || 4000;
    this.x = Math.max(levelStartX, Math.min(levelEndX - this.width, this.x));

    // Update animation
    if (this.stateMachine) {
      this.stateMachine.update(deltaTime);
      const newFrame = this.stateMachine.getFrame();
      if (newFrame) {
        this.img = newFrame;
      }
    }

    // Update boss health bar if visible
    if (this.hasTriggeredBossBar && this.world?.statusBarManager) {
      this.world.statusBarManager.updateBossHealth(this.health);
    }
  }

  /** Schaden erhalten */
  getDamage(source) {
    if (this.isDead) return;

    super.getDamage(source);

    if (!this.isDead) {
      this.setState("hurt", 8);
      this.isFlashing = true;

      // Update boss bar
      if (this.world?.statusBarManager) {
        this.world.statusBarManager.updateBossHealth(this.health);
      }

      setTimeout(() => {
        this.isFlashing = false;
        if (!this.isDead) {
          this.setState("alert", 3); // Return to alert after hurt
        }
      }, 500);

      if (this.debug) {
        console.log(`🐔👑 [DAMAGE] Boss health: ${this.health}/${this.maxHealth || 500}`);
      }
    }
  }

  /** Todesevent */
  die() {
    if (this.isDead) return; // Prevent multiple death calls

    super.die();
    this.setState("dead", 2);
    this.speedX = 0;
    this.currentBehavior = "dead";

    // Hide boss bar
    if (this.world?.statusBarManager) {
      this.world.statusBarManager.hideBossBar();
    }

    // Clean up intervals
    this.destroy();

    if (this.debug) {
      console.log("🐔👑 [DEBUG] ChickenBoss defeated!");
    }

    // Optional: Trigger victory event
    if (this.world && typeof this.world.onBossDefeated === 'function') {
      this.world.onBossDefeated();
    }
  }

  /** State wechseln */
  setState(stateName, speed = 10, forceRestart = false) {
    if (!this.stateMachine) return;

    if (this.stateMachine.currentState !== stateName || forceRestart) {
      if (this.debug) {
        console.log(
          `🐔👑 [DEBUG] State: ${this.stateMachine.currentState} → ${stateName}`
        );
      }
      this.stateMachine.setState(stateName, speed);
      this.currentBehavior = stateName;
    }
  }

  /** Check if boss is alive */
  isAlive() {
    return !this.isDead && this.health > 0;
  }

  /** Get boss info for debugging */
  getBossInfo() {
    return {
      health: this.health,
      maxHealth: this.maxHealth || 500,
      state: this.currentBehavior,
      movementPattern: this.movementPattern,
      position: { x: Math.round(this.x), y: Math.round(this.y) },
      speed: { x: Math.round(this.speedX), y: Math.round(this.speedY) },
      isAlive: this.isAlive(),
      hasTriggeredEncounter: this.hasTriggeredBossBar,
      playerDistance: this.player ? Math.round(Math.abs(this.player.x - this.x)) : null,
      facingDirection: this.otherDirection ? "right" : "left",
      isCharging: this.isCharging,
      isRetreating: this.isRetreating,
      attackCooldownRemaining: Math.max(0, this.attackCooldown - (performance.now() - this.lastAttackTime))
    };
  }

  /** Boss sauber entfernen */
  destroy() {
    if (this.debug) {
      console.log("🐔👑 [DEBUG] ChickenBoss destroyed");
    }
    
    // Stop all intervals related to this boss
    IntervalHub.stopIntervalsByType("chickenBoss");
    IntervalHub.stopIntervalsByType(this.constructor.name);
    
    // Clear any timeouts that might reference this object
    this.isDestroyed = true;
  }
}