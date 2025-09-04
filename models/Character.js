class Character extends MovableObject {
  width = 100;
  height = 200;
  y = 250;
  x = 120;

  speedX = 0;          // horizontal speed
  speedY = 0;          // vertical speed
  moveSpeed = 5;       // px per frame
  jumpPower = 15;      // initial jump speed
  gravity = 0.8;       // gravity per frame
  groundY = 250;       // floor level
  isJumping = false;

  constructor() {
    super();
    this.stateMachine = new StateMachine(AssetManager.PEPE_SPRITES, "idle", 10);
    this.loadSprites(AssetManager.PEPE_SPRITES);

    this.frameTimer = 0;
    this.frameInterval = 60;
    this.idleTimer = 0;
    this.longIdleThreshold = 6000;
  }

  update(deltaTime, moving = false, jumpInput = false, moveDir = 0) {
    // ---- Jumping ----
    if (jumpInput && !this.isJumping && this.isOnGround()) {
      this.speedY = -this.jumpPower; // upward
      this.isJumping = true;
      this.stateMachine.setState("jump");
    }

    // ---- Apply gravity ----
    this.speedY += this.gravity;
    this.y += this.speedY;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
      if (this.isJumping) {
        this.isJumping = false;
        if (!moving) this.stateMachine.setState("idle");
      }
    }

    // ---- Horizontal movement ----
    if (moving) {
      this.x += moveDir * this.moveSpeed;
      if (!this.isJumping && this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk");
      }
      this.idleTimer = 0;
    } else if (!this.isJumping) {
      this.idleTimer += deltaTime;
      if (this.idleTimer >= this.longIdleThreshold) {
        this.stateMachine.setState("longIdle");
      } else if (this.stateMachine.currentState !== "idle") {
        this.stateMachine.setState("idle");
      }
    }

    // ---- Animation ----
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;
    }
  }

  isOnGround() {
    return this.y >= this.groundY;
  }
}