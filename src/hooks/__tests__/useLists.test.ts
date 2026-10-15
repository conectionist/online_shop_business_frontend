import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys, invalidateQueries } from '@/lib/queryKeys'
import {
  useLists,
  usePublishedList,
  useLastExpiredList,
  useList,
  useCreateList,
  useUpdateList,
  useReplaceList,
  useCloneList,
  useDeleteList,
  useListProducts,
  useListProductsOrdered,
  useAddProductToList,
  useAddProductsToList,
  useRemoveProductFromList,
  useReplaceListProducts,
  useListDeliveryTypes,
  useAddDeliveryTypeToList,
  useRemoveDeliveryTypeFromList,
  useReplaceListDeliveryTypes,
  useBulkUpdatePositions,
  useUpdateListProductStock,
} from '@/hooks/useLists'

const API = 'http://localhost:8001/api/v1'

const mockList = { id: 101, data: '2026-01-01', is_published: true, is_deleted: false }
const mockLists = [mockList, { id: 102, data: '2026-02-01', is_published: false, is_deleted: false }]
const mockProducts = [{ id: 1, nume: 'Pâine' }, { id: 2, nume: 'Croissant' }]
const mockOrderedProducts = { categories: [{ id: 1, name: 'Pâine', products: mockProducts }] }
const mockDeliveryTypes = [{ id: 1, denumire: 'Livrare' }, { id: 2, denumire: 'Ridicare' }]

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/liste`, () => HttpResponse.json(mockLists)),
    // Before /liste/:id, which would otherwise match these paths
    http.get(`${API}/liste/published`, () => HttpResponse.json(mockList)),
    http.get(`${API}/liste/last-expired`, () => HttpResponse.json(null)),
    http.get(`${API}/liste/:id`, ({ params }) => {
      const l = mockLists.find(x => x.id === Number(params.id))
      return l ? HttpResponse.json(l) : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${API}/liste`, () => HttpResponse.json({ id: 103, data: '2026-03-01' })),
    http.patch(`${API}/liste/:id`, () => HttpResponse.json({ ...mockList, data: '2026-01-15' })),
    http.put(`${API}/liste/:id`, () => HttpResponse.json({ ...mockList, data: '2026-01-20' })),
    http.post(`${API}/liste/:id/clone`, () => HttpResponse.json({ id: 104, data: '2026-01-01-copy' })),
    http.delete(`${API}/liste/:id`, () => new HttpResponse(null, { status: 204 })),
    http.get(`${API}/liste/:id/products`, () => HttpResponse.json(mockProducts)),
    http.get(`${API}/liste/:id/products/ordered`, () => HttpResponse.json(mockOrderedProducts)),
    http.post(`${API}/liste/:listId/products/:productId`, () => HttpResponse.json({ id: 1 })),
    http.patch(`${API}/liste/:listId/products`, () => HttpResponse.json(mockProducts)),
    http.patch(`${API}/liste/:listId/products/:productId`, () => HttpResponse.json({ id: 1 })),
    http.delete(`${API}/liste/:listId/products/:productId`, () => new HttpResponse(null, { status: 204 })),
    http.put(`${API}/liste/:listId/products`, () => HttpResponse.json(mockProducts)),
    http.get(`${API}/liste/:id/delivery-types`, () => HttpResponse.json(mockDeliveryTypes)),
    http.post(`${API}/liste/:listId/delivery-types/:typeId`, () => HttpResponse.json({ id: 1 })),
    http.delete(`${API}/liste/:listId/delivery-types/:typeId`, () => new HttpResponse(null, { status: 204 })),
    http.put(`${API}/liste/:listId/delivery-types`, () => HttpResponse.json(mockDeliveryTypes)),
    http.put(`${API}/liste/:listId/positions`, () => HttpResponse.json({ success: true })),
  )
})

describe('useLists', () => {
  test('fetches lists', async () => {
    const { result } = renderHookWithQuery(() => useLists())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockLists)
  })
})

describe('usePublishedList', () => {
  test('uses composite query key with published suffix', async () => {
    const { result } = renderHookWithQuery(() => usePublishedList())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockList)
  })
})

describe('useLastExpiredList', () => {
  test('uses composite query key with last-expired suffix', async () => {
    const { result } = renderHookWithQuery(() => useLastExpiredList())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})

describe('useList', () => {
  test('fetches a single list by id', async () => {
    const { result } = renderHookWithQuery(() => useList(101))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 101 })
  })

  test('is disabled when id is 0', () => {
    const { result } = renderHookWithQuery(() => useList(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateList', () => {
  test('invalidates lists on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreateList())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ data: '2026-03-01' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.lists() })
  })
})

describe('useUpdateList', () => {
  test('patches detail cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateList())
    queryClient.setQueryData(queryKeys.lists.detail(101), mockList)

    result.current.mutate({ id: 101, data: { data: '2026-01-15' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.lists.detail(101)) as any
    expect(cached.data).toBe('2026-01-15')
  })

  test('patches list cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateList())
    queryClient.setQueryData(queryKeys.lists.list({}), mockLists)

    result.current.mutate({ id: 101, data: { data: '2026-01-15' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.lists.list({})) as any[]
    expect(cached[0].data).toBe('2026-01-15')
  })

  test('invalidates lists on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateList())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 101, data: {} as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.lists() })
  })
})

describe('useReplaceList', () => {
  test('patches detail and list cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReplaceList())
    queryClient.setQueryData(queryKeys.lists.detail(101), mockList)
    queryClient.setQueryData(queryKeys.lists.list({}), mockLists)

    result.current.mutate({ id: 101, data: { data: '2026-01-20' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const detail = queryClient.getQueryData(queryKeys.lists.detail(101)) as any
    expect(detail.data).toBe('2026-01-20')

    const list = queryClient.getQueryData(queryKeys.lists.list({})) as any[]
    expect(list[0].data).toBe('2026-01-20')
  })
})

describe('useCloneList', () => {
  test('prepends cloned list to list cache', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCloneList())
    queryClient.setQueryData(queryKeys.lists.list({}), mockLists)

    result.current.mutate(101)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.lists.list({})) as any[]
    expect(cached[0].id).toBe(104) // cloned list prepended
    expect(cached).toHaveLength(3)
  })

  test('creates array with cloned list when no existing cache', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCloneList())

    result.current.mutate(101)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.lists.list({})) as any[]
    expect(cached).toEqual([{ id: 104, data: '2026-01-01-copy' }])
  })
})

describe('useDeleteList', () => {
  test('removes detail cache and invalidates on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteList())
    queryClient.setQueryData(queryKeys.lists.detail(101), mockList)
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 101 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(removeSpy).toHaveBeenCalledWith({ queryKey: queryKeys.lists.detail(101) })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: invalidateQueries.lists() })
  })
})

describe('useListProducts', () => {
  test('fetches list products', async () => {
    const { result } = renderHookWithQuery(() => useListProducts(101))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProducts)
  })

  test('is disabled when listId is 0', () => {
    const { result } = renderHookWithQuery(() => useListProducts(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useListProductsOrdered', () => {
  test('fetches ordered list products', async () => {
    const { result } = renderHookWithQuery(() => useListProductsOrdered(101))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockOrderedProducts)
  })

  test('is disabled when listId is 0', () => {
    const { result } = renderHookWithQuery(() => useListProductsOrdered(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useAddProductToList', () => {
  test('invalidates list products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useAddProductToList())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, productId: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'products'] })
  })
})

describe('useAddProductsToList', () => {
  test('invalidates list products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useAddProductsToList())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, productIds: [1, 2] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'products'] })
  })
})

describe('useRemoveProductFromList', () => {
  test('invalidates list products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useRemoveProductFromList())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, productId: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'products'] })
  })
})

describe('useReplaceListProducts', () => {
  test('invalidates list products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReplaceListProducts())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, productIds: [1, 2] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'products'] })
  })
})

describe('useListDeliveryTypes', () => {
  test('fetches list delivery types', async () => {
    const { result } = renderHookWithQuery(() => useListDeliveryTypes(101))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDeliveryTypes)
  })

  test('is disabled when listId is 0', () => {
    const { result } = renderHookWithQuery(() => useListDeliveryTypes(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useAddDeliveryTypeToList', () => {
  test('invalidates list delivery types on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useAddDeliveryTypeToList())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, deliveryTypeId: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'delivery-types'] })
  })
})

describe('useRemoveDeliveryTypeFromList', () => {
  test('invalidates list delivery types on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useRemoveDeliveryTypeFromList())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, deliveryTypeId: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'delivery-types'] })
  })
})

describe('useReplaceListDeliveryTypes', () => {
  test('invalidates list delivery types on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReplaceListDeliveryTypes())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, deliveryTypeIds: [1, 2] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'delivery-types'] })
  })
})

describe('useBulkUpdatePositions', () => {
  test('invalidates list products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useBulkUpdatePositions())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, positions: [{ category_id: 1, products: [1, 2] }] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'products'] })
  })
})

describe('useUpdateListProductStock', () => {
  test('invalidates both products and ordered products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateListProductStock())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ listId: 101, productId: 1, stock: 50 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'products'] })
    expect(spy).toHaveBeenCalledWith({ queryKey: [...queryKeys.lists.detail(101), 'products', 'ordered'] })
  })
})
