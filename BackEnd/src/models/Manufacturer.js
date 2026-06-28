import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Manufacturer = sequelize.define('Manufacturer', {
  mfrId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MfrId'
  },
  mfrName: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    field: 'MfrName'
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
  tableName: 'Manufacturers',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: false // Read-only audit trail
});

// Setup relationships
if (User && !process.env.VITEST) {
  Manufacturer.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
}

export default Manufacturer;
export { Manufacturer };
