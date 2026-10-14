import { describe, test, expect } from 'vitest'
import { customerRows, productRows, summaryRows, toCsv } from '../csv'
import {
  createTestCustomerStats,
  createTestProductStats,
  createTestStatsOverview,
} from '@/test/mocks/handlers'

const generatedAt = new Date(2026, 9, 14, 12, 0)

describe('toCsv', () => {
  test('writes a BOM, ";" separators, CRLF and quoted cells; missing values stay empty', () => {
    expect(toCsv([['a', 1], [], ['x"y', null]])).toBe('﻿"a";"1"\r\n\r\n"x""y";')
  })

  test('writes decimals with a comma', () => {
    expect(toCsv([[67.1]])).toBe('﻿"67,1"')
  })

  test('neutralises text that a spreadsheet would run as a formula', () => {
    expect(toCsv([['=HYPERLINK("x")', '@cmd', '-2+3']])).toBe('﻿"\'=HYPERLINK(""x"")";"\'@cmd";"\'-2+3"')
    // Numbers are data, not text
    expect(toCsv([[-5]])).toBe('﻿"-5"')
  })
})

describe('row builders', () => {
  test('summaryRows lists the KPIs with the previous period and every list', () => {
    const rows = summaryRows(createTestStatsOverview(), '2 liste', generatedAt)
    expect(rows[1]).toEqual(['Perioada', '2 liste'])
    expect(rows).toContainEqual(['Încasări (RON)', 12480, 11534])
    expect(rows).toContainEqual(['Rata clienților fideli (%)', 71.3, 71.3])
    expect(rows).toContainEqual(['Joi, 15 oct', 88, 5880, 66.8, 85, 4, 81])
  })

  test('productRows ranks by revenue and adds the categories', () => {
    const rows = productRows(createTestProductStats(), '2 liste', generatedAt)
    expect(rows).toContainEqual([1, 'Cozonac cu nucă', 'Cozonaci', 40, 2400, 35])
    expect(rows).toContainEqual(['Pâine', 120, 1440])
  })

  test('customerRows lists the top customers with readable phones', () => {
    const rows = customerRows(createTestCustomerStats(), '2 liste', generatedAt)
    expect(rows).toContainEqual(['Elena Florea', '0760 456 644', 2, 2, 410, expect.stringMatching(/^1[34]\.10\.2026$/)])
  })
})
