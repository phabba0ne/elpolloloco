import MovableObject from "./MovableObject.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class Chicken extends MovableObject {
  constructor({
    x,
    y,
    width = 80,
    height = 80,
    speedX = 70,
    sprites = AssetManager.CHICKEN_SPRITES,
    type = "enemy",
  } = {}) {
    super({ x, y, width, height, speedX, type });

    this.stateMachine = new StateMachine(sprites, "walk", 6);
    this.movingLeft = true;
    this.otherDirection = false;
    this.worldBounds = { left: -200, right: 3000 };
    this.isDead = false;

    this.loadSprites(sprites);
  }

  loadSprites(sprites) {
    if (!sprites) return;
    Object.values(sprites)
      .flat()
      .forEach((imgPath) => AssetManager.getImage(imgPath));
  }

  update(deltaTime, character) {
    if (this.isDead) return;

    // Bewegung
    const moveDir = this.movingLeft ? -1 : 1;
    this.x += moveDir * this.speedX * deltaTime;

    // Grenzen
    if (this.x < this.worldBounds.left) this.movingLeft = false;
    if (this.x > this.worldBounds.right) this.movingLeft = true;

    // Stomp check
    if (character) this.checkStomp(character);

    this.stateMachine.update(deltaTime);
    this.img = this.stateMachine.getFrame();
  }

  checkStomp(character) {
    const feet = character.y + character.height;
    const chickenHead = this.y + 10;
    const overlap =
      character.x + character.width >= this.x &&
      character.x <= this.x + this.width;

    if (
      feet >= this.y &&
      feet <= chickenHead &&
      overlap &&
      character.speedY > 0
    ) {
      this.die();
      character.speedY = -character.jumpPower;
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stateMachine.setState("dead", 6);
  }

  draw(ctx) {
    if (!this.img) {
      ctx.fillStyle = this.isDead ? "#666" : "#8B4513";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    ctx.save();

    // Wenn nach rechts schauen, spiegeln
    if (!this.movingLeft) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.img,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }
}
