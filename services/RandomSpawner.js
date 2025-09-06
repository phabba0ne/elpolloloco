import Coin from "../models/Coin.js";
import SalsaBottle from "../models/SalsaBottle.js";
import StateMachine from "../services/StateMachine.js";
import AssetManager from "../services/AssetManager.js";

export default class RandomSpawner {
  constructor({ world, coinCount = 10, salsaCount = 5, debug = false } = {}) {
    this.world = world;
    this.debug = debug;

    this.coins = this.spawn("coin", coinCount);
    this.salsas = this.spawn("salsa", salsaCount);
  }

  spawn(type, count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = this.world.level.startX +
        Math.random() * (this.world.level.endX - this.world.level.startX);

      const y = this.world.character.groundY -
        Math.random() * this.world.character.jumpPower * 0.9;

      if (type === "coin") {
        arr.push(new Coin({
          x, y,
          stateMachine: new StateMachine(
            { idle: AssetManager.COIN_SPRITES.idle },
            "idle",
            10
          ),
          enabled: true,
          debug: this.debug
        }));
      }

      if (type === "salsa") {
        arr.push(new SalsaBottle({
          x, y,
          stateMachine: new StateMachine(
            {
              spin: AssetManager.SALSABOTTLE.spin,
              hit: AssetManager.SALSABOTTLE.hit
            },
            "spin",
            10
          ),
          enabled: true,
          debug: this.debug
        }));
      }
    }
    return arr;
  }

  update(deltaTime) {
    this.coins.forEach((coin) => coin.update(deltaTime, this.world));
    this.salsas.forEach((salsa) => salsa.update(deltaTime, this.world.enemies));
  }

  draw(ctx) {
    this.coins.forEach((coin) => coin.draw(ctx));
    this.salsas.forEach((salsa) => salsa.draw(ctx));
  }
}