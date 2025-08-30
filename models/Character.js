class Character extends MovableObject {
  height = 200;
  y = 230;

  IMAGES_WALKING = [
    "assets/img/characterPepe/walk/wTwentyOne.png",
    "assets/img/characterPepe/walk/wTwentyTwo.png",
    "assets/img/characterPepe/walk/wTwentyThree.png",
    "assets/img/characterPepe/walk/wTwentyFour.png",
    "assets/img/characterPepe/walk/wTwentyFive.png",
    "assets/img/characterPepe/walk/wTwentySix.png",
  ];

  constructor() {
    super();
    this.loadImage("assets/img/characterPepe/walk/wTwentyOne.png");
    this.loadImages(this.IMAGES_WALKING);
    this.animate();
  }

  animate() {
    setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 1000 / 10); // 10 FPS für Animation (nicht 60, sonst zu schnell!)
  }

  jump() {
    // TODO: später mit y-Physik
  }
}