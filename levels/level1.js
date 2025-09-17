import Level from "../models/Level.js";
import Chicken from "../models/Chicken.js";
import ChickenSmall from "../models/ChickenSmall.js";
import Cloud from "../models/Cloud.js";
import Background from "../models/Background.js";
import ChickenBoss from "../models/ChickenBoss.js";

/**
 * Creates enemy instances for level 1
 * @returns {Array<Object>}
 */
function createEnemies() {
  const chickens = [
    805, 1208, 1860, 2160, 3358, 3850, 3250, 4860, 4260, 705,
    5208, 5860, 5360, 5458, 7550, 7650, 7860, 7960, 8218, 8810,
    8310, 8418, 8510, 8610, 8810, 8910,
  ].map(x => new Chicken({ x, y: 365 }));
  const smalls = [
    2370, 1630, 1406, 1600, 1665, 2200, 3536, 3630, 3735, 4200,
    5400, 5536, 5630, 6635, 6200, 7546, 7640, 7645, 7240,
  ].map(x => new ChickenSmall({ x, y: 385 }));
  return [...chickens, ...smalls, new ChickenBoss({ x: 9500, y: 380 })];
}

/**
 * Creates cloud instances for level 1
 * @returns {Array<Object>}
 */
function createClouds() {
  return [
    { x: 1053, y: 50 }, { x: 1750, y: 80 }, { x: 1600, y: 60 },
    { x: 2203, y: 90 }, { x: 2053, y: 50 }, { x: 2750, y: 80 },
    { x: 2600, y: 60 }, { x: 2203, y: 90 }, { x: 4601, y: 40 },
    { x: 4340, y: 70 }, { x: 4600, y: 60 }, { x: 4203, y: 90 },
    { x: 6601, y: 40 }, { x: 6340, y: 70 }, { x: 6053, y: 50 },
    { x: 6750, y: 80 }, { x: 8600, y: 60 }, { x: 8203, y: 90 },
    { x: 8760, y: 40 }, { x: 8340, y: 70 },
  ].map(pos => new Cloud(pos));
}

/**
 * Creates background instances for level 1
 * @returns {Array<Object>}
 */
function createBackgrounds() {
  return [
    ["air.png", 0, 0.3], ["air.png", 1440, 0.3],
    ["thirdLayer/full.png", 0, 0.5], ["thirdLayer/full.png", 1440, 0.5],
    ["secondLayer/full.png", 0, 0.7], ["secondLayer/full.png", 1440, 0.7],
    ["firstLayer/full.png", 0, 1.0], ["firstLayer/full.png", 1440, 1.0],
  ].map(([file, x, speedFactor]) =>
    new Background({ imgPath: `assets/img/background/layers/${file}`, x, speedFactor })
  );
}

/**
 * Level 1 configuration
 * @type {Level}
 */
const level1 = new Level({
  startX: 300,
  enemies: createEnemies(),
  clouds: createClouds(),
  backgrounds: createBackgrounds(),
});

export default level1;