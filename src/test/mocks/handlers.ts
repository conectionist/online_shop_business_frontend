import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8001/api/v1'

// Test data factories
export const createTestBusinessDetails = () => ({
  id: 1,
  business_name: 'Test Bakery',
  adresa: 'Strada Test Nr. 123, București',
  numar_telefon: '+40123456789',
  email: 'contact@testbakery.ro',
  cui: 'RO12345678',
  numar_reg_com: 'J40/123/2024',
  reprezentant_legal: 'Ion Popescu',
  program: 'L-V: 09:00-18:00, S: 09:00-14:00',
  list_not_available_msg: 'Lista de produse nu a fost publicată încă. Vă rugăm să reveniți mai târziu.',
})

export const createTestCategories = () => [
  { id: 1, name: 'Pâine' },
  { id: 2, name: 'Produse de patiserie' },
  { id: 3, name: 'Cozonaci' },
]

export const createTestUnits = () => [
  { id: 1, denumire: 'bucată', abreviere: 'buc' },
  { id: 2, denumire: 'kilogram', abreviere: 'kg' },
  { id: 3, denumire: 'porție', abreviere: 'porț' },
]

export const createTestDeliverySchedules = () => [
  {
    id: 1,
    orar_livrari: 'Luni-Vineri: 10:00-18:00\nSâmbătă: 10:00-14:00',
  },
  {
    id: 2,
    orar_livrari: 'Doar weekend: 10:00-16:00',
  },
]

export const createTestPaymentMethods = () => [
  {
    id: 1,
    description: 'Numerar la livrare',
  },
  {
    id: 2,
    description: 'Card la livrare',
  },
  {
    id: 3,
    description: 'Transfer bancar',
  },
]

export const createTestDeliveryTypes = () => [
  {
    id: 1,
    denumire: 'Livrare la domiciliu',
    description: 'Livrăm direct la adresa dumneavoastră în intervalul orar selectat.',
  },
  {
    id: 2,
    denumire: 'Ridicare de la brutărie',
    description: 'Puteți ridica comanda direct de la brutăria noastră.',
  },
]

export const createTestProducts = () => [
  {
    id: 1,
    nume: 'Pâine albă',
    description: 'Pâine albă proaspătă, preparată zilnic din ingrediente naturale.',
    pret: 5.50,
    cantitate: 1,
    unitati_id: 1,
    category_id: 1,
    images: [{ id: 1, filename: 'paine-alba.jpg', is_primary: true }],
    stoc_produs: 50,
  },
  {
    id: 2,
    nume: 'Pâine neagră',
    description: 'Pâine neagră cu cereale integrale, bogată în fibre și minerale.',
    pret: 6.00,
    cantitate: 1,
    unitati_id: 1,
    category_id: 1,
    images: [{ id: 2, filename: 'paine-neagra.jpg', is_primary: true }],
    stoc_produs: 30,
  },
  {
    id: 3,
    nume: 'Croissant cu ciocolată',
    description: 'Croissant proaspăt cu ciocolată belgiană de calitate superioară.',
    pret: 8.50,
    cantitate: 1,
    unitati_id: 1,
    category_id: 2,
    images: [],
    stoc_produs: 20,
  },
  {
    id: 4,
    nume: 'Cozonac cu nucă',
    description: 'Cozonac tradițional românesc cu umplutură bogată de nucă. Perfect pentru zile speciale și sărbători. Rețetă tradițională transmisă din generație în generație.',
    pret: 35.00,
    cantitate: 1,
    unitati_id: 1,
    category_id: 3,
    images: [{ id: 4, filename: 'cozonac.jpg', is_primary: true }],
    stoc_produs: 0,
  },
]

export const createTestList = () => ({
  id: 101,
  data: '2025-01-01',
  is_current: true,
  is_published: true,
  is_deleted: false,
  orare_livrari_id: 1,
  mesaj_introducere: 'Bun venit la brutăria noastră!',
  alte_detalii: 'Toate produsele sunt proaspete și preparate zilnic.',
})

export const createTestListProductsOrdered = () => ({
  categories: [
    {
      id: 1,
      name: 'Pâine',
      products: [
        {
          id: 1,
          nume: 'Pâine albă',
          description: 'Pâine albă proaspătă, preparată zilnic din ingrediente naturale.',
          pret: 5.50,
          cantitate: 1,
          unitati_id: 1,
          category_id: 1,
          images: [{ id: 1, filename: 'paine-alba.jpg', is_primary: true }],
          stoc_produs: 50,
        },
        {
          id: 2,
          nume: 'Pâine neagră',
          description: 'Pâine neagră cu cereale integrale, bogată în fibre și minerale.',
          pret: 6.00,
          cantitate: 1,
          unitati_id: 1,
          category_id: 1,
          images: [{ id: 2, filename: 'paine-neagra.jpg', is_primary: true }],
          stoc_produs: 30,
        },
      ],
    },
    {
      id: 2,
      name: 'Produse de patiserie',
      products: [
        {
          id: 3,
          nume: 'Croissant cu ciocolată',
          description: 'Croissant proaspăt cu ciocolată belgiană de calitate superioară.',
          pret: 8.50,
          cantitate: 1,
          unitati_id: 1,
          category_id: 2,
          images: [],
          stoc_produs: 20,
        },
      ],
    },
    {
      id: 3,
      name: 'Cozonaci',
      products: [
        {
          id: 4,
          nume: 'Cozonac cu nucă',
          description: 'Cozonac tradițional românesc cu umplutură bogată de nucă. Perfect pentru zile speciale și sărbători. Rețetă tradițională transmisă din generație în generație.',
          pret: 35.00,
          cantitate: 1,
          unitati_id: 1,
          category_id: 3,
          images: [{ id: 4, filename: 'cozonac.jpg', is_primary: true }],
          stoc_produs: 0,
        },
      ],
    },
  ],
})

export const handlers = [
  // Business details
  http.get(`${API}/detalii-business`, () => {
    return HttpResponse.json([createTestBusinessDetails()])
  }),

  // Lists (published)
  http.get(`${API}/liste`, () => {
    return HttpResponse.json([createTestList()])
  }),

  // Categories
  http.get(`${API}/categorii`, () => {
    return HttpResponse.json(createTestCategories())
  }),

  // Units
  http.get(`${API}/unitati`, () => {
    return HttpResponse.json(createTestUnits())
  }),

  // Delivery schedules
  http.get(`${API}/orare-livrari`, () => {
    return HttpResponse.json(createTestDeliverySchedules())
  }),

  // Payment methods
  http.get(`${API}/metode-plata`, () => {
    return HttpResponse.json(createTestPaymentMethods())
  }),

  // List products ordered
  http.get(`${API}/liste/:listId/products/ordered`, ({ params }) => {
    const { listId } = params
    if (listId === '101') {
      return HttpResponse.json(createTestListProductsOrdered())
    }
    return HttpResponse.json({ categories: [] })
  }),

  // List delivery types
  http.get(`${API}/liste/:listId/delivery-types`, ({ params }) => {
    const { listId } = params
    if (listId === '101') {
      return HttpResponse.json(createTestDeliveryTypes())
    }
    return HttpResponse.json([])
  }),
]


