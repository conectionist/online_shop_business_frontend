import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { deliveryTypeService } from '../deliveryTypes'

const API = 'http://localhost:8001/api/v1'

describe('deliveryTypeService', () => {
  test('getAll calls GET /tipuri-livrare', async () => {
    const mockTypes = [{ id: 1, denumire: 'Curier' }, { id: 2, denumire: 'Ridicare' }]
    server.use(
      http.get(`${API}/tipuri-livrare`, () => HttpResponse.json(mockTypes))
    )
    const result = await deliveryTypeService.getAll()
    expect(result).toEqual(mockTypes)
  })

  test('getById calls GET /tipuri-livrare/:id', async () => {
    const mockType = { id: 1, denumire: 'Curier' }
    server.use(
      http.get(`${API}/tipuri-livrare/1`, () => HttpResponse.json(mockType))
    )
    const result = await deliveryTypeService.getById(1)
    expect(result).toEqual(mockType)
  })

  test('create calls POST /tipuri-livrare with body', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/tipuri-livrare`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 3, denumire: 'Transport propriu', description: '', order_index: 0 })
      })
    )
    const result = await deliveryTypeService.create({ denumire: 'Transport propriu', description: '', order_index: 0 })
    expect(result.id).toBe(3)
    expect(capturedBody).toMatchObject({ denumire: 'Transport propriu' })
  })

  test('update calls PUT /tipuri-livrare/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/tipuri-livrare/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, denumire: 'Curier rapid', description: '', order_index: 0 })
      })
    )
    const result = await deliveryTypeService.update(1, { denumire: 'Curier rapid' } as any)
    expect(result.denumire).toBe('Curier rapid')
    expect(capturedBody).toMatchObject({ denumire: 'Curier rapid' })
  })

  test('patch calls PATCH /tipuri-livrare/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.patch(`${API}/tipuri-livrare/2`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 2, denumire: 'Ridicare personală', description: '', order_index: 1 })
      })
    )
    const result = await deliveryTypeService.patch(2, { denumire: 'Ridicare personală' } as any)
    expect(result.id).toBe(2)
    expect(capturedBody).toMatchObject({ denumire: 'Ridicare personală' })
  })

  test('delete calls DELETE /tipuri-livrare/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/tipuri-livrare/1`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await deliveryTypeService.delete(1)
    expect(deleteCalled).toBe(true)
  })

  test('reorder calls PUT /tipuri-livrare/reorder with ID array', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/tipuri-livrare/reorder`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json([
          { id: 3, denumire: 'C', description: '', order_index: 0 },
          { id: 1, denumire: 'A', description: '', order_index: 1 },
          { id: 2, denumire: 'B', description: '', order_index: 2 },
        ])
      })
    )
    const result = await deliveryTypeService.reorder([3, 1, 2])
    expect(result).toHaveLength(3)
    expect(capturedBody).toEqual([3, 1, 2])
  })
})
