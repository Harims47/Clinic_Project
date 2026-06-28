import { body, validationResult } from 'express-validator';

export const validatePurchase = [
  body('supplierId')
    .exists()
    .withMessage('supplierId is required')
    .isInt()
    .withMessage('supplierId must be an integer'),

  body('supplierInvoiceNumber')
    .exists()
    .withMessage('supplierInvoiceNumber is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('supplierInvoiceNumber cannot be empty'),

  body('invoiceDate')
    .exists()
    .withMessage('invoiceDate is required')
    .isDate()
    .withMessage('invoiceDate must be a valid date YYYY-MM-DD'),

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

  body('items.*.batchNumber')
    .exists()
    .withMessage('batchNumber is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('batchNumber cannot be empty'),

  body('items.*.expiryDate')
    .exists()
    .withMessage('expiryDate is required')
    .isDate()
    .withMessage('expiryDate must be a valid date YYYY-MM-DD'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer'),

  body('items.*.purchaseRate')
    .isFloat({ min: 0.01 })
    .withMessage('purchaseRate must be greater than zero'),

  body('items.*.mrp')
    .isFloat({ min: 0.01 })
    .withMessage('MRP must be greater than zero'),

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

export default validatePurchase;
