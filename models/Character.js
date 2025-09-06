import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Character extends MovableObject {
  // --- Standardwerte ---
  x = 120;
  y = 250;
  width = 100;
  height = 200;
  speedX = 0;
  speedY = 0;
  moveSpeed = 3;
  jumpPower = 12;
  gravity = 0.7;
  groundY = 250;
  isJumping = false;
  constructor({
    x = 120,
    y = 250,
    width = 100,
    height = 200,
    moveSpeed = 3,
    jumpPower = 12,
    gravity = 0.7,
    groundY = 250,
    sprites = AssetManager.PEPE_SPRITES,
    longIdleThreshold = 6000, // ms bis zur "longIdle"-Animation
    invulnerableDuration = 2000, // ms nach Schaden unverwundbar
  } = {}) {
    super();
    this.type = "character"; // ✅ wichtig
    // Position und Größen
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Bewegung & Physik
    this.moveSpeed = moveSpeed;
    this.jumpPower = jumpPower;
    this.gravity = gravity;
    this.groundY = groundY;

    // StateMachine
    this.stateMachine = new StateMachine(sprites, "idle", 10);
    this.loadSprites(sprites);

    // Animation / Idle-Timer
    this.frameTimer = 0;
    this.frameInterval = 60;
    this.idleTimer = 0;
    this.longIdleThreshold = longIdleThreshold;

    // Damage / Invulnerability
    this.isHurt = false;
    this.isInvulnerable = false;
    this.invulnerableDuration = invulnerableDuration;
  }

  update(deltaTime, moving = false, jumpInput = false, moveDir = 0) {
    // --- Dead Animation + Fall ---
    if (this.isDead) {
      if (this.stateMachine.currentState !== "dead") {
        console.log("[STATE] Character died. Switching to dead animation.");
        this.stateMachine.setState("dead");
        this.stateMachine.currentFrame = 0;
      }

      // Apply gravity so he falls off the screen
      this.speedY += this.gravity;
      this.y += this.speedY;

      this.stateMachine.update(deltaTime);
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;

      return; // stop movement logic
    }

    // --- Hurt Animation ---
    if (this.isHurt) {
      if (this.stateMachine.currentState !== "hurt") {
        console.log("[STATE] Character hurt. Switching to hurt animation.");
        this.stateMachine.setState("hurt", true); // einmalig
      }
      this.stateMachine.update(deltaTime);
      this.img = this.stateMachine.getFrame();
      return;
    }

    // --- Jumping ---
    if (jumpInput && !this.isJumping && this.isOnGround()) {
      this.speedY = -this.jumpPower;
      this.isJumping = true;
      console.log("[ACTION] Character starts jumping.");
      this.stateMachine.setState("jump");
    }

    // --- Gravity ---
    this.speedY += this.gravity;
    this.y += this.speedY;
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
      if (this.isJumping) {
        this.isJumping = false;
        console.log("[ACTION] Character landed.");
        if (!moving) this.stateMachine.setState("idle");
      }
    }

    // --- Horizontal movement ---
    if (moving) {
      this.x += moveDir * this.moveSpeed;
      if (!this.isJumping && this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk");
        console.log("[STATE] Character walking.");
      }
      this.idleTimer = 0;
    } else if (!this.isJumping) {
      this.idleTimer += deltaTime;
      if (this.idleTimer >= this.longIdleThreshold) {
        if (this.stateMachine.currentState !== "longIdle") {
          this.stateMachine.setState("longIdle");
          console.log("[STATE] Character long idle.");
        }
      } else if (this.stateMachine.currentState !== "idle") {
        this.stateMachine.setState("idle");
        console.log("[STATE] Character idle.");
      }
    }

    // --- Animation ---
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  isOnGround() {
    return this.y >= this.groundY;
  }

  // --- Damage / Hurt Handling mit Logs ---
  getDamage(source) {
    if (this.isDead) {
      console.log(`[LOG] Character is already dead. No damage applied.`);
      return;
    }
    if (this.isInvulnerable) {
      console.log(
        `[LOG] Character is invulnerable. No damage taken from ${source.constructor.name}.`
      );
      return;
    }

    this.health -= source.strength;
    console.log(
      `[LOG] Character took ${source.strength} damage from ${source.constructor.name}. Health: ${this.health}`
    );

    this.isHurt = true;
    this.isInvulnerable = true;
    console.log(`[FLAG] isHurt: true, isInvulnerable: true`);

    // Hurt Animation kurz anzeigen
    setTimeout(() => {
      this.isHurt = false;
      console.log(`[FLAG] Hurt animation ended. isHurt: false`);
    }, 300);

    // 2 Sekunden Unverwundbarkeit
    setTimeout(() => {
      this.isInvulnerable = false;
      console.log(
        `[FLAG] Character is now vulnerable again. isInvulnerable: false`
      );
    }, this.invulnerableDuration);

    if (this.health <= 0) this.die();
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stateMachine.setState("dead", true);
    console.log(
      `[STATE] Character died. isDead: true, switching to dead animation.`
    );
  }
}
