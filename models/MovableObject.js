class MovableObject {
  x = 120;
  y = 280;
  height = 150;
  width = 100;
  imageCache = {};
  currentImage = 0;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(paths) {
    paths.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

    moveLeft() {
    setInterval(() => {
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame; // immer ein HTMLImage
    }, 1000 / this.stateMachine.frameRate);
    setInterval(() => {
      if (this.stateMachine.currentState === "walk") this.x -= 0.5;
    }, 1000 / 60);
  }

    moveRight() { 
    setInterval(() => {
      const frame = this.stateMachine.getFrame();
      if (frame) this.img = frame; // immer ein HTMLImage
    }, 1000 / this.stateMachine.frameRate);
    setInterval(() => {
      if (this.stateMachine.currentState === "walk") this.x += 0.5;
    }, 1000 / 60);
  }

  playAnimation(images) {
    let i = this.currentImage % images.length;
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
  }

    die() {
    this.stateMachine.setState("dead");
  }
}