// src/dataCollector/dataCollector.js

const EventEmitter = require('eventemitter3');
const axios = require('axios');
const logger = require('../utils/logger');

class DataCollector extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
    // Corrected API endpoint with SOL and JUP mint addresses
    this.apiEndpoint = 'https://api.jup.ag/price/v2?ids=JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN,So11111111111111111111111111111111111111112';
    this.fetchInterval = 5000; // Fetch every 5 seconds
  }

  async start() {
    logger.info('Starting Data Collector...');
    // Start periodic data fetching
    this.interval = setInterval(() => this.fetchMarketData(), this.fetchInterval);
    // Optionally, fetch immediately on start
    await this.fetchMarketData();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      logger.info('Data Collector stopped.');
    }
  }

  async fetchMarketData() {
    try {
      logger.debug('Fetching market data from %s', this.apiEndpoint);
      const response = await axios.get(this.apiEndpoint);
      const data = response.data;

      // Extract SOL price
      const solData = data.data['So11111111111111111111111111111111111111112'];
      if (!solData || !solData.price) {
        throw new Error('SOL price data not found in the API response.');
      }
      const solPrice = parseFloat(solData.price);

      // Extract JUP price
      const jupData = data.data['JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'];
      if (!jupData || !jupData.price) {
        throw new Error('JUP price data not found in the API response.');
      }
      const jupPrice = parseFloat(jupData.price);

      logger.info('Market data fetched successfully: SOL/USD = %f, JUP/USD = %f', solPrice, jupPrice);
      // Emit the data to listeners
      this.emit('data', { solPrice, jupPrice });
    } catch (error) {
      logger.error('Error fetching market data: %s', error.message);
      // Emit an error event
      this.emit('error', error);
    }
  }
}

module.exports = DataCollector;
