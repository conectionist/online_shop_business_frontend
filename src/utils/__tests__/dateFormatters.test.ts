import { formatDateRomanian, formatDateShortRomanian } from '@/utils/dateFormatters'

describe('formatDateRomanian', () => {
  test('formats "2026-02-14" → "14 februarie 2026"', () => {
    expect(formatDateRomanian('2026-02-14')).toBe('14 februarie 2026')
  })

  test('formats "2026-01-01" → "1 ianuarie 2026"', () => {
    expect(formatDateRomanian('2026-01-01')).toBe('1 ianuarie 2026')
  })

  test('formats "2026-12-31" → "31 decembrie 2026"', () => {
    expect(formatDateRomanian('2026-12-31')).toBe('31 decembrie 2026')
  })

  test('handles ISO date string with time component', () => {
    const result = formatDateRomanian('2026-06-15T10:30:00Z')
    expect(result).toMatch(/^\d{1,2} \w+ 2026$/)
  })

  test('returns original string for invalid date', () => {
    expect(formatDateRomanian('not-a-date')).toBe('not-a-date')
  })

  test('returns original string for empty string', () => {
    expect(formatDateRomanian('')).toBe('')
  })
})

describe('formatDateShortRomanian', () => {
  test('formats "2026-02-14" → "14.02.2026"', () => {
    expect(formatDateShortRomanian('2026-02-14')).toBe('14.02.2026')
  })

  test('zero-pads single-digit day', () => {
    expect(formatDateShortRomanian('2026-01-05')).toBe('05.01.2026')
  })

  test('zero-pads single-digit month', () => {
    expect(formatDateShortRomanian('2026-03-01')).toBe('01.03.2026')
  })

  test('returns original string for invalid date', () => {
    expect(formatDateShortRomanian('invalid')).toBe('invalid')
  })
})
