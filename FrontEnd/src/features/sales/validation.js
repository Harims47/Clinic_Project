import { z } from 'zod';

export const salesInvoiceSchema = z.object({
  patientId: z.any().optional(),
  tokenId: z.any().optional(),
  paymentMode: z.enum(['Cash', 'UPI', 'Card', 'Mixed'], {
    errorMap: () => ({ message: 'Please select a valid payment mode (Cash, UPI, Card, or Mixed)' })
  }),
  discountAmount: z.preprocess(
    (val) => (val === '' || val === null ? 0 : Number(val)),
    z.number().min(0, 'Discount amount cannot be negative')
  ),
  items: z.array(
    z.object({
      productId: z.number().int().min(1, 'Product selection is required'),
      productName: z.string().optional(),
      mrp: z.number().min(0).optional(),
      taxPercent: z.number().min(0).optional(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      discountAmount: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0, 'Item discount cannot be negative')
      )
    })
  ).min(1, 'Invoice must contain at least one item')
});

export default salesInvoiceSchema;
