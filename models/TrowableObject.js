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
    sprites = AssetManager.BOTTLE_SPRITES, // { idle: [...], spin: [...], hit: [...] }
  } = {}) {
    super({ x, y, width, height, gravity, type: "throwable" });

    this.stateMachine = new StateMachine(sprites, "idle", 10);
    this.loadSprites(sprites);

    this.isThrown = false;
    this.hasHitAnimationFinished = false;
    this.groundY = 200; // Bodenhöhe (kann dynamisch gesetzt werden)
  }

  throw(direction = 1, throwSpeed = 7, throwUp = -10) {
    this.isThrown = true;
    this.speedX = direction * throwSpeed;
    this.speedY = throwUp;
    this.stateMachine.setState("spin"); // Spin-Animation starten
  }

  update(deltaTime) {
    if (this.isThrown && !this.hasHitAnimationFinished) {
      // Physik
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;

      // Hit-Detection
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.speedX = 0;
        this.speedY = 0;

        // Hit-Animation einmal abspielen
        this.stateMachine.setState("hit", true); // einmalige Animation
        this.hasHitAnimationFinished = true;
      }
    }

    // StateMachine aktualisieren
    this.stateMachine.update(deltaTime);
  }

  draw(ctx) {
    const frame = this.stateMachine.getFrame();
    if (!frame) return;
    ctx.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  isActive() {
    // Objekt ist aktiv, solange Spin oder Hit läuft
    return !this.hasHitAnimationFinished || this.stateMachine.currentState === "hit";
  }
}