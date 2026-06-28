import { z } from 'zod';

export const productSchema = z.object({
  productName: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must not exceed 255 characters'),
  genericName: z.string()
    .min(1, 'Generic active formula name is required')
    .max(255, 'Generic name must not exceed 255 characters'),
  mrp: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'MRP is required', invalid_type_error: 'MRP must be a number' })
      .min(0, 'MRP must be a positive number')
  ),
  taxPercent: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number()
      .min(0, 'Tax Percent must be at least 0%')
      .max(100, 'Tax Percent must not exceed 100%')
      .optional()
  ).or(z.literal(0)),
  lowStockLevel: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number()
      .int('Low stock warning level must be an integer')
      .min(0, 'Low stock level must be positive')
      .optional()
  ).or(z.literal(10)),
  pack: z.string().max(50, 'Pack configuration must not exceed 50 characters').optional().or(z.literal('')),
  unit: z.string().max(50, 'Unit must not exceed 50 characters').optional().or(z.literal('')),
  packNo: z.string().max(50, 'Pack No must not exceed 50 characters').optional().or(z.literal('')),
  boxNo: z.string().max(50, 'Box No must not exceed 50 characters').optional().or(z.literal('')),
  mfrId: z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number().int().optional()
  ),
  hsnId: z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number().int().optional()
  )
});

export default productSchema;
