import { z } from 'zod';

// Common validation patterns
export const PHONE_REGEX = /^\+?[0-9]\d{6,19}$/;

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const phoneSchema = z.string().trim().regex(PHONE_REGEX, 'Numărul de telefon trebuie să conțină 7-20 cifre cu prefix opțional +');

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

// Delivery Type validation schema
export const deliveryTypeSchema = z.object({
  denumire: z.string().min(1, 'Denumirea tipului de livrare este obligatorie').max(100, 'Denumirea tipului de livrare trebuie să aibă mai puțin de 100 de caractere'),
  description: z.string().max(150, 'Descrierea trebuie să aibă cel mult 150 de caractere').optional(),
  order_index: z.number().int('Indexul trebuie să fie un număr întreg').min(1, 'Indexul trebuie să fie un număr întreg între 1 și 127').max(127, 'Indexul trebuie să fie un număr întreg între 1 și 127'),
});

export type DeliveryTypeFormData = z.infer<typeof deliveryTypeSchema>;

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

// Order validation schema
export const orderSchema = z.object({
  nume_client: z.string().trim().min(1, 'Numele clientului este obligatoriu'),
  data_plasarii: z.string().min(1, 'Data plasării este obligatorie'),
  liste_id: z.number().min(1, 'Lista este obligatorie'),
  delivery_type_id: z.number().min(1, 'Tipul de livrare este obligatoriu'),
  payment_method_id: z.number().min(1, 'Metoda de plată este obligatorie'),
  delivery_address: z.string().trim().optional(),
  order_notes: z.string().trim().optional(),
  phone_number: phoneSchema.optional().or(z.literal('')),
});

export type OrderFormData = z.infer<typeof orderSchema>;

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