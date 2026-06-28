import { z } from 'zod';

export const purchaseInvoiceSchema = z.object({
  supplierId: z.number().int().min(1, 'Please select a supplier'),
  supplierInvoiceNumber: z.string().min(1, 'Supplier invoice number is required').trim(),
  invoiceDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Please specify a valid invoice date'
  }),
  discountAmount: z.preprocess(
    (val) => (val === '' || val === null ? 0 : Number(val)),
    z.number().min(0, 'Discount amount cannot be negative')
  ),
  items: z.array(
    z.object({
      productId: z.number().int().min(1, 'Product selection is required'),
      productName: z.string().optional(),
      batchNumber: z.string().min(1, 'Batch number is required').trim(),
      mfgDate: z.string().optional().transform(val => val === '' ? null : val),
      expiryDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Expiry date is required'
      }),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      purchaseRate: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0.01, 'Purchase rate must be greater than zero')
      ),
      mrp: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0.01, 'MRP must be greater than zero')
      )
    })
  ).min(1, 'Purchase invoice must contain at least one item')
});

export default purchaseInvoiceSchema;
