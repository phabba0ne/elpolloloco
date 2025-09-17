import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

/**
 * Enemy chicken object
 */
export default class Chicken extends MovableObject {
  /**
   * @param {Object} config - Chicken configuration
   */
  constructor({
    x, y, width = 80, height = 80, speedX = 70,
    sprites = AssetManager.CHICKEN_SPRITES, type = "enemy",
  } = {}) {
    super({ x, y, width, height, speedX, type });
    this.stateMachine = new StateMachine(sprites, "walk", 6);
    this.movingLeft = true;
    this.otherDirection = false;
    this.worldBounds = { left: -200, right: 3000 };
    this.isDead = false;
    this.loadSprites(sprites);
  }

  /**
   * Preload sprite images
   */
  loadSprites(sprites) {
    if (!sprites) return;
    Object.values(sprites).flat().forEach(img => AssetManager.getImage(img));
  }

  /**
   * Update chicken state
   */
  update(deltaTime, character) {
    if (this.isDead) return;
    const moveDir = this.movingLeft ? -1 : 1;
    this.x += moveDir * this.speedX * deltaTime;
    if (this.x < this.worldBounds.left) this.movingLeft = false;
    if (this.x > this.worldBounds.right) this.movingLeft = true;
    if (character) this.handleCollision(character);
    this.stateMachine.update(deltaTime);
    this.img = this.stateMachine.getFrame();
  }

  /**
   * Handle collision with character
   */
  handleCollision(character) {
    const feet = character.y + character.height;
    const head = this.y;
    const overlapX = character.x + character.width > this.x &&
                     character.x < this.x + this.width;
    const overlapY = character.y + character.height > this.y &&
                     character.y < this.y + this.height;
    if (!(overlapX && overlapY)) return;
    const stompMargin = this.height * 0.25;
    const isStomp = feet <= head + stompMargin && character.speedY > 0;
    isStomp ? this.stomp(character) : character.getDamage(this);
  }

  /**
   * Kill chicken when stomped
   */
  stomp(character) {
    this.die();
    character.speedY = -character.jumpPower * 0.6;
    if (!this.world) return;
    this.world.stompCombo++;
    this.world.stompTimer = this.world.stompDisplayDuration;
    this.world.stompX = this.x + this.width / 2;
    this.world.stompY = this.y;
  }

  /**
   * Trigger death sequence
   */
  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stateMachine.setState("dead", 6);
    import("../services/AudioHub.js").then(({ default: AudioHub }) =>
      AudioHub.playOne("CHICKEN_SOUNDS", "dead")
    );
  }

  /**
   * Draw chicken on canvas
   */
  draw(ctx) {
    if (!this.img) {
      ctx.fillStyle = this.isDead ? "#666" : "#8B4513";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }
    ctx.save();
    if (!this.movingLeft) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }
}