import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";
import AudioHub from "../services/AudioHub.js";
import SalsaBottle from "./SalsaBottle.js";

/**
 * Main player character (Pepe)
 */
export default class Character extends MovableObject {
  /**
   * @param {Object} config - Character configuration
   */
  constructor({
    x = 120, y = 250, width = 120, height = 250, moveSpeed = 3,
    jumpPower = 13, gravity = 0.44, groundY = 200,
    sprites = AssetManager.PEPE_SPRITES, longIdleThreshold = 6,
    invulnerableDuration = 2000, health = 100,
    gold = 0, salsas = 0, walkSound,
  } = {}) {
    super({ x, y, width, height, gravity, health, gold, salsas, type: "character", walkSound });
    this.moveSpeed = moveSpeed;
    this.jumpPower = jumpPower;
    this.groundY = groundY;
    this.isJumping = false;
    this.isHurt = false;
    this.isInvulnerable = false;
    this.invulnerableDuration = invulnerableDuration;
    this.idleTimer = 1;
    this.longIdleThreshold = longIdleThreshold;
    this.stateMachine = new StateMachine(sprites, "idle", 10);
    this.loadSprites(sprites);
    this.health = health;
    this.gold = gold;
    this.displayGold = 0;
    this.salsas = salsas;
  }

  /**
   * Throw a salsa bottle if available
   */
  throwSalsa() {
    if (this.salsas <= 0 || !this.world) return;
    this.AudioHub.playOne("AMBIENT", "throwItem");
    this.salsas--;
    this.world.updateCharacterStats();
    const salsa = new SalsaBottle({
      x: this.otherDirection ? this.x - 20 : this.x + this.width,
      y: this.y + this.height / 2 - 20,
      direction: this.otherDirection,
      thrown: true,
      collectable: false,
    });
    this.world.addMovableObject(salsa);
  }

  /**
   * Update character state
   * @param {number} deltaTime
   * @param {boolean} moving
   * @param {boolean} jumpInput
   * @param {number} moveDir
   */
  async update(deltaTime, moving = false, jumpInput = false, moveDir = 0) {
    if (this.isDead) return this.handleDeath(deltaTime);
    if (this.isHurt) return this.handleHurt(deltaTime);
    if (jumpInput && !this.isJumping && this.isOnGround()) this.jump();
    this.applyGravity();
    this.handleGroundCollision(moving);
    moving ? this.move(moveDir) : this.handleIdle(deltaTime);
    this.updateStateMachine(deltaTime);
  }

  /**
   * Handle character death state
   */
  handleDeath(deltaTime) {
    if (this.stateMachine.currentState !== "dead") {
      this.stateMachine.setState("dead");
      this.AudioHub.stopOne("PEPE_SOUNDS", "walk");
      this.AudioHub.playOne("PEPE_SOUNDS", "dead");
      if (window.showGameOver) window.showGameOver();
    }
    this.speedY += this.gravity * 0.075;
    this.y += this.speedY;
    this.updateStateMachine(deltaTime);
  }

  /**
   * Handle hurt state
   */
  handleHurt(deltaTime) {
    if (this.stateMachine.currentState !== "hurt") {
      this.stateMachine.setState("hurt", true);
      this.AudioHub.playOne("PEPE_SOUNDS", "hurt");
    }
    this.updateStateMachine(deltaTime);
  }

  /**
   * Perform jump
   */
  jump() {
    this.speedY = -this.jumpPower;
    this.isJumping = true;
    this.stateMachine.setState("jump");
    this.AudioHub.playOne("AMBIENT", "cartoonJump");
  }

  /**
   * Apply gravity effect
   */
  applyGravity() {
    this.speedY += this.gravity;
    this.y += this.speedY;
  }

  /**
   * Handle collision with ground
   */
  handleGroundCollision(moving) {
    if (this.y < this.groundY) return;
    this.y = this.groundY;
    this.speedY = 0;
    if (this.isJumping) {
      this.isJumping = false;
      if (!moving) this.stateMachine.setState("idle");
    }
  }

  /**
   * Move character
   */
  move(moveDir) {
    this.x += moveDir * this.moveSpeed;
    if (!this.isJumping) {
      if (this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk");
        AudioHub.playOne("PEPE_SOUNDS", "walk");
      }
    } else {
      AudioHub.stopOne("PEPE_SOUNDS", "walk");
    }
    this.idleTimer = 0;
  }

  /**
   * Handle idle states
   */
  handleIdle(deltaTime) {
    AudioHub.stopOne("PEPE_SOUNDS", "walk");
    this.idleTimer += deltaTime;
    if (this.idleTimer >= this.longIdleThreshold) {
      if (this.stateMachine.currentState !== "longIdle") {
        this.stateMachine.setState("longIdle");
        AudioHub.playOne("PEPE_SOUNDS", "longIdle");
      }
    } else if (this.stateMachine.currentState !== "idle") {
      this.stateMachine.setState("idle");
    }
  }

  /**
   * Check if character is on ground
   */
  isOnGround() {
    return this.y >= this.groundY;
  }

  /**
   * Get collision hitbox
   */
  getHitbox() {
    return { x: this.x + 10, y: this.y + 10, width: this.width - 20, height: this.height - 60 };
  }

  /**
   * Handle damage animation and invulnerability
   */
  async onDamage() {
    this.AudioHub.playOne("PEPE_SOUNDS", "hurt");
    this.isHurt = true;
    this.isInvulnerable = true;
    setTimeout(() => { this.isHurt = false; }, 300);
    setTimeout(() => { this.isInvulnerable = false; }, this.invulnerableDuration);
  }

  /**
   * Receive damage if possible
   */
  getDamage(source) {
    if (this.isDead || this.isInvulnerable) return;
    super.getDamage(source);
  }

  /**
   * Destroy character and cleanup
   */
  destroy() {
    IntervalHub.stopIntervalsByType("character");
    IntervalHub.stopIntervalsByType(this.constructor.name);
    this.isDestroyed = true;
  }
}