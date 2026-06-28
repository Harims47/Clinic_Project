import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import QueueToken from '../src/models/QueueToken.js';
import Patient from '../src/models/Patient.js';
import User from '../src/models/User.js';

// Mock models
vi.mock('../src/models/QueueToken.js', () => {
  const mockToken = {
    create: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
    update: vi.fn(),
    max: vi.fn(),
    findOne: vi.fn()
  };
  return {
    default: mockToken,
    QueueToken: mockToken
  };
});

vi.mock('../src/models/Patient.js', () => {
  const mockPatient = {
    findByPk: vi.fn()
  };
  return {
    default: mockPatient,
    Patient: mockPatient
  };
});

vi.mock('../src/models/User.js', () => {
  const mockUser = {
    findOne: vi.fn(),
    findAll: vi.fn()
  };
  return {
    default: mockUser,
    User: mockUser
  };
});

// Mock auth middleware globally
vi.mock('../src/middlewares/auth.middleware.js', () => ({
  default: (req, res, next) => {
    req.user = { userId: 1, username: 'admin', role: 'ADMIN' };
    next();
  },
  authMiddleware: (req, res, next) => {
    req.user = { userId: 1, username: 'admin', role: 'ADMIN' };
    next();
  }
}));

describe('QueueToken APIs Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/tokens', () => {
    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/tokens')
        .send({ Remarks: 'Missing patient and doctor' });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Token validation failed');
    });

    it('should fail if consultationType is not in configuration', async () => {
      const res = await request(app)
        .post('/api/tokens')
        .send({
          patientId: 1,
          doctorId: 2,
          consultationType: 'InvalidConsult'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should fail if patient already has active token today', async () => {
      // Mock patient already having active token
      QueueToken.findOne.mockResolvedValue({
        tokenId: 12,
        tokenNumber: 3,
        patientId: 1,
        status: 'Waiting'
      });

      const res = await request(app)
        .post('/api/tokens')
        .send({
          patientId: 1,
          doctorId: 2,
          consultationType: 'New'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already in the queue today');
    });

    it('should successfully issue a token with sequential numbering', async () => {
      // Mock no active token today
      QueueToken.findOne.mockResolvedValue(null);
      // Mock max token count = 5 (so next is 6)
      QueueToken.max.mockResolvedValue(5);

      const mockResult = {
        tokenId: 15,
        tokenNumber: 6,
        patientId: 1,
        doctorId: 2,
        consultationType: 'New',
        status: 'Waiting',
        tokenDate: '2026-06-28'
      };

      QueueToken.create.mockResolvedValue(mockResult);
      QueueToken.findByPk.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/tokens')
        .send({
          patientId: 1,
          doctorId: 2,
          consultationType: 'New',
          remarks: 'Standard consultation check'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.tokenNumber).toBe(6);
    });
  });

  describe('PATCH /api/tokens/:id/status', () => {
    it('should record calledAt lifecycle timestamp on Call status update', async () => {
      const mockToken = {
        tokenId: 15,
        tokenNumber: 6,
        status: 'Waiting',
        update: vi.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return this;
        })
      };

      QueueToken.findByPk.mockResolvedValue(mockToken);

      const res = await request(app)
        .patch('/api/tokens/15/status')
        .send({ status: 'Called' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(mockToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Called',
          calledAt: expect.any(Date)
        }),
        expect.any(Object)
      );
    });

    it('should record completedAt lifecycle timestamp on Complete status update', async () => {
      const mockToken = {
        tokenId: 15,
        tokenNumber: 6,
        status: 'Called',
        update: vi.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return this;
        })
      };

      QueueToken.findByPk.mockResolvedValue(mockToken);

      const res = await request(app)
        .patch('/api/tokens/15/status')
        .send({ status: 'Completed' });

      expect(res.statusCode).toBe(200);
      expect(mockToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Completed',
          completedAt: expect.any(Date)
        }),
        expect.any(Object)
      );
    });
  });

  describe('POST /api/tokens/:id/transfer', () => {
    it('should transfer patient token to a different doctor and update sequence', async () => {
      const mockToken = {
        tokenId: 15,
        tokenNumber: 6,
        doctorId: 2,
        status: 'Called',
        doctor: { username: 'sharma' },
        update: vi.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return this;
        })
      };

      QueueToken.findByPk.mockResolvedValue(mockToken);
      
      // Target doctor mock
      User.findOne.mockResolvedValue({ userId: 3, username: 'verma', role: 'DOCTOR', isActive: true });
      // Mock max token for target doctor as 2 (so next is 3)
      QueueToken.max.mockResolvedValue(2);

      const res = await request(app)
        .post('/api/tokens/15/transfer')
        .send({ doctorId: 3 });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(mockToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          doctorId: 3,
          tokenNumber: 3,
          status: 'Waiting'
        }),
        expect.any(Object)
      );
    });
  });

  describe('GET /api/tokens/check-follow-up', () => {
    it('should return isFollowUp true if completed token in last 7 days exists', async () => {
      QueueToken.findOne.mockResolvedValue({
        tokenId: 2,
        tokenDate: '2026-06-25',
        status: 'Completed'
      });

      const res = await request(app)
        .get('/api/tokens/check-follow-up')
        .query({ patientId: 1, doctorId: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isFollowUp).toBe(true);
      expect(res.body.data.lastVisitDate).toBe('2026-06-25');
    });
  });

  describe('GET /api/tokens/stats', () => {
    it('should return daily dashboard statistics successfully', async () => {
      QueueToken.count = vi.fn().mockResolvedValue(4);
      
      const Patient = (await import('../src/models/Patient.js')).default;
      const Product = (await import('../src/models/Product.js')).default;
      Patient.count = vi.fn().mockResolvedValue(10);
      Product.count = vi.fn().mockResolvedValue(2);

      const res = await request(app)
        .get('/api/tokens/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.todayTokens).toBe(4);
      expect(res.body.data.todayPatients).toBe(10);
      expect(res.body.data.lowStockItems).toBe(2);
    });
  });
});
