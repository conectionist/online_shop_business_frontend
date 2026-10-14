import { describe, test, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys } from '@/lib/queryKeys'
import {
  useCurrentListStats,
  useCustomerStats,
  useProductStats,
  useStatisticsOverview,
} from '@/hooks/useStatistics'

const API = 'http://localhost:8001/api/v1'

describe('useStatistics hooks', () => {
  test('useStatisticsOverview sends the start date and caches under the range key', async () => {
    let requestedUrl = ''
    server.use(
      http.get(`${API}/statistics/overview`, ({ request }) => {
        requestedUrl = request.url
        return HttpResponse.json({ summary: { revenue: 100 } })
      })
    )

    const range = { start_date: '2026-09-14' }
    const { result, queryClient } = renderHookWithQuery(() => useStatisticsOverview(range))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(new URL(requestedUrl).search).toBe('?start_date=2026-09-14')
    expect(queryClient.getQueryData(queryKeys.statistics.overview(range))).toEqual({ summary: { revenue: 100 } })
  })

  test('useProductStats sends the date range and default limit', async () => {
    let params: URLSearchParams | null = null
    server.use(
      http.get(`${API}/statistics/products`, ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json({ top_by_quantity: [] })
      })
    )

    const { result } = renderHookWithQuery(() =>
      useProductStats({ start_date: '2026-01-01', end_date: '2026-06-30' })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(params!.get('start_date')).toBe('2026-01-01')
    expect(params!.get('end_date')).toBe('2026-06-30')
    expect(params!.get('limit')).toBe('10')
  })

  test('useCustomerStats sends no period params for "all time"', async () => {
    let search = 'unset'
    server.use(
      http.get(`${API}/statistics/customers`, ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json({ top_customers: [] })
      })
    )

    const { result } = renderHookWithQuery(() => useCustomerStats({}))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(search).toBe('?limit=10')
  })

  test('useCurrentListStats returns the live list figures', async () => {
    const { result } = renderHookWithQuery(() => useCurrentListStats())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.list?.id).toBe(216)
    expect(result.current.data?.sold_out).toHaveLength(1)
  })

  test('surfaces API errors', async () => {
    server.use(
      http.get(`${API}/statistics/overview`, () =>
        HttpResponse.json({ detail: 'start_date must be before end_date' }, { status: 400 })
      )
    )

    const { result } = renderHookWithQuery(() =>
      useStatisticsOverview({ start_date: '2026-06-30', end_date: '2026-01-01' })
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
