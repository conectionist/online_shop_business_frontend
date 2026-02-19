import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys, invalidateQueries } from '@/lib/queryKeys'
import {
  useProducts,
  useAllProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUploadProductImage,
  useUploadImageToStaging,
  useDeleteProductImage,
  useSetPrimaryImage,
  useUpdateImagePosition,
  useReorderProductImages,
} from '@/hooks/useProducts'

const API = 'http://localhost:8001/api/v1'

const mockProduct = {
  id: 1,
  nume: 'Pâine albă',
  pret: 5.5,
  category_id: 1,
  unitati_id: 1,
  images: [
    { id: 10, filename: 'img1.jpg', is_primary: true, position: 0 },
    { id: 11, filename: 'img2.jpg', is_primary: false, position: 1 },
    { id: 12, filename: 'img3.jpg', is_primary: false, position: 2 },
  ],
}

const mockProducts = [
  mockProduct,
  { id: 2, nume: 'Pâine neagră', pret: 6, category_id: 1, unitati_id: 1, images: [] },
]

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/products`, () => HttpResponse.json(mockProducts)),
    http.get(`${API}/products/:id`, ({ params }) => {
      const p = mockProducts.find(x => x.id === Number(params.id))
      return p ? HttpResponse.json(p) : new HttpResponse(null, { status: 404 })
    }),
    http.post(`${API}/products`, () => HttpResponse.json({ id: 3, nume: 'New' })),
    http.patch(`${API}/products/:id`, () => HttpResponse.json({ ...mockProduct, nume: 'Updated' })),
    http.delete(`${API}/products/:id`, () => new HttpResponse(null, { status: 204 })),
    http.post(`${API}/products/:id/images`, () => HttpResponse.json({ ...mockProduct })),
    http.delete(`${API}/products/:id/images/:imageId`, () => new HttpResponse(null, { status: 204 })),
    http.put(`${API}/products/:id/images/:imageId/primary`, () => new HttpResponse(null, { status: 204 })),
    http.put(`${API}/products/:id/images/:imageId/position`, () => new HttpResponse(null, { status: 204 })),
    http.put(`${API}/products/:id/images/reorder`, () =>
      HttpResponse.json([
        { id: 12, filename: 'img3.jpg', is_primary: false, position: 0 },
        { id: 10, filename: 'img1.jpg', is_primary: true, position: 1 },
        { id: 11, filename: 'img2.jpg', is_primary: false, position: 2 },
      ])
    ),
    http.post(`${API}/uploads/images`, () => HttpResponse.json({ upload_id: 'staged-123' })),
  )
})

describe('useProducts', () => {
  test('fetches products with default filters (limit:500, skip:0)', async () => {
    const { result } = renderHookWithQuery(() => useProducts())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProducts)
  })

  test('merges caller-provided filters into defaults', async () => {
    const { result } = renderHookWithQuery(() => useProducts({ category_id: 1 }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProducts)
  })
})

describe('useAllProducts', () => {
  test('fetches products with limit:1000, skip:0', async () => {
    const { result } = renderHookWithQuery(() => useAllProducts())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProducts)
  })
})

describe('useProduct', () => {
  test('fetches a single product by id', async () => {
    const { result } = renderHookWithQuery(() => useProduct(1))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 1, nume: 'Pâine albă' })
  })

  test('is disabled when id is 0', () => {
    const { result } = renderHookWithQuery(() => useProduct(0))
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateProduct', () => {
  test('invalidates products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreateProduct())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ nume: 'New', pret: 10, cantitate: 1, category_id: 1, unitati_id: 1 } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.products() })
  })

  test('logs console.error on error', async () => {
    server.use(http.post(`${API}/products`, () => new HttpResponse(null, { status: 500 })))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHookWithQuery(() => useCreateProduct())

    result.current.mutate({ nume: 'New', pret: 10, cantitate: 1, unitati_id: 1 } as any)
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(consoleSpy).toHaveBeenCalled()
  })
})

describe('useUpdateProduct', () => {
  test('patches detail cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateProduct())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)

    result.current.mutate({ id: 1, data: { nume: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.detail(1)) as any
    expect(cached.nume).toBe('Updated')
  })

  test('patches list cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateProduct())
    queryClient.setQueryData(queryKeys.products.list({}), mockProducts)

    result.current.mutate({ id: 1, data: { nume: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.list({})) as any[]
    expect(cached[0].nume).toBe('Updated')
  })

  test('invalidates products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateProduct())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, data: { nume: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.products() })
  })
})

describe('useDeleteProduct', () => {
  test('removes detail cache and invalidates on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteProduct())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(removeSpy).toHaveBeenCalledWith({ queryKey: queryKeys.products.detail(1) })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: invalidateQueries.products() })
  })
})

describe('useUploadProductImage', () => {
  test('invalidates detail and list queries on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUploadProductImage())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ productId: 1, image: new File([''], 'test.jpg') })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.products.detail(1) })
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.products.list({}) })
  })
})

describe('useUploadImageToStaging', () => {
  test('uploads file and resolves', async () => {
    const { result } = renderHookWithQuery(() => useUploadImageToStaging())

    result.current.mutate(new File([''], 'test.jpg'))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe('staged-123')
  })
})

describe('useDeleteProductImage', () => {
  test('filters deleted image from detail cache', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteProductImage())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)

    result.current.mutate({ productId: 1, imageId: 11 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.detail(1)) as any
    expect(cached.images).toHaveLength(2)
    expect(cached.images.find((img: any) => img.id === 11)).toBeUndefined()
  })

  test('filters deleted image from list cache', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteProductImage())
    queryClient.setQueryData(queryKeys.products.list({}), mockProducts)

    result.current.mutate({ productId: 1, imageId: 10 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.list({})) as any[]
    expect(cached[0].images).toHaveLength(2)
    expect(cached[0].images.find((img: any) => img.id === 10)).toBeUndefined()
  })

  test('invalidates products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteProductImage())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ productId: 1, imageId: 10 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.products() })
  })
})

describe('useSetPrimaryImage', () => {
  test('sets target image as primary with position 0', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useSetPrimaryImage())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)

    result.current.mutate({ productId: 1, imageId: 12 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.detail(1)) as any
    const target = cached.images.find((img: any) => img.id === 12)
    expect(target.is_primary).toBe(true)
    expect(target.position).toBe(0)
  })

  test('sets all other images as non-primary', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useSetPrimaryImage())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)

    result.current.mutate({ productId: 1, imageId: 12 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.detail(1)) as any
    const others = cached.images.filter((img: any) => img.id !== 12)
    others.forEach((img: any) => expect(img.is_primary).toBe(false))
  })

  test('renumbers positions 0..n-1 after sort', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useSetPrimaryImage())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)

    result.current.mutate({ productId: 1, imageId: 12 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.detail(1)) as any
    cached.images.forEach((img: any, idx: number) => expect(img.position).toBe(idx))
  })
})

describe('useUpdateImagePosition', () => {
  test('updates target image position and renumbers', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateImagePosition())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)

    // Move image 12 (currently position 2) to position 0
    // Hook sets pos=0, sorts (stable: 10 stays before 12 at pos 0), renumbers
    result.current.mutate({ productId: 1, imageId: 12, position: 0 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.detail(1)) as any
    // After sort-by-position + renumber, positions should be sequential 0, 1, 2
    cached.images.forEach((img: any, idx: number) => expect(img.position).toBe(idx))
    // Stable sort: 10 (original idx 0) before 12 (original idx 2) at same position, then 11
    expect(cached.images[0].id).toBe(10)
    expect(cached.images[1].id).toBe(12)
    expect(cached.images[2].id).toBe(11)
  })
})

describe('useReorderProductImages', () => {
  test('replaces images array with API response', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReorderProductImages())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)

    result.current.mutate({
      productId: 1,
      mappings: [{ id: 12, position: 0 }, { id: 10, position: 1 }, { id: 11, position: 2 }],
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData(queryKeys.products.detail(1)) as any
    expect(cached.images[0].id).toBe(12)
    expect(cached.images[1].id).toBe(10)
    expect(cached.images[2].id).toBe(11)
  })

  test('invalidates products on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useReorderProductImages())
    queryClient.setQueryData(queryKeys.products.detail(1), mockProduct)
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ productId: 1, mappings: [{ id: 10, position: 0 }] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: invalidateQueries.products() })
  })
})
