import { Op } from 'sequelize';
import QueueToken from '../models/QueueToken.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

export class QueueTokenRepository {
  async create(tokenData, transaction) {
    return await QueueToken.create(tokenData, { transaction });
  }

  async findById(tokenId) {
    return await QueueToken.findByPk(tokenId, {
      include: [
        { 
          model: Patient, 
          as: 'patient', 
          attributes: ['patientId', 'patientCode', 'name', 'phone', 'gender', 'dateOfBirth'] 
        },
        { 
          model: User, 
          as: 'doctor', 
          attributes: ['userId', 'username', 'role', 'isActive'] 
        },
        { 
          model: User, 
          as: 'creator', 
          attributes: ['userId', 'username'] 
        }
      ]
    });
  }

  async update(tokenId, updateData, transaction) {
    const token = await QueueToken.findByPk(tokenId);
    if (!token) return null;
    return await token.update(updateData, { transaction });
  }

  async findAndCountAll({ search, status, doctorId, date, limit, offset }) {
    const where = {};
    
    if (date) {
      where.tokenDate = date;
    }
    if (status) {
      where.status = status;
    }
    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (search) {
      where[Op.or] = [
        { '$patient.Name$': { [Op.like]: `%${search}%` } },
        { '$patient.Phone$': { [Op.like]: `%${search}%` } },
        { '$patient.PatientCode$': { [Op.like]: `%${search}%` } }
      ];
    }

    return await QueueToken.findAndCountAll({
      where,
      limit,
      offset,
      order: [['tokenNumber', 'ASC']],
      include: [
        { 
          model: Patient, 
          as: 'patient', 
          attributes: ['patientId', 'patientCode', 'name', 'phone', 'gender', 'dateOfBirth'] 
        },
        { 
          model: User, 
          as: 'doctor', 
          attributes: ['userId', 'username'] 
        }
      ]
    });
  }

  async getNextTokenNumber(doctorId, date) {
    const maxToken = await QueueToken.max('tokenNumber', {
      where: { doctorId, tokenDate: date }
    });
    return (maxToken || 0) + 1;
  }

  async findLastCompletedToken(patientId, doctorId, dateLimit) {
    return await QueueToken.findOne({
      where: {
        patientId,
        doctorId,
        status: 'Completed',
        tokenDate: { [Op.gte]: dateLimit }
      },
      order: [['tokenDate', 'DESC'], ['CreatedAt', 'DESC']]
    });
  }

  // Active check if patient has active queue token today
  async findActiveTokenToday(patientId, date) {
    return await QueueToken.findOne({
      where: {
        patientId,
        tokenDate: date,
        status: { [Op.in]: ['Waiting', 'Called'] }
      }
    });
  }

  async getTodayTokensCount(date) {
    return await QueueToken.count({ where: { tokenDate: date } });
  }

  async getTodayPatientsCount() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const Patient = (await import('../models/Patient.js')).default;
    return await Patient.count({
      where: {
        createdAt: {
          [Op.gte]: startOfToday
        }
      }
    });
  }

  async getLowStockCount() {
    const Product = (await import('../models/Product.js')).default;
    return await Product.count({
      where: {
        isActive: true,
        stockQty: {
          [Op.lte]: Product.sequelize.col('LowStockLevel')
        }
      }
    });
  }
}

export default QueueTokenRepository;
