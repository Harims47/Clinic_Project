import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Patient from './Patient.js';

const QueueToken = sequelize.define('QueueToken', {
  tokenId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'TokenId'
  },
  tokenNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'TokenNumber'
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'PatientId',
    references: {
      model: 'Patients',
      key: 'PatientId'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'DoctorId',
    references: {
      model: 'Users',
      key: 'UserId'
    }
  },
  consultationType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'New',
    field: 'ConsultationType'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Waiting', // 'Waiting', 'Called', 'Completed', 'Cancelled'
    field: 'Status'
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Remarks'
  },
  tokenDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'TokenDate'
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
  calledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'CalledAt'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'CompletedAt'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'CancelledAt'
  }
}, {
  tableName: 'QueueTokens',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  indexes: [
    {
      fields: ['TokenDate']
    },
    {
      fields: ['DoctorId']
    },
    {
      fields: ['PatientId']
    },
    {
      fields: ['DoctorId', 'TokenDate']
    }
  ]
});

// Setup relationships (safeguarded against vitest mock imports)
if (!process.env.VITEST) {
  QueueToken.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  QueueToken.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
  QueueToken.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
}

export default QueueToken;
export { QueueToken };
