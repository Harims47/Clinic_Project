import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Supplier from '../src/models/Supplier.js';
import PurchaseInvoice from '../src/models/PurchaseInvoice.js';
import PurchaseInvoiceItem from '../src/models/PurchaseInvoiceItem.js';
import ProductBatch from '../src/models/ProductBatch.js';
import StockLedger from '../src/models/StockLedger.js';
import Product from '../src/models/Product.js';

// Mock models
vi.mock('../src/models/Supplier.js', () => {
  const mockSupplier = {
    create: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn()
  };
  return {
    default: mockSupplier,
    Supplier: mockSupplier
  };
});

vi.mock('../src/models/PurchaseInvoice.js', () => {
  const mockInvoice = {
    create: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
    max: vi.fn()
  };
  return {
    default: mockInvoice,
    PurchaseInvoice: mockInvoice
  };
});

vi.mock('../src/models/PurchaseInvoiceItem.js', () => {
  const mockItem = {
    bulkCreate: vi.fn()
  };
  return {
    default: mockItem,
    PurchaseInvoiceItem: mockItem
  };
});

vi.mock('../src/models/ProductBatch.js', () => {
  const mockBatch = {
    create: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn()
  };
  return {
    default: mockBatch,
    ProductBatch: mockBatch
  };
});

vi.mock('../src/models/StockLedger.js', () => {
  const mockLedger = {
    create: vi.fn(),
    update: vi.fn()
  };
  return {
    default: mockLedger,
    StockLedger: mockLedger
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

describe('Purchase & Stock Inward APIs Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Supplier CRUD Endpoints', () => {
    it('should successfully register a new supplier and return 201', async () => {
      Supplier.findOne.mockResolvedValue(null);
      Supplier.create.mockResolvedValue({
        supplierId: 1,
        supplierName: 'Apotex Biotech',
        phone: '9876543210'
      });

      const res = await request(app)
        .post('/api/suppliers')
        .send({ supplierName: 'Apotex Biotech', phone: '9876543210' });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.supplierName).toBe('Apotex Biotech');
    });

    it('should fail if the supplier name is already registered', async () => {
      Supplier.findOne.mockResolvedValue({ supplierId: 1, supplierName: 'Apotex Biotech' });

      const res = await request(app)
        .post('/api/suppliers')
        .send({ supplierName: 'Apotex Biotech', phone: '9876543210' });

      expect(res.statusCode).toBe(400); // global error maps to 400
      expect(res.body.status).toBe('error');
    });
  });

  describe('Purchase Checkout Endpoints', () => {
    it('should successfully checkout purchase and increment batch stocks & overall product stock', async () => {
      const mockProduct = {
        productId: 10,
        productName: 'Paracetamol 650',
        stockQty: 50,
        mrp: 100.00,
        taxPercent: 12.00,
        save: vi.fn().mockResolvedValue(true)
      };

      Product.findByPk.mockResolvedValue(mockProduct);
      ProductBatch.findOne.mockResolvedValue(null); // Force creating a new batch
      ProductBatch.create.mockResolvedValue({ batchId: 1, stockQty: 100 });
      PurchaseInvoice.max.mockResolvedValue(10); // next invoice is PUR-00011
      PurchaseInvoice.create.mockResolvedValue({
        purchaseInvoiceId: 11,
        invoiceNumber: 'PUR-00011'
      });
      PurchaseInvoiceItem.bulkCreate.mockResolvedValue([]);
      StockLedger.create.mockResolvedValue({});
      StockLedger.update.mockResolvedValue([1]);

      const purchasePayload = {
        supplierId: 1,
        supplierInvoiceNumber: 'VND-2026/001',
        invoiceDate: '2026-06-28',
        discountAmount: 10.00,
        items: [
          {
            productId: 10,
            batchNumber: 'BT-PCM02',
            expiryDate: '2028-12-31',
            quantity: 100,
            purchaseRate: 80.00,
            mrp: 112.00
          }
        ]
      };

      const res = await request(app)
        .post('/api/purchase')
        .send(purchasePayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(mockProduct.stockQty).toBe(150); // added 100
      expect(mockProduct.mrp).toBe(112.00); // updated product MRP to newest batch retail MRP
      expect(ProductBatch.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 10,
          batchNumber: 'BT-PCM02',
          stockQty: 100
        }),
        expect.any(Object)
      );
      expect(StockLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: 'PURCHASE',
          quantity: 100,
          previousQty: 50,
          newQty: 150
        }),
        expect.any(Object)
      );
    });
  });
});
