const StrategyInterface = require('./strategyInterface');
const math = require('mathjs');

class OneSigmaStrategy extends StrategyInterface {
  constructor(params) {
    super();
    this.params = params;
    this.prices = [];
    this.windowSize = params.windowSize || 20; // Number of data points to consider
  }

  analyze(data) {
    // Update price history
    this.prices.push(data.price);
    if (this.prices.length > this.windowSize) {
      this.prices.shift(); // Keep only the latest 'windowSize' prices
    }

    // Ensure we have enough data points
    if (this.prices.length < this.windowSize) {
      return null; // Not enough data to make a decision
    }

    // Calculate mean and standard deviation
    const mean = math.mean(this.prices);
    const stdDev = math.std(this.prices);

    // Get the latest price
    const latestPrice = data.price;

    // Determine signals
    if (latestPrice <= mean - stdDev) {
      return 'buy';
    } else if (latestPrice >= mean + stdDev) {
      return 'sell';
    } else {
      return 'hold';
    }
  }
}

module.exports = OneSigmaStrategy;
