import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { unitService } from '../units'

const API = 'http://localhost:8001/api/v1'

describe('unitService', () => {
  test('getUnits calls GET /unitati', async () => {
    const mockUnits = [{ id: 1, denumire: 'kg' }, { id: 2, denumire: 'buc' }]
    server.use(
      http.get(`${API}/unitati`, () => HttpResponse.json(mockUnits))
    )
    const result = await unitService.getUnits()
    expect(result).toEqual(mockUnits)
  })

  test('getUnits appends search/limit/offset params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/unitati`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await unitService.getUnits({ search: 'kg', limit: 10, offset: 5 })
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('search')).toBe('kg')
    expect(url.searchParams.get('limit')).toBe('10')
    expect(url.searchParams.get('offset')).toBe('5')
  })

  test('getUnit calls GET /unitati/:id', async () => {
    const mockUnit = { id: 3, denumire: 'litru' }
    server.use(
      http.get(`${API}/unitati/3`, () => HttpResponse.json(mockUnit))
    )
    const result = await unitService.getUnit(3)
    expect(result).toEqual(mockUnit)
  })

  test('createUnit calls POST /unitati with body', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/unitati`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 4, denumire: 'gram' })
      })
    )
    const result = await unitService.createUnit({ denumire: 'gram' })
    expect(result.id).toBe(4)
    expect(capturedBody).toEqual({ denumire: 'gram' })
  })

  test('updateUnit calls PUT /unitati/:id with full body', async () => {
    let capturedBody: any = null
    server.use(
      http.put(`${API}/unitati/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, denumire: 'kilogram' })
      })
    )
    const result = await unitService.updateUnit(1, { denumire: 'kilogram' })
    expect(result.id).toBe(1)
    expect(result.denumire).toBe('kilogram')
    expect(capturedBody).toEqual({ denumire: 'kilogram' })
  })

  test('patchUnit calls PATCH /unitati/:id with partial body', async () => {
    let capturedBody: any = null
    server.use(
      http.patch(`${API}/unitati/2`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 2, denumire: 'bucata' })
      })
    )
    const result = await unitService.patchUnit(2, { denumire: 'bucata' })
    expect(result.id).toBe(2)
    expect(capturedBody).toEqual({ denumire: 'bucata' })
  })

  test('deleteUnit calls DELETE /unitati/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`${API}/unitati/5`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    await unitService.deleteUnit(5)
    expect(deleteCalled).toBe(true)
  })
})
