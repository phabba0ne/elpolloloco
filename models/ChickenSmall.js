import Chicken from "./Chicken.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";
import AudioHub from "../services/AudioHub.js";

export default class ChickenSmall extends Chicken {
  width = 50;
  height = 50;
  speedX = 40;
  strength = 20;
  y = 396;
  type = "enemy";
  constructor(x = null) {
    super(x, 396);

    this.stateMachine = new StateMachine(
      AssetManager.CHICKENSMALL_SPRITES,
      "walk",
      12
    );

    this.groundY = 396;
    this.isJumping = false;
    this.speedY = 0;
    this.gravity = 0.8;
    this.jumpPower = 10;

    this.lastJumpTime = 0;
    this.nextJumpDelay = this.getRandomJumpDelay();
    this.jumpChance = 0.3;

    this.jumpStartTime = 0;
    this.minJumpDuration = 200;

    this.loadSprites(AssetManager.CHICKENSMALL_SPRITES);
  }

  getRandomJumpDelay() {
    return Math.random() * 3 + 1;
  }

  shouldJump(currentTime) {
    if (this.isJumping) return false;
    if (this.isDead) return false;

    const timeSinceLastJump = (currentTime - this.lastJumpTime) / 1000;

    if (timeSinceLastJump >= this.nextJumpDelay) {
      return Math.random() < this.jumpChance;
    }

    return false;
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;

    this.stateMachine.setState("dead", 6);

    this.AudioHub.playOne("CHICKENSMALL_SOUNDS", "dead");
  }

  startJump(currentTime) {
    if (this.isJumping || this.isDead) return;
    this.isJumping = true;
    this.speedY = -this.jumpPower;
    this.jumpStartTime = currentTime;
    this.lastJumpTime = currentTime;
    this.nextJumpDelay = this.getRandomJumpDelay();
  }

  updateJumping(deltaTime, currentTime) {
    if (!this.isJumping) return;
    this.speedY += this.gravity;

    this.y += this.speedY * deltaTime * 60;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;

      const jumpDuration = currentTime - this.jumpStartTime;
      if (jumpDuration >= this.minJumpDuration) {
        this.isJumping = false;
      }
    }
  }

  async loadSprites(sprites) {
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  update(deltaTime, character) {
    const currentTime = performance.now();

    if (!this.isDead) {
      this.x -= this.speedX * deltaTime;

      if (this.shouldJump(currentTime)) {
        this.startJump(currentTime);
      }

      this.updateJumping(deltaTime, currentTime);

      if (this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk", 12);
      }
    }

    super.update(deltaTime, character);
  }
  draw(ctx) {
    if (typeof super.draw === "function") {
      super.draw(ctx);
    } else {
      if (this.img && this.img.complete && this.img.naturalWidth > 0) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = this.isDead ? "#666" : "#8B4513";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.isDead ? "#444" : "#FFD700";
        ctx.fillRect(this.x + 10, this.y + 5, 8, 8); // "beak"
      }
    }
  }

  getHitbox() {
    return {
      x: this.x + 2,
      y: this.y + 2,
      width: this.width - 4,
      height: this.height - 4,
    };
  }

  isOnGround() {
    return this.y >= this.groundY && !this.isJumping;
  }
}
