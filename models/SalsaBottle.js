import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class SalsaBottle extends MovableObject {
  width = 50;
  height = 50;
  speedX = 0;
  speedY = 0;
  gravity = 0.5;
  rotation = 0;
  rotationSpeed = 0.3;
  damage = 50;
  thrown = false;

  constructor({ x = 0, y = 0, direction = 1, enabled = true, debug = false } = {}) {
    super({ debug });
    this.type = "salsa";
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.thrown = false;
    this.enabled = enabled;

    this.stateMachine = new StateMachine({
      spin: AssetManager.SALSABOTTLE.spin,
      hit: AssetManager.SALSABOTTLE.hit,
      spawn: AssetManager.SALSABOTTLE.spawn
    }, "spawn", 10);

    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  update(deltaTime, objects = []) {
    if (!this.enabled || !this.thrown) return;

    this.x += this.speedX;
    this.speedY += this.gravity;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    for (const obj of objects) {
      if (obj !== this && this.isCollidingWith(obj)) {
        if (obj.getDamage) obj.getDamage(this);
        this.explode();
        break;
      }
    }

    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  explode() {
    if (!this.thrown) return;
    this.thrown = false;
    this.stateMachine.setState("hit");
    this.stateMachine.currentFrame = 0;
  }

  draw(ctx) {
    if (!this.enabled || !this.img) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  isCollidingWith(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y
    );
  }
}