/**
 * Romanian count phrase: "1 produs", "5 produse", "20 de produse", "101 produse".
 * Numbers whose last two digits are 00 or 20-99 take "de".
 */
export const formatRomanianCount = (count: number, one: string, many: string): string => {
  if (count === 1) {
    return `1 ${one}`;
  }
  const lastTwo = count % 100;
  const needsDe = count >= 20 && (lastTwo === 0 || lastTwo >= 20);
  return `${count} ${needsDe ? 'de ' : ''}${many}`;
};

export const formatProductCount = (count: number): string =>
  formatRomanianCount(count, 'produs', 'produse');

export const formatImageCount = (count: number): string =>
  formatRomanianCount(count, 'imagine', 'imagini');

/**
 * Accessible name for the floating cart link, including the badge count.
 */
export const cartLinkLabel = (count: number): string =>
  count > 0 ? `Coș de cumpărături, ${formatProductCount(count)}` : 'Coș de cumpărături';

/**
 * Screen reader announcement after the cart contents change.
 */
export const cartUpdateAnnouncement = (count: number): string =>
  count > 0 ? `Coș actualizat: ${formatProductCount(count)}` : 'Coșul este gol';
