import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys } from '@/lib/queryKeys'
import {
  useCreateOrder,
  useOrder,
  useOrders,
  useUpdateOrder,
  useAddOrderItem,
  useUpdateOrderItem,
  useRemoveOrderItem,
  useDeleteOrder,
  useRestoreOrder,
} from '@/hooks/useOrders'

const API = 'http://localhost:8001/api/v1'

const mockOrder = { id: 1, nume_client: 'Ion Popescu', status: 'pending' }
const mockOrders = [mockOrder, { id: 2, nume_client: 'Maria Ionescu', status: 'completed' }]

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/orders`, () => HttpResponse.json(mockOrders)),
    http.get(`${API}/orders/:id`, ({ params }) => {
      const o = mockOrders.find(x => x.id === Number(params.id))
      return o ? HttpResponse.json(o) : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${API}/orders`, () => HttpResponse.json({ id: 3, nume_client: 'New' })),
    http.patch(`${API}/orders/:id`, () => HttpResponse.json({ ...mockOrder, status: 'updated' })),
    http.delete(`${API}/orders/:id`, () => new HttpResponse(null, { status: 204 })),
    http.post(`${API}/orders/:id/restore`, () => HttpResponse.json(mockOrder)),
    http.post(`${API}/orders/:orderId/products`, () => HttpResponse.json({ id: 1 })),
    http.patch(`${API}/orders/:orderId/products/:productId`, () => HttpResponse.json({ id: 1 })),
    http.delete(`${API}/orders/:orderId/products/:productId`, () => new HttpResponse(null, { status: 204 })),
  )
})

describe('useOrder', () => {
  test('fetches a single order by id', async () => {
    const { result } = renderHookWithQuery(() => useOrder(1))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 1 })
  })

  test('is disabled when id is 0', () => {
    const { result } = renderHookWithQuery(() => useOrder(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useOrders', () => {
  test('fetches orders list', async () => {
    const { result } = renderHookWithQuery(() => useOrders())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockOrders)
  })

  test('passes filters into query key', async () => {
    const { result } = renderHookWithQuery(() => useOrders({ limit: 10, skip: 0 }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useCreateOrder', () => {
  test('invalidates all orders on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreateOrder())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ orderData: { nume_client: 'Test' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })

  test('passes source to service', async () => {
    let capturedUrl = ''
    server.use(
      http.post(`${API}/orders`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ id: 4 })
      })
    )
    const { result } = renderHookWithQuery(() => useCreateOrder())

    result.current.mutate({ orderData: { nume_client: 'Test' } as any, source: 'whatsapp' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedUrl).toContain('source=whatsapp')
  })
})

describe('useUpdateOrder', () => {
  test('invalidates detail, list, and all on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateOrder())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, data: { nume_client: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.detail(1) })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.list() })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })
})

describe('useAddOrderItem', () => {
  test('invalidates detail, list, and all on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useAddOrderItem())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({
      orderId: 1,
      item: { produse_id: 1, pret_produs: 5, cantitate_produs: 2, unitati_id: 1 },
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.detail(1) })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })
})

describe('useUpdateOrderItem', () => {
  test('invalidates detail, list, and all on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateOrderItem())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({
      orderId: 1,
      productId: 1,
      item: { produse_id: 1, pret_produs: 5, cantitate_produs: 3, unitati_id: 1 },
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.detail(1) })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })
})

describe('useRemoveOrderItem', () => {
  test('invalidates detail, list, and all on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useRemoveOrderItem())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ orderId: 1, productId: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.detail(1) })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })
})

describe('useDeleteOrder', () => {
  test('invalidates all orders on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteOrder())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })
})

describe('useRestoreOrder', () => {
  test('invalidates detail, list, and all on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useRestoreOrder())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.detail(1) })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.list() })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all })
  })
})
