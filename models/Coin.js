import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";

export default class Coin extends MovableObject {
  width = 50;
  height = 50;
  collected = false;

  constructor({ x = 0, y = 0, enabled = true, debug = false } = {}) {
    super({ debug });
    this.type = "coin";
    this.x = x;
    this.y = y;
    this.enabled = enabled;

    this.sprites = { idle: AssetManager.COIN_SPRITES.idle };
    this.loadSprites(this.sprites);
  }

  async loadSprites(sprites) {
    if (!sprites?.idle) return;
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = AssetManager.getImage(sprites.idle[0]);
  }

  // --- Optional update, nur wenn Coin aktiviert ---
  update(deltaTime, world) {
    if (!this.enabled || this.collected || !world?.character) return;

    if (this.checkCollisions([world.character], deltaTime)) {
      this.collect(world.character);
    }
  }

  collect(character) {
    this.collected = true;
    character.gold = (character.gold || 0) + 1;

    if (this.debug) {
      console.log(`[COIN] ${character.constructor.name} collected a coin! Total: ${character.gold}`);
    }
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