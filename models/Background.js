// Nur Background-spezifisch
import MovableObject from "./MovableObject.js";

export default class Background extends MovableObject {
  constructor({
    imgPath,
    x = 0,
    y = null,
    width = 1440,  // Background-typical width
    height = 480,
    speedFactor = 1
  } = {}) {
    super({
      x,
      y: y ?? 480 - height, // auto-align bottom
      width,
      height,
      imgPath,
    });
    this.type="background";
    // BACKGROUND-SPEZIFISCH
    this.speedFactor = speedFactor;
  }
  
  // Background bewegt sich nicht wie normale MovableObjects
  update(deltaTime) {
    // Backgrounds update differently - no physics needed
    // Override to prevent normal movement/physics
  }
}