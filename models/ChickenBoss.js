import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";


export default class ChickenBoss extends MovableObject {
  width = 300;
  height = 300;
  y = 155;
  speedX = 80;
  strength = 20;

  constructor({
    x = 2000, // Spawn weit rechts (off-screen)
    y = 155,
    width = 300,
    height = 300,
    speedX = 80,
    strength = 20,
    sprites = AssetManager.CHICKENBOSS_SPRITES,
    debug = false,
  } = {}) {
    super();
    this.type = "chickenBoss"; // wichtig für World

    // Basiswerte
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = speedX;
    this.strength = strength;
    this.debug = debug;

    // StateMachine mit Boss-Sprites
    this.stateMachine = new StateMachine(sprites, "alert", 6);
    this.loadSprites(sprites);
  }

  async loadSprites(sprites) {
    // Sprites preloaden und Startbild setzen
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  update(deltaTime) {
    if (!this.isDead) {
      // Boss-Bewegung optional aktivieren
      // this.x -= this.speedX * deltaTime;
    }
    super.update(deltaTime);
  }
}