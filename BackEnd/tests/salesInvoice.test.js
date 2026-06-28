import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import SalesInvoice from '../src/models/SalesInvoice.js';
import SalesInvoiceItem from '../src/models/SalesInvoiceItem.js';
import Product from '../src/models/Product.js';
import QueueToken from '../src/models/QueueToken.js';
import Patient from '../src/models/Patient.js';

// Mock models
vi.mock('../src/models/SalesInvoice.js', () => {
  const mockInvoice = {
    create: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
    max: vi.fn(),
    save: vi.fn()
  };
  return {
    default: mockInvoice,
    SalesInvoice: mockInvoice
  };
});

vi.mock('../src/models/SalesInvoiceItem.js', () => {
  const mockItem = {
    bulkCreate: vi.fn(),
    create: vi.fn()
  };
  return {
    default: mockItem,
    SalesInvoiceItem: mockItem
  };
});

vi.mock('../src/models/Product.js', () => {
  const mockProduct = {
    findByPk: vi.fn(),
    save: vi.fn()
  };
  return {
    default: mockProduct,
    Product: mockProduct
  };
});

vi.mock('../src/models/QueueToken.js', () => {
  const mockToken = {
    findByPk: vi.fn(),
    save: vi.fn()
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

// Mock auth middleware globally
vi.mock('../src/middlewares/auth.middleware.js', () => ({
  default: (req, res, next) => {
    req.user = { userId: 1, username: 'admin', role: 'ADMIN' };
    next();
  },
  authGuard: (req, res, next) => {
    req.user = { userId: 1, username: 'admin', role: 'ADMIN' };
    next();
  }
}));

describe('Pharmacy Billing APIs Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/invoices', () => {
    it('should successfully checkout an OTC walk-in sale invoice and perform reverse GST', async () => {
      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        mrp: 112.00, // Inclusive of 12% GST
        taxPercent: 12.00,
        stockQty: 50,
        isActive: true,
        save: vi.fn().mockResolvedValue(true)
      };

      Product.findByPk.mockResolvedValue(mockProduct);
      SalesInvoice.max.mockResolvedValue(12); // So next invoice is INV-00013
      SalesInvoice.create.mockResolvedValue({
        invoiceId: 13,
        invoiceNumber: 'INV-00013',
        subTotal: 100.00,
        taxAmount: 12.00,
        discountAmount: 0.00,
        netAmount: 112.00
      });
      SalesInvoiceItem.bulkCreate.mockResolvedValue([]);

      const checkoutPayload = {
        paymentMode: 'UPI',
        items: [
          { productId: 10, quantity: 1, discountAmount: 0.00 }
        ]
      };

      const res = await request(app)
        .post('/api/invoices')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.invoiceNumber).toBe('INV-00013');
      expect(mockProduct.stockQty).toBe(49); // stock deducted
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it('should successfully checkout a clinic queue visit patient, completing their visit', async () => {
      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        mrp: 112.00,
        taxPercent: 12.00,
        stockQty: 50,
        isActive: true,
        save: vi.fn().mockResolvedValue(true)
      };

      const mockToken = {
        tokenId: 3,
        status: 'Called',
        save: vi.fn().mockResolvedValue(true)
      };

      Product.findByPk.mockResolvedValue(mockProduct);
      QueueToken.findByPk.mockResolvedValue(mockToken);
      SalesInvoice.create.mockResolvedValue({
        invoiceId: 14,
        invoiceNumber: 'INV-00014',
        tokenId: 3,
        patientId: 2
      });

      const checkoutPayload = {
        patientId: 2,
        tokenId: 3,
        paymentMode: 'Cash',
        items: [
          { productId: 10, quantity: 2, discountAmount: 0.00 }
        ]
      };

      const res = await request(app)
        .post('/api/invoices')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(201);
      expect(mockToken.status).toBe('Completed');
      expect(mockToken.save).toHaveBeenCalled();
      expect(mockProduct.stockQty).toBe(48); // deducted 2
    });

    it('should fail checkout if the item quantity exceeds active stock levels', async () => {
      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        mrp: 112.00,
        taxPercent: 12.00,
        stockQty: 5,
        isActive: true
      };

      Product.findByPk.mockResolvedValue(mockProduct);

      const checkoutPayload = {
        paymentMode: 'Card',
        items: [
          { productId: 10, quantity: 10, discountAmount: 0.00 } // exceeds 5 stock
        ]
      };

      const res = await request(app)
        .post('/api/invoices')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(500); // Service throws standard error, global handler converts to status code/message
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('GET /api/invoices', () => {
    it('should query lists of invoices correctly with pagination', async () => {
      SalesInvoice.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ invoiceId: 1, invoiceNumber: 'INV-00001', netAmount: 112.00 }]
      });

      const res = await request(app)
        .get('/api/invoices')
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.invoices).toBeDefined();
      expect(res.body.data.totalPages).toBe(1);
    });
  });

  describe('PATCH /api/invoices/:id/cancel', () => {
    it('should successfully cancel an invoice and restore medicine stock levels', async () => {
      const mockInvoice = {
        invoiceId: 1,
        invoiceNumber: 'INV-00001',
        paymentStatus: 'Paid',
        save: vi.fn().mockResolvedValue(true),
        items: [
          { productId: 10, quantity: 3 }
        ]
      };

      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        stockQty: 20,
        save: vi.fn().mockResolvedValue(true)
      };

      SalesInvoice.findByPk.mockResolvedValue(mockInvoice);
      Product.findByPk.mockResolvedValue(mockProduct);

      const res = await request(app)
        .patch('/api/invoices/1/cancel')
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(mockInvoice.paymentStatus).toBe('Cancelled');
      expect(mockProduct.stockQty).toBe(23); // restored 3
      expect(mockProduct.save).toHaveBeenCalled();
    });
  });
});
