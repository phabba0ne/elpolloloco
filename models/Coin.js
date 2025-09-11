import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Coin extends MovableObject {
  width = 100;
  height = 100;
  collected = false;

  constructor({ x = 0, y = 250, enabled = true, debug = false } = {}) {
    super();
    this.type = "coin";
    this.x = x;
    this.y = y;
    this.enabled = enabled;
    this.debug = debug;

    // Animation
    const sprites = { idle: AssetManager.COIN_SPRITES.idle };
    this.stateMachine = new StateMachine(sprites, "idle", 3);
    this.loadSprites(sprites);
  }

  async loadSprites(sprites) {
    if (!sprites?.idle) return;
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  update(deltaTime, world) {
    if (!this.enabled || this.collected || !world?.character) return;

    // Kollision mit Character prüfen
    if (this.checkCollisions([world.character], deltaTime)) {
      this.collect(world.character);
    }

    // Animation
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  collect(character) {
    this.collected = true;
    character.gold = (character.gold || 0) + 1;
  }

  draw(ctx) {
    if (!this.enabled || this.collected) return;

    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    if (this.debug) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }
}