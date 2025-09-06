export default class RandomSpawner {
  constructor({ world, coinCount = 10, salsaCount = 5, debug = false } = {}) {
    this.world = world;
    this.debug = debug;
    this.coins = this.spawn("coin", coinCount);
    this.salsas = this.spawn("salsa", salsaCount);
  }

  spawn(type, count) {
    const arr = [];
    const xRange = [this.world.level.startX, this.world.level.endX];
    const yRange = [this.world.character.groundY - this.world.character.jumpPower * 0.9, this.world.character.groundY];

    for (let i = 0; i < count; i++) {
      const x = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
      const y = yRange[0] + Math.random() * (yRange[1] - yRange[0]);

      if (type === "coin") {
        arr.push(new Coin({
          x, y,
          stateMachine: new StateMachine({ idle: AssetManager.COIN_SPRITES.idle }, "idle", 10),
          enabled: true,
          debug: this.debug
        }));
      } else if (type === "salsa") {
        arr.push(new SalsaBottle({
          x, y,
          stateMachine: new StateMachine({
            spin: AssetManager.SALSABOTTLE.spin,
            hit: AssetManager.SALSABOTTLE.hit
          }, "spin", 10),
          enabled: true,
          debug: this.debug
        }));
      }
    }
    return arr;
  }

  update(deltaTime) {
    this.coins.forEach(c => c.update(deltaTime, this.world));
    this.salsas.forEach(s => s.update(deltaTime, this.world.enemies));
  }

  draw(ctx) {
    this.coins.forEach(c => c.draw(ctx));
    this.salsas.forEach(s => s.draw(ctx));
  }
}