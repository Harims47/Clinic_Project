import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Patient from './Patient.js';
import QueueToken from './QueueToken.js';

const SalesInvoice = sequelize.define('SalesInvoice', {
  invoiceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'InvoiceId'
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'InvoiceNumber'
  },
  tokenId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'TokenId',
    references: {
      model: 'QueueTokens',
      key: 'TokenId'
    }
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'PatientId',
    references: {
      model: 'Patients',
      key: 'PatientId'
    }
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
  paymentMode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Cash', // 'Cash', 'UPI', 'Card', 'Mixed'
    field: 'PaymentMode'
  },
  paymentStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Paid', // 'Paid', 'Cancelled'
    field: 'PaymentStatus'
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
  tableName: 'SalesInvoices',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  indexes: [
    {
      fields: ['InvoiceNumber']
    },
    {
      fields: ['PatientId']
    },
    {
      fields: ['CreatedAt']
    }
  ]
});

// Setup relationships (safeguarded against mock import errors during unit tests)
if (!process.env.VITEST) {
  SalesInvoice.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  SalesInvoice.belongsTo(QueueToken, { foreignKey: 'tokenId', as: 'token' });
  SalesInvoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
}

export default SalesInvoice;
export { SalesInvoice };
