🐔# 🐔 El Pollo Loco

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![JS](https://img.shields.io/badge/JavaScript-ES6+-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![Status](https://img.shields.io/badge/status-in%20development-blue)

A small **HTML5/Canvas-based platformer game** built with **Vanilla JavaScript (ES6+)**, using a clean modular architecture with services for **state management, asset handling, and a central game loop**.

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



<!-- ------------ DEV DOKU ------------ -->

BENEFITS / BEST PRACTICE IntervalHub :
	•	All animation intervals are centrally tracked.
	•	You can stop all or selective intervals when changing levels or pausing the game.
	•	Keeps your main World.loop() clean and free from scattered setInterval calls.


  PROBLEMATIC:

  setInterval(() => {
  const path = this.stateMachine.getNextFrame();
  if (path && this.imageCache[path]) {
    this.img = this.imageCache[path];
  }
}, 1000 / this.stateMachine.frameRate);

Problem: each character/enemy that uses setInterval creates a separate, unmanaged interval.
This can lead to too many intervals, memory leaks, or difficulty stopping animations when the game stops.

REFAC LIKE THIS:

1.	Replace all setInterval calls with IntervalHub.startInterval()

IntervalHub.startInterval(() => {
  const path = this.stateMachine.getNextFrame();
  if (path && this.imageCache[path]) {
    this.img = this.imageCache[path];
  }
}, 1000 / this.stateMachine.frameRate);


// e.g., on game over or when the character is removed
IntervalHub.stopAllIntervals();



<!-- ---------- IntervalHub ---------- -->

IntervalHub Developer Documentation

Purpose

The IntervalHub is a central helper class to manage all setInterval calls. This prevents intervals from running uncontrollably (avoiding memory leaks and performance issues) and provides a unified mechanism to start and stop intervals.

API

IntervalHub.startInterval(func, timer)

Starts a new interval.

Parameters:

func – Callback function to execute at each tick

timer – Time interval in milliseconds

Returns: nothing (the interval is stored internally)

Example:

IntervalHub.startInterval(() => {
  console.log("Tick every 1000ms");
}, 1000);

IntervalHub.stopAllIntervals()

Stops all intervals that were started.

Useful for Game Over, level change, or when a reset is needed.

Example:

// e.g., in World.stop()
IntervalHub.stopAllIntervals();

Best Practices

Do not use direct setInterval calls in game code.

Always use IntervalHub.

Lifecycle management:

Start intervals in World.start() or on events like "Level Begin".

Stop intervals in World.stop() or on "Game Over".

Use intervals for side tasks only:

Repeating tasks like cloud movement, enemy spawning, particle effects.

Physics or rendering should stay in the main loop (requestAnimationFrame).

Debugging tip:

Use console.log(IntervalHub.allIntervals) to check active intervals if debugging performance issues.

Example Integration in World

start() {
  // Main loop
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

Note:
This approach ensures that no intervals continue running uncontrollably when the game is paused or stopped.


<!-- ---------- StateMachine ---------- -->

How to Use the StateMachine

1. Create a new character

Create a new class in models/

Define a SPRITES object with all states

const SPRITES = {
  idle: ["assets/img/boss/idle/idle1.png", "assets/img/boss/idle/idle2.png"],
  attack: ["assets/img/boss/attack/attack1.png", "assets/img/boss/attack/attack2.png"],
  dead: ["assets/img/boss/dead/dead1.png"],
};

2. Instantiate the StateMachine

this.stateMachine = new StateMachine(SPRITES, "idle", 8);
this.loadImage(SPRITES.idle[0]);
this.stateMachine.preload((path) => this.loadImage(path));

SPRITES defines all animation frames per state.

"idle" is the initial state.

8 is the frame rate for this animation.

3. Activate the animation

setInterval(() => {
  const path = this.stateMachine.getNextFrame();
  if (path && this.imageCache[path]) {
    this.img = this.imageCache[path];
  }
}, 1000 / this.stateMachine.frameRate);

The interval cycles through the frames of the current state.

getNextFrame() returns the next image path in the current animation sequence.

Make sure the image is already loaded in this.imageCache.

4. Change the state

this.stateMachine.setState("attack");

Call setState() with the name of the new state to switch animations.

The next call to getNextFrame() will return frames from the new state.

Notes

Ensure all images are preloaded to avoid missing frames.

The StateMachine class can be reused for any character or enemy in your game.

Check Character and Enemy classes to integrate the stateMachine correctly and update this.img every frame.

```
