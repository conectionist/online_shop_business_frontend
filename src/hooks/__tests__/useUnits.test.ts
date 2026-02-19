import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys, invalidateQueries } from '@/lib/queryKeys'
import {
  useUnits,
  useUnit,
  useCreateUnit,
  useUpdateUnit,
  usePatchUnit,
  useDeleteUnit,
} from '@/hooks/useUnits'

const API = 'http://localhost:8001/api/v1'

const mockUnits = [
  { id: 1, denumire: 'bucată', abreviere: 'buc' },
  { id: 2, denumire: 'kilogram', abreviere: 'kg' },
]

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/unitati`, () => HttpResponse.json(mockUnits)),
    http.get(`${API}/unitati/:id`, ({ params }) => {
      const u = mockUnits.find(x => x.id === Number(params.id))
      return u ? HttpResponse.json(u) : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${API}/unitati`, () => HttpResponse.json({ id: 3, denumire: 'porție', abreviere: 'porț' })),
    http.put(`${API}/unitati/:id`, () => HttpResponse.json({ id: 1, denumire: 'Updated', abreviere: 'upd' })),
    http.patch(`${API}/unitati/:id`, () => HttpResponse.json({ id: 1, denumire: 'Patched', abreviere: 'ptch' })),
    http.delete(`${API}/unitati/:id`, () => new HttpResponse(null, { status: 204 })),
  )
})

describe('useUnits', () => {
  test('fetches units', async () => {
    const { result } = renderHookWithQuery(() => useUnits())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUnits)
  })
})

describe('useUnit', () => {
  test('fetches a single unit by id', async () => {
    const { result } = renderHookWithQuery(() => useUnit(1))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 1, denumire: 'bucată' })
  })

  test('is disabled when id is 0', () => {
    const { result } = renderHookWithQuery(() => useUnit(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateUnit', () => {
  test('invalidates units on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreateUnit())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ denumire: 'porție', abreviere: 'porț' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.units() })
  })

  test('logs console.error on error', async () => {
    server.use(http.post(`${API}/unitati`, () => new HttpResponse(null, { status: 500 })))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHookWithQuery(() => useCreateUnit())

    result.current.mutate({ denumire: 'fail' } as any)
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(consoleSpy).toHaveBeenCalled()
  })
})

describe('useUpdateUnit', () => {
  test('patches detail cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateUnit())
    queryClient.setQueryData(queryKeys.units.detail(1), mockUnits[0])

    result.current.mutate({ id: 1, data: { denumire: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.units.detail(1)) as any
    expect(cached.denumire).toBe('Updated')
  })

  test('patches list cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateUnit())
    queryClient.setQueryData(queryKeys.units.list({}), mockUnits)

    result.current.mutate({ id: 1, data: { denumire: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.units.list({})) as any[]
    expect(cached[0].denumire).toBe('Updated')
  })

  test('invalidates units on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateUnit())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, data: { denumire: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.units() })
  })
})

describe('usePatchUnit', () => {
  test('patches detail cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => usePatchUnit())
    queryClient.setQueryData(queryKeys.units.detail(1), mockUnits[0])

    result.current.mutate({ id: 1, data: { denumire: 'Patched' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.units.detail(1)) as any
    expect(cached.denumire).toBe('Patched')
  })

  test('patches list cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => usePatchUnit())
    queryClient.setQueryData(queryKeys.units.list({}), mockUnits)

    result.current.mutate({ id: 1, data: { denumire: 'Patched' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.units.list({})) as any[]
    expect(cached[0].denumire).toBe('Patched')
  })
})

describe('useDeleteUnit', () => {
  test('removes detail cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteUnit())
    queryClient.setQueryData(queryKeys.units.detail(1), mockUnits[0])
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(removeSpy).toHaveBeenCalledWith({ queryKey: queryKeys.units.detail(1) })
  })

  test('invalidates units on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteUnit())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.units() })
  })
})
