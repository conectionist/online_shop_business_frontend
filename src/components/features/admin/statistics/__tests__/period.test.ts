import { describe, test, expect } from 'vitest'
import { NO_LISTS_MESSAGE, describePeriod, periodSlug, resolveRange } from '../period'
import { StatsPeriod } from '@/types/statistics'

describe('resolveRange', () => {
  const today = new Date(2026, 9, 14)
  const noCustom = { start_date: '', end_date: '' }

  test('day presets count today', () => {
    // A week is today and the 6 days before it
    expect(resolveRange('days7', noCustom, today)).toEqual({ start_date: '2026-10-08' })
    expect(resolveRange('days15', noCustom, today)).toEqual({ start_date: '2026-09-30' })
    // Across a year boundary
    expect(resolveRange('days7', noCustom, new Date(2026, 0, 3))).toEqual({ start_date: '2025-12-28' })
  })

  test('month and year presets have an open end', () => {
    expect(resolveRange('months1', noCustom, today)).toEqual({ start_date: '2026-09-14' })
    expect(resolveRange('months2', noCustom, today)).toEqual({ start_date: '2026-08-14' })
    expect(resolveRange('months3', noCustom, today)).toEqual({ start_date: '2026-07-14' })
    expect(resolveRange('months6', noCustom, today)).toEqual({ start_date: '2026-04-14' })
    expect(resolveRange('months12', noCustom, today)).toEqual({ start_date: '2025-10-14' })
    expect(resolveRange('thisYear', noCustom, today)).toEqual({ start_date: '2026-01-01' })
  })

  test('all time and custom ranges', () => {
    expect(resolveRange('all', noCustom, today)).toEqual({})
    expect(resolveRange('custom', { start_date: '2026-01-01', end_date: '' }, today)).toEqual({
      start_date: '2026-01-01',
    })
    expect(resolveRange('custom', { start_date: '2026-01-01', end_date: '2026-03-31' }, today)).toEqual({
      start_date: '2026-01-01',
      end_date: '2026-03-31',
    })
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
