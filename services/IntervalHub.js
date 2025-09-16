export default class IntervalHub {
  static allIntervals = [];
  static intervalCounter = 0;
  static isRunning = false;
  static gameLoopId = null;
  static deltaTime = 0;
  static lastTime = performance.now();
  static targetFPS = 60;

  static startCentralLoop({ onUpdate = null, onRender = null, targetFPS = 60 } = {}) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.targetFPS = targetFPS;

    const loop = (currentTime) => {
      if (!this.isRunning) return;

      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (onUpdate) {
        onUpdate(this.deltaTime);
      }

      this.processIntervals(this.deltaTime);

      if (onRender) {
        onRender(this.deltaTime);
      }

      this.gameLoopId = requestAnimationFrame(loop);
    };

    this.gameLoopId = requestAnimationFrame(loop);
  }

  static stopCentralLoop() {
    this.isRunning = false;
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

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
      accumulator: 0,
    };

    this.allIntervals.push(intervalData);
    this.notifyStateMachine();

    return intervalId;
  }

  static processIntervals(deltaTime) {
    const deltaMs = deltaTime * 1000/60;

    this.allIntervals.forEach((interval) => {
      if (interval.paused) return;

      interval.accumulator += deltaMs;

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

  static getIntervalsByType(type) {
    return this.allIntervals.filter((interval) => {
      if (typeof type === "string") {
        return interval.type === type;
      } else {
        return interval.target && interval.target instanceof type;
      }
    });
  }
  
  static async stopAllIntervals() {
    return new Promise((resolve) => {
      this.allIntervals = [];
      this.notifyStateMachine();
      resolve();
    });
  }

  static async notifyStateMachine() {
    try {
      // TODO: StateMachine.onIntervalsChanged(this.allIntervals);
      console.log(`IntervalHub: ${this.allIntervals.length} intervals active`);
    } catch (error) {
      console.error("Failed to notify StateMachine:", error);
    }
  }

  static fpsToMs(fps) {
    return 1000 / fps;
  }

  static msToFps(ms) {
    return 1000 / ms;
  }
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