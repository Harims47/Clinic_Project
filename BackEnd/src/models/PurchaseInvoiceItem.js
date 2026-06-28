import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import PurchaseInvoice from './PurchaseInvoice.js';
import Product from './Product.js';

const PurchaseInvoiceItem = sequelize.define('PurchaseInvoiceItem', {
  purchaseInvoiceItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'PurchaseInvoiceItemId'
  },
  purchaseInvoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'PurchaseInvoiceId',
    references: {
      model: 'PurchaseInvoices',
      key: 'PurchaseInvoiceId'
    },
    onDelete: 'CASCADE'
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
  mfgDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'MfgDate'
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'ExpiryDate'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Quantity'
  },
  purchaseRate: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    field: 'PurchaseRate'
  },
  mrp: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    field: 'MRP'
  },
  taxPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'TaxPercent'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'TaxAmount'
  },
  itemTotal: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    field: 'ItemTotal'
  }
}, {
  tableName: 'PurchaseInvoiceItems',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

// Setup relationships (safeguarded against vitest mock imports)
if (!process.env.VITEST) {
  PurchaseInvoiceItem.belongsTo(PurchaseInvoice, { foreignKey: 'purchaseInvoiceId', as: 'purchaseInvoice' });
  PurchaseInvoice.hasMany(PurchaseInvoiceItem, { foreignKey: 'purchaseInvoiceId', as: 'items' });
  PurchaseInvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
}

export default PurchaseInvoiceItem;
export { PurchaseInvoiceItem };
