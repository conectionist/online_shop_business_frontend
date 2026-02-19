import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { paymentMethodService } from '../paymentMethods'

const API = 'http://localhost:8001/api/v1'

describe('paymentMethodService', () => {
  test('getAll calls GET /modalitati-plata', async () => {
    const mockMethods = [{ id: 1, name: 'Cash' }, { id: 2, name: 'Card' }]
    server.use(
      http.get(`${API}/modalitati-plata`, () => HttpResponse.json(mockMethods))
    )
    const result = await paymentMethodService.getAll()
    expect(result).toEqual(mockMethods)
  })

  test('getById calls GET /modalitati-plata/:id', async () => {
    const mockMethod = { id: 1, name: 'Cash' }
    server.use(
      http.get(`${API}/modalitati-plata/1`, () => HttpResponse.json(mockMethod))
    )
    const result = await paymentMethodService.getById(1)
    expect(result).toEqual(mockMethod)
  })

  test('create calls POST /modalitati-plata with body', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/modalitati-plata`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 3, name: 'Transfer bancar', description: '' })
      })
    )
    const result = await paymentMethodService.create({ name: 'Transfer bancar', description: '' })
    expect(result.id).toBe(3)
    expect(capturedBody).toMatchObject({ name: 'Transfer bancar' })
  })

  test('update calls PUT /modalitati-plata/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/modalitati-plata/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, name: 'Numerar', description: '' })
      })
    )
    const result = await paymentMethodService.update(1, { name: 'Numerar', description: '' })
    expect(result.name).toBe('Numerar')
    expect(capturedBody).toMatchObject({ name: 'Numerar' })
  })

  test('delete calls DELETE /modalitati-plata/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/modalitati-plata/1`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await paymentMethodService.delete(1)
    expect(deleteCalled).toBe(true)
  })
})
