import MovableObject from "./MovableObject.js";

export default class Background extends MovableObject {
  height = 480;
  speedFactor = 1;

  constructor({
    imgPath,
    x = 0,
    y = null,
    height = 480,
    speedFactor = 1
  } = {}) {
    super();
    this.loadImage(imgPath);
    this.x = x;
    this.height = height;
    this.y = y ?? 480 - this.height; // wenn y nicht gesetzt: automatisch unten ausrichten
    this.speedFactor = speedFactor;
  }
}