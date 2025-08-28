class World {
  character = new Character();
  enemies = [new Chicken(), new Chicken(), new Chicken()];
  clouds = [new Cloud()];
  backgrounds = [
    new Background("../assets/img/background/layers/air.png", 0),
    new Background("../assets/img/background/layers/thirdLayer/one.png", 0),
    new Background("../assets/img/background/layers/secondLayer/one.png", 0),
    new Background("../assets/img/background/layers/firstLayer/one.png", 0),
  ];

  canvas;
  ctx;

  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.addObjectsToMap(this.backgrounds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);
    this.addObjectsToMap(this.clouds);

    self = this;
    requestAnimationFrame(function () {
      self.draw;
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  addToMap(mo) {
    this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
  }
}
