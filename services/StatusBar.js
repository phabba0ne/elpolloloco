// TODO:

// In your initialization:
// this.statusBarManager.createCharacterBars({
  // healthSprites: [...], // Your 6 health bar sprites
  // coinSprites: [...],   // Your 6 coin bar sprites  
  // salsaSprites: [...],  // Your 6 salsa bar sprites
  
  // NEW: Icon paths
  // healthIcon: 'assets/img/icons/health_icon.png',
  // coinIcon: 'assets/img/icons/coin_icon.png', 
  // salsaIcon: 'assets/img/icons/salsa_icon.png',
  
//   iconSize: 50, // Size of the icons
//   barWidth: 250 // Total width (icon + padding + bar)
// });

// Boss bar with icon too
// this.statusBarManager.createBossBar({
//   bossSprites: [...],
//   bossIcon: 'assets/img/icons/boss_icon.png',
//   maxHealth: 100,
//   canvasWidth: this.canvas.width
// });

// When character stats change:

// this.statusBarManager.updateCharacterStats({
//   health: this.character.health,
//   gold: this.character.gold,
//   salsas: this.character.salsas
// });

// When boss spots character:

// this.statusBarManager.showBossBar();
// this.statusBarManager.updateBossHealth(this.chickenBoss.health);

// When boss is defeated:

// this.statusBarManager.hideBossBar();


import DrawableObject from "./DrawableObject.js";

// StatusBar class for displaying health, coins, salsas, etc.
export default class StatusBar extends DrawableObject {
  constructor({
    x = 10,
    y = 10,
    width = 200,
    height = 60,
    maxValue = 500,
    currentValue = 500,
    barType = 'health', // 'health', 'coins', 'salsas'
    sprites = [],
    debug = false
  } = {}) {
    super({ x, y, width, height, debug });
    
    this.maxValue = maxValue;
    this.currentValue = currentValue;
    this.barType = barType;
    this.sprites = sprites; // Array of 6 sprites (0%, 20%, 40%, 60%, 80%, 100%)
    this.currentSpriteIndex = 5; // Start at 100%
    
    // Load sprites if provided
    if (sprites && sprites.length > 0) {
      this.loadStatusSprites();
    }
  }

  // Load all status bar sprites
  async loadStatusSprites() {
    const spritePromises = this.sprites.map((spritePath, index) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.imageCache[`${this.barType}_${index}`] = img;
          resolve(img);
        };
        img.onerror = reject;
        img.src = spritePath;
      });
    });

    await Promise.all(spritePromises);
    this.updateSpriteIndex();
  }

  // Update the current value and sprite
  updateValue(newValue) {
    this.currentValue = Math.max(0, Math.min(newValue, this.maxValue));
    this.updateSpriteIndex();
  }

  // Calculate which sprite to show based on current value
  updateSpriteIndex() {
    const percentage = (this.currentValue / this.maxValue) * 100;
    
    if (percentage <= 0) this.currentSpriteIndex = 0;      // 0%
    else if (percentage <= 20) this.currentSpriteIndex = 1; // 20%
    else if (percentage <= 40) this.currentSpriteIndex = 2; // 40%
    else if (percentage <= 60) this.currentSpriteIndex = 3; // 60%
    else if (percentage <= 80) this.currentSpriteIndex = 4; // 80%
    else this.currentSpriteIndex = 5;                       // 100%
  }

  // Get current percentage
  getPercentage() {
    return (this.currentValue / this.maxValue) * 100;
  }

  // Draw the status bar
  draw(ctx) {
    const spriteKey = `${this.barType}_${this.currentSpriteIndex}`;
    
    if (this.imageCache[spriteKey]) {
      const sprite = this.imageCache[spriteKey];
      if (sprite.complete && sprite.naturalWidth > 0) {
        ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
      }
    } else {
      // Fallback drawing if no sprite
      this.drawFallback(ctx);
    }

    // Debug info
    if (this.debug) {
      super.draw(ctx); // Draw debug box
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(`${this.barType}: ${this.currentValue}/${this.maxValue}`, 
                   this.x, this.y - 5);
    }
  }

  // Fallback drawing when sprites aren't available
  drawFallback(ctx) {
    const percentage = this.getPercentage();
    
    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Bar color based on type
    let barColor = "#00ff00"; // Default green
    if (this.barType === 'health') {
      if (percentage > 60) barColor = "#00ff00";      // Green
      else if (percentage > 30) barColor = "#ffff00"; // Yellow
      else barColor = "#ff0000";                      // Red
    } else if (this.barType === 'coins') {
      barColor = "#ffd700"; // Gold
    } else if (this.barType === 'salsas') {
      barColor = "#ff4500"; // Orange-red
    }
    
    // Fill bar
    ctx.fillStyle = barColor;
    const barWidth = (this.width - 4) * (percentage / 100);
    ctx.fillRect(this.x + 2, this.y + 2, barWidth, this.height - 4);
    
    // Border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

// StatusBarManager for handling multiple status bars
export class StatusBarManager {
  constructor() {
    this.statusBars = new Map();
    this.bossBar = null;
    this.bossBarVisible = false;
  }

  // Create character status bars
  createCharacterBars({ 
    healthSprites = [], 
    coinSprites = [], 
    salsaSprites = [],
    startY = 10,
    barHeight = 60,
    barWidth = 200,
    spacing = 10
  } = {}) {
    // Health bar
    this.statusBars.set('health', new StatusBar({
      x: 10,
      y: startY,
      width: barWidth,
      height: barHeight,
      maxValue: 100,
      currentValue: 100,
      barType: 'health',
      sprites: healthSprites
    }));

    // Coins bar
    this.statusBars.set('coins', new StatusBar({
      x: 10,
      y: startY + barHeight + spacing,
      width: barWidth,
      height: barHeight,
      maxValue: 999, // Max coins to display
      currentValue: 0,
      barType: 'coins',
      sprites: coinSprites
    }));

    // Salsas bar
    this.statusBars.set('salsas', new StatusBar({
      x: 10,
      y: startY + (barHeight + spacing) * 2,
      width: barWidth,
      height: barHeight,
      maxValue: 10, // Max salsas
      currentValue: 0,
      barType: 'salsas',
      sprites: salsaSprites
    }));
  }

  // Create boss health bar (appears when spotted)
  createBossBar({ 
    bossSprites = [], 
    maxHealth = 100,
    canvasWidth = 800 
  } = {}) {
    this.bossBar = new StatusBar({
      x: (canvasWidth - 300) / 2, // Center horizontally
      y: 20,
      width: 300,
      height: 40,
      maxValue: maxHealth,
      currentValue: maxHealth,
      barType: 'boss_health',
      sprites: bossSprites
    });
  }

  // Update character stats
  updateCharacterStats({ health, gold, salsas }) {
    if (health !== undefined && this.statusBars.has('health')) {
      this.statusBars.get('health').updateValue(health);
    }
    if (gold !== undefined && this.statusBars.has('coins')) {
      this.statusBars.get('coins').updateValue(gold);
    }
    if (salsas !== undefined && this.statusBars.has('salsas')) {
      this.statusBars.get('salsas').updateValue(salsas);
    }
  }

  // Update boss health and visibility
  updateBossHealth(health, visible = true) {
    if (this.bossBar) {
      this.bossBar.updateValue(health);
      this.bossBarVisible = visible;
    }
  }

  // Show boss bar when character is spotted
  showBossBar() {
    this.bossBarVisible = true;
  }

  // Hide boss bar
  hideBossBar() {
    this.bossBarVisible = false;
  }

  // Draw all status bars
  draw(ctx) {
    // Draw character status bars
    this.statusBars.forEach(bar => {
      bar.draw(ctx);
    });

    // Draw boss bar if visible
    if (this.bossBarVisible && this.bossBar) {
      this.bossBar.draw(ctx);
    }
  }

  // Get a specific status bar
  getBar(type) {
    return this.statusBars.get(type);
  }

  // Get boss bar
  getBossBar() {
    return this.bossBar;
  }
}