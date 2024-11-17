// src/strategyEngine/strategyEngine.js

const EventEmitter = require('eventemitter3');
const logger = require('../utils/logger');

class StrategyEngine extends EventEmitter {
  constructor(strategy) {
    super();
    this.strategy = strategy;
    logger.info('Strategy Engine initialized with strategy: %s', strategy.constructor.name);
  }

  setStrategy(newStrategy) {
    this.strategy = newStrategy;
    logger.info('Strategy switched to: %s', newStrategy.constructor.name);
  }

  onDataReceived(data) {
    logger.debug('Strategy Engine received data: %O', data);
    const signal = this.strategy.analyze(data);
    logger.info('Strategy Engine generated signal: %s', signal);
    if (signal && signal !== 'hold') {
      // Emit signal to Order Execution Module
      this.emit('signal', { signal, data });
      logger.info('Signal emitted: %s', signal);
    }
  }
}

module.exports = StrategyEngine;
