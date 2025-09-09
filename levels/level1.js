import Level from "../models/Level.js";
import Chicken from "../models/Chicken.js";
import ChickenSmall from "../models/ChickenSmall.js";
import Cloud from "../models/Cloud.js";
import Background from "../models/Background.js";
import ChickenBoss from "../models/ChickenBoss.js";

const level1 = new Level({
  startX: 300,
  enemies: [
    // Normale Chickens - verteilt über das Level
    new Chicken({ x: 800, y: 385 }), // erste normale Chicken
    new Chicken({ x: 1200, y: 385 }), // zweite normale Chicken
    new Chicken({ x: 1800, y: 385 }), // dritte normale Chicken
    new Chicken({ x: 2400, y: 385 }), // vierte normale Chicken

    // Small Chickens - schnellere kleine Hühner
    new ChickenSmall({ x: 1000, y: 385 }), // erste kleine Chicken
    new ChickenSmall({ x: 1600, y: 385 }), // zweite kleine Chicken
    new ChickenSmall({ x: 2200, y: 385 }), // dritte kleine Chicken

    // Boss Chicken - am Ende des Levels
    new ChickenBoss({ x: 1000, y: 160 }), // Boss Chicken (großer Endgegner)
  ],

  // CLOUDS - Mehr Wolken fü}r bessere Atmosphäre
  clouds: [
    new Cloud({ x: 100, y: 50 }), // Wolke links
    new Cloud({ x: 400, y: 80 }), // Wolke mitte-links
    new Cloud({ x: 800, y: 60 }), // Wolke mitte
    new Cloud({ x: 1200, y: 90 }), // Wolke mitte-rechts
    new Cloud({ x: 1600, y: 40 }), // Wolke rechts
    new Cloud({ x: 2000, y: 70 }), // Wolke weit rechts
  ],

  // BACKGROUNDS - Parallax Scrolling Layer (bereits gut konfiguriert)
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
