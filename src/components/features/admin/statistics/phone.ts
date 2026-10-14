// Phone number in international form without "+", or null when it cannot be read.
// Numbers without a country code are taken as Romanian:
// "0722 123 456", "722123456" and "+40 722 123 456" all give "40722123456".
export const normalizePhone = (phone: string | null | undefined): string | null => {
  if (!phone) {
    return null;
  }
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  const international = (value: string) => (/^\d{8,15}$/.test(value) ? value : null);

  if (trimmed.startsWith('+')) {
    return international(digits);
  }
  if (digits.startsWith('00')) {
    return international(digits.slice(2));
  }
  if (/^0\d{9}$/.test(digits)) {
    return `4${digits}`;
  }
  if (/^\d{9}$/.test(digits)) {
    return `40${digits}`;
  }
  return /^40\d{9}$/.test(digits) ? digits : null;
};

// Romanian numbers in the local, readable form "0722 123 456"; anything else as stored.
// The spaces also keep spreadsheets from reading the number as a number and dropping the 0.
export const displayPhone = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized && /^40\d{9}$/.test(normalized)) {
    const local = `0${normalized.slice(2)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return phone;
};
