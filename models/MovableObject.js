// Alle Movement-Properties und StateMachine nach oben
import DrawableObject from "./DrawableObject.js";
import AssetManager from "../services/AssetManager.js";

export default class MovableObject extends DrawableObject {
  constructor(options = {}) {
    super(options);
    
    // MOVEMENT - gemeinsam für Character, Chicken, ChickenBoss
    this.speedX = options.speedX || 0;
    this.speedY = options.speedY || 0;
    this.otherDirection = options.otherDirection || false;
    
    // PHYSICS - gemeinsam verwendet
    this.gravity = options.gravity || 0;
    
    // HEALTH SYSTEM - alle Enemies und Character haben das
    this.health = options.health || 100;
    this.strength = options.strength || 10;
    this.isDead = false;
    
    // COLLISION SYSTEM - alle verwenden das
    this.collisionCooldown = 0;
    this.collisionInterval = options.collisionInterval || 150;
    
    // STATE MACHINE - Character, Chicken, ChickenBoss alle verwenden StateMachine
    this.stateMachine = null;
    this.frameTimer = 0;
    this.frameInterval = options.frameInterval || 60;
    
    // WORLD REFERENCE - alle brauchen das
    this.world = options.world || null;
  }

  // GEMEINSAME loadSprites Methode für StateMachine-Objekte
  async loadSprites(sprites) {
    await super.loadSprites(sprites); // Parent-Cache verwenden
    if (this.stateMachine) {
      this.img = this.stateMachine.getFrame(); // Startframe setzen
    }
  }

  // GEMEINSAME Update-Logik für StateMachine
  updateStateMachine(deltaTime) {
    if (this.stateMachine) {
      this.stateMachine.update(deltaTime);
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame;
    }
  }

  // BEWEGUNG - alle MovableObjects bewegen sich
  move(deltaTime) {
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;
  }

  // PHYSICS UPDATE - Character und Enemies verwenden das
  updatePhysics(deltaTime) {
    // Apply gravity if needed
    if (this.gravity > 0) {
      this.speedY += this.gravity;
    }
    
    // Move
    this.move(deltaTime);
  }

  // COLLISION DETECTION - alle verwenden AABB
  isCollidingWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  // COLLISION CHECKING - Character und Enemies verwenden das
  checkCollisions(objects, deltaTime) {
    if (this.isDead) return null;
    
    this.collisionCooldown -= deltaTime * 1000;
    if (this.collisionCooldown > 0) return null;

    for (const obj of objects) {
      if (!obj || obj === this) continue;
      if (!this.isCollidingWith(obj)) continue;
      
      this.collisionCooldown = this.collisionInterval;
      this.onCollision(obj);
      return obj;
    }
    return null;
  }

  // DAMAGE SYSTEM - Character und Enemies verwenden das
  getDamage(source) {
    if (!source || this.isDead) return;
    
    this.health -= source.strength;
    console.log(`[${this.type}] Took ${source.strength} damage. Health: ${this.health}`);
    
    if (this.health <= 0) {
      this.die();
    } else {
      this.onDamage(source);
    }
  }

  doDamage(target) {
    if (!target || this.isDead) return;
    target.getDamage(this);
  }

  // DEATH HANDLING - alle haben das
  die() {
    if (this.isDead) return;
    this.isDead = true;
    
    if (this.stateMachine && this.stateMachine.sprites.dead) {
      this.stateMachine.setState("dead");
    }
    
    console.log(`[${this.type}] Died`);
    this.onDeath();
  }

  // GEMEINSAME Update-Methode
  update(deltaTime) {
    if (this.isDead && this.stateMachine?.currentState === "dead") {
      // Nur Animation aktualisieren wenn tot
      this.updateStateMachine(deltaTime);
      return;
    }
    
    // Physics und Movement
    this.updatePhysics(deltaTime);
    
    // Animation
    this.updateStateMachine(deltaTime);
  }

  // Override-Points für Subklassen
  onCollision(other) {
    // Character <-> Enemy collision logic
    if (this.type === "character" && other.type === "enemy") {
      this.getDamage(other);
    }
    if (this.type === "enemy" && other.type === "character") {
      this.doDamage(other);
    }
  }

  onDamage(source) {
    // Override in subclasses
  }

  onDeath() {
    // Override in subclasses  
  }
}