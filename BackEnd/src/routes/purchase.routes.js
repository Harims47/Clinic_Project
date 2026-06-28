import { Router } from 'express';
import PurchaseController from '../controllers/PurchaseController.js';
import validatePurchase from '../middlewares/purchase.validator.js';
import authGuard from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new PurchaseController();

// Apply authGuard globally to all purchase/stock inward routes
router.use(authGuard);

router.post('/', validatePurchase, controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);

export default router;
export { router as purchaseRoutes };
