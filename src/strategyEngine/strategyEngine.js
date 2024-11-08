class StrategyEngine {
    constructor(strategy) {
      this.strategy = strategy;
    }
  
    setStrategy(newStrategy) {
      this.strategy = newStrategy;
    }
  
    onDataReceived(data) {
      const signal = this.strategy.analyze(data);
      if (signal && signal !== 'hold') {
        // Emit signal to Order Execution Module
        this.emit('signal', { signal, data });
      }
    }
}
  
// Ensure StrategyEngine extends EventEmitter to emit events
const EventEmitter = require('eventemitter3');
Object.setPrototypeOf(StrategyEngine.prototype, EventEmitter.prototype);
  
module.exports = StrategyEngine;
  