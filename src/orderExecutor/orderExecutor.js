// src/orderExecutor/orderExecutor.js

const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const EventEmitter = require('events'); // Import EventEmitter
const axios = require('axios');
const logger = require('../utils/logger');
const PortfolioManager = require('../portfolioManager/portfolioManager');
const RiskManagement = require('../riskManagement/riskManagement');
require('dotenv').config();

class OrderExecutor extends EventEmitter { // Extend EventEmitter
  constructor() {
    super(); // Initialize EventEmitter
    try {
      // Initialize connection and wallet
      this.connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
      this.privateKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
      this.keypair = Keypair.fromSecretKey(this.privateKey);
      logger.info('Order Executor initialized with wallet: %s', this.keypair.publicKey.toBase58());

      this.riskManager = new RiskManagement({
        maxPositionSize: 1000, // Example values
        stopLossPercentage: 0.05
      });

      this.portfolioManager = new PortfolioManager();
      this.currentPosition = 0; // Will be updated by PortfolioManager

      // Initialize by fetching current balances
      this.initialize();
    } catch (error) {
      logger.error('Error initializing OrderExecutor: %s', error.message);
      // Optionally, rethrow or handle the error
    }
  }

  async initialize() {
    await this.portfolioManager.fetchBalances();
    // Replace 'SOL_MINT_ADDRESS' with the actual SOL mint address or appropriate key
    this.currentPosition = this.portfolioManager.getBalance('SOL'); // Assuming 'SOL' key
    logger.info('Initial position set to: %d SOL', this.currentPosition);
  }

  async executeOrder(signal, data) {
    try {
      logger.info('Executing order: %s', signal);
      
      // Update portfolio before making decisions
      await this.portfolioManager.fetchBalances();
      this.currentPosition = this.portfolioManager.getBalance('SOL');
      
      // Risk check before executing the trade
      if (!this.riskManager.canExecuteTrade(this.currentPosition, data.amount)) {
        logger.warn('Trade aborted due to risk management rules.');
        return;
      }

      if (signal === 'buy') {
        await this.buy(data);
        this.currentPosition += data.amount; // Update position
      } else if (signal === 'sell') {
        await this.sell(data);
        this.currentPosition -= data.amount; // Update position
      }

      // Emit 'transaction' event after executing the order
      this.emit('transaction', { type: signal, price: data.solPrice, timestamp: new Date().toISOString() });
    } catch (error) {
      logger.error('Error executing order: %s', error.message);
      // Optionally, handle retries or additional error handling
    }
  }

  async buy(data) {
    logger.info('Placing BUY order for asset: %s', data.asset || 'Unknown');
    // Example: Send a transaction (this is a placeholder)
    const recipient = new Keypair().publicKey; // Replace with actual recipient
    const lamports = 1000000; // Replace with actual amount (1 SOL = 1e9 lamports)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: recipient,
        lamports: lamports,
      })
    );

    const signature = await this.connection.sendTransaction(transaction, [this.keypair]);
    logger.info('BUY transaction sent with signature: %s', signature);
    
    // Confirm the transaction (handle deprecation warning as per your Solana web3.js version)
    const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
    if (confirmation.value.err) {
      throw new Error('Transaction failed');
    }
    logger.info('BUY transaction confirmed.');
  }

  async sell(data) {
    logger.info('Placing SELL order for asset: %s', data.asset || 'Unknown');
    // Example: Send a transaction (this is a placeholder)
    const recipient = new Keypair().publicKey; // Replace with actual recipient
    const lamports = 1000000; // Replace with actual amount (1 SOL = 1e9 lamports)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: recipient,
        lamports: lamports,
      })
    );

    const signature = await this.connection.sendTransaction(transaction, [this.keypair]);
    logger.info('SELL transaction sent with signature: %s', signature);
    
    // Confirm the transaction
    const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
    if (confirmation.value.err) {
      throw new Error('Transaction failed');
    }
    logger.info('SELL transaction confirmed.');
  }
}

module.exports = OrderExecutor;
