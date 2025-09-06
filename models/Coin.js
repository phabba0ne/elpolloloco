import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";

export default class Coin extends MovableObject {
  width = 50;
  height = 50;
  collected = false;

  constructor({ x = 0, y = 0 } = {}) {
    super();
    this.type = "coin"; // wichtig für World/Kollision
    this.x = x;
    this.y = y;

    // Sprites laden
    this.sprites = { idle: AssetManager.COIN_SPRITES.idle };
    this.loadSprites(this.sprites);
  }

  async loadSprites(sprites) {
    if (!sprites || !sprites.idle) return;
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = AssetManager.getImage(sprites.idle[0]);
  }

  update(deltaTime, world) {
    if (this.collected) return;

    // Prüfe Kollisionen mit Character
    if (world?.character) {
      const collided = this.checkCollisions([world.character], deltaTime);
      if (collided) this.collect(world.character);
    }
  }

  collect(character) {
    this.collected = true;
    if (!character.gold) character.gold = 0;
    character.gold += 1;

    if (this.debug) {
      console.log(`[COIN] ${character.constructor.name} collected a coin! Total: ${character.gold}`);
    }
  }

  draw(ctx) {
    if (this.collected) return;

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