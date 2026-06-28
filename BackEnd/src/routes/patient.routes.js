import { Router } from 'express';
import PatientController from '../controllers/PatientController.js';
import validatePatient from '../middlewares/patient.validator.js';
import uploadPatientPhoto from '../middlewares/upload.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new PatientController();

// Apply authentication gate globally to all patient routes
router.use(authMiddleware);

// Rest routes
router.get('/', controller.list);
router.get('/:id', controller.getById);

router.post('/', uploadPatientPhoto.single('photo'), validatePatient, controller.register);
router.put('/:id', uploadPatientPhoto.single('photo'), validatePatient, controller.update);

export default router;
export { router as patientRoutes };
