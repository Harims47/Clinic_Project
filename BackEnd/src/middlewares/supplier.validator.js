import { body, validationResult } from 'express-validator';

export const validateSupplier = [
  body('supplierName')
    .exists()
    .withMessage('supplierName is required')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('supplierName must be between 2 and 150 characters'),

  body('phone')
    .exists()
    .withMessage('phone number is required')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('phone number must be between 5 and 20 characters'),

  body('gstin')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 15, max: 15 })
    .withMessage('gstin must be exactly 15 characters'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage('invalid email format'),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('address cannot exceed 255 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }
    next();
  }
];

export default validateSupplier;
