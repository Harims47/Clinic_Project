import { body, validationResult } from 'express-validator';

export const validateProduct = [
  body('productName')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 255 }).withMessage('Product name must not exceed 255 characters'),
  body('genericName')
    .trim()
    .notEmpty().withMessage('Generic active formula name is required')
    .isLength({ max: 255 }).withMessage('Generic name must not exceed 255 characters'),
  body('mrp')
    .notEmpty().withMessage('MRP is required')
    .isFloat({ min: 0.00 }).withMessage('MRP must be a positive number'),
  body('taxPercent')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0.00, max: 100.00 }).withMessage('Tax Percent must be a percentage between 0 and 100'),
  body('lowStockLevel')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Low stock warning limit must be a positive integer'),
  body('pack')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('unit')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('packNo')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('boxNo')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('mfrId')
    .optional({ nullable: true, checkFalsy: true })
    .isInt().withMessage('Invalid manufacturer selection'),
  body('hsnId')
    .optional({ nullable: true, checkFalsy: true })
    .isInt().withMessage('Invalid HSN code selection'),

  // Validation errors evaluator callback
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Product validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }
    next();
  }
];

export default validateProduct;
