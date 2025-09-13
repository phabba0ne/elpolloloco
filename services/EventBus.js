export default class EventBus {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.eventQueue = [];
    this.processing = false;
  }

  /**
   * Subscribe to event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} context - Context for callback
   */
  on(event, callback, context = null) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push({ callback, context });
  }

  /**
   * Subscribe to event once
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} context - Context for callback
   */
  once(event, callback, context = null) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, []);
    }
    this.onceListeners.get(event).push({ callback, context });
  }

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.findIndex(l => l.callback === callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data = null) {
    this.eventQueue.push({ event, data, timestamp: performance.now() });
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process event queue
   */
  processQueue() {
    this.processing = true;
    
    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift();
      
      // Process regular listeners
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(({ callback, context }) => {
          try {
            if (context) {
              callback.call(context, data);
            } else {
              callback(data);
            }
          } catch (error) {
            console.error(`Error in event listener for ${event}:`, error);
          }
        });
      }

      // Process once listeners
      if (this.onceListeners.has(event)) {
        const onceListeners = this.onceListeners.get(event);
        onceListeners.forEach(({ callback, context }) => {
          try {
            if (context) {
              callback.call(context, data);
            } else {
              callback(data);
            }
          } catch (error) {
            console.error(`Error in once event listener for ${event}:`, error);
          }
        });
        this.onceListeners.delete(event);
      }
    }
    
    this.processing = false;
  }

  /**
   * Get listener count for event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  getListenerCount(event) {
    const regular = this.listeners.has(event) ? this.listeners.get(event).length : 0;
    const once = this.onceListeners.has(event) ? this.onceListeners.get(event).length : 0;
    return regular + once;
  }
}