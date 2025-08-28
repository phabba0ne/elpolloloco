class Chicken extends MovableObject {

  y=290;

  constructor() {
    super().loadImage(
      "../assets/img/enemiesChicken/chickenNormal/walk/oneW.png"
    );
    this.x = 200 + Math.random() * 500;
  }
}
