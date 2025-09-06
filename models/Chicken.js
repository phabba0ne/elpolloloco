// Nur Chicken-spezifische Logik
import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Chicken extends MovableObject {
  constructor({ 
    x = null, 
    y = 100, 
    width = 60,
    height = 60,
    speedX = 60,
    strength = 10,
    sprites = AssetManager.CHICKEN_SPRITES 
  } = {}) {
    super({
      x: x ?? 700 + Math.random() * 1500,
      y,
      width,
      height,
      speedX,
      strength,
      type: "enemy"
    });

    // StateMachine für Chicken
    this.stateMachine = new StateMachine(sprites, "walk", 6);
    this.loadSprites(sprites);
  }

  update(deltaTime) {
    if (!this.isDead) {
      // Chicken moves left
      this.x -= this.speedX * deltaTime;
    }
    
    // Use parent's StateMachine update
    this.updateStateMachine(deltaTime);
  }
}