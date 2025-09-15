export default class Keyboard {
  constructor() {
    this.keys = {}; // aktueller Status
    this.prevKeys = {}; // Status im letzten Frame
    this.touchButtons = {}; // Status der Touch-Buttons
    
    // Keyboard events
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
    
    // Mobile detection and touch controls setup
    if (this.isMobileDevice()) {
      this.createTouchControls();
    }
  }

  /**
   * Erkennt mobile Geräte
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }

  /**
   * Erstellt Touch-Controls für mobile Geräte
   */
  createTouchControls() {
    // Container für alle Controls
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'touch-controls';
    controlsContainer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200px;
      pointer-events: none;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;

    // D-Pad (Bewegungssteuerung)
    const dPad = this.createDPad();
    
    // Action Buttons (rechts)
    const actionButtons = this.createActionButtons();
    
    controlsContainer.appendChild(dPad);
    controlsContainer.appendChild(actionButtons);
    document.body.appendChild(controlsContainer);
  }

  /**
   * Erstellt das D-Pad für Bewegungen
   */
  createDPad() {
    const dPad = document.createElement('div');
    dPad.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      width: 150px;
      height: 150px;
      pointer-events: auto;
    `;

    const buttons = [
      { key: 'ArrowUp', label: '↑', style: 'top: 0; left: 50px; width: 50px; height: 50px;' },
      { key: 'ArrowLeft', label: '←', style: 'top: 50px; left: 0; width: 50px; height: 50px;' },
      { key: 'ArrowRight', label: '→', style: 'top: 50px; right: 0; width: 50px; height: 50px;' },
      { key: 'ArrowDown', label: '↓', style: 'bottom: 0; left: 50px; width: 50px; height: 50px;' }
    ];

    buttons.forEach(btn => {
      const button = this.createTouchButton(btn.key, btn.label);
      button.style.cssText += btn.style;
      dPad.appendChild(button);
    });

    return dPad;
  }

  /**
   * Erstellt Action-Buttons
   */
  createActionButtons() {
    const actionContainer = document.createElement('div');
    actionContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 180px;
      height: 120px;
      pointer-events: auto;
    `;

    const buttons = [
      { key: 'Space', label: 'JUMP', style: 'bottom: 60px; right: 0; width: 70px; height: 50px;' },
      { key: 'KeyF', label: 'ATTACK', style: 'bottom: 0; right: 0; width: 70px; height: 50px;' },
    ];

    buttons.forEach(btn => {
      const button = this.createTouchButton(btn.key, btn.label);
      button.style.cssText += btn.style;
      actionContainer.appendChild(button);
    });

    return actionContainer;
  }

  /**
   * Erstellt einen einzelnen Touch-Button
   */
  createTouchButton(keyCode, label) {
    const button = document.createElement('div');
    button.style.cssText = `
      position: absolute;
      background: rgba(255, 255, 255, 0.7);
      border: 2px solid rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      color: #333;
      user-select: none;
      touch-action: manipulation;
      cursor: pointer;
      transition: all 0.1s;
    `;
    
    button.textContent = label;
    button.dataset.key = keyCode;

    // Touch events
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchButtons[keyCode] = true;
      button.style.background = 'rgba(200, 200, 255, 0.9)';
      button.style.transform = 'scale(0.95)';
    });

    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touchButtons[keyCode] = false;
      button.style.background = 'rgba(255, 255, 255, 0.7)';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.touchButtons[keyCode] = false;
      button.style.background = 'rgba(255, 255, 255, 0.7)';
      button.style.transform = 'scale(1)';
    });

    // Prevent context menu on long press
    button.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    return button;
  }

  /**
   * Muss am Anfang jedes Frames aufgerufen werden!
   */
  update() {
    this.prevKeys = { ...this.keys };
  }

  /**
   * Wird die Taste aktuell gehalten? (Keyboard oder Touch)
   */
  isPressed(code) {
    return !!(this.keys[code] || this.touchButtons[code]);
  }

  /**
   * Wurde die Taste gerade in diesem Frame gedrückt?
   */
  justPressed(code) {
    const currentState = this.isPressed(code);
    const prevState = this.prevKeys[code] || false;
    return currentState && !prevState;
  }

  /**
   * Bewegungen: halten erlaubt
   */
  get left() {
    return this.isPressed("ArrowLeft");
  }

  get right() {
    return this.isPressed("ArrowRight");
  }

  get up() {
    return this.isPressed("ArrowUp");
  }

  get down() {
    return this.isPressed("ArrowDown");
  }

  /**
   * Aktionen: nur einmal pro Drücken
   */
  get jump() {
    return this.justPressed("Space");
  }

  get attack() {
    return this.justPressed("KeyF");
  }

  /**
   * Entfernt die Touch-Controls (nützlich für Cleanup)
   */
  destroy() {
    const controls = document.getElementById('touch-controls');
    if (controls) {
      controls.remove();
    }
  }
}