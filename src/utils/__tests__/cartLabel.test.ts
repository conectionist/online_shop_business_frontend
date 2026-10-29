import { describe, expect, test } from 'vitest'
import { cartLinkLabel, cartUpdateAnnouncement, formatImageCount, formatProductCount } from '../cartLabel'

describe('formatProductCount', () => {
  test.each([
    [0, '0 produse'],
    [1, '1 produs'],
    [2, '2 produse'],
    [19, '19 produse'],
    [20, '20 de produse'],
    [100, '100 de produse'],
    [101, '101 produse'],
    [120, '120 de produse'],
  ])('%i -> %s', (count, expected) => {
    expect(formatProductCount(count)).toBe(expected)
  })
})

describe('cartLinkLabel', () => {
  test('empty cart has no count', () => {
    expect(cartLinkLabel(0)).toBe('Coș de cumpărături')
  })

  test('includes the item count', () => {
    expect(cartLinkLabel(3)).toBe('Coș de cumpărături, 3 produse')
  })
})

describe('formatImageCount', () => {
  test.each([
    [1, '1 imagine'],
    [4, '4 imagini'],
    [25, '25 de imagini'],
  ])('%i -> %s', (count, expected) => {
    expect(formatImageCount(count)).toBe(expected)
  })
})

describe('cartUpdateAnnouncement', () => {
  test('empty cart', () => {
    expect(cartUpdateAnnouncement(0)).toBe('Coșul este gol')
  })

  test('with items', () => {
    expect(cartUpdateAnnouncement(1)).toBe('Coș actualizat: 1 produs')
  })
})
