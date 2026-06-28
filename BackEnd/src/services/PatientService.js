import PatientRepository from '../repositories/PatientRepository.js';

export class PatientService {
  constructor() {
    this.repository = new PatientRepository();
  }

  async registerPatient(patientData, creatorId) {
    const data = {
      ...patientData,
      createdBy: creatorId,
      isActive: true
    };
    return await this.repository.create(data);
  }

  async getPatientDetails(patientId) {
    const patient = await this.repository.findById(patientId);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }
    return patient;
  }

  async updatePatient(patientId, updateData, editorId) {
    // Verify patient exists
    const patient = await this.repository.findById(patientId);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    const data = {
      ...updateData,
      updatedBy: editorId
    };

    return await this.repository.update(patientId, data);
  }

  async listPatients({ search, page = 1, limit = 10 }) {
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await this.repository.findAndCountAll({
      search,
      limit: parsedLimit,
      offset
    });

    return {
      patients: rows,
      totalCount: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage
    };
  }
}

export default PatientService;
