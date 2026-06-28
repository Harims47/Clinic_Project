import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import SalesInvoice from './SalesInvoice.js';
import Product from './Product.js';

const SalesInvoiceItem = sequelize.define('SalesInvoiceItem', {
  invoiceItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'InvoiceItemId'
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'InvoiceId',
    references: {
      model: 'SalesInvoices',
      key: 'InvoiceId'
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
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Quantity'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    field: 'UnitPrice'
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
  discountAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'DiscountAmount'
  },
  itemTotal: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    field: 'ItemTotal'
  },
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'BatchNumber'
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'ExpiryDate'
  }
}, {
  tableName: 'SalesInvoiceItems',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

// Setup relationships (safeguarded against mock imports during unit testing)
if (!process.env.VITEST) {
  SalesInvoiceItem.belongsTo(SalesInvoice, { foreignKey: 'invoiceId', as: 'invoice' });
  SalesInvoice.hasMany(SalesInvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
  SalesInvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
}

export default SalesInvoiceItem;
export { SalesInvoiceItem };
