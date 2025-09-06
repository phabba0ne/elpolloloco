import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;
  y = 155;
  speedX = 0; // start: nicht bewegen
  strength = 20;

  constructor({
    x = 1200,
    y = 155,
    width = 300,
    height = 300,
    strength = 20,
    sprites = AssetManager.CHICKENBOSS_SPRITES,
    debug = false,
    player = null,
    spawnThreshold = 900, // Bildschirmgrenze für Startbewegung
  } = {}) {
    super();
    this.type = "chickenBoss";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.strength = strength;
    this.debug = debug;
    this.player = player;
    this.spawnThreshold = spawnThreshold;
    this.active = false;

    this.stateMachine = new StateMachine(sprites, "alert", 3);
    // Sprites laden und erstes Bild setzen
    this.loadSprites(AssetManager.CHICKENBOSS_SPRITES).then(() => {
      this.img = this.stateMachine.getFrame(); // sofort zeichnen
    });
  }

  async loadSprites(sprites) {
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  setState(stateName, speed = 3) {
    if (this.stateMachine.currentState !== stateName) {
      this.stateMachine.setState(stateName, speed);
    }
  }

  walk() {
    this.setState("walk", 3);
  }
  attack() {
    this.setState("attack", 4);
  }
  alert() {
    this.setState("alert", 3);
  }
  die() {
    this.setState("die", 2);
    this.isDead = true;
    this.speedX = 0;
  }

  update(deltaTime) {
    if (!this.img) return; // keine Sprites geladen → nichts tun

    if (!this.isDead && this.player) {
      if (!this.active && this.x < 900) this.active = true;

      if (this.active) {
        const dx = this.player.x - this.x;
        this.otherDirection = dx > 0;
        this.x += Math.sign(dx) * 40 * deltaTime;

        if (Math.abs(dx) > 50) this.walk();
        else this.attack();
      }
    }

    this.stateMachine.update(deltaTime);
    this.img = this.stateMachine.getFrame();

    super.update(deltaTime);
  }
}
