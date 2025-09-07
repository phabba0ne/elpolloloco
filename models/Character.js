// Nur noch Character-spezifische Logik
import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Character extends MovableObject {
  constructor({
    x = 120,
    y = 250,
    width = 100,
    height = 200,
    moveSpeed = 3,
    jumpPower = 15,
    gravity = 0.5,
    groundY = 250,
    sprites = AssetManager.PEPE_SPRITES,
    longIdleThreshold = 6000,
    invulnerableDuration = 2000,
    health = 100,
    gold = 0,
    salsas = 0,
  } = {}) {
    super({
      x,
      y,
      width,
      height,
      gravity,
      health,
      type: "character",
      gold,
      salsas,
    });

    // CHARACTER-SPEZIFISCH
    this.moveSpeed = moveSpeed;
    this.jumpPower = jumpPower;
    this.groundY = groundY;
    this.isJumping = false;

    // CHARACTER DAMAGE SYSTEM
    this.isHurt = false;
    this.isInvulnerable = false;
    this.invulnerableDuration = invulnerableDuration;

    // CHARACTER IDLE SYSTEM
    this.idleTimer = 0;
    this.longIdleThreshold = longIdleThreshold;

    // StateMachine für Character
    this.stateMachine = new StateMachine(sprites, "idle", 8);
    this.loadSprites(sprites);
  }

  update(deltaTime, moving = false, jumpInput = false, moveDir = 0) {
    // Dead state
    if (this.isDead) {
      if (this.stateMachine.currentState !== "dead") {
        this.stateMachine.setState("dead");
      }
      // Gravity fall
      this.speedY += this.gravity;
      this.y += this.speedY;

      this.updateStateMachine(deltaTime);
      return;
    }

    // Hurt state - CHARACTER-SPEZIFISCH
    if (this.isHurt) {
      if (this.stateMachine.currentState !== "hurt") {
        this.stateMachine.setState("hurt", true);
      }
      this.updateStateMachine(deltaTime);
      return;
    }

    // Jumping - CHARACTER-SPEZIFISCH
    if (jumpInput && !this.isJumping && this.isOnGround()) {
      this.speedY = -this.jumpPower;
      this.isJumping = true;
      this.stateMachine.setState("jump");
    }

    // Gravity
    this.speedY += this.gravity;
    this.y += this.speedY;

    // Ground collision - CHARACTER-SPEZIFISCH
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
      if (this.isJumping) {
        this.isJumping = false;
        if (!moving) this.stateMachine.setState("idle");
      }
    }

    // Horizontal movement
    if (moving) {
      this.x += moveDir * this.moveSpeed;
      if (!this.isJumping && this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk");
      }
      this.idleTimer = 0;
    } else if (!this.isJumping) {
      // Idle system - CHARACTER-SPEZIFISCH
      this.idleTimer += deltaTime;
      if (this.idleTimer >= this.longIdleThreshold) {
        if (this.stateMachine.currentState !== "longIdle") {
          this.stateMachine.setState("longIdle");
        }
      } else if (this.stateMachine.currentState !== "idle") {
        this.stateMachine.setState("idle");
      }
    }

    this.updateStateMachine(deltaTime);
  }

  isOnGround() {
    return this.y >= this.groundY;
  }

  // CHARACTER DAMAGE OVERRIDE
  onDamage(source) {
    this.isHurt = true;
    this.isInvulnerable = true;

    // Hurt animation timer
    setTimeout(() => {
      this.isHurt = false;
    }, 300);

    // Invulnerability timer
    setTimeout(() => {
      this.isInvulnerable = false;
    }, this.invulnerableDuration);
  }

  // Override parent getDamage für Invulnerability
  getDamage(source) {
    if (this.isDead || this.isInvulnerable) {
      console.log(
        `[CHARACTER] Damage blocked - Dead: ${this.isDead}, Invulnerable: ${this.isInvulnerable}`
      );
      return;
    }
    super.getDamage(source);
  }
}
