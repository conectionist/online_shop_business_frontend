import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8001/api/v1'

export const handlers = [
  // Business details
  http.get(`${API}/detalii-business`, () => {
    return HttpResponse.json([
      {
        id: 1,
        business_name: 'Test Business',
        adresa: 'Test Address',
        numar_telefon: '+40123456789',
        email: 'test@example.com',
        cui: 'RO12345678',
        numar_reg_com: 'J40/123/2024',
        reprezentant_legal: 'Test Representative',
        program: 'L-V: 09:00-18:00',
      },
    ])
  }),

  // Lists (published)
  http.get(`${API}/liste`, () => {
    return HttpResponse.json([
      {
        id: 101,
        data: '2025-01-01',
        is_current: true,
        is_published: true,
        is_deleted: false,
        orare_livrari_id: 1,
        mesaj_introducere: 'Bun venit!',
        alte_detalii: '',
      },
    ])
  }),
]


