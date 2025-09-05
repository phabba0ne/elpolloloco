class SalsaBottle extends MovableObject {
  width = 50;
  height = 50;
  speedX = 0;
  speedY = 0;
  gravity = 0.5;
  rotation = 0;
  rotationSpeed = 0.3;
  damage = 50;
  thrown = false;

  constructor(x, y, direction = 1) {
    super();
    this.x = x;
    this.y = y;
    this.speedX = 10 * direction;

    // StateMachine für Spin und Hit
    this.stateMachine = new StateMachine({
      spin: AssetManager.SALSABOTTLE.spin,
      hit: AssetManager.SALSABOTTLE.hit
    }, "spin", 10);

    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;

    this.thrown = true;
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
      if (obj !== this && isColliding(this, obj)) {
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
    this.stateMachine.setState("hit");
    this.stateMachine.currentFrame = 0;
    this.thrown = false;
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
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}