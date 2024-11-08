const DataCollector = require('./dataCollector/dataCollector');
const StrategyEngine = require('./strategyEngine/strategyEngine');
const OneSigmaStrategy = require('./strategyEngine/oneSigmaStrategy');
const OrderExecutor = require('./orderExecutor/orderExecutor');
const EventEmitter = require('eventemitter3');

// Initialize modules
const dataCollector = new DataCollector();
const oneSigmaStrategy = new OneSigmaStrategy({ windowSize: 20 });
const strategyEngine = new StrategyEngine(oneSigmaStrategy);
const orderExecutor = new OrderExecutor();

// Ensure strategyEngine can emit events
Object.setPrototypeOf(strategyEngine, EventEmitter.prototype);

// Set up event listeners
dataCollector.on('data', (data) => {
  strategyEngine.onDataReceived(data);
});

strategyEngine.on('signal', async ({ signal, data }) => {
  await orderExecutor.executeOrder(signal, data);
});

// Start the data collector
dataCollector.start();
