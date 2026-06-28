import { Router } from 'express';
import SupplierController from '../controllers/SupplierController.js';
import validateSupplier from '../middlewares/supplier.validator.js';
import authGuard from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new SupplierController();

// Apply authGuard globally to all supplier directory routes
router.use(authGuard);

router.post('/', validateSupplier, controller.create);
router.put('/:id', validateSupplier, controller.update);
router.get('/', controller.list);
router.get('/:id', controller.getById);

export default router;
export { router as supplierRoutes };
