import { z } from 'zod';

export const queueTokenSchema = z.object({
  patientId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Patient selection is required' }).int().positive('Please select a valid patient')
  ),
  doctorId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Doctor selection is required' }).int().positive('Please select a valid doctor')
  ),
  consultationType: z.string({ required_error: 'Consultation type is required' })
    .min(1, 'Please select consultation type'),
  remarks: z.string()
    .max(255, 'Remarks must not exceed 255 characters')
    .optional()
    .or(z.literal(''))
});

export default queueTokenSchema;
