import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number');

export const priceSchema = z.number().positive('Price must be positive');

export const quantitySchema = z.number().int().min(0, 'Quantity must be a non-negative integer');

// Product validation schema
export const productSchema = z.object({
  nume: z.string().min(1, 'Name is required'),
  cantitate: quantitySchema,
  pret: priceSchema,
  description: z.string().optional(),
  category_id: z.number().min(1, 'Category is required'),
  unitati_id: z.number().min(1, 'Unit is required'),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// List validation schema
export const listSchema = z.object({
  data: z.string().min(1, 'Date is required'),
  is_current: z.boolean(),
  orare_livrari_id: z.number().min(1, 'Delivery schedule is required'),
  is_published: z.boolean().optional(),
  mesaj_introducere: z.string().max(45, 'Message must be 45 characters or less').optional(),
  alte_detalii: z.string().max(500, 'Details must be 500 characters or less').optional(),
  numar_whatsapp: phoneSchema.optional(),
});

export type ListFormData = z.infer<typeof listSchema>;

// Helper function to format validation errors
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  errors.issues.forEach((error: any) => {
    const field = error.path.join('.');
    formattedErrors[field] = error.message;
  });
  
  return formattedErrors;
};

// Helper function to validate form data
export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: formatValidationErrors(result.error) };
  }
}; 