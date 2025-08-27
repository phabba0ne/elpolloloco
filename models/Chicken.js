class Chicken extends MovableObject {
  constructor() {
    super().loadImage(
      "../assets/img/enemiesChicken/chickenNormal/walk/oneW.png"
    );
    this.x = 200 + Math.random() * 500;
  }
}
