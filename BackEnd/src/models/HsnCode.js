import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const HsnCode = sequelize.define('HsnCode', {
  hsnId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'HsnId'
  },
  hsnCode: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    field: 'HsnCode'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Description'
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
  tableName: 'HsnCodes',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: false // Read-only audit trail
});

// Setup relationships
if (User && !process.env.VITEST) {
  HsnCode.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
}

export default HsnCode;
export { HsnCode };
