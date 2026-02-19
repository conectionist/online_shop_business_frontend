import { vi } from 'vitest'

vi.mock('@/utils/appConfig', () => ({
  getAppName: () => 'Test Shop',
}))

import {
  getBusinessName,
  getBusinessAddress,
  getBusinessPhone,
  getBusinessEmail,
  getBusinessCUI,
  getBusinessRegistrationNumber,
  getBusinessRepresentative,
  getBusinessHours,
  getBusinessMotto,
  getBusinessDescription,
  getLegalReturnPolicy,
  getLegalReturnDays,
  getANPCLink,
  getSOLLink,
  getSALLink,
  getLegalPageRoutes,
  getBusinessSocialMedia,
  getBusinessTaxInfo,
  getPaymentMethodsDisplay,
  getDeliveryMethodsDisplay,
} from '@/utils/businessInfo'
import type { BusinessDetails } from '@/types/api'

const mockDetails: Partial<BusinessDetails> = {
  business_name: 'Brutăria Artizanală',
  adresa: 'Str. Pâinii 42, București',
  telefon: '+40712345678',
  email: 'contact@brutaria.ro',
  CUI: 'RO12345678',
  registration_number: 'J40/1234/2020',
  representative: 'Ion Popescu',
  operating_hours: 'Luni - Sâmbătă: 7:00 - 20:00',
  motto: 'Pâine cu suflet',
  alte_detalii: 'Brutărie artizanală cu tradiție',
  delivery_tax: 10,
}

describe('getters with API data', () => {
  const getters = [
    { fn: getBusinessName, field: 'business_name', expected: 'Brutăria Artizanală' },
    { fn: getBusinessAddress, field: 'adresa', expected: 'Str. Pâinii 42, București' },
    { fn: getBusinessPhone, field: 'telefon', expected: '+40712345678' },
    { fn: getBusinessEmail, field: 'email', expected: 'contact@brutaria.ro' },
    { fn: getBusinessCUI, field: 'CUI', expected: 'RO12345678' },
    { fn: getBusinessRegistrationNumber, field: 'registration_number', expected: 'J40/1234/2020' },
    { fn: getBusinessRepresentative, field: 'representative', expected: 'Ion Popescu' },
    { fn: getBusinessHours, field: 'operating_hours', expected: 'Luni - Sâmbătă: 7:00 - 20:00' },
    { fn: getBusinessMotto, field: 'motto', expected: 'Pâine cu suflet' },
    { fn: getBusinessDescription, field: 'alte_detalii', expected: 'Brutărie artizanală cu tradiție' },
  ] as const

  test.each(getters)('$field — returns value from businessDetails when present', ({ fn, expected }) => {
    expect(fn(mockDetails as BusinessDetails)).toBe(expected)
  })

  test.each(getters)('$field — returns fallback when businessDetails is undefined', ({ fn }) => {
    const result = fn(undefined)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  test.each(getters)('$field — returns fallback when specific field is missing', ({ fn }) => {
    const result = fn({} as BusinessDetails)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('getBusinessEmail — fallback logic', () => {
  test('constructs email from app name: lowercase, no spaces', () => {
    // getAppName() is mocked to return 'Test Shop'
    const email = getBusinessEmail(undefined)
    expect(email).toBe('contact@testshop.ro')
  })
})

describe('getBusinessTaxInfo', () => {
  test('returns hasVAT: true and vatRate: 19', () => {
    const info = getBusinessTaxInfo(undefined)
    expect(info.hasVAT).toBe(true)
    expect(info.vatRate).toBe(19)
  })

  test('returns delivery_tax from businessDetails when present', () => {
    const info = getBusinessTaxInfo(mockDetails as BusinessDetails)
    expect(info.deliveryTax).toBe(10)
  })

  test('returns delivery_tax as undefined when businessDetails missing', () => {
    const info = getBusinessTaxInfo(undefined)
    expect(info.deliveryTax).toBeUndefined()
  })
})

describe('hardcoded legal values', () => {
  test('getLegalReturnPolicy contains "14 zile"', () => {
    expect(getLegalReturnPolicy()).toContain('14 zile')
  })

  test('getLegalReturnDays returns 14', () => {
    expect(getLegalReturnDays()).toBe(14)
  })

  test('getANPCLink returns valid URL', () => {
    expect(getANPCLink()).toMatch(/^https:\/\//)
  })

  test('getSOLLink returns valid URL', () => {
    expect(getSOLLink()).toMatch(/^https:\/\//)
  })

  test('getSALLink returns valid URL', () => {
    expect(getSALLink()).toMatch(/^https:\/\//)
  })
})

describe('getLegalPageRoutes', () => {
  test('returns object with expected route keys', () => {
    const routes = getLegalPageRoutes()
    expect(routes).toHaveProperty('terms')
    expect(routes).toHaveProperty('privacy')
    expect(routes).toHaveProperty('cookies')
    expect(routes).toHaveProperty('returns')
    expect(routes).toHaveProperty('contact')
  })
})

describe('getBusinessSocialMedia', () => {
  test('returns empty object', () => {
    expect(getBusinessSocialMedia()).toEqual({})
  })
})

describe('display helpers', () => {
  test('getPaymentMethodsDisplay returns non-empty string', () => {
    expect(getPaymentMethodsDisplay().length).toBeGreaterThan(0)
  })

  test('getDeliveryMethodsDisplay returns non-empty string', () => {
    expect(getDeliveryMethodsDisplay().length).toBeGreaterThan(0)
  })
})
