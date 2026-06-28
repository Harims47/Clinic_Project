import sequelize from '../config/database.js';
import SalesInvoiceRepository from '../repositories/SalesInvoiceRepository.js';
import Product from '../models/Product.js';
import QueueToken from '../models/QueueToken.js';
import SalesInvoiceItem from '../models/SalesInvoiceItem.js';
import ProductBatch from '../models/ProductBatch.js';
import StockLedger from '../models/StockLedger.js';

export class SalesInvoiceService {
  constructor() {
    this.repo = new SalesInvoiceRepository();
  }

  async createInvoice(checkoutData, creatorId) {
    const { patientId, tokenId, paymentMode, discountAmount: invoiceDiscount = 0, items = [] } = checkoutData;

    if (!items || items.length === 0) {
      const err = new Error('Invoice must contain at least one item');
      err.statusCode = 400;
      throw err;
    }

    return await sequelize.transaction(async (transaction) => {
      // 1. Generate unique invoice number
      const invoiceNumber = await this.repo.getNextInvoiceNumber(transaction);

      let subTotalAccumulator = 0;
      let taxAmountAccumulator = 0;
      let discountAccumulator = Number(invoiceDiscount);
      let netAmountAccumulator = 0;

      const itemsToCreate = [];
      const stockLedgerEntriesToCreate = [];

      // 2. Validate products/batches, lock stock, and compute tax calculations
      for (const item of items) {
        const { productId, batchNumber, quantity, discountAmount = 0 } = item;

        if (!quantity || quantity <= 0) {
          const err = new Error('Quantity must be greater than zero');
          err.statusCode = 400;
          throw err;
        }

        if (!batchNumber || batchNumber.trim() === '') {
          const err = new Error('Batch number is required');
          err.statusCode = 400;
          throw err;
        }

        // Fetch product with locking to prevent concurrency race conditions
        const product = await Product.findByPk(productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!product) {
          const err = new Error(`Product ID ${productId} not found`);
          err.statusCode = 404;
          throw err;
        }

        if (!product.isActive) {
          const err = new Error(`Product "${product.productName}" is inactive and cannot be billed`);
          err.statusCode = 400;
          throw err;
        }

        // Lock specific batch
        const batch = await ProductBatch.findOne({
          where: { productId, batchNumber },
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!batch) {
          const err = new Error(`Product batch "${batchNumber}" not found for "${product.productName}"`);
          err.statusCode = 400;
          throw err;
        }

        if (batch.stockQty < quantity) {
          const err = new Error(`Insufficient stock for product batch "${batchNumber}" (Available: ${batch.stockQty}, Requested: ${quantity})`);
          err.statusCode = 400;
          throw err;
        }

        const previousProductStock = product.stockQty || 0;

        // Deduct inventory batch stock
        batch.stockQty -= quantity;
        await batch.save({ transaction });

        // Synchronize overall product stock
        product.stockQty = previousProductStock - quantity;
        await product.save({ transaction });

        // Retrieve MRP from the batch-specific records
        const itemMRP = Number(batch.mrp);
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
          itemTotal: lineNetTotal,
          batchNumber: batch.batchNumber,
          expiryDate: batch.expiryDate
        });

        // Store ledger log payload to write next
        stockLedgerEntriesToCreate.push({
          productId,
          batchNumber: batch.batchNumber,
          transactionType: 'SALE',
          quantity: -quantity, // Negative for sale stock reduction
          previousQty: previousProductStock,
          newQty: product.stockQty
        });
      }

      // Apply invoice level discount (deducted from overall net totals)
      const absoluteNetTotal = netAmountAccumulator - Number(invoiceDiscount);
      if (absoluteNetTotal < 0) {
        const err = new Error('Invoice discount cannot exceed net total amount');
        err.statusCode = 400;
        throw err;
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

      // 5. Create audit logs in StockLedger linked to the created Invoice
      for (const entry of stockLedgerEntriesToCreate) {
        await StockLedger.create({
          ...entry,
          referenceId: createdInvoice.invoiceId,
          createdBy: creatorId
        }, { transaction });
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
      const err = new Error('Invoice not found');
      err.statusCode = 404;
      throw err;
    }
    return invoice;
  }

  async cancelInvoice(invoiceId, userId) {
    return await sequelize.transaction(async (transaction) => {
      const invoice = await this.repo.findById(invoiceId);
      if (!invoice) {
        const err = new Error('Invoice not found');
        err.statusCode = 404;
        throw err;
      }

      if (invoice.paymentStatus === 'Cancelled') {
        const err = new Error('Invoice is already cancelled');
        err.statusCode = 400;
        throw err;
      }

      // 1. Update paymentStatus to Cancelled
      invoice.paymentStatus = 'Cancelled';
      await invoice.save({ transaction });

      // 2. Restore stocks for all medicines
      for (const item of invoice.items || []) {
        // Lock batch
        const batch = await ProductBatch.findOne({
          where: { productId: item.productId, batchNumber: item.batchNumber },
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (batch) {
          batch.stockQty += item.quantity;
          await batch.save({ transaction });
        }

        // Lock product
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (product) {
          const previousProductStock = product.stockQty || 0;
          product.stockQty = previousProductStock + item.quantity;
          await product.save({ transaction });

          // 3. Log return movement in StockLedger
          await StockLedger.create({
            productId: item.productId,
            batchNumber: item.batchNumber,
            transactionType: 'SALES_RETURN',
            quantity: item.quantity, // Positive for returned stock
            referenceId: invoiceId,
            previousQty: previousProductStock,
            newQty: product.stockQty,
            createdBy: userId
          }, { transaction });
        }
      }

      return invoice;
    });
  }
}

export default SalesInvoiceService;
