import { Op } from 'sequelize';
import PurchaseInvoice from '../models/PurchaseInvoice.js';
import PurchaseInvoiceItem from '../models/PurchaseInvoiceItem.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export class PurchaseRepository {
  async createPurchase(invoiceData, itemsData, transaction) {
    const invoice = await PurchaseInvoice.create(invoiceData, { transaction });

    const itemsToInsert = itemsData.map(item => ({
      ...item,
      purchaseInvoiceId: invoice.purchaseInvoiceId
    }));

    const items = await PurchaseInvoiceItem.bulkCreate(itemsToInsert, { transaction });

    return {
      ...(invoice.toJSON ? invoice.toJSON() : invoice),
      items: items.map(it => (it.toJSON ? it.toJSON() : it))
    };
  }

  async findById(purchaseInvoiceId) {
    return await PurchaseInvoice.findByPk(purchaseInvoiceId, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['supplierId', 'supplierName', 'phone', 'gstin', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['userId', 'username']
        },
        {
          model: PurchaseInvoiceItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['productId', 'productName', 'genericName', 'mrp', 'taxPercent']
            }
          ]
        }
      ]
    });
  }

  async findAndCountAll({ search, page = 1, limit = 10, date }) {
    const limitVal = parseInt(limit, 10) || 10;
    const pageVal = parseInt(page, 10) || 1;
    const offsetVal = (pageVal - 1) * limitVal;

    const where = {};

    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${search}%` } },
        { supplierInvoiceNumber: { [Op.like]: `%${search}%` } },
        { '$supplier.SupplierName$': { [Op.like]: `%${search}%` } }
      ];
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await PurchaseInvoice.findAndCountAll({
      where,
      limit: limitVal,
      offset: offsetVal,
      order: [['CreatedAt', 'DESC']],
      include: [
        {
          model: Supplier,
          as: 'supplier',
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['userId', 'username']
        }
      ]
    });

    return {
      totalCount: count,
      totalPages: Math.ceil(count / limitVal),
      currentPage: pageVal,
      invoices: rows
    };
  }

  async getNextInvoiceNumber(transaction) {
    const maxId = await PurchaseInvoice.max('purchaseInvoiceId', { transaction });
    const nextNumber = (maxId || 0) + 1;
    return `PUR-${String(nextNumber).padStart(5, '0')}`;
  }
}

export default PurchaseRepository;
