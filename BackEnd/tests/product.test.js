import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Product from '../src/models/Product.js';
import Manufacturer from '../src/models/Manufacturer.js';
import HsnCode from '../src/models/HsnCode.js';

// Mock models
vi.mock('../src/models/Product.js', () => {
  const mockProduct = {
    create: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
    update: vi.fn()
  };
  return {
    default: mockProduct,
    Product: mockProduct
  };
});

vi.mock('../src/models/Manufacturer.js', () => {
  const mockMfr = {
    create: vi.fn(),
    findAll: vi.fn()
  };
  return {
    default: mockMfr,
    Manufacturer: mockMfr
  };
});

vi.mock('../src/models/HsnCode.js', () => {
  const mockHsn = {
    create: vi.fn(),
    findAll: vi.fn()
  };
  return {
    default: mockHsn,
    HsnCode: mockHsn
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

describe('Product APIs Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/products', () => {
    it('should fail registration if mandatory fields are missing', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ productName: 'Crocin' }); // Missing genericName and mrp

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Product validation failed');
    });

    it('should fail registration if mrp is negative', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          productName: 'Crocin 650',
          genericName: 'Paracetamol',
          mrp: -10.00
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should fail registration if taxPercent is out of bounds', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          productName: 'Crocin 650',
          genericName: 'Paracetamol',
          mrp: 30.00,
          taxPercent: 120.00
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should successfully register a product with valid parameters', async () => {
      const mockProd = {
        productId: 5,
        productName: 'Crocin 650',
        genericName: 'Paracetamol',
        mrp: 30.00,
        taxPercent: 12.00,
        purchaseRate: 0.00,
        salesPrice: 30.00,
        stockQty: 0,
        createdBy: 1,
        isActive: true
      };

      Product.create.mockResolvedValue(mockProd);

      const res = await request(app)
        .post('/api/products')
        .send({
          productName: 'Crocin 650',
          genericName: 'Paracetamol',
          mrp: 30.00,
          taxPercent: 12.00
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.productName).toBe('Crocin 650');
      expect(res.body.data.salesPrice).toBe(30.00);
    });
  });

  describe('GET /api/products', () => {
    it('should return products pagination list', async () => {
      const mockResult = {
        count: 1,
        rows: [
          {
            productId: 5,
            productName: 'Crocin 650',
            genericName: 'Paracetamol',
            mrp: 30.00
          }
        ]
      };

      Product.findAndCountAll.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.totalPages).toBe(1);
    });
  });

  describe('POST /api/products/manufacturers', () => {
    it('should fail if manufacturer name is missing', async () => {
      const res = await request(app)
        .post('/api/products/manufacturers')
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should create manufacturer successfully', async () => {
      const mockMfr = { mfrId: 1, mfrName: 'Cipla', createdBy: 1 };
      Manufacturer.create.mockResolvedValue(mockMfr);

      const res = await request(app)
        .post('/api/products/manufacturers')
        .send({ mfrName: 'Cipla' });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.mfrName).toBe('Cipla');
    });
  });

  describe('POST /api/products/hsncodes', () => {
    it('should fail if HSN code is missing', async () => {
      const res = await request(app)
        .post('/api/products/hsncodes')
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should create HSN code successfully', async () => {
      const mockHsn = { hsnId: 2, hsnCode: '3004', description: 'Meds', createdBy: 1 };
      HsnCode.create.mockResolvedValue(mockHsn);

      const res = await request(app)
        .post('/api/products/hsncodes')
        .send({ hsnCode: '3004', description: 'Meds' });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.hsnCode).toBe('3004');
    });
  });
});
