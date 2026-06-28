import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';
import User from './User.js';

const StockLedger = sequelize.define('StockLedger', {
  ledgerId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'LedgerId'
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
  transactionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'TransactionType' // 'PURCHASE', 'SALE', 'PURCHASE_RETURN', 'SALES_RETURN', 'ADJUSTMENT', 'OPENING_STOCK'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Quantity'
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ReferenceId' // ID of the PurchaseInvoice or SalesInvoice
  },
  previousQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'PreviousQty'
  },
  newQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'NewQty'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'CreatedBy',
    references: {
      model: 'Users',
      key: 'UserId'
    }
  }
}, {
  tableName: 'StockLedgers',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  indexes: [
    {
      fields: ['ProductId']
    },
    {
      fields: ['BatchNumber']
    },
    {
      fields: ['CreatedAt']
    }
  ]
});

// Setup relationships (safeguarded against vitest mock imports)
if (!process.env.VITEST) {
  StockLedger.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  StockLedger.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
}

export default StockLedger;
export { StockLedger };
