// Image upload constants
export const IMAGE_UPLOAD = {
  MAX_SIZE_BYTES: 25 * 1024 * 1024, // 25MB in bytes
  MAX_SIZE_MB: 25, // 25MB for display purposes
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  ACCEPTED_EXTENSIONS: ['JPG', 'PNG', 'WebP'] as const,
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: (maxSize: number) => `Dimensiunea imaginii trebuie să fie mai mică de ${maxSize}MB`,
    INVALID_FILE_TYPE: (extensions: readonly string[]) => `Vă rugăm să selectați un fișier imagine valid (${extensions.join(', ')})`,
  },
  UI_TEXT: {
    FORMATS_ACCEPTED: 'Formate acceptate',
    MAX_SIZE: 'max',
    UPLOAD_IMAGE: 'Încarcă o imagine pentru produs (opțional)',
    UPLOAD_CATEGORY_IMAGE: 'Încărcați o imagine pentru categorie (opțional)',
    CHOOSE_IMAGE: 'Alege Imaginea',
    CHOOSE_CATEGORY_IMAGE: 'Alegeți Imaginea',
  },
} as const;

// Validation constants
export const VALIDATION = {
  CATEGORY_NAME_MAX_LENGTH: 100,
  PRODUCT_NAME_MAX_LENGTH: 100,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 1500,
  PRODUCT_PRICE_MAX: 999999.99,
  PRODUCT_QUANTITY_MAX: 999999,
} as const;
