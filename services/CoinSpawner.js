import Coin from "../models/Coin.js";

export default class CoinSpawner {
  constructor({ world, count = 10, respawn = false, debug = false } = {}) {
    if (!world) throw new Error("CoinSpawner requires a world instance");
    this.world = world;
    this.character = world.character;
    this.level = world.level;
    this.count = count;
    this.respawn = respawn;
    this.debug = debug;

    this.coins = [];
    this.spawnCoins();
  }

  spawnCoins() {
    this.coins = Array.from({ length: this.count }, () => {
      const x = Math.random() * (this.level.endX - this.level.startX) + this.level.startX;
      const coin = new Coin({ x, character: this.character, enabled: true, debug: this.debug });
      coin.world = this.world;
      return coin;
    });

    if (this.debug) console.log(`[CoinSpawner] Spawned ${this.coins.length} coins`);
  }

  update(deltaTime) {
    for (const coin of this.coins) {
      coin.update(deltaTime, this.world);

      // optional respawn
      if (this.respawn && coin.collected) {
        coin.collected = false;
        coin.x = Math.random() * (this.level.endX - this.level.startX) + this.level.startX;

        const maxJumpHeight = this.character.groundY - (this.character.jumpPower ** 2) / (2 * this.character.gravity);
        coin.y = Math.random() * (this.character.groundY - maxJumpHeight) + maxJumpHeight;

        if (this.debug) console.log(`[CoinSpawner] Respawned a coin at x=${coin.x}, y=${coin.y}`);
      }
    }
  }

  draw(ctx) {
    for (const coin of this.coins) {
      coin.draw(ctx);
    }
  }
}