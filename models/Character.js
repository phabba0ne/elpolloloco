import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

import SalsaBottle from "./SalsaBottle.js";

export default class Character extends MovableObject {
  constructor({
    x = 120,
    y = 250,
    width = 120,
    height = 250,
    moveSpeed = 3,
    jumpPower = 13,
    gravity = 0.44,
    groundY = 200,
    sprites = AssetManager.PEPE_SPRITES,
    longIdleThreshold = 6,
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
      gold,
      salsas,
      type: "character",
    });

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
    this.health = 100;
    this.gold = 0; // echte Münzen
    this.displayGold = 0; // für Animation
    this.salsas = 0;
  }
  throwSalsa() {
    if (this.salsas <= 0 || !this.world) return;

    if (this.debug) console.log("[CHARACTER] Throw Salsa!");

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

  update(deltaTime, moving = false, jumpInput = false, moveDir = 0) {
    if (this.isDead) {
      if (this.stateMachine.currentState !== "dead") {
        this.stateMachine.setState("dead");
      }
      this.speedY += this.gravity * 0.075;
      this.y += this.speedY;

      this.updateStateMachine(deltaTime);
      return;
    }

    if (this.isHurt) {
      if (this.stateMachine.currentState !== "hurt") {
        this.stateMachine.setState("hurt", true);
      }
      this.updateStateMachine(deltaTime);
      return;
    }

    if (jumpInput && !this.isJumping && this.isOnGround()) {
      this.speedY = -this.jumpPower;
      this.isJumping = true;
      this.stateMachine.setState("jump");
    }

    this.speedY += this.gravity;
    this.y += this.speedY;

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

  getHitbox() {
    return {
      x: this.x + 10,
      y: this.y + 10,
      width: this.width - 20,
      height: this.height - 60,
    };
  }

  // CHARACTER DAMAGE OVERRIDE
  onDamage(source) {
    if (this.debug) console.log("[CHARACTER] Hurt by", source);
    this.isHurt = true;
    this.isInvulnerable = true;

    setTimeout(() => {
      this.isHurt = false;
    }, 300);
    setTimeout(() => {
      this.isInvulnerable = false;
    }, this.invulnerableDuration);
  }

  getDamage(source) {
    if (this.isDead || this.isInvulnerable) {
      if (this.debug) console.log("[CHARACTER] Damage blocked!");
      return;
    }
    super.getDamage(source);
  }
}
