# 🐔 El Pollo Loco

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![JS](https://img.shields.io/badge/JavaScript-ES6+-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![Status](https://img.shields.io/badge/status-in%20development-blue)

## Project Overview

**El Pollo Loco** is an HTML5/Canvas-based side-scroller game that utilizes modern web technologies such as ES6+, the Canvas API, CSS3 animations, and HTML5 audio. The project is built with a modular structure, allowing easy extensions with new characters, enemies, assets, or gameplay mechanics.

---

## 🎮 Preview

> _(Insert a GIF or screenshot here once gameplay is stable)_

![Game Screenshot](assets/img/gif/all_sequences_bottle.gif)

---

## 🚀 Quickstart

```bash
# Clone the repo
git clone https://github.com/<your-org>/el-pollo-loco.git
cd el-pollo-loco

# Start a local web server (example with serve)
npx serve .
```

---

# El Pollo Loco – Developer Guide

## AssetManager Developer Documentation

**Purpose:**  
The `AssetManager` is a central hub for loading, caching, and accessing all images and audio used in the game. It ensures that all assets are available before gameplay starts, preventing rendering or sound errors.

### API

#### `AssetManager.loadImage(path)`

Loads a single image and stores it in the cache.

- **Parameters:** `path` – String path to the image.
- **Returns:** Promise resolving to the loaded `Image` object.

#### `AssetManager.loadImages(paths)`

Loads multiple images at once.

- **Parameters:** `paths` – Array of image paths.
- **Returns:** Promise resolving when all images are loaded.

#### `AssetManager.getImage(path)`

Retrieve a loaded image from the cache.

- **Parameters:** `path` – String path to the image.
- **Returns:** `HTMLImageElement` or `undefined`.

#### `AssetManager.loadAudio(path)`

Loads a single audio file and stores it in the cache.

- **Parameters:** `path` – String path to the audio file.
- **Returns:** Promise resolving to the loaded `Audio` object.

#### `AssetManager.loadAudios(paths)`

Loads multiple audio files at once.

- **Parameters:** `paths` – Array of audio paths.
- **Returns:** Promise resolving when all audio files are loaded.

#### `AssetManager.getAudio(path)`

Retrieve a loaded audio from the cache.

- **Parameters:** `path` – String path to the audio file.
- **Returns:** `HTMLAudioElement` or `undefined`.

#### `AssetManager.loadAll(assets)`

Loads all images and audio from an array of asset paths.

- **Parameters:** `assets` – Array of paths (images and audio mixed).
- **Returns:** Promise resolving when all assets are loaded.

### Best Practices

- Always preload assets before starting the game loop.
- Organize sprites by character/enemy in dedicated arrays (`PEPE_SPRITES`, `CHICKEN_SPRITES`) for clarity.
- Access assets via `getImage` or `getAudio` only after they are fully loaded.
- Avoid loading the same asset multiple times; `AssetManager` automatically caches loaded assets.

---

## IntervalHub Developer Documentation

**Purpose:**  
`IntervalHub` manages all `setInterval` calls centrally to prevent memory leaks and uncontrolled intervals. This ensures clean game lifecycle management.

### API

#### `IntervalHub.startInterval(func, timer)`

Starts a new interval and stores it internally.

- **Parameters:**
  - `func` – Callback function to execute at each tick.
  - `timer` – Interval duration in milliseconds.
- **Returns:** Nothing.

**Example:**

```javascript
IntervalHub.startInterval(() => {
  console.log("Tick every 1000ms");
}, 1000);
```

#### `IntervalHub.stopAllIntervals()`

Stops all currently active intervals.

- **Use case:** Game Over, level reset, or pausing the game.

**Example:**

```javascript
IntervalHub.stopAllIntervals(); // Stop all intervals at Game Over
```

### Best Practices

- Never use direct `setInterval` calls in game logic. Always use `IntervalHub`.
- Start intervals in `World.start()` or event-driven methods like "Level Begin".
- Stop intervals in `World.stop()` or on "Game Over".
- Use intervals only for side tasks (cloud movement, particle effects, enemy spawning). Physics and rendering should run in the main game loop (`requestAnimationFrame`).
- Debug tip: `console.log(IntervalHub.allIntervals)` to check active intervals.

### Example Integration in World:

```javascript
start() {
  this._loop = this.loop.bind(this);
  requestAnimationFrame(this._loop);

  // Move clouds every 50ms
  IntervalHub.startInterval(() => this.updateClouds(), 50);

  // Spawn enemies every 3 seconds
  IntervalHub.startInterval(() => this.spawnEnemy(), 3000);
}

stop() {
  this.running = false;
  IntervalHub.stopAllIntervals(); // Important!
}
```

---

## StateMachine Developer Documentation

**Purpose:**  
`StateMachine` handles animation states for characters and enemies, providing automatic frame iteration and easy state switching.

### How to Use

#### 1. Define Sprites

Create a `SPRITES` object with all animation states for your character:

```javascript
const SPRITES = {
  idle: ["assets/img/boss/idle/idle1.png", "assets/img/boss/idle/idle2.png"],
  attack: ["assets/img/boss/attack/attack1.png", "assets/img/boss/attack/attack2.png"],
  dead: ["assets/img/boss/dead/dead1.png"],
};
```

#### 2. Instantiate StateMachine

```javascript
this.stateMachine = new StateMachine(SPRITES, "idle", 8); // Initial state "idle", frame rate 8
```

#### 3. Preload Frames (optional but recommended)

```javascript
SPRITES.idle.forEach(path => AssetManager.loadImage(path));
```

#### 4. Activate Animation in Game Loop

```javascript
setInterval(() => {
  const img = this.stateMachine.getFrame();
  if (img) this.img = img;
}, 1000 / this.stateMachine.frameRate);
```

#### 5. Change State

```javascript
this.stateMachine.setState("attack");
```

### Notes

- Make sure all images are preloaded before animation to avoid missing frames.
- `StateMachine` is reusable for any character or enemy.
- Update the entity's `img` property each frame using `getFrame()`.
- Frame iteration is automatic; `getFrame()` returns the next frame in the current state.

### Best Practices for Extending the Game

- Always preload new sprite sets in `AssetManager`.
- Use descriptive state names (e.g., `walkFast`, `jumpAttack`) for clarity.
- Keep frame rates consistent per character to avoid animation glitches.
- Integrate `StateMachine` updates within the main loop or controlled intervals.
- Avoid long-running intervals for animation; prefer `requestAnimationFrame` for smooth updates if performance is critical.
