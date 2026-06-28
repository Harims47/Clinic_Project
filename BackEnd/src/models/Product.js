import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Manufacturer from './Manufacturer.js';
import HsnCode from './HsnCode.js';

const Product = sequelize.define('Product', {
  productId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ProductId'
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'ProductName'
  },
  genericName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'GenericName'
  },
  mfrId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'MfrId',
    references: {
      model: 'Manufacturers',
      key: 'MfrId'
    }
  },
  pack: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'Pack'
  },
  mrp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'MRP'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'Unit'
  },
  hsnId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'HsnId',
    references: {
      model: 'HsnCodes',
      key: 'HsnId'
    }
  },
  taxPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'TaxPercent'
  },
  packNo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'PackNo'
  },
  boxNo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'BoxNo'
  },
  lowStockLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    field: 'LowStockLevel'
  },
  purchaseRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'PurchaseRate' // Readonly, calculated from Purchase invoices
  },
  salesPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'SalesPrice' // Readonly, calculated from MRP/sales
  },
  stockQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'StockQty' // Readonly, calculated from batch stocks
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
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'UpdatedBy',
    references: {
      model: 'Users',
      key: 'UserId'
    }
  }
}, {
  tableName: 'Products',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  indexes: [
    {
      fields: ['ProductName']
    },
    {
      fields: ['GenericName']
    }
  ]
});

// Setup relationships (safeguarded against vitest mock imports)
if (!process.env.VITEST) {
  Product.belongsTo(Manufacturer, { foreignKey: 'mfrId', as: 'manufacturer' });
  Product.belongsTo(HsnCode, { foreignKey: 'hsnId', as: 'hsn' });
  Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Product.belongsTo(User, { foreignKey: 'updatedBy', as: 'editor' });
}

export default Product;
export { Product };
