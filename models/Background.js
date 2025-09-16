import MovableObject from "./MovableObject.js";

export default class Background extends MovableObject {
  constructor({
    imgPath,
    x = 0,
    y = null,
    width = 1440,
    height = 480,
    speedFactor = 1
  } = {}) {
    super({
      x,
      y: y ?? 480 - height,
      width,
      height,
      imgPath,
    });
    this.type="background";
    this.speedFactor = speedFactor;
  }
}