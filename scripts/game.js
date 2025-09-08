import World from "../models/World.js";
import Keyboard from "../services/Keyboard.js";
import level1 from "../levels/level1.js";
import Character from "../models/Character.js";
import AssetManager from "../services/AssetManager.js";

let world;
let keyboard;
let character;
let level = level1;

async function init() {

  const canvas = document.getElementById("canvas");
  keyboard = new Keyboard();
  await AssetManager.preload();
  character = new Character({ x: 200, y: 370 });

  world = new World({
    canvas,
    keyboard,
    level,
    character,
    debug: true,
  });

  world.start();
}

window.addEventListener("load", init);
