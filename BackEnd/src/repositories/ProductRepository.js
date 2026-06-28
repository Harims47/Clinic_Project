import { Op } from 'sequelize';
import Product from '../models/Product.js';
import Manufacturer from '../models/Manufacturer.js';
import HsnCode from '../models/HsnCode.js';
import User from '../models/User.js';

export class ProductRepository {
  async create(productData, transaction) {
    return await Product.create(productData, { transaction });
  }

  async findById(productId) {
    return await Product.findByPk(productId, {
      include: [
        { model: Manufacturer, as: 'manufacturer', attributes: ['mfrId', 'mfrName'] },
        { model: HsnCode, as: 'hsn', attributes: ['hsnId', 'hsnCode', 'description'] },
        { model: User, as: 'creator', attributes: ['userId', 'username', 'role'] },
        { model: User, as: 'editor', attributes: ['userId', 'username', 'role'] }
      ]
    });
  }

  async update(productId, updateData, transaction) {
    const product = await Product.findByPk(productId);
    if (!product) return null;
    return await product.update(updateData, { transaction });
  }

  async findAndCountAll({ search, limit, offset, order = [['CreatedAt', 'DESC']] }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { productName: { [Op.like]: `%${search}%` } },
        { genericName: { [Op.like]: `%${search}%` } }
      ];
    }

    return await Product.findAndCountAll({
      where,
      limit,
      offset,
      offset,
      order,
      include: [
        { model: Manufacturer, as: 'manufacturer', attributes: ['mfrId', 'mfrName'] },
        { model: HsnCode, as: 'hsn', attributes: ['hsnId', 'hsnCode'] }
      ]
    });
  }
}

export default ProductRepository;
