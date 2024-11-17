// server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const DataCollector = require('./src/dataCollector/dataCollector');
const OneSigmaStrategy = require('./src/strategyEngine/oneSigmaStrategy');
const StrategyEngine = require('./src/strategyEngine/strategyEngine');
const OrderExecutor = require('./src/orderExecutor/orderExecutor'); // Import OrderExecutor
const PortfolioManager = require('./src/portfolioManager/portfolioManager');
const logger = require('./src/utils/logger');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize modules
const dataCollector = new DataCollector();
const oneSigmaStrategy = new OneSigmaStrategy({ windowSize: 5 }); // Reduced for testing
const strategyEngine = new StrategyEngine(oneSigmaStrategy);
const orderExecutor = new OrderExecutor();
const portfolioManager = new PortfolioManager();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Broadcast a message to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Set up WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  ws.on('close', () => console.log('Client disconnected'));
});

// Listen for data updates from DataCollector and broadcast price updates
dataCollector.on('data', (data) => {
  broadcast({ type: 'price', value: data.solPrice });
  strategyEngine.onDataReceived(data); // Pass data to StrategyEngine
});

// Listen for signals from StrategyEngine and execute orders via OrderExecutor
strategyEngine.on('signal', async ({ signal, data }) => {
  if (signal !== 'hold') {
    // Execute the order
    await orderExecutor.executeOrder(signal, data);
  }
});

// Listen for transactions from OrderExecutor and broadcast them
orderExecutor.on('transaction', (transaction) => {
  broadcast({ type: 'action', action: transaction.type, price: transaction.price, timestamp: transaction.timestamp });
});

// Listen for balance updates from PortfolioManager and broadcast them
portfolioManager.on('balanceUpdate', (balances) => {
  broadcast({ type: 'balance', balances });
});

// Start services
dataCollector.start();
portfolioManager.start();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
