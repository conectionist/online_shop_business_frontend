import { describe, test, expect } from 'vitest'
import { displayPhone, normalizePhone } from '../phone'

describe('normalizePhone', () => {
  test('reads Romanian numbers in any common form', () => {
    expect(normalizePhone('0722123456')).toBe('40722123456')
    expect(normalizePhone('0722 123 456')).toBe('40722123456')
    expect(normalizePhone('0722-123-456')).toBe('40722123456')
    expect(normalizePhone('+40 722 123 456')).toBe('40722123456')
    expect(normalizePhone('0040722123456')).toBe('40722123456')
    expect(normalizePhone('722123456')).toBe('40722123456')
    expect(normalizePhone('40722123456')).toBe('40722123456')
  })

  test('keeps foreign numbers that carry a country code', () => {
    expect(normalizePhone('+44 7700 900123')).toBe('447700900123')
  })

  test('rejects what cannot be read', () => {
    expect(normalizePhone(null)).toBeNull()
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('12345')).toBeNull()
    expect(normalizePhone('07221234')).toBeNull()
  })
})

describe('displayPhone', () => {
  test('groups Romanian numbers and leaves others alone', () => {
    expect(displayPhone('0760456644')).toBe('0760 456 644')
    expect(displayPhone('+40722123456')).toBe('0722 123 456')
    expect(displayPhone('+44 7700 900123')).toBe('+44 7700 900123')
    expect(displayPhone('abc')).toBe('abc')
  })
})
