import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

// TODO: AUDIOMANAGER
    // this.GAME_OVER,
    // this.STATUSBARS_CHICKENBOSS,
    // this.STATUSBARS_PEPE,
    // this.SALSABOTTLE,
    // this.SALSASOUNDS,
    // this.COIN_SPRITES,
    // this.COIN_SOUNDS,
    // this.CHICKEN_SPRITES,
    // this.CHICKEN_SOUNDS,
    // this.CHICKENSMALL_SPRITES,
    // this.CHICKENSMALL_SOUNDS,
    // this.CHICKENBOSS_SPRITES,
    // this.CHICKENBOSS_SOUNDS,
    // this.PEPE_SPRITES,
    // this.PEPE_SOUNDS


export default class Coin extends MovableObject {
  width = 100;
  height = 100;
  collected = false;

  constructor({ x = 0, y = 250, enabled = true, } = {}) {
    super();
    this.type = "coin";
    this.x = x;
    this.y = y;
    this.enabled = enabled;

    // Animation
    const sprites = { idle: AssetManager.COIN_SPRITES.idle };
    this.stateMachine = new StateMachine(sprites, "idle", 3); // 3 FPS
    this.loadSprites(sprites);
  }

  async loadSprites(sprites) {
    if (!sprites?.idle) return;
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  /**
   * Versucht, die Münze einzusammeln.
   * Gibt true zurück, wenn erfolgreich.
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

  collect(character) {
    this.collected = true;
    character.gold = (character.gold || 0) + 1;

    // Event triggern, falls world und EventEmitter vorhanden
    if (this.world?.events) {
      this.world.events.emit("coin:collected", { character, coin: this });
    }
  }

  update(deltaTime, world) {
    if (!this.enabled || this.collected || !world?.character) return;

    // Animation
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

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