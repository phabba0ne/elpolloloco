export default class ServiceContainer {
  static services = new Map();
  static singletons = new Map();
  static factories = new Map();
  static initializing = new Set();

  /**
   * Register a service factory
   * @param {string} name - Service name
   * @param {Function|Class} factory - Factory function or class constructor
   * @param {Object} options - Registration options
   */
  static register(name, factory, options = {}) {
    const { singleton = true, dependencies = [] } = options;
    
    this.factories.set(name, {
      factory,
      singleton,
      dependencies,
      initialized: false
    });
  }

  /**
   * Get service instance
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  static get(name) {
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    if (this.initializing.has(name)) {
      throw new Error(`Circular dependency detected for service: ${name}`);
    }

    const serviceConfig = this.factories.get(name);
    if (!serviceConfig) {
      throw new Error(`Service not registered: ${name}`);
    }

    this.initializing.add(name);

    try {
      // Resolve dependencies
      const deps = serviceConfig.dependencies.map(dep => this.get(dep));
      
      // Create instance
      let instance;
      if (typeof serviceConfig.factory === 'function') {
        if (serviceConfig.factory.prototype && serviceConfig.factory.prototype.constructor) {
          instance = new serviceConfig.factory(...deps);
        } else {
          instance = serviceConfig.factory(...deps);
        }
      } else {
        instance = serviceConfig.factory;
      }

      if (serviceConfig.singleton) {
        this.singletons.set(name, instance);
      }

      this.initializing.delete(name);
      return instance;
    } catch (error) {
      this.initializing.delete(name);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  static async initialize() {
    const serviceNames = Array.from(this.factories.keys());
    await Promise.all(serviceNames.map(name => this.get(name)));
  }

  /**
   * Clear all services (for testing)
   */
  static clear() {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
    this.initializing.clear();
  }
}