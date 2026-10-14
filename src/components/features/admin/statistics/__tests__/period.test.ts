import { describe, test, expect } from 'vitest'
import { NO_LISTS_MESSAGE, checkCustomRange, describePeriod, periodSlug, resolveRange } from '../period'
import { StatsPeriod } from '@/types/statistics'

describe('resolveRange', () => {
  const today = new Date(2026, 9, 14)
  const noCustom = { start_date: '', end_date: '' }

  const startOf = (preset: Parameters<typeof resolveRange>[0], day: Date) =>
    resolveRange(preset, noCustom, day).start_date

  test('day presets count today', () => {
    // A week is today and the 6 days before it
    expect(resolveRange('days7', noCustom, today)).toEqual({ start_date: '2026-10-08', end_date: '2026-10-14' })
    expect(resolveRange('days15', noCustom, today)).toEqual({ start_date: '2026-09-30', end_date: '2026-10-14' })
    // Across a year boundary
    expect(resolveRange('days7', noCustom, new Date(2026, 0, 3))).toEqual({
      start_date: '2025-12-28',
      end_date: '2026-01-03',
    })
  })

  test('month and year presets end today', () => {
    expect(resolveRange('months1', noCustom, today)).toEqual({ start_date: '2026-09-14', end_date: '2026-10-14' })
    expect(startOf('months2', today)).toBe('2026-08-14')
    expect(startOf('months3', today)).toBe('2026-07-14')
    expect(startOf('months6', today)).toBe('2026-04-14')
    expect(startOf('months12', today)).toBe('2025-10-14')
    expect(resolveRange('thisYear', noCustom, today)).toEqual({ start_date: '2026-01-01', end_date: '2026-10-14' })
  })

  test('month presets stop at the end of a shorter month', () => {
    expect(startOf('months1', new Date(2026, 2, 31))).toBe('2026-02-28')
    expect(startOf('months1', new Date(2028, 2, 31))).toBe('2028-02-29')
    expect(startOf('months1', new Date(2026, 4, 31))).toBe('2026-04-30')
    expect(startOf('months6', new Date(2026, 7, 31))).toBe('2026-02-28')
    expect(startOf('months12', new Date(2026, 9, 31))).toBe('2025-10-31')
  })

  test('all time and custom ranges', () => {
    expect(resolveRange('all', noCustom, today)).toEqual({ end_date: '2026-10-14' })
    expect(resolveRange('custom', { start_date: '2026-01-01', end_date: '' }, today)).toEqual({
      start_date: '2026-01-01',
    })
    expect(resolveRange('custom', { start_date: '2026-01-01', end_date: '2026-03-31' }, today)).toEqual({
      start_date: '2026-01-01',
      end_date: '2026-03-31',
    })
  })
})

describe('checkCustomRange', () => {
  test('accepts a complete range in order', () => {
    expect(checkCustomRange({ start_date: '2026-09-01', end_date: '2026-10-01' })).toEqual({ usable: true })
    expect(checkCustomRange({ start_date: '2026-10-01', end_date: '2026-10-01' })).toEqual({ usable: true })
  })

  test('ignores half-typed and empty dates without a message', () => {
    // A date input reports 0002, 0020, 0202 while a year is typed
    expect(checkCustomRange({ start_date: '0202-10-01', end_date: '2026-10-14' })).toEqual({ usable: false })
    expect(checkCustomRange({ start_date: '2026-10-01', end_date: '' })).toEqual({ usable: false })
  })

  test('explains a range in the wrong order', () => {
    const result = checkCustomRange({ start_date: '2026-10-14', end_date: '2026-09-01' })
    expect(result.usable).toBe(false)
    expect(result.message).toMatch(/înaintea datei de sfârșit/)
  })
})

describe('describePeriod and periodSlug', () => {
  const period: StatsPeriod = {
    start_date: '2026-09-24',
    end_date: '2026-10-15',
    list_count: 2,
    previous_start_date: '2026-08-27',
    previous_end_date: '2026-09-17',
    previous_list_count: 1,
  }

  test('describePeriod names the lists and the comparison period', () => {
    expect(describePeriod(period)).toBe(
      '2 liste (24 sep – 15 oct 2026) · comparat cu 1 listă anterioară (27 aug – 17 sep 2026)'
    )
    expect(describePeriod({ ...period, previous_list_count: 0 })).toBe('2 liste (24 sep – 15 oct 2026)')
    expect(describePeriod({ ...period, list_count: 0 })).toBe(NO_LISTS_MESSAGE)
  })

  test('periodSlug uses the bounds, or today without them', () => {
    expect(periodSlug(period)).toBe('2026-09-24_2026-10-15')
    expect(periodSlug(undefined, new Date(2026, 9, 14))).toBe('2026-10-14')
  })
})
