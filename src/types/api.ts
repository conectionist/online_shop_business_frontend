// API Base Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// Product Types
export interface Product {
  id: number;
  nume: string;
  cantitate: number;
  pret: number;
  description?: string;
  category_id: number;
  unitati_id: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  images: ProductImage[];
  image_versions: {
    original: string;
    medium: string;
    thumbnail: string;
  };
}

export interface ProductImage {
  id: number;
  path: string;
  position: number;
  produse_id: number;
  is_primary: boolean;
  image_versions: {
    original: string;
    medium: string;
    thumbnail: string;
  };
}

export interface ProductCreate {
  nume: string;
  cantitate: number;
  pret: number;
  description?: string;
  category_id?: number;
  unitati_id: number;
}

export interface ProductUpdate {
  nume?: string;
  cantitate?: number;
  pret?: number;
  description?: string;
  category_id?: number;
  unitati_id?: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  image_path?: string;
  image_versions: {
    original: string;
    medium: string;
    thumbnail: string;
  };
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
}

export interface CategoryUpdate {
  name?: string;
  clear_image?: boolean;
}

// List Types
export interface List {
  id: number;
  data: string;
  is_current: boolean;
  is_published: boolean;
  expiration_date?: string | null;
  mesaj_introducere?: string;
  alte_detalii?: string;
  numar_whatsapp?: string;
  orare_livrari_id: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ListCreate {
  data: string;
  is_current: boolean;
  orare_livrari_id: number;
  is_published?: boolean;
  expiration_date?: string | null;
  mesaj_introducere?: string;
  alte_detalii?: string;
  numar_whatsapp?: string;
}

export interface ListUpdate {
  data?: string;
  is_current?: boolean;
  is_published?: boolean;
  expiration_date?: string | null;
  mesaj_introducere?: string;
  alte_detalii?: string;
  numar_whatsapp?: string;
  orare_livrari_id?: number;
}

// Unit Types
export interface Unit {
  id: number;
  denumire: string;
}

export interface UnitCreate {
  denumire: string;
}

export interface UnitUpdate {
  denumire?: string;
}

// Delivery Types
export interface DeliveryType {
  id: number;
  denumire: string;
  description?: string;
  order_index: number;
}

export interface DeliveryTypeCreate {
  denumire: string;
  description?: string;
  order_index: number;
}

export interface DeliveryTypeUpdate {
  denumire?: string;
  description?: string;
  order_index?: number;
}

// Payment Method Types
export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
}

export interface PaymentMethodCreate {
  name: string;
  description: string;
}

export interface PaymentMethodUpdate {
  name?: string;
  description?: string;
}

// Delivery Schedule Types
export interface DeliverySchedule {
  id: number;
  orar_livrari: string;
}

export interface DeliveryScheduleCreate {
  orar_livrari: string;
}

export interface DeliveryScheduleUpdate {
  orar_livrari?: string;
}

// Business Details Types
export interface BusinessDetails {
  id: number;
  adresa?: string;
  telefon?: string;
  logo_path?: string;
  motto?: string;
  list_not_available_msg?: string;
  // Raw, unprocessed version returned by backend for admin editing
  list_not_available_msg_raw?: string;
  alte_detalii?: string;
  delivery_tax?: number;
  business_name?: string;
  registration_number?: string;
  CUI?: string;
  email?: string;
  operating_hours?: string;
  representative?: string;
}

export interface BusinessDetailsCreate {
  adresa?: string;
  telefon?: string;
  logo_path?: string;
  motto?: string;
  list_not_available_msg?: string;
  alte_detalii?: string;
  delivery_tax?: number;
  business_name?: string;
  registration_number?: string;
  CUI?: string;
  email?: string;
  operating_hours?: string;
  representative?: string;
}

export interface BusinessDetailsUpdate {
  adresa?: string;
  telefon?: string;
  logo_path?: string;
  motto?: string;
  list_not_available_msg?: string;
  alte_detalii?: string;
  delivery_tax?: number;
  business_name?: string;
  registration_number?: string;
  CUI?: string;
  email?: string;
  operating_hours?: string;
  representative?: string;
}

// Product Override Types
export interface ProductOverride {
  id: number;
  produse_id: number;
  field_name: 'price' | 'description' | 'availability';
  old_value?: string;
  new_value: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductOverrideCreate {
  produse_id: number;
  field_name: 'price' | 'description' | 'availability';
  old_value?: string;
  new_value: string;
  notes?: string;
  is_active?: boolean;
}

export interface ProductOverrideUpdate {
  new_value?: string;
  notes?: string;
  is_active?: boolean;
}

// List Product Types (for stock management)
export interface ListProduct {
  id: number;
  nume: string;
  cantitate: number;
  pret: number;
  description?: string;
  category_id: number;
  unitati_id: number;
  stoc_produs: number; // Stock for this product in this list
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  images: ProductImage[];
}

// Order Types
export interface Order {
  id: number;
  nume_client: string;
  data_plasarii: string;
  liste_id: number;
  delivery_type_id: number;
  payment_method_id: number;
  delivery_address?: string;
  order_notes?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  comenzi_id: number;
  produse_id: number;
  pret_produs: number;
  cantitate_produs: number;
  unitati_id: number;
}

export interface OrderCreate {
  nume_client: string;
  data_plasarii: string;
  liste_id: number;
  delivery_type_id: number;
  payment_method_id: number;
  delivery_address?: string;
  order_notes?: string;
  phone_number?: string;
  items?: OrderItemBase[];
}

export interface OrderItemBase {
  produse_id: number;
  pret_produs: number;
  cantitate_produs: number;
  unitati_id: number;
}

export interface OrderUpdate {
  nume_client?: string;
  order_notes?: string;
  delivery_type_id?: number;
  payment_method_id?: number;
  delivery_address?: string;
  phone_number?: string;
}

export interface OrderRead extends Order {
  items: OrderItem[];
}

// Error Types
export interface ApiError {
  detail: string | Array<{
    type: string;
    loc: string[];
    msg: string;
    input?: any;
  }>;
}

// Auth Types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  admin: {
    id: number;
    username: string;
  };
}

// Generic API Response Types
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  detail: string;
  status?: number;
} 