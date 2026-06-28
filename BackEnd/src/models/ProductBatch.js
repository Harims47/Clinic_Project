import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';

const ProductBatch = sequelize.define('ProductBatch', {
  batchId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'BatchId'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ProductId',
    references: {
      model: 'Products',
      key: 'ProductId'
    }
  },
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'BatchNumber'
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'ExpiryDate'
  },
  stockQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'StockQty'
  },
  purchaseRate: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'PurchaseRate'
  },
  mrp: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'MRP'
  }
}, {
  tableName: 'ProductBatches',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  indexes: [
    {
      fields: ['ProductId', 'BatchNumber']
    }
  ]
});

// Setup relationships (safeguarded against vitest mock imports)
if (!process.env.VITEST) {
  ProductBatch.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  Product.hasMany(ProductBatch, { foreignKey: 'productId', as: 'batches' });
}

export default ProductBatch;
export { ProductBatch };
