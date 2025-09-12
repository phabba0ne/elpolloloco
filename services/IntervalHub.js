// Enhanced IntervalHub optimized for canvas games
export default class IntervalHub {
  static allIntervals = [];
  static intervalCounter = 0;
  static isRunning = false;
  static gameLoopId = null;
  static deltaTime = 0;
  static lastTime = performance.now();
  static targetFPS = 60;

  // Central game loop - replaces World.js loop
  static startCentralLoop({ onUpdate = null, onRender = null, targetFPS = 60 } = {}) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.targetFPS = targetFPS;

    const loop = (currentTime) => {
      if (!this.isRunning) return;

      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Call update callback (game logic)
      if (onUpdate) {
        onUpdate(this.deltaTime);
      }

      // Process all registered intervals using deltaTime
      this.processIntervals(this.deltaTime);

      // Call render callback (drawing)
      if (onRender) {
        onRender(this.deltaTime);
      }

      this.gameLoopId = requestAnimationFrame(loop);
    };

    this.gameLoopId = requestAnimationFrame(loop);
  }

  // Stop central game loop
  static stopCentralLoop() {
    this.isRunning = false;
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  // Simplified API: startInterval(func, intervalMs, options)
  static startInterval(func, intervalMs = 16, options = {}) {
    const {
      id = null,
      type = "generic",
      target = null,
      paused = false,
    } = options;

    if (!func || typeof func !== 'function') {
      throw new Error("startInterval requires a function as first parameter");
    }

    const intervalId = id || `interval_${++this.intervalCounter}`;
    const intervalData = {
      id: intervalId,
      func,
      timer: intervalMs,
      type,
      target,
      paused,
      accumulator: 0, // For deltaTime-based execution
    };

    this.allIntervals.push(intervalData);
    this.notifyStateMachine();

    return intervalId;
  }

  // Process intervals using deltaTime (no more setInterval!)
  static processIntervals(deltaTime) {
    const deltaMs = deltaTime * 1000/60;

    this.allIntervals.forEach((interval) => {
      if (interval.paused) return;

      interval.accumulator += deltaMs;

      // Execute function when accumulated time exceeds timer
      while (interval.accumulator >= interval.timer) {
        try {
          interval.func();
        } catch (error) {
          console.error(`Error in interval ${interval.id}:`, error);
        }
        interval.accumulator -= interval.timer;
      }
    });
  }

  // Stop interval by ID
  static stopInterval(intervalId) {
    const index = this.allIntervals.findIndex(
      (interval) => interval.id === intervalId
    );
    if (index !== -1) {
      this.allIntervals.splice(index, 1);
      this.notifyStateMachine();
      return true;
    }
    return false;
  }

  // Pause interval by ID
  static pauseInterval(intervalId) {
    const interval = this.allIntervals.find(
      (interval) => interval.id === intervalId
    );
    if (interval) {
      interval.paused = true;
      return true;
    }
    return false;
  }

  // Resume interval by ID
  static resumeInterval(intervalId) {
    const interval = this.allIntervals.find(
      (interval) => interval.id === intervalId
    );
    if (interval) {
      interval.paused = false;
      return true;
    }
    return false;
  }

  // Stop intervals by type or class instance
  static stopIntervalsByType(type) {
    const toRemove = this.allIntervals.filter((interval) => {
      if (typeof type === "string") {
        return interval.type === type;
      } else {
        return interval.target && interval.target instanceof type;
      }
    });

    this.allIntervals = this.allIntervals.filter(
      (interval) => !toRemove.includes(interval)
    );
    this.notifyStateMachine();

    return toRemove.length;
  }

  // Pause intervals by type
  static pauseIntervalsByType(type) {
    let count = 0;
    this.allIntervals.forEach((interval) => {
      if (typeof type === "string") {
        if (interval.type === type) {
          interval.paused = true;
          count++;
        }
      } else {
        if (interval.target && interval.target instanceof type) {
          interval.paused = true;
          count++;
        }
      }
    });
    return count;
  }

  // Resume intervals by type
  static resumeIntervalsByType(type) {
    let count = 0;
    this.allIntervals.forEach((interval) => {
      if (typeof type === "string") {
        if (interval.type === type) {
          interval.paused = false;
          count++;
        }
      } else {
        if (interval.target && interval.target instanceof type) {
          interval.paused = false;
          count++;
        }
      }
    });
    return count;
  }

  // Get intervals by type for StateMachine
  static getIntervalsByType(type) {
    return this.allIntervals.filter((interval) => {
      if (typeof type === "string") {
        return interval.type === type;
      } else {
        return interval.target && interval.target instanceof type;
      }
    });
  }
  
  // Enhanced stop all with async cleanup
  static async stopAllIntervals() {
    return new Promise((resolve) => {
      this.allIntervals = [];
      this.notifyStateMachine();
      resolve();
    });
  }

  // Notify StateMachine about interval changes
  static async notifyStateMachine() {
    try {
      // TODO: StateMachine.onIntervalsChanged(this.allIntervals);
      console.log(`IntervalHub: ${this.allIntervals.length} intervals active`);
    } catch (error) {
      console.error("Failed to notify StateMachine:", error);
    }
  }

  // Get current state for debugging
  static getState() {
    return {
      intervalCount: this.allIntervals.length,
      isRunning: this.isRunning,
      deltaTime: this.deltaTime,
      targetFPS: this.targetFPS,
      intervals: this.allIntervals.map((interval) => ({
        id: interval.id,
        type: interval.type,
        timer: interval.timer,
        paused: interval.paused,
        accumulator: interval.accumulator,
        target: interval.target?.constructor?.name || null,
      })),
    };
  }

  // Utility: Convert FPS to milliseconds
  static fpsToMs(fps) {
    return 1000 / fps;
  }

  // Utility: Convert milliseconds to FPS
  static msToFps(ms) {
    return 1000 / ms;
  }
}

// Global access for testing and debugging
if (typeof window !== 'undefined') {
  window.IntervalHub = IntervalHub;
}

// Usage Examples:
// 
// Start the central loop:
// IntervalHub.startCentralLoop({
//   onUpdate: (deltaTime) => { /* game logic */ },
//   onRender: (deltaTime) => { /* drawing */ }
// });
//
// Your desired usage pattern:
// const intervalId = IntervalHub.startInterval(this.updateX, 1000/20);
// 
// With arrow function:
// updateX = () => { this.x += 10; }
//
// With regular method (auto-bound if target is provided):
// IntervalHub.startInterval(
//   this.updateX.bind(this), 
//   1000/20, 
//   { target: this, type: this.constructor.name }
// );
//
// Or using FPS utility:
// IntervalHub.startInterval(this.updateX, IntervalHub.fpsToMs(20));