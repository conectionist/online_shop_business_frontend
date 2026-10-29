/**
 * Romanian count phrase: "1 produs", "5 produse", "20 de produse", "101 produse".
 * Numbers whose last two digits are 00 or 20-99 take "de".
 */
export const formatProductCount = (count: number): string => {
  if (count === 1) {
    return '1 produs';
  }
  const lastTwo = count % 100;
  const needsDe = count >= 20 && (lastTwo === 0 || lastTwo >= 20);
  return `${count} ${needsDe ? 'de ' : ''}produse`;
};

/**
 * Accessible name for the floating cart link, including the badge count.
 */
export const cartLinkLabel = (count: number): string =>
  count > 0 ? `Coș de cumpărături, ${formatProductCount(count)}` : 'Coș de cumpărături';
