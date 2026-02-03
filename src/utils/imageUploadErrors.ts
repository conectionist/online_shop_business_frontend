/**
 * Backend image validation 400 responses use the same body shape as 422:
 * detail: [{ loc, msg, type }] with type e.g. image_extension_not_allowed, image_too_large.
 * This helper detects that shape and returns a user-facing message.
 */

const IMAGE_VALIDATION_ERROR_MESSAGES: Record<string, string> = {
  image_extension_not_allowed: 'Extensia fișierului nu este permisă. Extensii acceptate: jpg, jpeg, png, gif, webp.',
  image_content_type_not_allowed: 'Tipul de conținut al fișierului nu este permis.',
  image_too_large: 'Fișierul este prea mare. Vă rugăm să folosiți o imagine mai mică.',
  image_invalid_content: 'Fișierul nu este o imagine validă.',
  image_processing_error: 'Imaginea nu a putut fi procesată. Vă rugăm să încercați alt fișier.',
};

const DEFAULT_IMAGE_ERROR_MESSAGE =
  'Imaginea nu a putut fi încărcată. Vă rugăm să verificați formatul și dimensiunea.';

function isImageValidationError(error: any): boolean {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;
  return (
    (status === 400 || status === 422) &&
    Array.isArray(detail) &&
    detail.length > 0 &&
    typeof detail[0]?.type === 'string' &&
    detail[0].type.startsWith('image_')
  );
}

/**
 * Returns a user-facing message for image validation errors (400/422 with detail[].type starting with image_).
 * Falls back to detail[0].msg if type is unknown, then to a generic Romanian message.
 */
export function getImageValidationMessage(error: any): string {
  if (!isImageValidationError(error)) {
    return DEFAULT_IMAGE_ERROR_MESSAGE;
  }
  const detail = error.response.data.detail as Array<{ type?: string; msg?: string }>;
  const first = detail[0];
  const type = first?.type;
  const msg = first?.msg;
  if (type && IMAGE_VALIDATION_ERROR_MESSAGES[type]) {
    return IMAGE_VALIDATION_ERROR_MESSAGES[type];
  }
  if (typeof msg === 'string' && msg.trim()) {
    return msg;
  }
  return DEFAULT_IMAGE_ERROR_MESSAGE;
}
