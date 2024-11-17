// src/strategyEngine/oneSigmaStrategy.js

const StrategyInterface = require('./strategyInterface');
const math = require('mathjs');
const logger = require('../utils/logger');

class OneSigmaStrategy extends StrategyInterface {
  constructor(params) {
    super();
    this.params = params;
    this.prices = [];
    this.windowSize = params.windowSize || 20; // Number of data points to consider
    logger.info('OneSigmaStrategy initialized with windowSize: %d', this.windowSize);
  }

  analyze(data) {
    logger.debug('Analyzing data: %O', data);
    // Use 'solPrice' instead of 'price'
    if (typeof data.solPrice !== 'number') {
      logger.warn('Data does not contain a valid solPrice.');
      return 'hold';
    }

    this.prices.push(data.solPrice);
    if (this.prices.length > this.windowSize) {
      this.prices.shift(); // Keep only the latest 'windowSize' prices
    }

    // Ensure we have enough data points
    if (this.prices.length < this.windowSize) {
      logger.debug('Not enough data points to analyze. Current count: %d', this.prices.length);
      return 'hold'; // Not enough data to make a decision
    }

    // Calculate mean and standard deviation
    const mean = math.mean(this.prices);
    const stdDev = math.std(this.prices);

    // Get the latest price
    const latestPrice = data.solPrice;
    logger.debug('Mean: %f, StdDev: %f, Latest Price: %f', mean, stdDev, latestPrice);

    // Determine signals
    if (latestPrice <= mean - stdDev) {
      logger.info('Condition met for BUY signal.');
      return 'buy';
    } else if (latestPrice >= mean + stdDev) {
      logger.info('Condition met for SELL signal.');
      return 'sell';
    } else {
      logger.debug('No significant price movement. Holding position.');
      return 'hold';
    }
  }
}

module.exports = OneSigmaStrategy;