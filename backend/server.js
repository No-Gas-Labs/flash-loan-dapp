const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'flashloan.db'));

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blockchain TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    borrower_address TEXT NOT NULL,
    loan_amount DECIMAL NOT NULL,
    loan_token TEXT NOT NULL,
    fee_amount DECIMAL NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    repaid_at DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS liquidity_pools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blockchain TEXT NOT NULL,
    pool_address TEXT NOT NULL,
    token_address TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    total_liquidity DECIMAL NOT NULL,
    fee_rate INTEGER NOT NULL,
    max_loan_ratio INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wallet_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Wallet connection
app.post('/api/wallet/connect', (req, res) => {
  const { walletAddress, blockchain } = req.body;
  
  if (!walletAddress || !blockchain) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stmt = db.prepare(`INSERT INTO wallet_connections (wallet_address, blockchain) VALUES (?, ?)`);
  stmt.run(walletAddress, blockchain, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, connectionId: this.lastID });
  });
  stmt.finalize();
});

// Get wallet balance (mock implementation)
app.get('/api/wallet/balance/:address', (req, res) => {
  const { address } = req.params;
  const { blockchain } = req.query;
  
  // Mock balances - in real implementation, query blockchain
  const mockBalances = {
    eos: { EOS: 1000.5 },
    ton: { TON: 50.25 },
    sui: { SUI: 200.75 }
  };

  res.json({
    address,
    blockchain,
    balances: mockBalances[blockchain] || {}
  });
});

// Execute flash loan
app.post('/api/flashloan/execute', (req, res) => {
  const { blockchain, amount, token, duration, walletAddress } = req.body;
  
  if (!blockchain || !amount || !token || !duration || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate mock transaction hash
  const transactionHash = `${blockchain}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const feeAmount = (amount * 0.001).toFixed(6); // 0.1% fee

  const stmt = db.prepare(`
    INSERT INTO transactions (blockchain, transaction_hash, borrower_address, loan_amount, loan_token, fee_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(blockchain, transactionHash, walletAddress, amount, token, feeAmount, 'pending', function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Simulate blockchain interaction
    setTimeout(() => {
      db.run(`UPDATE transactions SET status = 'executed' WHERE id = ?`, [this.lastID]);
      
      // Simulate repayment after duration
      setTimeout(() => {
        db.run(`UPDATE transactions SET status = 'repaid', repaid_at = ? WHERE id = ?`, [new Date().toISOString(), this.lastID]);
      }, duration * 1000);

    }, 2000);

    res.json({
      success: true,
      transactionId: this.lastID,
      transactionHash,
      loanAmount: amount,
      feeAmount,
      estimatedRepayment: (parseFloat(amount) + parseFloat(feeAmount)).toFixed(6)
    });
  });
  stmt.finalize();
});

// Get transaction history
app.get('/api/transactions/:address', (req, res) => {
  const { address } = req.params;
  const { blockchain } = req.query;

  let query = `SELECT * FROM transactions WHERE borrower_address = ?`;
  let params = [address];

  if (blockchain) {
    query += ` AND blockchain = ?`;
    params.push(blockchain);
  }

  query += ` ORDER BY created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get liquidity pools
app.get('/api/pools', (req, res) => {
  const { blockchain } = req.query;
  
  let query = `SELECT * FROM liquidity_pools`;
  let params = [];

  if (blockchain) {
    query += ` WHERE blockchain = ?`;
    params.push(blockchain);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Flash Loan backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

module.exports = app;