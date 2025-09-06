import Coin from "../models/Coin.js";
import SalsaBottle from "../models/SalsaBottle.js";
import StateMachine from "../services/StateMachine.js";
import AssetManager from "../services/AssetManager.js";

export default class ItemSpawner {
  constructor({ world, coinCount = 50, salsaCount = 10, debug = false } = {}) {
    if (!world) throw new Error("ItemSpawner requires a world instance");

    this.world = world;
    this.character = world.character;
    this.level = world.level;
    this.debug = debug;

    this.coins = this.spawnCoins(coinCount);
    this.salsas = this.spawnSalsas(salsaCount);
  }

  // ---------------- Spawn Coins ----------------
  spawnCoins(count) {
    const coins = [];
    for (let i = 0; i < count; i++) {
      const x = this.randomX();
      const y = this.randomY();
      const coin = new Coin({
        x,
        y,
        stateMachine: new StateMachine({ idle: AssetManager.COIN_SPRITES.idle }, "idle", 10),
        enabled: true,
        debug: this.debug
      });
      coin.world = this.world;
      coins.push(coin);
    }
    if (this.debug) console.log(`[ItemSpawner] Spawned ${coins.length} coins`);
    return coins;
  }

  // ---------------- Spawn Salsas ----------------
  spawnSalsas(count) {
    const salsas = [];
    for (let i = 0; i < count; i++) {
      const x = this.randomX();
      const y = this.randomY();
      const salsa = new SalsaBottle({
        x,
        y,
        stateMachine: new StateMachine({
          spin: AssetManager.SALSABOTTLE.spin,
          hit: AssetManager.SALSABOTTLE.hit
        }, "spin", 12),
        enabled: true,
        debug: this.debug
      });
      salsa.world = this.world;
      salsas.push(salsa);
    }
    if (this.debug) console.log(`[ItemSpawner] Spawned ${salsas.length} salsas`);
    return salsas;
  }

  // ---------------- Random Position Helper ----------------
  randomX() {
    return this.level.startX + Math.random() * (this.level.endX - this.level.startX);
  }

  randomY() {
    const maxJumpHeight = this.character.groundY - (this.character.jumpPower ** 2) / (2 * this.character.gravity);
    return Math.random() * (this.character.groundY - maxJumpHeight) + maxJumpHeight;
  }

  // ---------------- Update ----------------
  update(deltaTime) {
    this.coins.forEach((coin) => {
      coin.update(deltaTime, this.world);

      // Respawn-Logik für gesammelte Coins
      if (coin.collected) {
        coin.collected = false;
        coin.x = this.randomX();
        coin.y = this.randomY();
        if (this.debug) console.log(`[ItemSpawner] Respawned coin at x=${coin.x}, y=${coin.y}`);
      }
    });

    this.salsas.forEach((salsa) => salsa.update(deltaTime, this.world.enemies));
  }

  // ---------------- Draw ----------------
  draw(ctx) {
    this.coins.forEach((coin) => coin.draw(ctx));
    this.salsas.forEach((salsa) => salsa.draw(ctx));
  }
}