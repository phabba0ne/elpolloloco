const level1 = new Level(
  [new Chicken(), new Chicken(), new Chicken(), new Chicken(), new ChickenBoss()],
  [new Cloud()],
  [
    new Background("assets/img/background/layers/air.png", 0, 0.3),
    new Background("assets/img/background/layers/air.png", 1440, 0.3),
    new Background("assets/img/background/layers/thirdLayer/full.png", 0, 0.5),
    new Background(
      "assets/img/background/layers/thirdLayer/full.png",
      1440,
      0.5
    ),
    new Background("assets/img/background/layers/secondLayer/full.png", 0, 0.7),
    new Background(
      "assets/img/background/layers/secondLayer/full.png",
      1440,
      0.7
    ),
    new Background("assets/img/background/layers/firstLayer/full.png", 0, 1.0),
    new Background(
      "assets/img/background/layers/firstLayer/full.png",
      1440,
      1.0
    ),
  ]);
