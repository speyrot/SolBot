// src/riskManagement/riskManagement.js

const logger = require('../utils/logger');

class RiskManagement {
  constructor(params) {
    this.maxPositionSize = params.maxPositionSize || 1000; // Example: Max 1000 SOL
    this.stopLossPercentage = params.stopLossPercentage || 0.05; // 5%
    logger.info('Risk Management initialized with maxPositionSize: %d, stopLossPercentage: %f', this.maxPositionSize, this.stopLossPercentage);
  }

  canExecuteTrade(currentPosition, tradeAmount) {
    if (currentPosition + tradeAmount > this.maxPositionSize) {
      logger.warn('Trade rejected: Exceeds maximum position size.');
      return false;
    }
    // Add more risk checks as needed
    return true;
  }

  shouldTriggerStopLoss(currentPrice, averagePrice) {
    const loss = (averagePrice - currentPrice) / averagePrice;
    if (loss >= this.stopLossPercentage) {
      logger.warn('Stop-loss triggered: Current loss is %f%%', loss * 100);
      return true;
    }
    return false;
  }
}

module.exports = RiskManagement;