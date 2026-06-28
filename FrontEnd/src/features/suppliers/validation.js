import { z } from 'zod';

export const supplierSchema = z.object({
  supplierName: z.string()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(150, 'Supplier name cannot exceed 150 characters')
    .trim(),
  phone: z.string()
    .min(5, 'Phone number must be at least 5 characters')
    .max(20, 'Phone number cannot exceed 20 characters')
    .trim(),
  gstin: z.string()
    .length(15, 'GSTIN must be exactly 15 characters')
    .or(z.literal(''))
    .optional()
    .transform(val => val === '' ? null : val),
  email: z.string()
    .email('Invalid email address')
    .or(z.literal(''))
    .optional()
    .transform(val => val === '' ? null : val),
  address: z.string()
    .max(255, 'Address cannot exceed 255 characters')
    .or(z.literal(''))
    .optional()
    .transform(val => val === '' ? null : val),
  isActive: z.boolean().default(true)
});

export default supplierSchema;
