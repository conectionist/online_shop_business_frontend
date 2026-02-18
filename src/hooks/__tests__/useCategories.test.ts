import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys, invalidateQueries } from '@/lib/queryKeys'
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUploadCategoryImage,
  useReorderCategories,
} from '@/hooks/useCategories'

const API = 'http://localhost:8001/api/v1'

const mockCategories = [
  { id: 1, name: 'Pâine', image_versions: null },
  { id: 2, name: 'Patiserie', image_versions: null },
]

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/categories`, () => HttpResponse.json(mockCategories)),
    http.get(`${API}/categories/:id`, ({ params }) => {
      const c = mockCategories.find(x => x.id === Number(params.id))
      return c ? HttpResponse.json(c) : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${API}/categories`, () => HttpResponse.json({ id: 3, name: 'New' })),
    http.patch(`${API}/categories/:id`, () => HttpResponse.json({ id: 1, name: 'Updated' })),
    http.delete(`${API}/categories/:id`, () => new HttpResponse(null, { status: 204 })),
    http.post(`${API}/categories/:id/image`, () => HttpResponse.json({ id: 1, name: 'Pâine', image_versions: { original: '/img.jpg' } })),
    http.put(`${API}/categories/reorder`, () => HttpResponse.json([{ id: 2, name: 'Patiserie' }, { id: 1, name: 'Pâine' }])),
  )
})

describe('useCategories', () => {
  test('fetches categories', async () => {
    const { result } = renderHookWithQuery(() => useCategories())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockCategories)
  })

  test('passes filters into query key', async () => {
    const { result } = renderHookWithQuery(() => useCategories({ search: 'p' }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useCategory', () => {
  test('fetches a single category by id', async () => {
    const { result } = renderHookWithQuery(() => useCategory(1))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 1, name: 'Pâine' })
  })

  test('is disabled when id is 0', () => {
    const { result } = renderHookWithQuery(() => useCategory(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateCategory', () => {
  test('invalidates categories on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreateCategory())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ name: 'New' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.categories() })
  })

  test('logs console.error on error', async () => {
    server.use(http.post(`${API}/categories`, () => new HttpResponse(null, { status: 500 })))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHookWithQuery(() => useCreateCategory())

    result.current.mutate({ name: 'New' } as any)
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(consoleSpy).toHaveBeenCalled()
  })
})

describe('useUpdateCategory', () => {
  test('patches detail cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateCategory())
    queryClient.setQueryData(queryKeys.categories.detail(1), mockCategories[0])

    result.current.mutate({ id: 1, name: 'Updated' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.categories.detail(1)) as any
    expect(cached.name).toBe('Updated')
  })

  test('patches list cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateCategory())
    queryClient.setQueryData(queryKeys.categories.list({}), mockCategories)

    result.current.mutate({ id: 1, name: 'Updated' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.categories.list({})) as any[]
    expect(cached[0].name).toBe('Updated')
  })

  test('invalidates categories on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateCategory())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, name: 'Updated' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.categories() })
  })
})

describe('useDeleteCategory', () => {
  test('removes detail cache and invalidates on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteCategory())
    queryClient.setQueryData(queryKeys.categories.detail(1), mockCategories[0])
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(removeSpy).toHaveBeenCalledWith({ queryKey: queryKeys.categories.detail(1) })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: invalidateQueries.categories() })
  })
})

describe('useUploadCategoryImage', () => {
  test('patches detail cache with updated category', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUploadCategoryImage())
    queryClient.setQueryData(queryKeys.categories.detail(1), mockCategories[0])

    result.current.mutate({ id: 1, image: new File([''], 'test.jpg') })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.categories.detail(1)) as any
    expect(cached.image_versions).toEqual({ original: '/img.jpg' })
  })

  test('patches list cache with updated category', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUploadCategoryImage())
    queryClient.setQueryData(queryKeys.categories.list({}), mockCategories)

    result.current.mutate({ id: 1, image: new File([''], 'test.jpg') })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.categories.list({})) as any[]
    expect(cached[0].image_versions).toEqual({ original: '/img.jpg' })
  })
})

describe('useReorderCategories', () => {
  test('replaces list cache with returned array', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReorderCategories())
    queryClient.setQueryData(queryKeys.categories.list({}), mockCategories)

    result.current.mutate([2, 1])
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.categories.list({})) as any[]
    expect(cached[0].id).toBe(2)
    expect(cached[1].id).toBe(1)
  })

  test('invalidates categories on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReorderCategories())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate([2, 1])
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.categories() })
  })
})
