import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { sessionService } from '../sessionService'

const API = 'http://localhost:8001/api/v1'

describe('sessionService', () => {
  test('getSessions calls GET /auth/sessions and unwraps .sessions', async () => {
    const mockSessions = [
      { id: 1, ip_address: '192.168.1.1', is_current: true },
      { id: 2, ip_address: '10.0.0.1', is_current: false },
    ]
    server.use(
      http.get(`${API}/auth/sessions`, () => {
        return HttpResponse.json({ sessions: mockSessions })
      })
    )
    const result = await sessionService.getSessions()
    expect(result).toEqual(mockSessions)
    expect(result).toHaveLength(2)
  })

  test('getCurrentSession calls GET /auth/sessions/current', async () => {
    const mockSession = { id: 1, ip_address: '192.168.1.1', is_current: true }
    server.use(
      http.get(`${API}/auth/sessions/current`, () => HttpResponse.json(mockSession))
    )
    const result = await sessionService.getCurrentSession()
    expect(result).toEqual(mockSession)
  })

  test('getSession calls GET /auth/sessions/:id', async () => {
    const mockSession = { id: 5, ip_address: '10.0.0.5', is_current: false }
    server.use(
      http.get(`${API}/auth/sessions/5`, () => HttpResponse.json(mockSession))
    )
    const result = await sessionService.getSession(5)
    expect(result).toEqual(mockSession)
  })

  test('revokeSession calls DELETE /auth/sessions/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/auth/sessions/3`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await sessionService.revokeSession(3)
    expect(deleteCalled).toBe(true)
  })
})
