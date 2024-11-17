// src/strategyEngine/strategyInterface.js

class StrategyInterface {
    constructor() {}
  
    analyze(data) {
      throw new Error('Method "analyze" must be implemented.');
    }
}
  
module.exports = StrategyInterface;
  