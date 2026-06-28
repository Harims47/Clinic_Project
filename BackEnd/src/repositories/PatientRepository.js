import { Op } from 'sequelize';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

export class PatientRepository {
  async create(patientData, transaction) {
    return await Patient.create(patientData, { transaction });
  }

  async findById(patientId) {
    return await Patient.findByPk(patientId, {
      include: [
        { model: User, as: 'creator', attributes: ['userId', 'username', 'role'] },
        { model: User, as: 'editor', attributes: ['userId', 'username', 'role'] }
      ]
    });
  }

  async update(patientId, updateData, transaction) {
    const patient = await Patient.findByPk(patientId);
    if (!patient) return null;
    return await patient.update(updateData, { transaction });
  }

  async findAndCountAll({ search, limit, offset, order = [['CreatedAt', 'DESC']] }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { patientCode: { [Op.like]: `%${search}%` } }
      ];
    }

    return await Patient.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: User, as: 'creator', attributes: ['userId', 'username', 'role'] }
      ]
    });
  }
}

export default PatientRepository;
