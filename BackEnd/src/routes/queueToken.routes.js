import { Router } from 'express';
import QueueTokenController from '../controllers/QueueTokenController.js';
import validateQueueToken from '../middlewares/queueToken.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new QueueTokenController();

// Globally gated under authentication middleware
router.use(authMiddleware);

router.get('/', controller.list);
router.get('/doctors', controller.listDoctors);
router.get('/check-follow-up', controller.checkFollowUp);
router.get('/stats', controller.getStats);

router.post('/', validateQueueToken, controller.issue);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/transfer', controller.transfer);

export default router;
export { router as queueTokenRoutes };
