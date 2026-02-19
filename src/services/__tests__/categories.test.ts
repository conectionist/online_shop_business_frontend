import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { categoryService } from '../categories'

const API = 'http://localhost:8001/api/v1'

describe('categoryService', () => {
  test('getCategories calls GET /categories', async () => {
    const mockCategories = [{ id: 1, name: 'Pâine' }, { id: 2, name: 'Prăjituri' }]
    server.use(
      http.get(`${API}/categories`, () => HttpResponse.json(mockCategories))
    )
    const result = await categoryService.getCategories()
    expect(result).toEqual(mockCategories)
  })

  test('getCategories appends search/limit/offset params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/categories`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await categoryService.getCategories({ search: 'pâine', limit: 5, offset: 10 })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('search')).toBe('pâine')
    expect(url.searchParams.get('limit')).toBe('5')
    expect(url.searchParams.get('offset')).toBe('10')
  })

  test('getCategory calls GET /categories/:id', async () => {
    const mockCategory = { id: 1, name: 'Pâine' }
    server.use(
      http.get(`${API}/categories/1`, () => HttpResponse.json(mockCategory))
    )
    const result = await categoryService.getCategory(1)
    expect(result).toEqual(mockCategory)
  })

  test('createCategory calls POST /categories and returns data', async () => {
    let handlerCalled = false
    server.use(
      http.post(`${API}/categories`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 3, name: 'Cozonaci', order_index: 3 })
      })
    )
    const result = await categoryService.createCategory({ name: 'Cozonaci', order_index: 3 })
    expect(handlerCalled).toBe(true)
    expect(result.id).toBe(3)
    expect(result.name).toBe('Cozonaci')
  })

  test('updateCategory calls PATCH /categories/:id and returns data', async () => {
    let handlerCalled = false
    server.use(
      http.patch(`${API}/categories/1`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 1, name: 'Pâine Proaspătă' })
      })
    )
    const result = await categoryService.updateCategory({ id: 1, name: 'Pâine Proaspătă' })
    expect(handlerCalled).toBe(true)
    expect(result.name).toBe('Pâine Proaspătă')
  })

  test('updateCategory sends only provided fields', async () => {
    let handlerCalled = false
    server.use(
      http.patch(`${API}/categories/2`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 2, name: 'Prăjituri', order_index: 5 })
      })
    )
    await categoryService.updateCategory({ id: 2, order_index: 5, clear_image: true })
    expect(handlerCalled).toBe(true)
  })

  test('deleteCategory calls DELETE /categories/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/categories/1`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await categoryService.deleteCategory(1)
    expect(deleteCalled).toBe(true)
  })

  test('uploadCategoryImage calls POST /categories/:id/image', async () => {
    let handlerCalled = false
    const testFile = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' })
    server.use(
      http.post(`${API}/categories/1/image`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 1, name: 'Pâine' })
      })
    )
    const result = await categoryService.uploadCategoryImage(1, testFile)
    expect(handlerCalled).toBe(true)
    expect(result.id).toBe(1)
  })

  test('reorder calls PUT /categories/reorder with ID array', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/categories/reorder`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json([
          { id: 2, name: 'B', order_index: 0 },
          { id: 1, name: 'A', order_index: 1 },
          { id: 3, name: 'C', order_index: 2 },
        ])
      })
    )
    const result = await categoryService.reorder([2, 1, 3])
    expect(result).toHaveLength(3)
    expect(result[0].id).toBe(2)
    expect(capturedBody).toEqual([2, 1, 3])
  })
})
