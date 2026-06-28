import sequelize from '../config/database.js';
import SalesInvoiceRepository from '../repositories/SalesInvoiceRepository.js';
import Product from '../models/Product.js';
import QueueToken from '../models/QueueToken.js';
import { SalesInvoiceItem } from '../models/SalesInvoiceItem.js';

export class SalesInvoiceService {
  constructor() {
    this.repo = new SalesInvoiceRepository();
  }

  async createInvoice(checkoutData, creatorId) {
    const { patientId, tokenId, paymentMode, discountAmount: invoiceDiscount = 0, items = [] } = checkoutData;

    if (!items || items.length === 0) {
      throw new Error('Invoice must contain at least one item');
    }

    return await sequelize.transaction(async (transaction) => {
      // 1. Generate unique invoice number
      const invoiceNumber = await this.repo.getNextInvoiceNumber(transaction);

      let subTotalAccumulator = 0;
      let taxAmountAccumulator = 0;
      let discountAccumulator = Number(invoiceDiscount);
      let netAmountAccumulator = 0;

      const itemsToCreate = [];

      // 2. Validate products, lock stock, and compute tax calculations
      for (const item of items) {
        const { productId, quantity, discountAmount = 0 } = item;

        if (!quantity || quantity <= 0) {
          throw new Error('Quantity must be greater than zero');
        }

        // Lock product row to prevent concurrency race conditions
        const product = await Product.findByPk(productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!product) {
          throw new Error(`Product ID ${productId} not found`);
        }

        if (!product.isActive) {
          throw new Error(`Product "${product.productName}" is inactive and cannot be billed`);
        }

        if (product.stockQty < quantity) {
          throw new Error(`Insufficient stock for product "${product.productName}" (Available: ${product.stockQty}, Requested: ${quantity})`);
        }

        // Deduct inventory stock
        product.stockQty -= quantity;
        await product.save({ transaction });

        // Reverse GST Extraction (MRP inclusive of tax calculation)
        const itemMRP = Number(product.mrp);
        const itemTaxPercent = Number(product.taxPercent || 0);

        const lineGrossTotal = itemMRP * quantity;
        const lineNetTotal = lineGrossTotal - Number(discountAmount);

        // Subtotal (excl tax) = lineNetTotal / (1 + (taxPercent / 100))
        const lineSubtotalExclTax = lineNetTotal / (1 + (itemTaxPercent / 100));
        const lineTaxAmount = lineNetTotal - lineSubtotalExclTax;

        subTotalAccumulator += lineSubtotalExclTax;
        taxAmountAccumulator += lineTaxAmount;
        discountAccumulator += Number(discountAmount);
        netAmountAccumulator += lineNetTotal;

        itemsToCreate.push({
          productId,
          quantity,
          unitPrice: itemMRP,
          taxPercent: itemTaxPercent,
          taxAmount: lineTaxAmount,
          discountAmount: Number(discountAmount),
          itemTotal: lineNetTotal
        });
      }

      // Apply invoice level discount (deducted from overall net totals)
      const absoluteNetTotal = netAmountAccumulator - Number(invoiceDiscount);
      if (absoluteNetTotal < 0) {
        throw new Error('Invoice discount cannot exceed net total amount');
      }

      const invoiceData = {
        invoiceNumber,
        tokenId: tokenId || null,
        patientId: patientId || null,
        subTotal: subTotalAccumulator,
        taxAmount: taxAmountAccumulator,
        discountAmount: discountAccumulator,
        netAmount: absoluteNetTotal,
        paymentMode,
        paymentStatus: 'Paid',
        createdBy: creatorId
      };

      // 3. Save Sales Invoice header and items
      const createdInvoice = await this.repo.createInvoice(invoiceData, itemsToCreate, transaction);

      // 4. Update Queue Visit Token to Completed (if token was linked)
      if (tokenId) {
        const token = await QueueToken.findByPk(tokenId, { transaction, lock: transaction.LOCK.UPDATE });
        if (token) {
          token.status = 'Completed';
          token.completedAt = new Date();
          await token.save({ transaction });
        }
      }

      return createdInvoice;
    });
  }

  async listInvoices(query) {
    return await this.repo.findAndCountAll(query);
  }

  async getInvoiceDetails(invoiceId) {
    const invoice = await this.repo.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async cancelInvoice(invoiceId, userId) {
    return await sequelize.transaction(async (transaction) => {
      const invoice = await this.repo.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.paymentStatus === 'Cancelled') {
        throw new Error('Invoice is already cancelled');
      }

      // 1. Update paymentStatus to Cancelled
      invoice.paymentStatus = 'Cancelled';
      await invoice.save({ transaction });

      // 2. Restore stocks for all medicines
      for (const item of invoice.items || []) {
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (product) {
          product.stockQty += item.quantity;
          await product.save({ transaction });
        }
      }

      return invoice;
    });
  }
}

export default SalesInvoiceService;
