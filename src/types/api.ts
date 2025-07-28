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
  mesaj_introducere?: string;
  alte_detalii?: string;
  numar_whatsapp?: string;
}

export interface ListUpdate {
  data?: string;
  is_current?: boolean;
  is_published?: boolean;
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
}

export interface DeliveryTypeCreate {
  denumire: string;
}

export interface DeliveryTypeUpdate {
  denumire?: string;
}

// Payment Method Types
export interface PaymentMethod {
  id: number;
  denumire: string;
}

export interface PaymentMethodCreate {
  denumire: string;
}

export interface PaymentMethodUpdate {
  denumire?: string;
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
  alte_detalii?: string;
}

export interface BusinessDetailsCreate {
  adresa?: string;
  telefon?: string;
  logo_path?: string;
  motto?: string;
  list_not_available_msg?: string;
  alte_detalii?: string;
}

export interface BusinessDetailsUpdate {
  adresa?: string;
  telefon?: string;
  logo_path?: string;
  motto?: string;
  list_not_available_msg?: string;
  alte_detalii?: string;
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

// Error Types
export interface ApiError {
  detail: string | Array<{
    type: string;
    loc: string[];
    msg: string;
    input?: any;
  }>;
} 