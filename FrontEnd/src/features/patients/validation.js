import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must not exceed 150 characters'),
  dateOfBirth: z.string()
    .nonempty('Date of birth is required')
    .refine(val => {
      const birthDate = new Date(val);
      const today = new Date();
      return birthDate <= today;
    }, 'Date of birth must be in the past'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Gender must be Male, Female, or Other' })
  }),
  phone: z.string()
    .min(5, 'Primary phone number is too short')
    .max(20, 'Primary phone number is too long')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Invalid phone number format'),
  alternatePhone: z.string()
    .optional()
    .or(z.literal('')),
  bloodGroup: z.enum(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Invalid blood group selection' })
  }).optional().or(z.literal('')),
  emergencyContactName: z.string()
    .max(150, 'Contact name must not exceed 150 characters')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z.string()
    .max(20, 'Contact phone must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
  addressLine1: z.string()
    .max(255, 'Address line 1 must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  addressLine2: z.string()
    .max(255, 'Address line 2 must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .max(100, 'City must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  state: z.string()
    .max(100, 'State must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  pincode: z.string()
    .max(20, 'Pincode must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
  remarks: z.string()
    .optional()
    .or(z.literal(''))
});

export default patientSchema;
