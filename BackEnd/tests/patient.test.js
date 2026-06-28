import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Patient from '../src/models/Patient.js';

// Mock Patient model queries
vi.mock('../src/models/Patient.js', () => {
  return {
    default: {
      create: vi.fn(),
      findByPk: vi.fn(),
      findAndCountAll: vi.fn(),
      update: vi.fn()
    },
    Patient: {
      create: vi.fn(),
      findByPk: vi.fn(),
      findAndCountAll: vi.fn(),
      update: vi.fn()
    }
  };
});

// Mock authentication middleware globally for tests
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

describe('Patient APIs Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/patients', () => {
    it('should fail registration if mandatory fields are missing', async () => {
      const res = await request(app)
        .post('/api/patients')
        .send({ name: 'John Doe' }); // Missing phone, dateOfBirth, gender

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Validation failed');
    });

    it('should successfully register a patient with valid inputs', async () => {
      const mockPatient = {
        patientId: 10,
        patientCode: 'PAT-00010',
        name: 'Jane Smith',
        dateOfBirth: '1995-04-10',
        gender: 'Female',
        phone: '9876543210',
        createdBy: 1,
        isActive: true
      };

      // Mock database insertion return
      Patient.create.mockResolvedValue(mockPatient);

      const res = await request(app)
        .post('/api/patients')
        .send({
          name: 'Jane Smith',
          dateOfBirth: '1995-04-10',
          gender: 'Female',
          phone: '9876543210'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Jane Smith');
      expect(res.body.data.patientCode).toBe('PAT-00010');
    });
  });

  describe('GET /api/patients', () => {
    it('should list paginated patients with total pages details', async () => {
      const mockPatientsList = {
        count: 1,
        rows: [
          {
            patientId: 10,
            patientCode: 'PAT-00010',
            name: 'Jane Smith',
            dateOfBirth: '1995-04-10',
            gender: 'Female',
            phone: '9876543210'
          }
        ]
      };

      Patient.findAndCountAll.mockResolvedValue(mockPatientsList);

      const res = await request(app)
        .get('/api/patients')
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.patients).toHaveLength(1);
      expect(res.body.data.totalPages).toBe(1);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should return 404 if patient is not found', async () => {
      Patient.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/patients/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Patient not found');
    });

    it('should return patient details profile if present', async () => {
      const mockPatient = {
        patientId: 10,
        patientCode: 'PAT-00010',
        name: 'Jane Smith',
        dateOfBirth: '1995-04-10',
        gender: 'Female',
        phone: '9876543210'
      };

      Patient.findByPk.mockResolvedValue(mockPatient);

      const res = await request(app).get('/api/patients/10');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Jane Smith');
    });
  });
});
