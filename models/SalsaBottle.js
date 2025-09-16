import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class SalsaBottle extends MovableObject {
  width = 70;
  height = 70;
  gravity = 0.5;
  rotation = 0;
  rotationSpeed = 0.3;
  damage = 50;

  constructor({
    x = 0,
    y = 0,
    collectable = true,
    direction = 1,
    thrown = false,
  } = {}) {
    super({ x, y });
    this.type = "salsa";
    this.collectable = collectable;
    this.thrown = thrown;
    this.enabled = true;
    this.speedX = thrown ? (direction ? 10 : -10) : 0;
    this.speedY = thrown ? -4 : 0;

    this.stateMachine = new StateMachine(
      {
        spawn: AssetManager.SALSABOTTLE.spawn,
        spin: AssetManager.SALSABOTTLE.spin,
        hit: AssetManager.SALSABOTTLE.hit,
      },
      thrown ? "spin" : "spawn",
      6
    );

    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  update(deltaTime, objects = []) {
    if (!this.enabled) return;

    if (this.thrown) {
      this.x += this.speedX;
      this.speedY += this.gravity;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      for (const obj of objects) {
        if (obj !== this && this.isCollidingWith(obj)) {
          this.AudioHub.playOne("SALSASOUNDS", "hit");
          this.onHit(obj);
          break;
        }
      }
    }

    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
    if (
      this.stateMachine.currentState === "hit" &&
      this.stateMachine.isFinished
    ) {
      this.enabled = false;
      this.hasHitAnimationFinished = true;
    }
  }

  onHit(obj) {
    if (!obj) return;

    if (obj.constructor?.name === "ChickenBoss") {
      this.AudioHub.playOne("AMBIENT", "chickenAlarmCall");
      if (typeof obj.getDamage === "function") {
        obj.getDamage({ damage: 200 });
      }
      obj.flash?.(300);
    } else {
      if (typeof obj.getDamage === "function") {
        obj.getDamage({ damage: obj.health || 9999 });
      } else if (typeof obj.die === "function") {
        obj.die();
      }
    }

    this.explode();
  }
  explode() {
    this.thrown = false;
    this.stateMachine.setState("hit", false);
    this.stateMachine.currentFrame = 0;
    this.speedX = 0;
    this.speedY = 0;
  }

  draw(ctx) {
    if (!this.enabled || !this.img) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    if (this.thrown && this.stateMachine.currentState === "spin") {
      ctx.rotate(this.rotation);
    }

    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }

  tryCollect(character) {
    if (!this.collectable || !this.enabled) return false;
    if (this.isCollidingWith(character)) {
      this.enabled = false;
      this.AudioHub.playOne("AMBIENT", "bottleClink");
      character.salsas = (character.salsas || 0) + 1;

      return true;
    }
    return false;
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
