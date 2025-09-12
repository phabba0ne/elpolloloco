import Coin from "../models/Coin.js";
import SalsaBottle from "../models/SalsaBottle.js";

export default class ItemSpawner {
  constructor({ world, coinCount = 50, salsaCount = 10, minDistance = 100 } = {}) {
    if (!world) throw new Error("ItemSpawner requires a world instance");

    this.world = world;
    this.character = world.character;
    this.level = world.level;
    this.minDistance = minDistance; // minimale Distanz zwischen Items

    this.items = []; // alle Items zusammen
    this.coins = this.spawnCoins(coinCount);
    this.salsas = this.spawnSalsas(salsaCount);
  }

  spawnCoins(count) {
    const coins = [];
    for (let i = 0; i < count; i++) {
      const coin = new Coin({
        x: 0,
        y: 0,
        enabled: true,
      });
      coin.world = this.world;
      this.placeItemSafely(coin);
      coins.push(coin);
      this.items.push(coin);
    }
    return coins;
  }

  spawnSalsas(count) {
    const salsas = [];
    for (let i = 0; i < count; i++) {
      const salsa = new SalsaBottle({
        x: 0,
        y: 0,
        enabled: true,
      });
      salsa.world = this.world;
      this.placeItemSafely(salsa);
      salsas.push(salsa);
      this.items.push(salsa);
    }
    return salsas;
  }

  /** Position so setzen, dass kein anderes Item näher als minDistance ist */
  placeItemSafely(item) {
    let tries = 0;
    let placed = false;

    while (!placed && tries < 100) {
      item.x = this.randomX();
      item.y = this.randomY();
      placed = this.items.every(
        (other) =>
          Math.hypot(item.x - other.x, item.y - other.y) >= this.minDistance
      );
      tries++;
    }

    // Wenn nach 100 Versuchen kein freier Platz gefunden, wird die letzte Position genommen
    if (!placed) console.warn("Could not find safe spawn position for item:", item);
  }

  randomX() {
    return this.level.startX + Math.random() * (this.level.endX - this.level.startX);
  }

  randomY() {
    const maxJumpHeight = this.character.groundY - (this.character.jumpPower ** 2) / (2 * this.character.gravity);
    return Math.random() * (this.character.groundY - maxJumpHeight) + maxJumpHeight;
  }

  update(deltaTime) {
    // Items bewegen sich nicht, nur update aufrufen
    this.coins.forEach((coin) => coin.update(deltaTime, this.world));
    this.salsas.forEach((salsa) => salsa.update(deltaTime, this.world.enemies));
  }

  draw(ctx) {
    this.coins.forEach((coin) => coin.draw(ctx));
    this.salsas.forEach((salsa) => salsa.draw(ctx));
  }
}