import { body, validationResult } from 'express-validator';

// Configurable consultation types (not hardcoded at database level)
export const ALLOWED_CONSULTATION_TYPES = ['New', 'Follow-up', 'Routine Review', 'Specialist Consult'];

export const validateQueueToken = [
  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isInt({ min: 1 }).withMessage('Invalid patient selection'),
  body('doctorId')
    .notEmpty().withMessage('Doctor ID is required')
    .isInt({ min: 1 }).withMessage('Invalid doctor selection'),
  body('consultationType')
    .optional({ nullable: true })
    .trim()
    .isIn(ALLOWED_CONSULTATION_TYPES)
    .withMessage(`Consultation Type must be one of: ${ALLOWED_CONSULTATION_TYPES.join(', ')}`),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Remarks must not exceed 255 characters'),

  // Validation evaluator callback
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Token validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }
    next();
  }
];

export default validateQueueToken;
