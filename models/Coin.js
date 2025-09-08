import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Coin extends MovableObject {
  width = 100;
  height = 100;
  collected = true;
  constructor({ x = 0, y = null, enabled = true, debug = false, character = null } = {}) {
    super();
    this.type = "coin";
    this.x = x;
    this.enabled = enabled;

    // y nur einmalig beim Spawn bestimmen
    if (y === null && character) {
      const maxJumpHeight = character.groundY - (character.jumpPower ** 2) / (2 * character.gravity);
      this.y = Math.random() * (character.groundY - maxJumpHeight) + maxJumpHeight;
    } else {
      this.y = y ?? 250;
    }

    // --- StateMachine für Animation ---
    const sprites = { idle: AssetManager.COIN_SPRITES.idle };
    this.stateMachine = new StateMachine(sprites, "idle", 10); // 10 Frames pro Sekunde
    this.loadSprites(sprites);
  }

  async loadSprites(sprites) {
    if (!sprites?.idle) return;
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  update(deltaTime, world) {
    if (!this.enabled || this.collected || !world?.character) return;

    // Kollisionsprüfung
    if (this.checkCollisions([world.character], deltaTime)) {
      this.collect(world.character);
    }

    // Animation aktualisieren
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
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