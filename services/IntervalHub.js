// TODO #1: Step 01 - Enhanced IntervalHub with central loop and interval management
export default class IntervalHub {
  static allIntervals = [];
  static intervalCounter = 0;
  static isRunning = false;
  static gameLoopId = null;
  static deltaTime = 0;
  static lastTime = performance.now();

  // TODO #1: Central game loop - will replace World.js loop
  static startCentralLoop({ onUpdate = null, onRender = null } = {}) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (currentTime) => {
      if (!this.isRunning) return;

      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // TODO #1: Call update callback (will handle game logic)
      if (onUpdate) {
        onUpdate(this.deltaTime);
      }

      // TODO #1: Call render callback (will handle drawing)
      if (onRender) {
        onRender(this.deltaTime);
      }

      // TODO #1: Process all registered intervals
      this.processIntervals(this.deltaTime);

      this.gameLoopId = requestAnimationFrame(loop);
    };

    this.gameLoopId = requestAnimationFrame(loop);
  }

  // TODO #1: Stop central game loop
  static stopCentralLoop() {
    this.isRunning = false;
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  // TODO #1: Enhanced interval registration with unique ID and metadata
  static registerInterval({
    id = null,
    func = null,
    timer = 16,
    type = "generic",
    target = null,
    paused = false,
  } = {}) {
    if (!func) {
      throw new Error("registerInterval requires { func }");
    }

    const intervalId = id || `interval_${++this.intervalCounter}`;
    const intervalData = {
      id: intervalId,
      func,
      timer,
      type,
      target,
      paused,
      lastExecution: 0,
      nativeInterval: null,
    };

    // TODO #1: For now, still use native setInterval (will be replaced with deltaTime-based system)
    intervalData.nativeInterval = setInterval(() => {
      if (!intervalData.paused) {
        intervalData.func();
      }
    }, timer);

    this.allIntervals.push(intervalData);

    // TODO #1: Notify StateMachine about interval changes
    this.notifyStateMachine();

    return intervalId;
  }

  // TODO #1: Process intervals using deltaTime (future implementation)
  static processIntervals(deltaTime) {
    // TODO #1: Replace setInterval with deltaTime-based execution
    // This will be implemented in later steps
    this.allIntervals.forEach((interval) => {
      if (!interval.paused) {
        interval.lastExecution += deltaTime * 1000;
        if (interval.lastExecution >= interval.timer) {
          interval.func();
          interval.lastExecution = 0;
        }
      }
    });
  }

  // TODO #1: Stop interval by ID
  static stopInterval(intervalId) {
    const index = this.allIntervals.findIndex(
      (interval) => interval.id === intervalId
    );
    if (index !== -1) {
      const interval = this.allIntervals[index];
      if (interval.nativeInterval) {
        clearInterval(interval.nativeInterval);
      }
      this.allIntervals.splice(index, 1);
      this.notifyStateMachine();
      return true;
    }
    return false;
  }

  // TODO #1: Pause interval by ID
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

  // TODO #1: Resume interval by ID
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

  // TODO #1: Stop intervals by type (using instanceof check)
  static stopIntervalsByType(type) {
    const toRemove = this.allIntervals.filter((interval) => {
      if (typeof type === "string") {
        return interval.type === type;
      } else {
        // TODO #1: Check if target is instance of given class
        return interval.target && interval.target instanceof type;
      }
    });

    toRemove.forEach((interval) => {
      if (interval.nativeInterval) {
        clearInterval(interval.nativeInterval);
      }
    });

    this.allIntervals = this.allIntervals.filter(
      (interval) => !toRemove.includes(interval)
    );
    this.notifyStateMachine();

    return toRemove.length;
  }

  // TODO #1: Pause intervals by type
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

  // TODO #1: Resume intervals by type
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

  // TODO #1: Get intervals by type for StateMachine
  static getIntervalsByType(type) {
    return this.allIntervals.filter((interval) => {
      if (typeof type === "string") {
        return interval.type === type;
      } else {
        return interval.target && interval.target instanceof type;
      }
    });
  }
  
  // TODO #1: Enhanced stop all with async cleanup
  static async stopAllIntervals() {
    return new Promise((resolve) => {
      this.allIntervals.forEach((interval) => {
        if (interval.nativeInterval) {
          clearInterval(interval.nativeInterval);
        }
      });
      this.allIntervals = [];
      this.notifyStateMachine();
      resolve();
    });
  }

  // TODO #1: Notify StateMachine about interval changes (async)
  static async notifyStateMachine() {
    // TODO #1: Implement StateMachine notification
    // This will trigger AssetManager prefetching and render job preparation
    try {
      // TODO #1: StateMachine.onIntervalsChanged(this.allIntervals);
      console.log(`IntervalHub: ${this.allIntervals.length} intervals active`);
    } catch (error) {
      console.error("Failed to notify StateMachine:", error);
    }
  }

  // TODO #1: Get current state for debugging
  static getState() {
    return {
      intervalCount: this.allIntervals.length,
      isRunning: this.isRunning,
      deltaTime: this.deltaTime,
      intervals: this.allIntervals.map((interval) => ({
        id: interval.id,
        type: interval.type,
        timer: interval.timer,
        paused: interval.paused,
        target: interval.target?.constructor?.name || null,
      })),
    };
  }
}
// TODO #1: Global access for testing and debugging
window.IntervalHub = IntervalHub;

//REGISTER EVERYTHING ON INTERVAL HUB

// TODO #1: Test and debug functionality
// console.log('IntervalHub initialized:', IntervalHub.getState());
// Test interval registration:
// IntervalHub.registerInterval({
//     id: 'test-interval',
//     func: () => console.log('Test interval tick'),
//     timer: 1000,
//     type: 'test'
// });

//testing with IntervalHub.getState()

//TODO: REGISTER (1 EVOL)
// Instead of: setInterval(() => this.animate(), 100)
// IntervalHub.registerInterval({ 
//     id: `${this.constructor.name}_${this.instanceId}_animation`,
//     func: () => this.animate(), 
//     timer: 100,
//     type: this.constructor.name,
//     target: this
// });