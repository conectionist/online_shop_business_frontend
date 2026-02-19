import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys } from '@/lib/queryKeys'
import {
  useDeliveryTypes,
  useDeliveryType,
  useCreateDeliveryType,
  useUpdateDeliveryType,
  usePatchDeliveryType,
  useDeleteDeliveryType,
  useReorderDeliveryTypes,
} from '@/hooks/useDeliveryTypes'

const API = 'http://localhost:8001/api/v1'

const mockTypes = [
  { id: 1, denumire: 'Livrare la domiciliu', order_index: 1 },
  { id: 2, denumire: 'Ridicare de la brutărie', order_index: 2 },
]

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/tipuri-livrare`, () => HttpResponse.json(mockTypes)),
    http.get(`${API}/tipuri-livrare/:id`, ({ params }) => {
      const t = mockTypes.find(x => x.id === Number(params.id))
      return t ? HttpResponse.json(t) : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${API}/tipuri-livrare`, () => HttpResponse.json({ id: 3, denumire: 'New' })),
    http.put(`${API}/tipuri-livrare/reorder`, () => HttpResponse.json([mockTypes[1], mockTypes[0]])),
    http.put(`${API}/tipuri-livrare/:id`, () => HttpResponse.json({ id: 1, denumire: 'Updated' })),
    http.patch(`${API}/tipuri-livrare/:id`, () => HttpResponse.json({ id: 1, denumire: 'Patched' })),
    http.delete(`${API}/tipuri-livrare/:id`, () => new HttpResponse(null, { status: 204 })),
  )
})

describe('useDeliveryTypes', () => {
  test('fetches delivery types', async () => {
    const { result } = renderHookWithQuery(() => useDeliveryTypes())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockTypes)
  })
})

describe('useDeliveryType', () => {
  test('fetches a single delivery type by id', async () => {
    const { result } = renderHookWithQuery(() => useDeliveryType(1))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 1 })
  })

  test('is disabled when id is 0', () => {
    const { result } = renderHookWithQuery(() => useDeliveryType(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateDeliveryType', () => {
  test('invalidates delivery types on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreateDeliveryType())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ denumire: 'New', order_index: 3 } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.deliveryTypes.all })
  })
})

describe('useUpdateDeliveryType', () => {
  test('invalidates all and detail on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateDeliveryType())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, data: { denumire: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.deliveryTypes.all })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.deliveryTypes.detail(1) })
  })
})

describe('usePatchDeliveryType', () => {
  test('invalidates all and detail on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => usePatchDeliveryType())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, data: { denumire: 'Patched' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.deliveryTypes.all })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.deliveryTypes.detail(1) })
  })
})

describe('useDeleteDeliveryType', () => {
  test('invalidates delivery types on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteDeliveryType())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.deliveryTypes.all })
  })
})

describe('useReorderDeliveryTypes', () => {
  test('sets cache directly with returned array', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReorderDeliveryTypes())
    const setSpy = vi.spyOn(queryClient, 'setQueryData')

    result.current.mutate([2, 1])
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(setSpy).toHaveBeenCalledWith(
      queryKeys.deliveryTypes.all,
      [expect.objectContaining({ id: 2 }), expect.objectContaining({ id: 1 })]
    )
  })

  test('invalidates delivery types on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReorderDeliveryTypes())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate([2, 1])
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.deliveryTypes.all })
  })
})
