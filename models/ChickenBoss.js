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
    strength = 20,
    sprites = AssetManager.CHICKENBOSS_SPRITES,
    debug = true, // DEBUG AKTIVIERT
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
    this.active = false;
    this.speedX = 0;
    this.speedY = 0;
    this.moveSpeed = 40; // Basis Geschwindigkeit
    
    // BEHAVIOR STATES
    this.currentBehavior = "sleeping";
    this.behaviorTimer = 0;
    this.lastAttackTime = 0;
    this.attackCooldown = 3000;
    
    // VISUAL EFFECTS
    this.isFlashing = false;
    this.screenShake = { active: false, intensity: 0, duration: 0 };
    
    // ✅ DEBUG COUNTERS
    this.debugCounters = {
      updateCalls: 0,
      movementUpdates: 0,
      behaviorChanges: 0,
      intervalCalls: 0
    };

    // StateMachine setup
    this.stateMachine = new StateMachine(sprites, "alert", 3);
    
    // ✅ SIMPLIFIED INIT - erst Sprites, dann Animationen
    this.initBoss();
  }

  async initBoss() {
    try {
      await this.loadSprites(AssetManager.CHICKENBOSS_SPRITES);
    } catch (error) {
      console.error("🐔👑 [ERROR] Boss init failed:", error);
    }
  }

  // ✅ VEREINFACHTE MOVEMENT LOGIC
  updateSimpleMovement() {
    if (!this.player) return;
    
    const distanceToPlayer = Math.abs(this.player.x - this.x);
    const direction = Math.sign(this.player.x - this.x);
    
    // ✅ DIRECT SPEED SETTING
    this.speedX = direction * this.moveSpeed;
    this.otherDirection = direction > 0;
    
    // ✅ DEBUG LOG
    if (this.debug && this.debugCounters.movementUpdates % 30 === 0) {
      console.log("🐔👑 [DEBUG] Movement:", {
        playerX: this.player.x,
        bossX: this.x,
        distance: distanceToPlayer,
        direction: direction,
        speedX: this.speedX,
        otherDirection: this.otherDirection
      });
    }
    
    this.debugCounters.movementUpdates++;
    
    // ✅ ANIMATION STATES
    if (distanceToPlayer > 50) {
      this.setState("walk", 4);
    } else {
      this.setState("attack", 6);
      this.speedX = 0; // Stop bei Angriff
    }
  }

  // ✅ ENHANCED UPDATE mit Debug
  update(deltaTime) {
    this.debugCounters.updateCalls++;
    
    // ✅ DEBUG LOG alle 60 Updates (1 Sekunde bei 60 FPS)
    if (this.debug && this.debugCounters.updateCalls % 60 === 0) {
      console.log("🐔👑 [DEBUG] Update Stats:", {
        updateCalls: this.debugCounters.updateCalls,
        position: { x: this.x, y: this.y },
        speedX: this.speedX,
        speedY: this.speedY,
        active: this.active,
        behavior: this.currentBehavior,
        isDead: this.isDead,
        hasPlayer: !!this.player,
        hasImg: !!this.img
      });
    }

    // ✅ SPRITE CHECK
    if (!this.img) {
      if (this.debug) console.log("🐔👑 [DEBUG] No sprite loaded yet");
      return;
    }

    // ✅ MOVEMENT APPLICATION
    if (this.speedX !== 0) {
      const oldX = this.x;
      this.x += this.speedX * deltaTime;
      
      // ✅ BOUNDARY CHECK
      if (this.x < 0) this.x = 0;
      if (this.x > 1200) this.x = 1200;
      
      // ✅ DEBUG MOVEMENT
      if (this.debug && Math.abs(oldX - this.x) > 0.1) {
        console.log("🐔👑 [DEBUG] Position changed:", oldX, "→", this.x, "Speed:", this.speedX);
      }
    }

    // ✅ SUPER UPDATE
    super.update(deltaTime);
    
    // ✅ STATEMACHINE UPDATE
    if (this.stateMachine) {
      this.stateMachine.update(deltaTime);
      this.img = this.stateMachine.getFrame();
    }
  }

  // ✅ SIMPLIFIED DAMAGE für Debug
  getDamage(source) {
    console.log("🐔👑 [DEBUG] Boss taking damage from:", source.type);
    super.getDamage(source);
    
    if (!this.isDead) {
      this.setState("hurt", 8);
      // Flash effect
      this.isFlashing = true;
      setTimeout(() => this.isFlashing = false, 500);
    }
  }

  // ✅ SIMPLIFIED DEATH
  die() {
    console.log("🐔👑 [DEBUG] 💀 BOSS DYING!");
    super.die();
    this.setState("die", 2);
    this.speedX = 0;
    this.currentBehavior = "dead";
  }

  // ORIGINAL METHODS für Kompatibilität
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

  walk() {
    this.setState("walk", 3);
  }

  attack() {
    this.setState("attack", 4);
  }

  alert() {
    this.setState("alert", 3);
  }

  // ✅ CLEANUP
  destroy() {
    console.log("🐔👑 [DEBUG] 🧹 Destroying boss...");
    IntervalHub.stopAllIntervals();
  }
}

// ✅ GLOBAL DEBUG HELPER
window.debugChickenBoss = function(boss) {
  console.log("🐔👑 [DEBUG] === BOSS DEBUG INFO ===");
  console.log(boss.getDebugInfo());
  
  console.log("\n🔧 Available Commands:");
  console.log("boss.forceActivate() - Force activate boss");
  console.log("boss.testMovement() - Test movement for 1 second");
  console.log("boss.setPlayer(character) - Set player reference");
  console.log("boss.getDebugInfo() - Get full debug info");
};