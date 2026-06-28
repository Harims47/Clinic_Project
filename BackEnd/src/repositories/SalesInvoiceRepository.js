import { Op } from 'sequelize';
import SalesInvoice from '../models/SalesInvoice.js';
import SalesInvoiceItem from '../models/SalesInvoiceItem.js';
import Patient from '../models/Patient.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export class SalesInvoiceRepository {
  async createInvoice(invoiceData, itemsData, transaction) {
    // 1. Create primary invoice
    const invoice = await SalesInvoice.create(invoiceData, { transaction });

    // 2. Map items with parent invoiceId reference
    const itemsToInsert = itemsData.map(item => ({
      ...item,
      invoiceId: invoice.invoiceId
    }));

    // 3. Bulk insert invoice items
    const items = await SalesInvoiceItem.bulkCreate(itemsToInsert, { transaction });

    return {
      ...(invoice.toJSON ? invoice.toJSON() : invoice),
      items: items.map(it => (it.toJSON ? it.toJSON() : it))
    };
  }

  async findById(invoiceId) {
    return await SalesInvoice.findByPk(invoiceId, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patientId', 'name', 'phone', 'patientCode', 'gender', 'age']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['userId', 'username']
        },
        {
          model: SalesInvoiceItem,
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
        { '$patient.name$': { [Op.like]: `%${search}%` } },
        { '$patient.phone$': { [Op.like]: `%${search}%` } }
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

    // Workaround to enable include searching on fields
    const include = [
      {
        model: Patient,
        as: 'patient',
        required: false
      },
      {
        model: User,
        as: 'creator',
        attributes: ['userId', 'username']
      }
    ];

    const { count, rows } = await SalesInvoice.findAndCountAll({
      where,
      limit: limitVal,
      offset: offsetVal,
      order: [['CreatedAt', 'DESC']],
      include
    });

    return {
      totalCount: count,
      totalPages: Math.ceil(count / limitVal),
      currentPage: pageVal,
      invoices: rows
    };
  }

  async getNextInvoiceNumber(transaction) {
    const maxId = await SalesInvoice.max('invoiceId', { transaction });
    const nextNumber = (maxId || 0) + 1;
    return `INV-${String(nextNumber).padStart(5, '0')}`;
  }
}

export default SalesInvoiceRepository;
