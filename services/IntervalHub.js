// TODO: IntervalHub

class IntervalHub{
    static allIntervals=[];

    static startInterval(func, timer){
        const newInterval = setInterval(func, timer);
        IntervalHub.allIntervals.push(newInterval);
    }
    static stopAllIntervals(){
        IntervalHub.allIntervals.forEach(clearInterval);
    }
}