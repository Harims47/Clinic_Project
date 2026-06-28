import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Patient = sequelize.define('Patient', {
  patientId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'PatientId'
  },
  patientCode: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
    field: 'PatientCode'
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'Name'
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'DateOfBirth'
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Gender'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Phone'
  },
  alternatePhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'AlternatePhone'
  },
  bloodGroup: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'BloodGroup'
  },
  emergencyContactName: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'EmergencyContactName'
  },
  emergencyContactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'EmergencyContactPhone'
  },
  addressLine1: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'AddressLine1'
  },
  addressLine2: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'AddressLine2'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'City'
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'State'
  },
  pincode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'Pincode'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Remarks'
  },
  photoPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'PhotoPath'
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
  tableName: 'Patients',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
  hooks: {
    afterCreate: async (patient, options) => {
      const code = `PAT-${String(patient.patientId).padStart(5, '0')}`;
      await patient.update({ patientCode: code }, { transaction: options.transaction });
    }
  }
});

// Setup relationships (safeguarded against mock import errors during unit tests)
if (User && !process.env.VITEST) {
  Patient.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Patient.belongsTo(User, { foreignKey: 'updatedBy', as: 'editor' });
}

export default Patient;
export { Patient };
