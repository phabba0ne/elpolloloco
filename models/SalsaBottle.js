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

  constructor(x = 0, y = 0, direction = 1) {
    super();
    this.type = "projectile"; // wichtig für Collision / World
    this.x = x;
    this.y = y;
    this.speedX = 10 * direction;
    this.thrown = true;

    // StateMachine für Spin und Hit
    this.stateMachine = new StateMachine({
      spin: AssetManager.SALSABOTTLE.spin,
      hit: AssetManager.SALSABOTTLE.hit,
    }, "spin", 10);

    // Erstes Frame laden
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  update(deltaTime, objects = []) {
    if (!this.thrown) return;

    // Bewegung
    this.x += this.speedX;
    this.speedY += this.gravity;
    this.y += this.speedY;

    // Rotation
    this.rotation += this.rotationSpeed;

    // Kollision prüfen
    for (const obj of objects) {
      if (obj !== this && this.isCollidingWith(obj)) {
        console.log(`[HIT] SalsaBottle hit ${obj.constructor.name}`);
        if (obj.getDamage) obj.getDamage(this);
        this.explode();
        break;
      }
    }

    // Animation aktualisieren
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  explode() {
    if (!this.thrown) return;
    this.thrown = false;
    this.stateMachine.setState("hit");
    this.stateMachine.currentFrame = 0;
    console.log("[ACTION] SalsaBottle exploded");
  }

  draw(ctx) {
    if (!this.img) return;
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();

    if (this.debug) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
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