import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { deliveryScheduleService } from '../deliverySchedules'

const API = 'http://localhost:8001/api/v1'

describe('deliveryScheduleService', () => {
  test('getAll calls GET /orare-livrari', async () => {
    const mockSchedules = [{ id: 1, day: 'Luni' }, { id: 2, day: 'Marți' }]
    server.use(
      http.get(`${API}/orare-livrari`, () => HttpResponse.json(mockSchedules))
    )
    const result = await deliveryScheduleService.getAll()
    expect(result).toEqual(mockSchedules)
  })

  test('getById calls GET /orare-livrari/:id', async () => {
    const mockSchedule = { id: 1, day: 'Luni' }
    server.use(
      http.get(`${API}/orare-livrari/1`, () => HttpResponse.json(mockSchedule))
    )
    const result = await deliveryScheduleService.getById(1)
    expect(result).toEqual(mockSchedule)
  })

  test('create calls POST /orare-livrari with body', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/orare-livrari`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 3, ...capturedBody })
      })
    )
    const data = { day: 'Miercuri', time_start: '08:00', time_end: '12:00' } as any
    const result = await deliveryScheduleService.create(data)
    expect(result.id).toBe(3)
    expect(capturedBody).toEqual(data)
  })

  test('update calls PUT /orare-livrari/:id', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/orare-livrari/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, ...capturedBody })
      })
    )
    const data = { day: 'Luni', time_start: '09:00', time_end: '17:00' } as any
    const result = await deliveryScheduleService.update(1, data)
    expect(result.id).toBe(1)
    expect(capturedBody).toEqual(data)
  })

  test('delete calls DELETE /orare-livrari/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/orare-livrari/1`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await deliveryScheduleService.delete(1)
    expect(deleteCalled).toBe(true)
  })
})
