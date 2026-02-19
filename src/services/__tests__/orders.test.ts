import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { orderService } from '../orders'

const API = 'http://localhost:8001/api/v1'

describe('orderService', () => {
  test('createOrder calls POST /orders with order data', async () => {
    let capturedBody: any = null
    let capturedUrl = ''
    const orderData = { nume_client: 'Ion Popescu', items: [] } as any
    server.use(
      http.post(`${API}/orders`, async ({ request }) => {
        capturedUrl = request.url
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, ...capturedBody })
      })
    )
    const result = await orderService.createOrder(orderData)
    expect(result.id).toBe(1)
    expect(capturedBody).toMatchObject({ nume_client: 'Ion Popescu' })
    expect(new URL(capturedUrl).searchParams.has('source')).toBe(false)
  })

  test('createOrder appends ?source= when provided', async () => {
    let capturedUrl = ''
    server.use(
      http.post(`${API}/orders`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ id: 2 })
      })
    )
    await orderService.createOrder({ nume_client: 'Maria' } as any, { source: 'website' })
    expect(new URL(capturedUrl).searchParams.get('source')).toBe('website')
  })

  test('getOrder calls GET /orders/:id', async () => {
    const mockOrder = { id: 5, nume_client: 'Ion' }
    server.use(
      http.get(`${API}/orders/5`, () => HttpResponse.json(mockOrder))
    )
    const result = await orderService.getOrder(5)
    expect(result).toEqual(mockOrder)
  })

  test('listOrders calls GET /orders with no params when no filters', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/orders`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    const result = await orderService.listOrders()
    expect(result).toEqual([])
    expect(new URL(capturedUrl).searchParams.toString()).toBe('')
  })

  test('listOrders appends all filter params correctly', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/orders`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await orderService.listOrders({
      nume_client: 'Ion',
      liste_id: 3,
      delivery_type_id: 1,
      payment_method_id: 2,
      data_plasarii_start: '2026-01-01',
      data_plasarii_end: '2026-02-01',
      merge_similar: true,
      include_deleted: true,
    })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('nume_client')).toBe('Ion')
    expect(url.searchParams.get('liste_id')).toBe('3')
    expect(url.searchParams.get('delivery_type_id')).toBe('1')
    expect(url.searchParams.get('payment_method_id')).toBe('2')
    expect(url.searchParams.get('data_plasarii_start')).toBe('2026-01-01')
    expect(url.searchParams.get('data_plasarii_end')).toBe('2026-02-01')
    expect(url.searchParams.get('merge_similar')).toBe('true')
    expect(url.searchParams.get('include_deleted')).toBe('true')
  })

  test('listOrders handles pagination (skip, limit)', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/orders`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await orderService.listOrders({ skip: 20, limit: 10 })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('skip')).toBe('20')
    expect(url.searchParams.get('limit')).toBe('10')
  })

  test('listOrders handles sorting (sort_by, sort_order)', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/orders`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await orderService.listOrders({ sort_by: 'data_plasarii', sort_order: 'desc' })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('sort_by')).toBe('data_plasarii')
    expect(url.searchParams.get('sort_order')).toBe('desc')
  })

  test('updateOrder calls PATCH /orders/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.patch(`${API}/orders/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, nume_client: 'Ion Actualizat' })
      })
    )
    const result = await orderService.updateOrder(1, { nume_client: 'Ion Actualizat' })
    expect(result.nume_client).toBe('Ion Actualizat')
    expect(capturedBody).toEqual({ nume_client: 'Ion Actualizat' })
  })

  test('deleteOrder calls DELETE /orders/:id (soft delete)', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${API}/orders/1`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 204 })
      })
    )
    await orderService.deleteOrder(1)
    expect(new URL(capturedUrl).searchParams.has('permanent')).toBe(false)
  })

  test('deleteOrder appends ?permanent=true when requested', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${API}/orders/1`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 204 })
      })
    )
    await orderService.deleteOrder(1, true)
    expect(new URL(capturedUrl).searchParams.get('permanent')).toBe('true')
  })

  test('restoreOrder calls POST /orders/:id/restore', async () => {
    server.use(
      http.post(`${API}/orders/1/restore`, () => {
        return HttpResponse.json({ id: 1, is_deleted: false })
      })
    )
    const result = await orderService.restoreOrder(1)
    expect(result.id).toBe(1)
  })

  test('addOrderItem calls POST /orders/:orderId/products', async () => {
    let capturedBody: any = null
    const item = { produse_id: 5, pret_produs: 10.5, cantitate_produs: 2, unitati_id: 1 }
    server.use(
      http.post(`${API}/orders/1/products`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 100, ...item })
      })
    )
    const result = await orderService.addOrderItem(1, item)
    expect(result.id).toBe(100)
    expect(capturedBody).toEqual(item)
  })

  test('updateOrderItem calls PATCH /orders/:orderId/products/:productId', async () => {
    let capturedBody: any = null
    const item = { produse_id: 5, pret_produs: 12, cantitate_produs: 3, unitati_id: 1 }
    server.use(
      http.patch(`${API}/orders/1/products/5`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(item)
      })
    )
    await orderService.updateOrderItem(1, 5, item)
    expect(capturedBody).toEqual(item)
  })

  test('removeOrderItem calls DELETE /orders/:orderId/products/:productId', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/orders/1/products/5`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await orderService.removeOrderItem(1, 5)
    expect(deleteCalled).toBe(true)
  })
})
