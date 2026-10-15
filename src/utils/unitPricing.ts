// Unit pricing (price per kg / per litre) derived from a product's quantity and unit.
// EU rules require a unit price for products sold by weight or volume, and Google
// Merchant Center checks it. The backend feed mirrors this logic in
// app/utils/unit_pricing.py; keep the two in sync.

export type MeasureUnit = 'g' | 'kg' | 'ml' | 'l';

export interface UnitPricing {
  measure: { value: number; unit: MeasureUnit };
  base: { value: number; unit: 'kg' | 'l' };
}

// UN/CEFACT codes used by schema.org QuantitativeValue.unitCode
export const UN_CEFACT_CODES: Record<MeasureUnit, string> = {
  g: 'GRM',
  kg: 'KGM',
  ml: 'MLT',
  l: 'LTR',
};

const EXACT_UNITS = new Map<string, MeasureUnit>([
  ['g', 'g'],
  ['gr', 'g'],
  ['grame', 'g'],
  ['kg', 'kg'],
  ['ml', 'ml'],
  ['l', 'l'],
  ['litru', 'l'],
  ['litri', 'l'],
]);

// Size embedded in a container unit name, e.g. "Caserola de 250gr", "Borcanul de 800gr"
const EMBEDDED_SIZE = /(\d+(?:[.,]\d+)?)\s*(gr|g|kg|ml|l)\b/;

const TO_SMALLEST: Record<MeasureUnit, number> = { g: 1, kg: 1000, ml: 1, l: 1000 };

// Amounts outside 10 g/ml .. 50 kg/l are treated as bad product data, not published
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 50_000;

export const getUnitPricing = (
  cantitate: number | null | undefined,
  unitName: string | null | undefined
): UnitPricing | null => {
  if (!unitName || !cantitate || cantitate <= 0) return null;

  const name = unitName.trim().toLowerCase();
  let amount = cantitate;
  let unit = EXACT_UNITS.get(name);
  if (!unit) {
    const match = EMBEDDED_SIZE.exec(name);
    if (!match) return null;
    unit = EXACT_UNITS.get(match[2])!;
    amount *= parseFloat(match[1].replace(',', '.'));
  }

  const smallest = amount * TO_SMALLEST[unit];
  if (smallest < MIN_AMOUNT || smallest > MAX_AMOUNT) return null;

  return {
    measure: { value: Number(amount.toFixed(3)), unit },
    base: { value: 1, unit: unit === 'g' || unit === 'kg' ? 'kg' : 'l' },
  };
};
