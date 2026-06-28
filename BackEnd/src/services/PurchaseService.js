import sequelize from '../config/database.js';
import PurchaseRepository from '../repositories/PurchaseRepository.js';
import Product from '../models/Product.js';
import ProductBatch from '../models/ProductBatch.js';
import StockLedger from '../models/StockLedger.js';

export class PurchaseService {
  constructor() {
    this.repo = new PurchaseRepository();
  }

  async createPurchase(purchaseData, creatorId) {
    const { supplierId, supplierInvoiceNumber, invoiceDate, discountAmount = 0, items = [] } = purchaseData;

    if (!items || items.length === 0) {
      const err = new Error('Purchase order must contain at least one item');
      err.statusCode = 400;
      throw err;
    }

    return await sequelize.transaction(async (transaction) => {
      // 1. Generate unique internal inward invoice number
      const invoiceNumber = await this.repo.getNextInvoiceNumber(transaction);

      let subTotalAccumulator = 0;
      let taxAmountAccumulator = 0;
      let netAmountAccumulator = 0;

      const itemsToCreate = [];

      for (const item of items) {
        const { productId, batchNumber, mfgDate, expiryDate, quantity, purchaseRate, mrp } = item;

        if (!quantity || quantity <= 0) {
          const err = new Error('Quantity must be greater than zero');
          err.statusCode = 400;
          throw err;
        }
        if (!purchaseRate || purchaseRate <= 0) {
          const err = new Error('Purchase rate must be greater than zero');
          err.statusCode = 400;
          throw err;
        }
        if (!mrp || mrp <= 0) {
          const err = new Error('MRP must be greater than zero');
          err.statusCode = 400;
          throw err;
        }
        if (!batchNumber || batchNumber.trim() === '') {
          const err = new Error('Batch number is required');
          err.statusCode = 400;
          throw err;
        }
        if (!expiryDate) {
          const err = new Error('Expiry date is required');
          err.statusCode = 400;
          throw err;
        }

        // Fetch product with locking to prevent concurrent updates
        const product = await Product.findByPk(productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!product) {
          const err = new Error(`Product ID ${productId} not found`);
          err.statusCode = 404;
          throw err;
        }

        const previousProductStock = product.stockQty || 0;

        // 2. Create or update batch-wise inventory (dbo.ProductBatches)
        let batch = await ProductBatch.findOne({
          where: { productId, batchNumber },
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (batch) {
          // Increment stock on existing batch
          batch.stockQty += quantity;
          batch.purchaseRate = purchaseRate;
          batch.mrp = mrp;
          batch.expiryDate = expiryDate;
          await batch.save({ transaction });
        } else {
          // Register a new batch
          batch = await ProductBatch.create({
            productId,
            batchNumber,
            expiryDate,
            stockQty: quantity,
            purchaseRate,
            mrp
          }, { transaction });
        }

        // 3. Update global product inventory
        product.stockQty = previousProductStock + quantity;
        
        // Update product MRP to match latest purchase batch retail price
        product.mrp = mrp;
        await product.save({ transaction });

        // Calculate GST Purchase totals (Purchase Rate + taxPercent GST)
        const lineGross = Number(purchaseRate) * quantity;
        const lineTaxPercent = Number(product.taxPercent || 0);
        const lineTaxAmount = lineGross * (lineTaxPercent / 100);
        const lineTotal = lineGross + lineTaxAmount;

        subTotalAccumulator += lineGross;
        taxAmountAccumulator += lineTaxAmount;
        netAmountAccumulator += lineTotal;

        itemsToCreate.push({
          productId,
          batchNumber,
          mfgDate: mfgDate || null,
          expiryDate,
          quantity,
          purchaseRate,
          mrp,
          taxPercent: lineTaxPercent,
          taxAmount: lineTaxAmount,
          itemTotal: lineTotal
        });

        // 4. Log audit log row to StockLedger
        await StockLedger.create({
          productId,
          batchNumber,
          transactionType: 'PURCHASE',
          quantity,
          referenceId: 0, // Placeholder, updated next
          previousQty: previousProductStock,
          newQty: product.stockQty,
          createdBy: creatorId
        }, { transaction });
      }

      const netAmount = netAmountAccumulator - Number(discountAmount);
      if (netAmount < 0) {
        const err = new Error('Discount cannot exceed gross purchase total');
        err.statusCode = 400;
        throw err;
      }

      const invoiceData = {
        invoiceNumber,
        supplierInvoiceNumber,
        supplierId,
        invoiceDate,
        subTotal: subTotalAccumulator,
        taxAmount: taxAmountAccumulator,
        discountAmount: Number(discountAmount),
        netAmount,
        createdBy: creatorId
      };

      // 5. Store invoice details
      const createdPurchase = await this.repo.createPurchase(invoiceData, itemsToCreate, transaction);

      // 6. Update referenceId inside the created StockLedger rows
      await StockLedger.update(
        { referenceId: createdPurchase.purchaseInvoiceId },
        { 
          where: { 
            referenceId: 0,
            createdBy: creatorId,
            transactionType: 'PURCHASE'
          }, 
          transaction 
        }
      );

      return createdPurchase;
    });
  }

  async listPurchases(query) {
    return await this.repo.findAndCountAll(query);
  }

  async getPurchaseDetails(purchaseInvoiceId) {
    const invoice = await this.repo.findById(purchaseInvoiceId);
    if (!invoice) {
      const err = new Error('Purchase invoice not found');
      err.statusCode = 404;
      throw err;
    }
    return invoice;
  }
}

export default PurchaseService;
