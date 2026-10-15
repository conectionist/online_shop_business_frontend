import { describe, test, expect } from 'vitest'
import { getUnitPricing } from '@/utils/unitPricing'

describe('getUnitPricing', () => {
  test.each([
    [600, 'gr', { value: 600, unit: 'g' }, { value: 1, unit: 'kg' }],
    [500, 'g', { value: 500, unit: 'g' }, { value: 1, unit: 'kg' }],
    [1, 'Kg', { value: 1, unit: 'kg' }, { value: 1, unit: 'kg' }],
    [500, 'ml', { value: 500, unit: 'ml' }, { value: 1, unit: 'l' }],
    [1, 'l', { value: 1, unit: 'l' }, { value: 1, unit: 'l' }],
  ])('%i %s is priced per kg or litre', (cantitate, unitName, measure, base) => {
    expect(getUnitPricing(cantitate, unitName)).toEqual({ measure, base })
  })

  test('reads the size from a container unit name', () => {
    expect(getUnitPricing(1, 'Borcanul de 800gr')).toEqual({
      measure: { value: 800, unit: 'g' },
      base: { value: 1, unit: 'kg' },
    })
    expect(getUnitPricing(1, 'Caserola de 375ml')).toEqual({
      measure: { value: 375, unit: 'ml' },
      base: { value: 1, unit: 'l' },
    })
  })

  test('multiplies the container size by the quantity', () => {
    expect(getUnitPricing(2, 'Caserola de 250gr')?.measure).toEqual({ value: 500, unit: 'g' })
  })

  test('accepts a decimal comma in the container size', () => {
    expect(getUnitPricing(1, 'Sticla de 0,75l')?.measure).toEqual({ value: 0.75, unit: 'l' })
  })

  test('ignores case and surrounding whitespace', () => {
    expect(getUnitPricing(600, '  GR ')?.measure).toEqual({ value: 600, unit: 'g' })
  })

  test.each(['buc', 'caserola', 'Paharul', 'portia', 'constructor'])(
    'returns null for %s, which has no weight or volume',
    (unitName) => {
      expect(getUnitPricing(1, unitName)).toBeNull()
    }
  )

  test.each([
    [1, 'ml'],
    [1000, 'Kg'],
  ])('returns null for the implausible quantity %i %s', (cantitate, unitName) => {
    expect(getUnitPricing(cantitate, unitName)).toBeNull()
  })

  test('returns null when quantity or unit is missing', () => {
    expect(getUnitPricing(0, 'gr')).toBeNull()
    expect(getUnitPricing(600, '')).toBeNull()
    expect(getUnitPricing(undefined, 'gr')).toBeNull()
  })
})
