import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys } from '@/lib/queryKeys'
import {
  usePaymentMethods,
  usePaymentMethod,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '@/hooks/usePaymentMethods'

const API = 'http://localhost:8001/api/v1'

const mockMethods = [
  { id: 1, description: 'Numerar la livrare' },
  { id: 2, description: 'Card la livrare' },
]

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/modalitati-plata`, () => HttpResponse.json(mockMethods)),
    http.get(`${API}/modalitati-plata/:id`, ({ params }) => {
      const m = mockMethods.find(x => x.id === Number(params.id))
      return m ? HttpResponse.json(m) : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${API}/modalitati-plata`, () => HttpResponse.json({ id: 3, description: 'Transfer' })),
    http.put(`${API}/modalitati-plata/:id`, () => HttpResponse.json({ id: 1, description: 'Updated' })),
    http.delete(`${API}/modalitati-plata/:id`, () => new HttpResponse(null, { status: 204 })),
  )
})

describe('usePaymentMethods', () => {
  test('fetches payment methods', async () => {
    const { result } = renderHookWithQuery(() => usePaymentMethods())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockMethods)
  })
})

describe('usePaymentMethod', () => {
  test('fetches a single payment method by id', async () => {
    const { result } = renderHookWithQuery(() => usePaymentMethod(1))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 1 })
  })

  test('is disabled when id is 0', () => {
    const { result } = renderHookWithQuery(() => usePaymentMethod(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreatePaymentMethod', () => {
  test('invalidates payment methods on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreatePaymentMethod())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ description: 'Transfer' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.paymentMethods.all })
  })
})

describe('useUpdatePaymentMethod', () => {
  test('invalidates all and detail on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdatePaymentMethod())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, data: { description: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.paymentMethods.all })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.paymentMethods.detail(1) })
  })
})

describe('useDeletePaymentMethod', () => {
  test('invalidates payment methods on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeletePaymentMethod())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.paymentMethods.all })
  })
})
