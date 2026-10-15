import { describe, test, expect } from 'vitest'
import {
  computeDelta,
  formatCompact,
  formatCountdown,
  formatDateRange,
  formatDelta,
  formatLongWeekdayDay,
  formatPercent,
  formatPoints,
  formatRON,
  formatShortDay,
  formatWeekdayDay,
  pluralRo,
} from '../format'

describe('statistics formatters', () => {
  test('formatRON uses Romanian grouping and whole lei', () => {
    expect(formatRON(12480)).toBe('12.480 RON')
    expect(formatRON(67.35)).toBe('67 RON')
  })

  test('formatCompact shortens thousands for axis ticks', () => {
    expect(formatCompact(950)).toBe('950')
    expect(formatCompact(1200)).toBe('1,2k')
    expect(formatCompact(2000)).toBe('2k')
    expect(formatCompact(12480)).toBe('12k')
  })

  test('formatPercent drops a trailing ,0', () => {
    expect(formatPercent(0.9286)).toBe('92,9%')
    expect(formatPercent(0.5)).toBe('50%')
  })

  test('computeDelta and formatDelta', () => {
    expect(computeDelta(110, 100)).toBeCloseTo(0.1)
    expect(computeDelta(5, 0)).toBeNull()
    expect(computeDelta(5, null)).toBeNull()
    expect(formatDelta(0.082)).toBe('+8,2%')
    expect(formatDelta(-0.011)).toBe('−1,1%')
    expect(formatPoints(0.089)).toBe('+8,9 pp')
    expect(formatPoints(-0.05)).toBe('−5 pp')
  })

  test('day formatting does not shift with time zones', () => {
    expect(formatShortDay('2026-10-15')).toBe('15 oct')
    expect(formatWeekdayDay('2026-10-15')).toBe('Joi, 15 oct')
  })

  test('pluralRo adds "de" from 20 up', () => {
    expect(pluralRo(1, 'oră', 'ore')).toBe('1 oră')
    expect(pluralRo(0, 'oră', 'ore')).toBe('0 ore')
    expect(pluralRo(3, 'oră', 'ore')).toBe('3 ore')
    expect(pluralRo(19, 'oră', 'ore')).toBe('19 ore')
    expect(pluralRo(20, 'oră', 'ore')).toBe('20 de ore')
    expect(pluralRo(88, 'comandă', 'comenzi')).toBe('88 de comenzi')
    expect(pluralRo(101, 'comandă', 'comenzi')).toBe('101 comenzi')
    expect(pluralRo(1200, 'comandă', 'comenzi')).toBe('1.200 de comenzi')
  })

  test('formatLongWeekdayDay spells out the month', () => {
    expect(formatLongWeekdayDay('2026-10-15')).toBe('Joi, 15 octombrie')
  })

  test('formatDateRange repeats the year only across years', () => {
    expect(formatDateRange('2026-08-15', '2026-10-15')).toBe('15 aug – 15 oct 2026')
    expect(formatDateRange('2025-12-18', '2026-02-12')).toBe('18 dec 2025 – 12 feb 2026')
    expect(formatDateRange('2026-10-15', '2026-10-15')).toBe('15 oct 2026')
  })

  test('formatCountdown', () => {
    const now = new Date('2026-10-14T10:00:00')
    expect(formatCountdown('2026-10-14T14:12:00', now)).toBe('4 ore 12 min')
    expect(formatCountdown('2026-10-14T11:05:00', now)).toBe('1 oră 5 min')
    expect(formatCountdown('2026-10-14T10:45:00', now)).toBe('45 min')
    expect(formatCountdown('2026-10-14T10:00:30', now)).toBe('mai puțin de 1 min')
    expect(formatCountdown('2026-10-16T14:00:00', now)).toBe('2 zile 4 ore')
    expect(formatCountdown('2026-10-15T10:00:00', now)).toBe('1 zi')
    expect(formatCountdown('2026-10-14T09:00:00', now)).toBeNull()
  })
})
