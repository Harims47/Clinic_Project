import { body, validationResult } from 'express-validator';

export const validatePatient = [
  body('name')
    .trim()
    .notEmpty().withMessage('Patient name is required')
    .isLength({ max: 150 }).withMessage('Name must not exceed 150 characters'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Primary phone number is required'),
  body('alternatePhone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('bloodGroup')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group format'),
  body('emergencyContactName')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('emergencyContactPhone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('addressLine1')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('addressLine2')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('city')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('state')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('pincode')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  
  // Handler middleware to evaluate assertions result
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

export default validatePatient;
