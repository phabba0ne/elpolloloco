import World from "../models/World.js";
import Keyboard from "../services/Keyboard.js";
import level1 from "../levels/level1.js";
import Character from "../models/Character.js";
import AssetManager from "../services/AssetManager.js";

let world;
let keyboard;
let character;
let level = level1;

// Hauptinitialisierung
async function init() {
  const canvas = document.getElementById("canvas");
  keyboard = new Keyboard();

  // --- Alle Assets preloaden ---
  await AssetManager.preload();
  // --- Character erstellen ---
  character = new Character({ x: 200, y: 370 });

  // --- World erstellen ---
  world = new World({
    canvas,
    keyboard,
    level,
    character,
    debug: true,
  });

  // --- Starten ---
  world.start();
}

// Start, wenn Fenster geladen ist
window.addEventListener("load", init);




// TODO:
// Coin
// update(deltaTime, world)
// Coin
// collect(character)
// Coin
// draw(ctx)
// MovableObject
// doDamage(target)
// SalsaBottle
// update(deltaTime, objects)
// SalsaBottle
// explode()
// SalsaBottle
// draw(ctx)
// SalsaBottle
// isCollidingWith(obj)
