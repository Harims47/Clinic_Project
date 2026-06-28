import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Supplier = sequelize.define('Supplier', {
  supplierId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'SupplierId'
  },
  supplierName: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'SupplierName'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Phone'
  },
  gstin: {
    type: DataTypes.STRING(15),
    allowNull: true,
    field: 'GSTIN'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Address'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Email'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'IsActive'
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
  tableName: 'Suppliers',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  indexes: [
    {
      fields: ['SupplierName']
    }
  ]
});

// Setup relationships (safeguarded against vitest mock imports)
if (!process.env.VITEST) {
  Supplier.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
}

export default Supplier;
export { Supplier };
