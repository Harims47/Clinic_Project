import { Router } from 'express';
import SalesInvoiceController from '../controllers/SalesInvoiceController.js';
import validateSalesInvoice from '../middlewares/salesInvoice.validator.js';
import authGuard from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new SalesInvoiceController();

// Apply authGuard globally to all pharmacy billing routes
router.use(authGuard);

router.post('/', validateSalesInvoice, controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.patch('/:id/cancel', controller.cancel);

export default router;
