import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { businessDetailsService } from '../businessDetails'

const API = 'http://localhost:8001/api/v1'

describe('businessDetailsService', () => {
  test('get calls GET /detalii-business and returns array', async () => {
    const mockDetails = [{ id: 1, name: 'Brutăria Pâine Bună', phone: '0712345678' }]
    server.use(
      http.get(`${API}/detalii-business`, () => HttpResponse.json(mockDetails))
    )
    const result = await businessDetailsService.get()
    expect(result).toEqual(mockDetails)
    expect(Array.isArray(result)).toBe(true)
  })

  test('create calls POST /detalii-business', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/detalii-business`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 2, ...capturedBody })
      })
    )
    const result = await businessDetailsService.create({ name: 'Brutăria Nouă', phone: '0700000000' } as any)
    expect(result.id).toBe(2)
    expect(capturedBody).toEqual({ name: 'Brutăria Nouă', phone: '0700000000' })
  })

  test('update calls PUT /detalii-business/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/detalii-business/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, ...capturedBody })
      })
    )
    const result = await businessDetailsService.update(1, { name: 'Brutăria Actualizată' } as any)
    expect(result.id).toBe(1)
    expect(capturedBody).toEqual({ name: 'Brutăria Actualizată' })
  })

  test('delete calls DELETE /detalii-business/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/detalii-business/1`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await businessDetailsService.delete(1)
    expect(deleteCalled).toBe(true)
  })
})
