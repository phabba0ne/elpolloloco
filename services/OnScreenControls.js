const GAME_OVER_IMAGES = {
  over: [
    "assets/img/youWonYouLost/gameOver.png",
    "assets/img/youWonYouLost/gameOverA.png",
  ],
  win: [
    "assets/img/youWonYouLost/youWinA.png",
    "assets/img/youWonYouLost/youWinB.png",
  ],
  won: [
    "assets/img/youWonYouLost/youWonA.png",
    "assets/img/youWonYouLost/youWonB.png",
  ],
  lost: [
    "assets/img/youWonYouLost/youLost.png",
    "assets/img/youWonYouLost/youLostA.png",
  ],
};

class OnscreenControls {
  constructor() {
    this.setupControls();
  }

  setupControls() {
    const buttons = document.querySelectorAll('#onscreen-controls button');
    
    buttons.forEach(button => {
      let keyCode;
      
      if (button.classList.contains('btn-left')) keyCode = 'ArrowLeft';
      else if (button.classList.contains('btn-right')) keyCode = 'ArrowRight';
      else if (button.classList.contains('btn-up')) keyCode = 'ArrowUp';
      else if (button.classList.contains('btn-down')) keyCode = 'ArrowDown';
      else if (button.classList.contains('btn-jump')) keyCode = 'Space';
      else if (button.classList.contains('btn-attack')) keyCode = 'KeyF';

      if (keyCode) {
        const trigger = (type) => {
          document.dispatchEvent(new KeyboardEvent(type, { code: keyCode }));
        };

        button.addEventListener("touchstart", (e) => {
          e.preventDefault();
          trigger("keydown");
        });

        button.addEventListener("touchend", (e) => {
          e.preventDefault();
          trigger("keyup");
        });

        button.addEventListener("mousedown", (e) => {
          e.preventDefault();
          trigger("keydown");
        });

        button.addEventListener("mouseup", (e) => {
          e.preventDefault();
          trigger("keyup");
        });
      }
    });
  }
}
