class Chicken extends MovableObject {

  y=370;
    height=60;
    width=60;

  constructor() {
    super().loadImage(
      "../assets/img/enemiesChicken/chickenNormal/walk/oneW.png"
    );
    this.x = 200 + Math.random() * 500;
  }
}
