import { describe, test, expect } from 'vitest'
import { listStatus } from '../listStatus'

describe('listStatus', () => {
  const now = new Date('2026-10-15T12:00:00Z')

  test('an unpublished list is a draft, whatever its dates', () => {
    expect(listStatus({ is_published: false, expiration_date: '2026-10-20T19:00:00Z' }, now)).toBe('draft')
    expect(listStatus({ is_published: false, expiration_date: '2026-10-01T19:00:00Z' }, now)).toBe('draft')
  })

  test('a published list takes orders until its expiration date', () => {
    expect(listStatus({ is_published: true, expiration_date: '2026-10-15T12:00:01Z' }, now)).toBe('active')
    expect(listStatus({ is_published: true, expiration_date: '2026-10-15T12:00:00Z' }, now)).toBe('expired')
    expect(listStatus({ is_published: true, expiration_date: '2026-10-14T19:00:00Z' }, now)).toBe('expired')
  })

  test('a published list without an expiration date never expires', () => {
    expect(listStatus({ is_published: true, expiration_date: null }, now)).toBe('active')
  })
})
