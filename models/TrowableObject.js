import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

/**
 * Throwable object (e.g., bottle) with physics and hit animation
 */
export default class ThrowableObject extends MovableObject {
  /**
   * @param {object} options
   * @param {number} [options.x=100]
   * @param {number} [options.y=100]
   * @param {number} [options.width=50]
   * @param {number} [options.height=50]
   * @param {number} [options.gravity=0.44]
   * @param {object} [options.sprites=AssetManager.BOTTLE_SPRITES]
   */
  constructor({ x = 100, y = 100, width = 50, height = 50, gravity = 0.44, sprites = AssetManager.BOTTLE_SPRITES } = {}) {
    super({ x, y, width, height, gravity, type: "throwable" });

    this.stateMachine = new StateMachine(sprites, "idle", 10);
    this.loadSprites(sprites);

    this.isThrown = false;
    this.hasHitAnimationFinished = false;
    this.groundY = 200;
  }

  /**
   * Launch the object
   * @param {number} direction - 1 = right, -1 = left
   * @param {number} throwSpeed - horizontal speed
   * @param {number} throwUp - initial vertical speed
   */
  throw(direction = 1, throwSpeed = 7, throwUp = -10) {
    this.isThrown = true;
    this.speedX = direction * throwSpeed;
    this.speedY = throwUp;
    this.stateMachine.setState("spin", false, true);
  }

  /** Update physics and animation */
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

  /** Draw current frame */
  draw(ctx) {
    const frame = this.stateMachine.getFrame();
    if (frame) ctx.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  /** Whether the object is still active in the world */
  isActive() {
    return !this.hasHitAnimationFinished || this.stateMachine.currentState === "hit";
  }
}