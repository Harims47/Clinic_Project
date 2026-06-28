import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Supplier from './Supplier.js';

const PurchaseInvoice = sequelize.define('PurchaseInvoice', {
  purchaseInvoiceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'PurchaseInvoiceId'
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'InvoiceNumber'
  },
  supplierInvoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'SupplierInvoiceNumber'
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'SupplierId',
    references: {
      model: 'Suppliers',
      key: 'SupplierId'
    }
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'InvoiceDate'
  },
  subTotal: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'SubTotal'
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
  netAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'NetAmount'
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
  tableName: 'PurchaseInvoices',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  indexes: [
    {
      fields: ['InvoiceNumber']
    },
    {
      fields: ['SupplierId']
    },
    {
      fields: ['CreatedAt']
    }
  ]
});

// Setup relationships (safeguarded against vitest mock imports)
if (!process.env.VITEST) {
  PurchaseInvoice.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
  PurchaseInvoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
}

export default PurchaseInvoice;
export { PurchaseInvoice };
