/**
 * IntervalHub
 * ------------
 * Central manager for all setIntervals.
 * Allows starting intervals and stopping them all at once.
 */
class IntervalHub {
    static allIntervals = [];

    static startInterval(func, timer) {
        const newInterval = setInterval(func, timer);
        this.allIntervals.push(newInterval);
    }

    static stopAllIntervals() {
        this.allIntervals.forEach(clearInterval);
        this.allIntervals = [];
    }
}

// Global verfügbar machen
window.IntervalHub = IntervalHub;

// test
// console.log(IntervalHub.allIntervals)