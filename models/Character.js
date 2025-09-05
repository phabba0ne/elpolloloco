class Character extends MovableObject {
  width = 100;
  height = 200;
  y = 250;
  x = 120;

  speedX = 0;
  speedY = 0;
  moveSpeed = 4;
  jumpPower = 12;
  gravity = 0.5 ;
  groundY = 250;
  isJumping = false;

  constructor() {
    super();
    this.stateMachine = new StateMachine(AssetManager.PEPE_SPRITES, "idle", 10 );
    this.loadSprites(AssetManager.PEPE_SPRITES);

    this.frameTimer = 0;
    this.frameInterval = 60;
    this.idleTimer = 0;
    this.longIdleThreshold = 6000;

    this.isHurt = false;
    this.isInvulnerable = false;
    this.invulnerableDuration = 2000; // 2 Sekunden
  }

  update(deltaTime, moving = false, jumpInput = false, moveDir = 0) {
    // --- Dead Animation ---
    if (this.isDead) {
      if (this.stateMachine.currentState !== "dead") {
        console.log("[STATE] Character died. Switching to dead animation.");
        this.stateMachine.setState("dead", true); // einmalig
      }
      this.stateMachine.update(deltaTime);
      this.img = this.stateMachine.getFrame();
      return; 
    }

    // --- Hurt Animation ---
    if (this.isHurt) {
      if (this.stateMachine.currentState !== "hurt") {
        console.log("[STATE] Character hurt. Switching to hurt animation.");
        this.stateMachine.setState("hurt", true); // einmalig
      }
      this.stateMachine.update(deltaTime);
      this.img = this.stateMachine.getFrame();
      return; 
    }

    // --- Jumping ---
    if (jumpInput && !this.isJumping && this.isOnGround()) {
      this.speedY = -this.jumpPower;
      this.isJumping = true;
      console.log("[ACTION] Character starts jumping.");
      this.stateMachine.setState("jump");
    }

    // --- Gravity ---
    this.speedY += this.gravity;
    this.y += this.speedY;
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
      if (this.isJumping) {
        this.isJumping = false;
        console.log("[ACTION] Character landed.");
        if (!moving) this.stateMachine.setState("idle");
      }
    }

    // --- Horizontal movement ---
    if (moving) {
      this.x += moveDir * this.moveSpeed;
      if (!this.isJumping && this.stateMachine.currentState !== "walk") {
        this.stateMachine.setState("walk");
        console.log("[STATE] Character walking.");
      }
      this.idleTimer = 0;
    } else if (!this.isJumping) {
      this.idleTimer += deltaTime;
      if (this.idleTimer >= this.longIdleThreshold) {
        if (this.stateMachine.currentState !== "longIdle") {
          this.stateMachine.setState("longIdle");
          console.log("[STATE] Character long idle.");
        }
      } else if (this.stateMachine.currentState !== "idle") {
        this.stateMachine.setState("idle");
        console.log("[STATE] Character idle.");
      }
    }

    // --- Animation ---
    this.stateMachine.update(deltaTime);
    const frame = this.stateMachine.getFrame();
    if (frame) this.img = frame;
  }

  isOnGround() {
    return this.y >= this.groundY;
  }

  // --- Damage / Hurt Handling mit Logs ---
  getDamage(source) {
    if (this.isDead) {
      console.log(`[LOG] Character is already dead. No damage applied.`);
      return;
    }
    if (this.isInvulnerable) {
      console.log(`[LOG] Character is invulnerable. No damage taken from ${source.constructor.name}.`);
      return;
    }

    this.health -= source.strength;
    console.log(`[LOG] Character took ${source.strength} damage from ${source.constructor.name}. Health: ${this.health}`);

    this.isHurt = true;
    this.isInvulnerable = true;
    console.log(`[FLAG] isHurt: true, isInvulnerable: true`);

    // Hurt Animation kurz anzeigen
    setTimeout(() => {
      this.isHurt = false;
      console.log(`[FLAG] Hurt animation ended. isHurt: false`);
    }, 300);

    // 2 Sekunden Unverwundbarkeit
    setTimeout(() => {
      this.isInvulnerable = false;
      console.log(`[FLAG] Character is now vulnerable again. isInvulnerable: false`);
    }, this.invulnerableDuration);

    if (this.health <= 0) this.die();
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stateMachine.setState("dead", true);
    console.log(`[STATE] Character died. isDead: true, switching to dead animation.`);
  }
}