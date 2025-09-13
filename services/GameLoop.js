// export default class GameLoop {
//   constructor(eventBus = null) {
//     this.isRunning = false;
//     this.gameLoopId = null;
//     this.deltaTime = 0;
//     this.lastTime = performance.now();
//     this.targetFPS = 60;
//     this.actualFPS = 60;
//     this.frameCount = 0;
//     this.fpsUpdateTime = 0;
//     this.eventBus = eventBus;
    
//     // Callbacks
//     this.onUpdate = null;
//     this.onRender = null;
    
//     // Performance tracking
//     this.performanceStats = {
//       avgDeltaTime: 0,
//       minDeltaTime: Infinity,
//       maxDeltaTime: 0,
//       frameDrops: 0
//     };
//   }

//   /**
//    * Start the central game loop
//    * @param {Object} options - Loop options
//    */
//   start(options = {}) {
//     if (this.isRunning) return;

//     const { onUpdate = null, onRender = null, targetFPS = 60 } = options;
    
//     this.onUpdate = onUpdate;
//     this.onRender = onRender;
//     this.targetFPS = targetFPS;
//     this.isRunning = true;
//     this.lastTime = performance.now();
//     this.frameCount = 0;
//     this.fpsUpdateTime = this.lastTime;

//     console.log(`GameLoop: Started with target FPS: ${targetFPS}`);

//     const loop = (currentTime) => {
//       if (!this.isRunning) return;

//       this.deltaTime = (currentTime - this.lastTime) / 1000;
//       this.lastTime = currentTime;

//       // Performance tracking
//       this.updatePerformanceStats();

//       // Update phase (game logic)
//       if (this.onUpdate) {
//         try {
//           this.onUpdate(this.deltaTime);
//         } catch (error) {
//           console.error('Error in game update:', error);
//         }
//       }

//       // Process intervals
//       IntervalHub.processIntervals(this.deltaTime);

//       // Render phase (drawing)
//       if (this.onRender) {
//         try {
//           this.onRender(this.deltaTime);
//         } catch (error) {
//           console.error('Error in game render:', error);
//         }
//       }

//       // FPS calculation
//       this.frameCount++;
//       if (currentTime - this.fpsUpdateTime >= 1000) {
//         this.actualFPS = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
//         this.frameCount = 0;
//         this.fpsUpdateTime = currentTime;
        
//         if (this.eventBus) {
//           this.eventBus.emit('fps-update', {
//             fps: this.actualFPS,
//             targetFPS: this.targetFPS,
//             deltaTime: this.deltaTime,
//             performance: this.performanceStats
//           });
//         }
//       }

//       this.gameLoopId = requestAnimationFrame(loop);
//     };

//     this.gameLoopId = requestAnimationFrame(loop);
//   }

//   /**
//    * Stop the game loop
//    */
//   stop() {
//     this.isRunning = false;
//     if (this.gameLoopId) {
//       cancelAnimationFrame(this.gameLoopId);
//       this.gameLoopId = null;
//     }
//     console.log('GameLoop: Stopped');
//   }

//   /**
//    * Pause the game loop
//    */
//   pause() {
//     if (this.isRunning) {
//       this.stop();
//       if (this.eventBus) {
//         this.eventBus.emit('game-paused');
//       }
//     }
//   }

//   /**
//    * Resume the game loop
//    */
//   resume() {
//     if (!this.isRunning) {
//       this.start({
//         onUpdate: this.onUpdate,
//         onRender: this.onRender,
//         targetFPS: this.targetFPS
//       });
//       if (this.eventBus) {
//         this.eventBus.emit('game-resumed');
//       }
//     }
//   }

//   /**
//    * Update performance statistics
//    */
//   updatePerformanceStats() {
//     const targetFrameTime = 1 / this.targetFPS;
    
//     // Track performance
//     this.performanceStats.avgDeltaTime = 
//       (this.performanceStats.avgDeltaTime * 0.9) + (this.deltaTime * 0.1);
    
//     this.performanceStats.minDeltaTime = 
//       Math.min(this.performanceStats.minDeltaTime, this.deltaTime);
    
//     this.performanceStats.maxDeltaTime = 
//       Math.max(this.performanceStats.maxDeltaTime, this.deltaTime);

//     // Frame drop detection
//     if (this.deltaTime > targetFrameTime * 1.5) {
//       this.performanceStats.frameDrops++;
//     }
//   }

//   /**
//    * Get current performance stats
//    */
//   getPerformanceStats() {
//     return {
//       ...this.performanceStats,
//       actualFPS: this.actualFPS,
//       targetFPS: this.targetFPS,
//       deltaTime: this.deltaTime,
//       isRunning: this.isRunning
//     };
//   }

//   /**
//    * Reset performance stats
//    */
//   resetPerformanceStats() {
//     this.performanceStats = {
//       avgDeltaTime: 0,
//       minDeltaTime: Infinity,
//       maxDeltaTime: 0,
//       frameDrops: 0
//     };
//   }
// }
