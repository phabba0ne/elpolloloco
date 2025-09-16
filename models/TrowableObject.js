import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class ThrowableObject extends MovableObject {
  constructor({
    x = 100,
    y = 100,
    width = 50,
    height = 50,
    gravity = 0.44,
    sprites = AssetManager.BOTTLE_SPRITES,
  } = {}) {
    super({ x, y, width, height, gravity, type: "throwable" });

    this.stateMachine = new StateMachine(sprites, "idle", 10);
    this.loadSprites(sprites);

    this.isThrown = false;
    this.hasHitAnimationFinished = false;
    this.groundY = 200;
  }

  throw(direction = 1, throwSpeed = 7, throwUp = -10) {
    this.isThrown = true;
    this.speedX = direction * throwSpeed;
    this.speedY = throwUp;
    this.stateMachine.setState("spin", false, true);
  }

  update(deltaTime) {
    if (this.isThrown && !this.hasHitAnimationFinished) {
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.speedX = 0;
        this.speedY = 0;

        this.AudioHub.playOne("SALSASOUNDS", "hit");
        this.stateMachine.setState("hit", true);
        this.hasHitAnimationFinished = true;
      }
    }
    this.stateMachine.update(deltaTime);
  }

  draw(ctx) {
    const frame = this.stateMachine.getFrame();
    if (!frame) return;
    ctx.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  isActive() {
    return (
      !this.hasHitAnimationFinished || this.stateMachine.currentState === "hit"
    );
  }
}
