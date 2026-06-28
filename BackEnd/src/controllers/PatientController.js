import PatientService from '../services/PatientService.js';

export class PatientController {
  constructor() {
    this.service = new PatientService();
  }

  // Bind methods to this context to ensure correct reference when mounted as routing callbacks
  register = async (req, res, next) => {
    try {
      const patientData = { ...req.body };
      
      // Inject file path if Multer completed a successful upload
      if (req.file) {
        // Store relative path to be served statically
        patientData.photoPath = `uploads/patients/${req.file.filename}`;
      }

      // req.user is set by authMiddleware
      const creatorId = req.user.userId;
      
      const newPatient = await this.service.registerPatient(patientData, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Patient registered successfully',
        data: newPatient
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const patient = await this.service.getPatientDetails(id);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: patient
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (req.file) {
        updateData.photoPath = `uploads/patients/${req.file.filename}`;
      }

      const editorId = req.user.userId;

      const updatedPatient = await this.service.updatePatient(id, updateData, editorId);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Patient profile updated successfully',
        data: updatedPatient
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const { search, page, limit } = req.query;
      
      const result = await this.service.listPatients({ search, page, limit });

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

export default PatientController;
