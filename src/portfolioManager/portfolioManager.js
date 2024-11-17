// src/portfolioManager/portfolioManager.js

const { Connection, PublicKey } = require('@solana/web3.js');
const EventEmitter = require('eventemitter3');
const logger = require('../utils/logger');
require('dotenv').config();

class PortfolioManager extends EventEmitter {
  constructor() {
    super();
    this.connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
    this.publicKey = new PublicKey(process.env.WALLET_PUBLIC_KEY);
    this.balances = {};
    this.fetchInterval = 10000; // Fetch every 10 seconds

    logger.info('Portfolio Manager initialized for wallet: %s', this.publicKey.toBase58());
  }

  async start() {
    this.interval = setInterval(() => this.fetchBalances(), this.fetchInterval);
    await this.fetchBalances();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      logger.info('Portfolio Manager stopped.');
    }
  }

  async fetchBalances() {
    try {
      logger.debug('Fetching balances for wallet: %s', this.publicKey.toBase58());

      // Fetch native SOL balance
      const solBalance = await this.connection.getBalance(this.publicKey) / 1e9; // Convert from lamports to SOL
      this.balances['SOL'] = solBalance;

      // Fetch SPL token balances
      const tokens = await this.connection.getParsedTokenAccountsByOwner(this.publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });

      tokens.value.forEach((token) => {
        const amount = parseFloat(token.account.data.parsed.info.tokenAmount.uiAmount);
        const mint = token.account.data.parsed.info.mint;
        this.balances[mint] = amount;
      });

      logger.info('Balances updated: %O', this.balances);

      // Emit balance data to listeners
      this.emit('balanceUpdate', this.balances);
    } catch (error) {
      logger.error('Error fetching balances: %s', error.message);
    }
  }

  getBalance(mint) {
    return this.balances[mint] || 0;
  }
}

module.exports = PortfolioManager;