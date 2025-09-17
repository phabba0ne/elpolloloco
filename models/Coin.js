import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

/**
 * Collectable Coin object
 */
export default class Coin extends MovableObject {
  /**
   * @param {object} options
   * @param {number} [options.x=0] - X position
   * @param {number} [options.y=250] - Y position
   * @param {number} [options.width=100] - Width of the coin
   * @param {number} [options.height=100] - Height of the coin
   * @param {boolean} [options.enabled=true] - Whether coin is active
   */
  constructor({ x = 0, y = 250, width = 100, height = 100, enabled = true } = {}) {
    super({ x, y, width, height, type: "coin" });

    this.enabled = enabled;
    this.collected = false;

    this.sprites = { idle: AssetManager.COIN_SPRITES.idle };
    this.stateMachine = new StateMachine(this.sprites, "idle", 3);
    this.loadSprites(this.sprites);
  }

  /**
   * Load coin animation sprites
   */
  async loadSprites(sprites) {
    if (!sprites?.idle) return;
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  /**
   * Attempt to collect coin
   * @param {Character} character
   * @returns {boolean} whether collected
   */
  tryCollect(character) {
    if (!this.enabled || this.collected) return false;

    if (this.checkCollisions([character])) {
      this.collect(character);
      this.AudioHub.playOne("COIN_SOUNDS", "collect");
      return true;
    }
    return false;
  }

  /**
   * Handle coin collection
   */
  collect(character) {
    this.collected = true;
    character.gold = (character.gold || 0) + 1;

    if (this.world?.events) {
      this.world.events.emit("coin:collected", { character, coin: this });
    }
  }

  /**
   * Update coin animation
   */
  update(deltaTime, world) {
    if (!this.enabled || this.collected || !world?.character) return;

    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  /**
   * Draw coin
   */
  draw(ctx) {
    if (!this.enabled || this.collected) return;

    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}