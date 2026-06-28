import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import SalesInvoice from '../src/models/SalesInvoice.js';
import SalesInvoiceItem from '../src/models/SalesInvoiceItem.js';
import Product from '../src/models/Product.js';
import QueueToken from '../src/models/QueueToken.js';
import Patient from '../src/models/Patient.js';
import ProductBatch from '../src/models/ProductBatch.js';
import StockLedger from '../src/models/StockLedger.js';

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

vi.mock('../src/models/ProductBatch.js', () => {
  const mockBatch = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn()
  };
  return {
    default: mockBatch,
    ProductBatch: mockBatch
  };
});

vi.mock('../src/models/StockLedger.js', () => {
  const mockLedger = {
    create: vi.fn()
  };
  return {
    default: mockLedger,
    StockLedger: mockLedger
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
    it('should successfully checkout an OTC walk-in sale invoice, performing batch deduction & reverse GST from batch MRP', async () => {
      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        taxPercent: 12.00,
        stockQty: 50,
        isActive: true,
        save: vi.fn().mockResolvedValue(true)
      };

      const mockBatch = {
        batchId: 1,
        productId: 10,
        batchNumber: 'BT-PCM02',
        stockQty: 30,
        mrp: 112.00, // MRP specific to this batch
        expiryDate: '2028-12-31',
        save: vi.fn().mockResolvedValue(true)
      };

      Product.findByPk.mockResolvedValue(mockProduct);
      ProductBatch.findOne.mockResolvedValue(mockBatch);
      SalesInvoice.max.mockResolvedValue(12); // next invoice is INV-00013
      SalesInvoice.create.mockResolvedValue({
        invoiceId: 13,
        invoiceNumber: 'INV-00013',
        subTotal: 100.00,
        taxAmount: 12.00,
        discountAmount: 0.00,
        netAmount: 112.00
      });
      SalesInvoiceItem.bulkCreate.mockResolvedValue([]);
      StockLedger.create.mockResolvedValue({});

      const checkoutPayload = {
        paymentMode: 'UPI',
        items: [
          { productId: 10, batchNumber: 'BT-PCM02', quantity: 1, discountAmount: 0.00 }
        ]
      };

      const res = await request(app)
        .post('/api/invoices')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(mockBatch.stockQty).toBe(29); // batch deducted
      expect(mockProduct.stockQty).toBe(49); // global product stock synchronized
      expect(mockBatch.save).toHaveBeenCalled();
      expect(mockProduct.save).toHaveBeenCalled();
      
      // Verify StockLedger logs the transaction type 'SALE' with negative quantity
      expect(StockLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 10,
          batchNumber: 'BT-PCM02',
          transactionType: 'SALE',
          quantity: -1,
          previousQty: 50,
          newQty: 49
        }),
        expect.any(Object)
      );
    });

    it('should successfully checkout a clinic queue visit patient, completing their visit', async () => {
      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        taxPercent: 12.00,
        stockQty: 50,
        isActive: true,
        save: vi.fn().mockResolvedValue(true)
      };

      const mockBatch = {
        batchId: 1,
        productId: 10,
        batchNumber: 'BT-PCM02',
        stockQty: 30,
        mrp: 112.00,
        expiryDate: '2028-12-31',
        save: vi.fn().mockResolvedValue(true)
      };

      const mockToken = {
        tokenId: 3,
        status: 'Called',
        save: vi.fn().mockResolvedValue(true)
      };

      Product.findByPk.mockResolvedValue(mockProduct);
      ProductBatch.findOne.mockResolvedValue(mockBatch);
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
          { productId: 10, batchNumber: 'BT-PCM02', quantity: 2, discountAmount: 0.00 }
        ]
      };

      const res = await request(app)
        .post('/api/invoices')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(201);
      expect(mockToken.status).toBe('Completed');
      expect(mockToken.save).toHaveBeenCalled();
      expect(mockBatch.stockQty).toBe(28); // deducted 2
      expect(mockProduct.stockQty).toBe(48); // deducted 2
    });

    it('should fail checkout if the item quantity exceeds active batch stock levels', async () => {
      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        taxPercent: 12.00,
        stockQty: 50,
        isActive: true
      };

      const mockBatch = {
        batchId: 1,
        productId: 10,
        batchNumber: 'BT-PCM02',
        stockQty: 5, // insufficient
        mrp: 112.00
      };

      Product.findByPk.mockResolvedValue(mockProduct);
      ProductBatch.findOne.mockResolvedValue(mockBatch);

      const checkoutPayload = {
        paymentMode: 'Card',
        items: [
          { productId: 10, batchNumber: 'BT-PCM02', quantity: 10, discountAmount: 0.00 }
        ]
      };

      const res = await request(app)
        .post('/api/invoices')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(400); // maps validation status code as bad request
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Insufficient stock for product batch');
    });
  });

  describe('PATCH /api/invoices/:id/cancel', () => {
    it('should successfully cancel an invoice and restore batch & global stocks with SALES_RETURN log', async () => {
      const mockInvoice = {
        invoiceId: 1,
        invoiceNumber: 'INV-00001',
        paymentStatus: 'Paid',
        save: vi.fn().mockResolvedValue(true),
        items: [
          { productId: 10, batchNumber: 'BT-PCM02', quantity: 3 }
        ]
      };

      const mockBatch = {
        batchId: 1,
        productId: 10,
        batchNumber: 'BT-PCM02',
        stockQty: 10,
        save: vi.fn().mockResolvedValue(true)
      };

      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        stockQty: 20,
        save: vi.fn().mockResolvedValue(true)
      };

      SalesInvoice.findByPk.mockResolvedValue(mockInvoice);
      Product.findByPk.mockResolvedValue(mockProduct);
      ProductBatch.findOne.mockResolvedValue(mockBatch);
      StockLedger.create.mockResolvedValue({});

      const res = await request(app)
        .patch('/api/invoices/1/cancel')
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(mockInvoice.paymentStatus).toBe('Cancelled');
      
      // Restored both batch and global quantities
      expect(mockBatch.stockQty).toBe(13); // +3
      expect(mockProduct.stockQty).toBe(23); // +3
      expect(mockBatch.save).toHaveBeenCalled();
      expect(mockProduct.save).toHaveBeenCalled();

      // Logged as SALES_RETURN
      expect(StockLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 10,
          batchNumber: 'BT-PCM02',
          transactionType: 'SALES_RETURN',
          quantity: 3,
          previousQty: 20,
          newQty: 23
        }),
        expect.any(Object)
      );
    });
  });
});
