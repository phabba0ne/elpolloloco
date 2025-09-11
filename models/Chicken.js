// Enhanced Chicken with advanced behaviors
import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Chicken extends MovableObject {
  constructor({
    x = null,
    y = 100,
    width = 100,
    height = 100,
    speedX = 60,
    strength = 20,
    sprites = AssetManager.CHICKEN_SPRITES,
    type = "enemy",
  } = {}) {
    super({
      x: x ?? 700 + Math.random() * 1500,
      y: 345,
      width,
      height,
      speedX,
      strength,
      type,
    });

    // StateMachine für Chicken
    this.stateMachine = new StateMachine(sprites, "walk", 6);
    
    // Direction and turning properties
    this.movingLeft = true;
    this.otherDirection = false;
    
    // Enhanced turning behavior
    this.lastTurnTime = 0;
    this.nextTurnDelay = this.getRandomTurnDelay();
    this.turnChance = 0.45; // Increased from 0.4
    this.minTurnDelay = 1.0; // Reduced from 1.5 for more frequent turns
    this.maxTurnDelay = 4.0; // Reduced from 5.0
    
    // Movement bounds
    this.initialX = this.x;
    this.maxDistanceFromStart = 1000; // Increased roaming area
    this.worldBounds = { left: -200, right: 3000 };
    
    // Wandering properties
    this.isWandering = true;
    this.turnCooldown = 0;
    this.minCooldown = 0.3; // Reduced from 0.5
    
    // NEW: Player awareness system
    this.playerDetectionRange = 150;
    this.isAwareOfPlayer = false;
    this.lastPlayerPosition = null;
    this.panicMode = false;
    this.panicDuration = 3000; // 3 seconds
    this.panicStartTime = 0;
    
    // NEW: Jumping ability
    this.canJump = Math.random() > 0.5; // 50% of chickens can jump
    this.isJumping = false;
    this.speedY = 0;
    this.gravity = 0.9;
    this.jumpPower = 6;
    this.groundY = this.y;
    this.jumpChance = 0.15; // 15% chance per turn to jump
    
    // NEW: Behavioral states
    this.behaviorState = 'wandering'; // 'wandering', 'curious', 'fleeing', 'panic'
    this.stateChangeTime = 0;
    this.minStateTime = 2000; // Minimum time in a state
    
    // NEW: Speed variations
    this.baseSpeedX = speedX;
    this.speedMultiplier = 1.0;
    this.maxSpeedMultiplier = 2.5;
    this.minSpeedMultiplier = 0.5;
    
    // NEW: Clucking system
    this.lastCluckTime = 0;
    this.cluckCooldown = 3000 + Math.random() * 5000; // 3-8 seconds
    
    // NEW: Group behavior (for future flocking)
    this.nearbyChickens = [];
    this.personalSpace = 80;
    this.flockTendency = 0.3;
    
    this.loadSprites(sprites);
    
    console.log(`🐔 [Chicken] Enhanced chicken spawned at ${Math.round(this.x)} - Can jump: ${this.canJump}`);
  }

  getRandomTurnDelay() {
    return Math.random() * (this.maxTurnDelay - this.minTurnDelay) + this.minTurnDelay;
  }

  /** NEW: Detect nearby player */
  detectPlayer(character) {
    if (!character || character.isDead) {
      this.isAwareOfPlayer = false;
      return;
    }
    
    const distance = Math.abs(character.x - this.x);
    const wasAware = this.isAwareOfPlayer;
    this.isAwareOfPlayer = distance <= this.playerDetectionRange;
    
    if (this.isAwareOfPlayer) {
      this.lastPlayerPosition = { x: character.x, y: character.y };
      
      // First time spotting player - chance to enter curious or flee state
      if (!wasAware && Math.random() > 0.6) {
        this.enterCuriousMode();
      } else if (!wasAware && Math.random() > 0.3) {
        this.enterFleeingMode();
      }
    }
  }

  /** NEW: Enter curious mode - chicken approaches player */
  enterCuriousMode() {
    if (this.behaviorState === 'curious') return;
    
    this.behaviorState = 'curious';
    this.stateChangeTime = performance.now();
    this.speedMultiplier = 0.7; // Move slower when curious
    this.cluck();
    
    console.log(`🐔 [Chicken] Entered curious mode at ${Math.round(this.x)}`);
  }

  /** NEW: Enter fleeing mode - chicken runs from player */
  enterFleeingMode() {
    if (this.behaviorState === 'fleeing' || this.behaviorState === 'panic') return;
    
    this.behaviorState = 'fleeing';
    this.stateChangeTime = performance.now();
    this.speedMultiplier = 1.8; // Move faster when fleeing
    
    // Face away from player
    if (this.lastPlayerPosition) {
      this.movingLeft = this.x > this.lastPlayerPosition.x;
      this.otherDirection = !this.movingLeft;
    }
    
    this.cluck();
    console.log(`🐔 [Chicken] Entered fleeing mode at ${Math.round(this.x)}`);
  }

  /** NEW: Enter panic mode - chicken moves erratically */
  enterPanicMode() {
    this.behaviorState = 'panic';
    this.panicMode = true;
    this.panicStartTime = performance.now();
    this.stateChangeTime = this.panicStartTime;
    this.speedMultiplier = 2.2;
    this.turnChance = 0.8; // Very likely to turn randomly
    this.minTurnDelay = 0.2;
    this.maxTurnDelay = 0.8;
    
    this.cluck();
    console.log(`🐔 [Chicken] PANIC MODE at ${Math.round(this.x)}!`);
  }

  /** NEW: Return to wandering state */
  returnToWandering() {
    this.behaviorState = 'wandering';
    this.panicMode = false;
    this.speedMultiplier = 1.0;
    this.turnChance = 0.45;
    this.minTurnDelay = 1.0;
    this.maxTurnDelay = 4.0;
    this.stateChangeTime = performance.now();
    
    console.log(`🐔 [Chicken] Returned to wandering at ${Math.round(this.x)}`);
  }

  /** NEW: Clucking behavior */
  cluck() {
    const now = performance.now();
    if (now - this.lastCluckTime > this.cluckCooldown) {
      this.lastCluckTime = now;
      this.cluckCooldown = 1000 + Math.random() * 4000; // 1-5 seconds
      
      // Visual cluck indicator (you could add sound here)
      console.log(`🐔 [Chicken] *CLUCK* at ${Math.round(this.x)}`);
    }
  }

  /** NEW: Enhanced jumping behavior */
  attemptJump() {
    if (!this.canJump || this.isJumping || this.isDead) return false;
    
    const shouldJump = Math.random() < this.jumpChance;
    if (shouldJump) {
      this.isJumping = true;
      this.speedY = -this.jumpPower;
      this.cluck(); // Cluck when jumping
      
      console.log(`🐔 [Chicken] Jump! at ${Math.round(this.x)}`);
      return true;
    }
    return false;
  }

  /** NEW: Update jumping physics */
  updateJumping(deltaTime) {
    if (!this.isJumping) return;
    
    this.speedY += this.gravity;
    this.y += this.speedY * deltaTime * 60;
    
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
      this.isJumping = false;
    }
  }

  /** NEW: Behavioral state management */
  updateBehaviorState(character) {
    const now = performance.now();
    const timeInState = now - this.stateChangeTime;
    
    // Handle panic mode timeout
    if (this.panicMode && now - this.panicStartTime > this.panicDuration) {
      this.returnToWandering();
      return;
    }
    
    // Don't change states too quickly
    if (timeInState < this.minStateTime) return;
    
    switch (this.behaviorState) {
      case 'curious':
        // Return to wandering if player moves away or after some time
        if (!this.isAwareOfPlayer || timeInState > 8000) {
          this.returnToWandering();
        }
        break;
        
      case 'fleeing':
        // Return to wandering if player moves away or after fleeing for a while
        if (!this.isAwareOfPlayer || timeInState > 6000) {
          this.returnToWandering();
        }
        break;
        
      case 'wandering':
        // Randomly cluck while wandering
        if (Math.random() < 0.001) { // Low chance per frame
          this.cluck();
        }
        break;
    }
  }

  /** Enhanced turning logic with behavioral consideration */
  shouldTurn(currentTime) {
    if (!this.isWandering || this.isDead) return false;

    const timeSinceLastTurn = (currentTime - this.lastTurnTime) / 1000;

    if (this.turnCooldown > 0) return false;

    // Behavioral modifications
    let modifiedTurnChance = 0.1; // viel niedriger als vorher

    switch (this.behaviorState) {
        case 'curious':
        case 'fleeing':
            // Wenn Chicken Pepe verfolgt oder ausweicht, fast nie zufällig drehen
            modifiedTurnChance = 0.02;
            break;
        case 'panic':
            modifiedTurnChance = 0.5; // erratisch im Panik-Modus
            break;
    }

    // Boundary check unverändert
    if (this.x <= this.worldBounds.left && this.movingLeft) return true;
    if (this.x >= this.worldBounds.right && !this.movingLeft) return true;

    // Abstand vom Spawn
    const distanceFromStart = Math.abs(this.x - this.initialX);
    if (distanceFromStart > this.maxDistanceFromStart) return true;

    // Zufällige Drehung seltener
    if (timeSinceLastTurn >= this.nextTurnDelay) {
        return Math.random() < modifiedTurnChance;
    }

    return false;
}

  executeTurn(currentTime) {
    if (this.turnCooldown > 0) return;
    
    this.movingLeft = !this.movingLeft;
    this.otherDirection = !this.otherDirection;
    
    this.lastTurnTime = currentTime;
    this.nextTurnDelay = this.getRandomTurnDelay();
    this.turnCooldown = this.minCooldown;
    
    // Enhanced speed variation based on state
    let baseVariation = 0.8 + Math.random() * 0.4;
    this.currentSpeedX = this.baseSpeedX * baseVariation * this.speedMultiplier;
    
    // Chance to jump when turning
    if (this.canJump && !this.isJumping) {
      this.attemptJump();
    }
    
    console.log(`🐔 [Chicken] Turned ${this.movingLeft ? 'LEFT' : 'RIGHT'} (${this.behaviorState}) at ${Math.round(this.x)}`);
  }

  updateTurning(deltaTime, currentTime) {
    if (this.turnCooldown > 0) {
      this.turnCooldown -= deltaTime;
    }
    
    if (this.shouldTurn(currentTime)) {
      this.executeTurn(currentTime);
    }
  }

updateMovement(deltaTime, character) {
    if (this.isDead) return;

    let targetSpeed = this.baseSpeedX * this.speedMultiplier;

    // Pepe in Sichtweite → folgen oder fliehen
    if (this.isAwareOfPlayer && character) {
        if (this.behaviorState === 'curious') {
            this.movingLeft = this.x > character.x;
        } else if (this.behaviorState === 'fleeing') {
            this.movingLeft = this.x < character.x; // weglaufen
        }
    }

    if (this.movingLeft) {
        this.x -= targetSpeed * deltaTime;
    } else {
        this.x += targetSpeed * deltaTime;
    }

    // Gelegentliche Sprünge beim Folgen oder Fleeing
    if (this.canJump && !this.isJumping && Math.random() < 0.01) {
        this.attemptJump();
    }

    // Begrenzung innerhalb WorldBounds
    if (this.x < this.worldBounds.left) this.x = this.worldBounds.left;
    if (this.x > this.worldBounds.right) this.x = this.worldBounds.right;
}


  /** Enhanced stomp check with panic reaction */
  checkStomp(character) {
    const characterFeet = character.y + character.height;
    const chickenHead = this.y + 10;
    const horizontalOverlap =
      character.x + character.width >= this.x &&
      character.x <= this.x + this.width;

    if (
      characterFeet >= this.y &&
      characterFeet <= chickenHead &&
      horizontalOverlap &&
      character.speedY > 0
    ) {
      this.die();
      character.speedY = -character.jumpPower * 1;
      console.log(`[${this.type.toUpperCase()}] Stomped by Pepe!`);
    } else if (horizontalOverlap && Math.abs(character.y - this.y) < 50) {
      // Close call - enter panic mode
      if (Math.random() > 0.7) {
        this.enterPanicMode();
      }
    }
  }

  update(deltaTime, character) {
    const currentTime = performance.now();
    
    if (!this.isDead) {
      // Player detection and behavior
      this.detectPlayer(character);
      this.updateBehaviorState(character);
      
      // Movement and turning
      this.updateTurning(deltaTime, currentTime);
      this.updateMovement(deltaTime);
      
      // Jumping physics
      this.updateJumping(deltaTime);
      
      // Combat
      if (character && !character.isDead) {
        this.checkStomp(character);
      }
    }
    
    this.updateStateMachine(deltaTime);
  }

  /** Enhanced debug information */
  getChickenInfo() {
    return {
      position: { x: Math.round(this.x), y: Math.round(this.y) },
      direction: this.movingLeft ? 'LEFT' : 'RIGHT',
      behaviorState: this.behaviorState,
      isAwareOfPlayer: this.isAwareOfPlayer,
      canJump: this.canJump,
      isJumping: this.isJumping,
      speedMultiplier: Math.round(this.speedMultiplier * 100) / 100,
      nextTurnIn: Math.max(0, this.nextTurnDelay - (performance.now() - this.lastTurnTime) / 1000),
      distanceFromStart: Math.round(Math.abs(this.x - this.initialX)),
      isDead: this.isDead,
      state: this.stateMachine?.currentState || 'unknown'
    };
  }

  /** Enhanced drawing with behavioral indicators */
  draw(ctx) {
    if (typeof super.draw === 'function') {
      super.draw(ctx);
    } else {
      if (this.img && this.img.complete && this.img.naturalWidth > 0) {
        ctx.save();
        
        if (!this.movingLeft) {
          ctx.translate(this.x + this.width, this.y);
          ctx.scale(-1, 1);
          ctx.drawImage(this.img, 0, 0, this.width, this.height);
        } else {
          ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
      } else {
        // Enhanced fallback with behavior colors
        let fillColor = '#8B4513';
        switch (this.behaviorState) {
          case 'curious': fillColor = '#4169E1'; break; // Blue
          case 'fleeing': fillColor = '#FFA500'; break; // Orange
          case 'panic': fillColor = '#FF4500'; break; // Red-orange
        }
        
        ctx.fillStyle = this.isDead ? '#666' : fillColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        const beakX = this.movingLeft ? this.x + 10 : this.x + this.width - 18;
        ctx.fillStyle = this.isDead ? '#444' : '#FFD700';
        ctx.fillRect(beakX, this.y + 5, 8, 8);
      }
    }
    
    // Enhanced debug indicators
    if (this.debug && !this.isDead) {
      ctx.fillStyle = 'lime';
      ctx.font = '12px Arial';
      const arrow = this.movingLeft ? '←' : '→';
      ctx.fillText(arrow, this.x + this.width/2 - 6, this.y - 5);
      
      // Behavior state indicator
      ctx.fillStyle = 'cyan';
      ctx.font = '8px Arial';
      ctx.fillText(this.behaviorState.toUpperCase(), this.x, this.y - 15);
      
      // Jump indicator
      if (this.canJump && this.isJumping) {
        ctx.fillStyle = 'yellow';
        ctx.fillText('JUMP', this.x, this.y - 25);
      }
      
      // Player awareness indicator
      if (this.isAwareOfPlayer) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.playerDetectionRange, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Enhanced methods for external control
  stopWandering() {
    this.isWandering = false;
    this.behaviorState = 'idle';
  }

  startWandering() {
    this.isWandering = true;
    this.returnToWandering();
  }

  setWorldBounds(left, right) {
    this.worldBounds = { left, right };
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.isWandering = false;
    this.panicMode = false;
    this.behaviorState = 'dead';
    this.stateMachine.setState("dead", 6);
    console.log(`🐔 [Chicken] Enhanced chicken died at ${Math.round(this.x)} in ${this.behaviorState} state`);
  }
}