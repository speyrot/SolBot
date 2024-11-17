// src/index.js

const DataCollector = require('./dataCollector/dataCollector');
const StrategyEngine = require('./strategyEngine/strategyEngine');
const OneSigmaStrategy = require('./strategyEngine/oneSigmaStrategy');
const OrderExecutor = require('./orderExecutor/orderExecutor');
const logger = require('./utils/logger');

// Initialize modules
const dataCollector = new DataCollector();
const oneSigmaStrategy = new OneSigmaStrategy({ windowSize: 20 });
const strategyEngine = new StrategyEngine(oneSigmaStrategy);
const orderExecutor = new OrderExecutor();

// Set up event listeners
dataCollector.on('data', (data) => {
  logger.info('DataCollector emitted data.');
  strategyEngine.onDataReceived(data);
});

strategyEngine.on('signal', async ({ signal, data }) => {
  logger.info('StrategyEngine emitted signal: %s', signal);
  await orderExecutor.executeOrder(signal, data);
});

// Handle errors
dataCollector.on('error', (error) => {
  logger.error('DataCollector encountered an error: %s', error.message);
});

strategyEngine.on('error', (error) => {
  logger.error('StrategyEngine encountered an error: %s', error.message);
});

// Start the data collector
dataCollector.start();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  dataCollector.stop();
  process.exit();
});
