import { Router } from 'express';
import ProductController from '../controllers/ProductController.js';
import validateProduct from '../middlewares/product.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new ProductController();

// Protect all product routes globally using auth gate
router.use(authMiddleware);

// Products routing list
router.get('/', controller.list);
router.get('/manufacturers', controller.listMfrs);
router.post('/manufacturers', controller.createMfr);
router.get('/hsncodes', controller.listHsns);
router.post('/hsncodes', controller.createHsn);

router.get('/:id', controller.getById);
router.post('/', validateProduct, controller.register);
router.put('/:id', validateProduct, controller.update);

export default router;
export { router as productRoutes };
