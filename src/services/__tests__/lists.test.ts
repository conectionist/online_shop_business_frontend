import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { listService } from '../lists'

const API = 'http://localhost:8001/api/v1'

describe('listService — basic CRUD', () => {
  test('getLists calls GET /liste', async () => {
    const mockLists = [{ id: 1, data: '2026-01-01' }]
    server.use(
      http.get(`${API}/liste`, () => HttpResponse.json(mockLists))
    )
    const result = await listService.getLists()
    expect(result).toEqual(mockLists)
  })

  test('getLists appends search/limit/offset/include_deleted params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/liste`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await listService.getLists({ search: 'test', limit: 10, offset: 5, include_deleted: true })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('search')).toBe('test')
    expect(url.searchParams.get('limit')).toBe('10')
    expect(url.searchParams.get('offset')).toBe('5')
    expect(url.searchParams.get('include_deleted')).toBe('true')
  })

  test('getList calls GET /liste/:id', async () => {
    const mockList = { id: 1, data: '2026-01-01' }
    server.use(
      http.get(`${API}/liste/1`, () => HttpResponse.json(mockList))
    )
    const result = await listService.getList(1)
    expect(result).toEqual(mockList)
  })

  test('createList calls POST /liste', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/liste`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 5, ...capturedBody })
      })
    )
    const result = await listService.createList({ data: '2026-03-01' } as any)
    expect(result.id).toBe(5)
    expect(capturedBody).toMatchObject({ data: '2026-03-01' })
  })

  test('updateList calls PATCH /liste/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.patch(`${API}/liste/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, mesaj_introducere: 'Bun venit' })
      })
    )
    const result = await listService.updateList(1, { mesaj_introducere: 'Bun venit' } as any)
    expect(result).toMatchObject({ id: 1 })
    expect(capturedBody).toEqual({ mesaj_introducere: 'Bun venit' })
  })

  test('replaceList calls PUT /liste/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/liste/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, ...capturedBody })
      })
    )
    const result = await listService.replaceList(1, { data: '2026-04-01' } as any)
    expect(result.id).toBe(1)
    expect(capturedBody).toMatchObject({ data: '2026-04-01' })
  })

  test('cloneList calls POST /liste/:id/clone', async () => {
    server.use(
      http.post(`${API}/liste/1/clone`, () => {
        return HttpResponse.json({ id: 10, data: '2026-01-01' })
      })
    )
    const result = await listService.cloneList(1)
    expect(result.id).toBe(10)
  })

  test('deleteList calls DELETE /liste/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/liste/1`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await listService.deleteList(1)
    expect(deleteCalled).toBe(true)
  })
})

describe('listService — published list lookups', () => {
  // Which list is active is decided by the backend, in Romania time

  test('getPublishedList returns the list from GET /liste/published', async () => {
    server.use(
      http.get(`${API}/liste/published`, () => HttpResponse.json({ id: 2, is_published: true, is_deleted: false }))
    )
    const result = await listService.getPublishedList()
    expect(result).toMatchObject({ id: 2 })
  })

  test('getPublishedList returns null when no list is active', async () => {
    server.use(
      http.get(`${API}/liste/published`, () => HttpResponse.json(null))
    )
    const result = await listService.getPublishedList()
    expect(result).toBeNull()
  })

  test('getPublishedList throws on API error instead of reporting no list', async () => {
    server.use(
      http.get(`${API}/liste/published`, () => new HttpResponse(null, { status: 500 }))
    )
    await expect(listService.getPublishedList()).rejects.toThrow()
  })

  test('getLastExpiredPublishedList returns the list from GET /liste/last-expired', async () => {
    server.use(
      http.get(`${API}/liste/last-expired`, () => HttpResponse.json({ id: 2, is_published: true, is_deleted: false }))
    )
    const result = await listService.getLastExpiredPublishedList()
    expect(result).toMatchObject({ id: 2 })
  })

  test('getLastExpiredPublishedList returns null when no list has expired', async () => {
    server.use(
      http.get(`${API}/liste/last-expired`, () => HttpResponse.json(null))
    )
    const result = await listService.getLastExpiredPublishedList()
    expect(result).toBeNull()
  })

  test('getLastExpiredPublishedList throws on API error', async () => {
    server.use(
      http.get(`${API}/liste/last-expired`, () => HttpResponse.error())
    )
    await expect(listService.getLastExpiredPublishedList()).rejects.toThrow()
  })
})

describe('listService — product operations', () => {
  test('getListProducts calls GET /liste/:id/products', async () => {
    const mockProducts = [{ id: 1, nume: 'Pâine' }]
    server.use(
      http.get(`${API}/liste/1/products`, () => HttpResponse.json(mockProducts))
    )
    const result = await listService.getListProducts(1)
    expect(result).toEqual(mockProducts)
  })

  test('getListProductsOrdered calls GET /liste/:id/products/ordered', async () => {
    const mockOrdered = { categories: [] }
    server.use(
      http.get(`${API}/liste/1/products/ordered`, () => HttpResponse.json(mockOrdered))
    )
    const result = await listService.getListProductsOrdered(1)
    expect(result).toEqual(mockOrdered)
  })

  test('addProductToList calls POST with stock when provided', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/liste/1/products/5`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ list_id: 1, product_id: 5, stoc_produs: 100 })
      })
    )
    const result = await listService.addProductToList(1, 5, 100)
    expect(result.stoc_produs).toBe(100)
    expect(capturedBody).toEqual({ stoc_produs: 100 })
  })

  test('addProductToList calls POST with empty body when no stock', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/liste/1/products/5`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ list_id: 1, product_id: 5 })
      })
    )
    await listService.addProductToList(1, 5)
    expect(capturedBody).toEqual({})
  })

  test('updateListProductStock calls PATCH with stoc_produs', async () => {
    let capturedBody: any = null
    server.use(
      http.patch(`${API}/liste/1/products/5`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ list_id: 1, product_id: 5, stoc_produs: 50 })
      })
    )
    const result = await listService.updateListProductStock(1, 5, 50)
    expect(result.stoc_produs).toBe(50)
    expect(capturedBody).toEqual({ stoc_produs: 50 })
  })

  test('addProductsToList calls PATCH with ID array', async () => {
    let capturedBody: any = null
    server.use(
      http.patch(`${API}/liste/1/products`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json([{ product_id: 5 }, { product_id: 6 }, { product_id: 7 }])
      })
    )
    const result = await listService.addProductsToList(1, [5, 6, 7])
    expect(result).toHaveLength(3)
    expect(capturedBody).toEqual([5, 6, 7])
  })

  test('removeProductFromList calls DELETE', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/liste/1/products/5`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await listService.removeProductFromList(1, 5)
    expect(deleteCalled).toBe(true)
  })

  test('replaceListProducts calls PUT with ID array', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/liste/1/products`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json([{ product_id: 10 }, { product_id: 11 }])
      })
    )
    const result = await listService.replaceListProducts(1, [10, 11])
    expect(result).toHaveLength(2)
    expect(capturedBody).toEqual([10, 11])
  })
})

describe('listService — delivery type operations', () => {
  test('getListDeliveryTypes calls GET /liste/:id/delivery-types', async () => {
    const mockTypes = [{ id: 1, denumire: 'Curier' }]
    server.use(
      http.get(`${API}/liste/1/delivery-types`, () => HttpResponse.json(mockTypes))
    )
    const result = await listService.getListDeliveryTypes(1)
    expect(result).toEqual(mockTypes)
  })

  test('addDeliveryTypeToList calls POST', async () => {
    server.use(
      http.post(`${API}/liste/1/delivery-types/2`, () => {
        return HttpResponse.json({ list_id: 1, delivery_type_id: 2 })
      })
    )
    const result = await listService.addDeliveryTypeToList(1, 2)
    expect(result.delivery_type_id).toBe(2)
  })

  test('removeDeliveryTypeFromList calls DELETE', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/liste/1/delivery-types/2`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await listService.removeDeliveryTypeFromList(1, 2)
    expect(deleteCalled).toBe(true)
  })

  test('replaceListDeliveryTypes calls PUT with ID array', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/liste/1/delivery-types`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json([{ id: 1 }, { id: 3 }])
      })
    )
    const result = await listService.replaceListDeliveryTypes(1, [1, 3])
    expect(result).toHaveLength(2)
    expect(capturedBody).toEqual([1, 3])
  })
})

describe('listService — positions', () => {
  test('bulkUpdatePositions calls PUT with nested positions payload', async () => {
    let capturedBody: any = null
    const positions = [
      { category_id: 1, products: [10, 11] },
      { category_id: 2, products: [20] },
    ]
    server.use(
      http.put(`${API}/liste/1/positions`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ success: true })
      })
    )
    await listService.bulkUpdatePositions(1, positions)
    expect(capturedBody).toEqual({ positions })
  })
})
