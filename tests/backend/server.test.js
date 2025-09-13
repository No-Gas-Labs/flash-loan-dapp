const request = require('supertest');
const app = require('../../backend/server');

describe('Backend API Tests', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3001, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Wallet Connection', () => {
    it('should connect wallet successfully', async () => {
      const response = await request(app)
        .post('/api/wallet/connect')
        .send({
          walletAddress: '0x1234567890abcdef',
          blockchain: 'EOS'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/wallet/connect')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('Flash Loan Execution', () => {
    it('should execute flash loan successfully', async () => {
      const response = await request(app)
        .post('/api/flashloan/execute')
        .send({
          blockchain: 'EOS',
          amount: 100,
          token: 'EOS',
          duration: 300,
          walletAddress: '0x1234567890abcdef'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transactionHash).toBeDefined();
    });

    it('should reject invalid parameters', async () => {
      const response = await request(app)
        .post('/api/flashloan/execute')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('Transaction History', () => {
    it('should fetch transaction history', async () => {
      const response = await request(app)
        .get('/api/transactions/0x1234567890abcdef');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by blockchain', async () => {
      const response = await request(app)
        .get('/api/transactions/0x1234567890abcdef?blockchain=EOS');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Balance Fetching', () => {
    it('should fetch wallet balance', async () => {
      const response = await request(app)
        .get('/api/wallet/balance/0x1234567890abcdef')
        .query({ blockchain: 'EOS' });
      
      expect(response.status).toBe(200);
      expect(response.body.address).toBe('0x1234567890abcdef');
    });
  });
});