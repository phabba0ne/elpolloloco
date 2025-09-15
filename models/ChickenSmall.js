import Chicken from "./Chicken.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class ChickenSmall extends Chicken {
  width = 50;
  height = 50;
  speedX = 40;
  strength = 20;
  y = 396;
  type = "enemy";
  constructor(x = null) {
    super(x, 396);

    // Override StateMachine für Small Chicken
    this.stateMachine = new StateMachine(
      AssetManager.CHICKENSMALL_SPRITES,
      "walk",
      12
    );

    // Jumping properties
    this.groundY = 396; // Original ground position
    this.isJumping = false;
    this.speedY = 0;
    this.gravity = 0.8; // Gravity strength
    this.jumpPower = 10; // Jump strength

    // Random jump timing
    this.lastJumpTime = 0;
    this.nextJumpDelay = this.getRandomJumpDelay();
    this.jumpChance = 0.3; // 30% chance to jump when delay is reached

    // Jump duration tracking
    this.jumpStartTime = 0;
    this.minJumpDuration = 200; // Minimum time in air (ms)

    this.loadSprites(AssetManager.CHICKENSMALL_SPRITES);
  }

  /** Get random delay between potential jumps (in seconds) */
  getRandomJumpDelay() {
    return Math.random() * 3 + 1; // 1-4 seconds
  }

  /** Check if chicken should attempt a jump */
  shouldJump(currentTime) {
    if (this.isJumping) return false;
    if (this.isDead) return false;

    const timeSinceLastJump = (currentTime - this.lastJumpTime) / 1000;

    if (timeSinceLastJump >= this.nextJumpDelay) {
      return Math.random() < this.jumpChance;
    }

    return false;
  }

  /** Initiate a jump */
  startJump(currentTime) {
    if (this.isJumping || this.isDead) return;

    this.isJumping = true;
    this.speedY = -this.jumpPower;
    this.jumpStartTime = currentTime;
    this.lastJumpTime = currentTime;
    this.nextJumpDelay = this.getRandomJumpDelay();

    // Continue playing walk animation during jump
    // (no state change needed - keep walking animation)

    console.log(
      `🐔 [ChickenSmall] Jump started! Next jump in ${this.nextJumpDelay.toFixed(
        1
      )}s`
    );
  }

  /** Update jumping physics */
  updateJumping(deltaTime, currentTime) {
    if (!this.isJumping) return;

    // Apply gravity
    this.speedY += this.gravity;

    // Update vertical position
    this.y += this.speedY * deltaTime * 60; // Scale for consistent physics

    // Check if back on ground
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;

      // Only land if minimum jump duration has passed
      const jumpDuration = currentTime - this.jumpStartTime;
      if (jumpDuration >= this.minJumpDuration) {
        this.isJumping = false;
        console.log(`🐔 [ChickenSmall] Landed after ${jumpDuration}ms`);
      }
    }
  }

  async loadSprites(sprites) {
    // Preload alle Sprites und setze Startframe
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  update(deltaTime, character) {
    const currentTime = performance.now();

    if (!this.isDead) {
      // Move horizontally (continues during jumps)
      this.x -= this.speedX * deltaTime;

      // Check for random jumping
      if (this.shouldJump(currentTime)) {
        this.startJump(currentTime);
      }

      // Update jumping physics
      this.updateJumping(deltaTime, currentTime);

      // Always keep the walking animation playing
      // (even while jumping for a bouncy effect)
      if (this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk", 12);
      }
    }

    // Call parent update (handles animation, death, collisions, etc.)
    super.update(deltaTime, character);
  }
  draw(ctx) {
    // Call parent draw method
    if (typeof super.draw === "function") {
      super.draw(ctx);
    } else {
      // Fallback drawing if parent doesn't have draw method
      if (this.img && this.img.complete && this.img.naturalWidth > 0) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      } else {
        // Fallback rectangle
        ctx.fillStyle = this.isDead ? "#666" : "#8B4513";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Simple chicken indicator
        ctx.fillStyle = this.isDead ? "#444" : "#FFD700";
        ctx.fillRect(this.x + 10, this.y + 5, 8, 8); // "beak"
      }
    }
  }

  /** Override getHitbox to account for jumping */
  getHitbox() {
    return {
      x: this.x + 2,
      y: this.y + 2,
      width: this.width - 4,
      height: this.height - 4,
    };
  }

  /** Check if chicken is on ground */
  isOnGround() {
    return this.y >= this.groundY && !this.isJumping;
  }
}
