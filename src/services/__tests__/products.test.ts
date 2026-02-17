import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { productService } from '../products'

const API = 'http://localhost:8001/api/v1'

describe('productService', () => {
  test('getProducts calls GET /products', async () => {
    const mockProducts = [{ id: 1, nume: 'Pâine albă' }]
    server.use(
      http.get(`${API}/products`, () => HttpResponse.json(mockProducts))
    )
    const result = await productService.getProducts()
    expect(result).toEqual(mockProducts)
  })

  test('getProducts appends search/category_id/limit/skip params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/products`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await productService.getProducts({ search: 'pâine', category_id: 2, limit: 10, skip: 5 })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('search')).toBe('pâine')
    expect(url.searchParams.get('category_id')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('10')
    expect(url.searchParams.get('skip')).toBe('5')
  })

  test('getProducts appends include_deleted when true', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/products`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await productService.getProducts({ include_deleted: true })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('include_deleted')).toBe('true')
  })

  test('getProduct calls GET /products/:id', async () => {
    const mockProduct = { id: 1, nume: 'Pâine albă', pret: 5.5 }
    server.use(
      http.get(`${API}/products/1`, () => HttpResponse.json(mockProduct))
    )
    const result = await productService.getProduct(1)
    expect(result).toEqual(mockProduct)
  })

  test('createProduct calls POST /products and returns data', async () => {
    let handlerCalled = false
    server.use(
      http.post(`${API}/products`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 1, nume: 'Pâine', cantitate: 100, pret: 5.5, unitati_id: 1 })
      })
    )
    const result = await productService.createProduct({
      nume: 'Pâine',
      cantitate: 100,
      pret: 5.5,
      unitati_id: 1,
    })
    expect(handlerCalled).toBe(true)
    expect(result.id).toBe(1)
    expect(result.nume).toBe('Pâine')
  })

  test('createProduct includes optional fields when present', async () => {
    let handlerCalled = false
    server.use(
      http.post(`${API}/products`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 2, nume: 'Pâine', description: 'Pâine proaspătă', category_id: 2 })
      })
    )
    const result = await productService.createProduct({
      nume: 'Pâine',
      cantitate: 50,
      pret: 6,
      unitati_id: 1,
      description: 'Pâine proaspătă',
      category_id: 2,
      primary_image_upload_id: 'upload-123',
    })
    expect(handlerCalled).toBe(true)
    expect(result.id).toBe(2)
  })

  test('updateProduct calls PATCH /products/:id and returns data', async () => {
    let handlerCalled = false
    server.use(
      http.patch(`${API}/products/1`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 1, nume: 'Pâine neagră', pret: 7 })
      })
    )
    const result = await productService.updateProduct(1, { nume: 'Pâine neagră', pret: 7 })
    expect(handlerCalled).toBe(true)
    expect(result.nume).toBe('Pâine neagră')
  })

  test('updateProduct sends only provided fields', async () => {
    let handlerCalled = false
    server.use(
      http.patch(`${API}/products/1`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 1, description: 'Descriere nouă' })
      })
    )
    await productService.updateProduct(1, { description: 'Descriere nouă' })
    expect(handlerCalled).toBe(true)
  })

  test('deleteProduct calls DELETE /products/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/products/1`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await productService.deleteProduct(1)
    expect(deleteCalled).toBe(true)
  })

  test('uploadProductImage calls POST /products/:id/images', async () => {
    let handlerCalled = false
    const testFile = new File(['img'], 'product.jpg', { type: 'image/jpeg' })
    server.use(
      http.post(`${API}/products/1/images`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 10, produse_id: 1, path: 'product.jpg', position: 0, is_primary: false, image_versions: { original: '', medium: '', thumbnail: '' } })
      })
    )
    const result = await productService.uploadProductImage(1, testFile)
    expect(handlerCalled).toBe(true)
    expect(result.id).toBe(10)
  })

  test('getProductImages calls GET /products/:id/images', async () => {
    const mockImages = [{ id: 10, path: 'a.jpg' }, { id: 11, path: 'b.jpg' }]
    server.use(
      http.get(`${API}/products/1/images`, () => HttpResponse.json(mockImages))
    )
    const result = await productService.getProductImages(1)
    expect(result).toEqual(mockImages)
  })

  test('deleteProductImage calls DELETE /products/:productId/images/:imageId', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/products/1/images/10`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await productService.deleteProductImage(1, 10)
    expect(deleteCalled).toBe(true)
  })

  test('setPrimaryImage calls PUT /products/:productId/images/:imageId/primary', async () => {
    let called = false
    server.use(
      http.put(`${API}/products/1/images/10/primary`, () => {
        called = true
        return new HttpResponse(null, { status: 200 })
      })
    )
    await productService.setPrimaryImage(1, 10)
    expect(called).toBe(true)
  })

  test('reorderProductImages calls PUT /products/:productId/images/reorder with mappings', async () => {
    const mappings = [{ id: 10, position: 0 }, { id: 11, position: 1 }]
    let capturedBody: any = null
    server.use(
      http.put(`${API}/products/1/images/reorder`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json([
          { id: 10, position: 0 },
          { id: 11, position: 1 },
        ])
      })
    )
    const result = await productService.reorderProductImages(1, mappings)
    expect(result).toHaveLength(2)
    expect(capturedBody).toEqual(mappings)
  })
})
