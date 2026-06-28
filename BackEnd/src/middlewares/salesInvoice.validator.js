import { body, validationResult } from 'express-validator';

export const validateSalesInvoice = [
  body('patientId')
    .optional({ nullable: true })
    .isInt()
    .withMessage('patientId must be an integer'),

  body('tokenId')
    .optional({ nullable: true })
    .isInt()
    .withMessage('tokenId must be an integer'),

  body('paymentMode')
    .exists()
    .withMessage('paymentMode is required')
    .isIn(['Cash', 'UPI', 'Card', 'Mixed'])
    .withMessage('paymentMode must be Cash, UPI, Card, or Mixed'),

  body('discountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('discountAmount must be a non-negative number'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array'),

  body('items.*.productId')
    .isInt()
    .withMessage('productId must be an integer'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer'),

  body('items.*.discountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('item discountAmount must be a non-negative number'),

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

export default validateSalesInvoice;
