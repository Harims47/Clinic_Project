import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'UserId'
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'Username'
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'PasswordHash'
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Role'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'IsActive'
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: false // Schema doesn't require an updatedAt column
});

export default User;
export { User };
