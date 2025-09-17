import Level from "../models/Level.js";
import Chicken from "../models/Chicken.js";
import ChickenSmall from "../models/ChickenSmall.js";
import Cloud from "../models/Cloud.js";
import Background from "../models/Background.js";
import ChickenBoss from "../models/ChickenBoss.js";

const level1 = new Level({
  startX: 300,
  enemies: [
    new Chicken({ x: 805, y: 365 }),
    new Chicken({ x: 1208, y: 365 }),
    new Chicken({ x: 1860, y: 365 }),
    new Chicken({ x: 2160, y: 365 }),
    new Chicken({ x: 3358, y: 365 }),
    new Chicken({ x: 3850, y: 365 }),
    new Chicken({ x: 3250, y: 365 }),
    new Chicken({ x: 4860, y: 365 }),
    new Chicken({ x: 4260, y: 365 }),
    new Chicken({ x: 705, y: 365 }),
    new Chicken({ x: 5208, y: 365 }),
    new Chicken({ x: 5860, y: 365 }),
    new Chicken({ x: 5360, y: 365 }),
    new Chicken({ x: 5458, y: 365 }),
    new Chicken({ x: 7550, y: 365 }),
    new Chicken({ x: 7650, y: 365 }),
    new Chicken({ x: 7860, y: 365 }),
    new Chicken({ x: 7960, y: 365 }),
    new Chicken({ x: 8218, y: 365 }),
    new Chicken({ x: 8810, y: 365 }),
    new Chicken({ x: 8310, y: 365 }),
    new Chicken({ x: 8418, y: 365 }),
    new Chicken({ x: 8510, y: 365 }),
    new Chicken({ x: 8610, y: 365 }),
    new Chicken({ x: 8810, y: 365 }),
    new Chicken({ x: 8910, y: 365 }),
    new ChickenSmall({ x: 2370, y: 385 }),
    new ChickenSmall({ x: 1630, y: 385 }),
    new ChickenSmall({ x: 1406, y: 385 }),
    new ChickenSmall({ x: 1600, y: 385 }),
    new ChickenSmall({ x: 1665, y: 385 }),
    new ChickenSmall({ x: 2200, y: 385 }),
    new ChickenSmall({ x: 3536, y: 385 }),
    new ChickenSmall({ x: 3630, y: 385 }),
    new ChickenSmall({ x: 3735, y: 385 }),
    new ChickenSmall({ x: 4200, y: 385 }),
    new ChickenSmall({ x: 5400, y: 385 }),
    new ChickenSmall({ x: 5536, y: 385 }),
    new ChickenSmall({ x: 5630, y: 385 }),
    new ChickenSmall({ x: 6635, y: 385 }),
    new ChickenSmall({ x: 6200, y: 385 }),
    new ChickenSmall({ x: 7546, y: 385 }),
    new ChickenSmall({ x: 7640, y: 385 }),
    new ChickenSmall({ x: 7645, y: 385 }),
    new ChickenSmall({ x: 7240, y: 385 }),
    new ChickenBoss({ x: 9500, y: 380 }),
  ],

  clouds: [
    new Cloud({ x: 1053, y: 50 }),
    new Cloud({ x: 1750, y: 80 }),
    new Cloud({ x: 1600, y: 60 }),
    new Cloud({ x: 2203, y: 90 }),
    new Cloud({ x: 2053, y: 50 }),
    new Cloud({ x: 2750, y: 80 }),
    new Cloud({ x: 2600, y: 60 }),
    new Cloud({ x: 2203, y: 90 }),
    new Cloud({ x: 4601, y: 40 }),
    new Cloud({ x: 4340, y: 70 }),
    new Cloud({ x: 4600, y: 60 }),
    new Cloud({ x: 4203, y: 90 }),
    new Cloud({ x: 6601, y: 40 }),
    new Cloud({ x: 6340, y: 70 }),
    new Cloud({ x: 6053, y: 50 }),
    new Cloud({ x: 6750, y: 80 }),
    new Cloud({ x: 8600, y: 60 }),
    new Cloud({ x: 8203, y: 90 }),
    new Cloud({ x: 8760, y: 40 }),
    new Cloud({ x: 8340, y: 70 }),
  ],

  backgrounds: [
    new Background({
      imgPath: "assets/img/background/layers/air.png",
      x: 0,
      speedFactor: 0.3,
    }),
    new Background({
      imgPath: "assets/img/background/layers/air.png",
      x: 1440,
      speedFactor: 0.3,
    }),

    new Background({
      imgPath: "assets/img/background/layers/thirdLayer/full.png",
      x: 0,
      speedFactor: 0.5,
    }),
    new Background({
      imgPath: "assets/img/background/layers/thirdLayer/full.png",
      x: 1440,
      speedFactor: 0.5,
    }),

    new Background({
      imgPath: "assets/img/background/layers/secondLayer/full.png",
      x: 0,
      speedFactor: 0.7,
    }),
    new Background({
      imgPath: "assets/img/background/layers/secondLayer/full.png",
      x: 1440,
      speedFactor: 0.7,
    }),

    new Background({
      imgPath: "assets/img/background/layers/firstLayer/full.png",
      x: 0,
      speedFactor: 1.0,
    }),
    new Background({
      imgPath: "assets/img/background/layers/firstLayer/full.png",
      x: 1440,
      speedFactor: 1.0,
    }),
  ],
});

export default level1;
