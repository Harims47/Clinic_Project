import { Op } from 'sequelize';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';

export class SupplierRepository {
  async create(supplierData, transaction) {
    return await Supplier.create(supplierData, { transaction });
  }

  async findById(supplierId) {
    return await Supplier.findByPk(supplierId, {
      include: [
        { model: User, as: 'creator', attributes: ['userId', 'username'] }
      ]
    });
  }

  async update(supplierId, updateData, transaction) {
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) return null;
    return await supplier.update(updateData, { transaction });
  }

  async findAndCountAll({ search, page = 1, limit = 10 }) {
    const limitVal = parseInt(limit, 10) || 10;
    const pageVal = parseInt(page, 10) || 1;
    const offsetVal = (pageVal - 1) * limitVal;

    const where = {};
    if (search) {
      where[Op.or] = [
        { supplierName: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      limit: limitVal,
      offset: offsetVal,
      order: [['CreatedAt', 'DESC']],
      include: [
        { model: User, as: 'creator', attributes: ['userId', 'username'] }
      ]
    });

    return {
      totalCount: count,
      totalPages: Math.ceil(count / limitVal),
      currentPage: pageVal,
      suppliers: rows
    };
  }

  async findByName(supplierName) {
    return await Supplier.findOne({ where: { supplierName } });
  }
}

export default SupplierRepository;
