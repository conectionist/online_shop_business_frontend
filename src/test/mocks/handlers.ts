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
  {
    id: 5,
    nume: 'Franzela cu susan',
    description: 'Franzelă crocantă cu susan auriu, perfectă pentru micul dejun.',
    pret: 4.50,
    cantitate: 1,
    unitati_id: 1,
    category_id: 1,
    images: [
      { id: 5, filename: 'franzela-1.jpg', is_primary: true },
      { id: 6, filename: 'franzela-2.jpg', is_primary: false },
      { id: 7, filename: 'franzela-3.jpg', is_primary: false },
    ],
    stoc_produs: 25,
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
        {
          id: 5,
          nume: 'Franzela cu susan',
          description: 'Franzelă crocantă cu susan auriu, perfectă pentru micul dejun.',
          pret: 4.50,
          cantitate: 1,
          unitati_id: 1,
          category_id: 1,
          images: [
            { id: 5, filename: 'franzela-1.jpg', is_primary: true },
            { id: 6, filename: 'franzela-2.jpg', is_primary: false },
            { id: 7, filename: 'franzela-3.jpg', is_primary: false },
          ],
          stoc_produs: 25,
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

// Statistics fixtures (admin statistics page)
const createTestStatsSummary = (overrides: Record<string, number> = {}) => ({
  revenue: 12480,
  orders: 186,
  average_order_value: 67.1,
  items_sold: 540,
  unique_customers: 94,
  returning_customers: 67,
  repeat_customer_rate: 0.7128,
  cancelled_orders: 3,
  cancelled_rate: 0.0159,
  ...overrides,
})

const createTestStatsPeriod = () => ({
  start_date: '2026-09-24',
  end_date: '2026-10-15',
  list_count: 2,
  previous_start_date: '2026-08-27',
  previous_end_date: '2026-09-17',
  previous_list_count: 2,
})

export const createTestStatsOverview = () => ({
  period: createTestStatsPeriod(),
  summary: createTestStatsSummary(),
  previous_summary: createTestStatsSummary({ revenue: 11534, orders: 179 }),
  lists: [
    { list_id: 215, data: '2026-10-08', orders: 98, revenue: 6600, average_order_value: 67.35, customers: 90, new_customers: 6, returning_customers: 84 },
    { list_id: 216, data: '2026-10-15', orders: 88, revenue: 5880, average_order_value: 66.82, customers: 85, new_customers: 4, returning_customers: 81 },
  ],
  delivery_types: [
    { id: 1, name: 'Ridicare de la sediu', orders: 110, revenue: 7300 },
    { id: 3, name: 'Livrare la domiciliu', orders: 76, revenue: 5180 },
  ],
  payment_methods: [
    { id: 5, name: 'cash', orders: 120, revenue: 8000 },
    { id: 6, name: 'card', orders: 66, revenue: 4480 },
  ],
  heatmap: [
    { weekday: 2, hour: 19, orders: 14 },
    { weekday: 3, hour: 8, orders: 3 },
  ],
})

export const createTestProductStats = () => ({
  period: createTestStatsPeriod(),
  top_by_quantity: [
    { product_id: 13, name: 'Pâine de casă', category_name: 'Pâine', unit: 'buc', quantity: 120, revenue: 1440, orders: 80 },
    { product_id: 17, name: 'Cozonac cu nucă', category_name: 'Cozonaci', unit: 'buc', quantity: 40, revenue: 2400, orders: 35 },
  ],
  top_by_revenue: [
    { product_id: 17, name: 'Cozonac cu nucă', category_name: 'Cozonaci', unit: 'buc', quantity: 40, revenue: 2400, orders: 35 },
    { product_id: 13, name: 'Pâine de casă', category_name: 'Pâine', unit: 'buc', quantity: 120, revenue: 1440, orders: 80 },
  ],
  categories: [
    { category_id: 3, name: 'Cozonaci', quantity: 40, revenue: 2400 },
    { category_id: 1, name: 'Pâine', quantity: 120, revenue: 1440 },
  ],
  unsold_products: [{ product_id: 21, name: 'Biscuiți cu ovăz', category_name: 'Produse de patiserie', times_offered: 2 }],
  sell_outs: [{ product_id: 17, name: 'Cozonac cu nucă', category_name: 'Cozonaci', sold_out: 3, offered: 4 }],
})

export const createTestCustomerStats = () => ({
  period: createTestStatsPeriod(),
  top_customers: [
    { name: 'Elena Florea', phone_number: '0760456644', orders: 2, lists: 2, revenue: 410, last_order_date: '2026-10-13T16:38:00Z' },
  ],
  top_customers_by_orders: [
    { name: 'Elena Florea', phone_number: '0760456644', orders: 2, lists: 2, revenue: 410, last_order_date: '2026-10-13T16:38:00Z' },
  ],
})

export const createTestCurrentListStats = () => ({
  // Still taking orders whatever day the tests run
  list: {
    id: 216,
    data: '2026-10-15',
    expiration_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_published: true,
  },
  orders: 88,
  revenue: 5880,
  customers: 85,
  items_sold: 260,
  previous: { id: 215, data: '2026-10-08', orders: 98, revenue: 6600 },
  sold_out: [{ product_id: 17, name: 'Cozonac cu nucă', unit: 'buc', ordered: 20 }],
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

  // Individual product by ID
  http.get(`${API}/products/:id`, ({ params }) => {
    const { id } = params
    const products = createTestProducts()
    const product = products.find(p => p.id === parseInt(id as string))
    
    if (product) {
      return HttpResponse.json(product)
    }
    return new HttpResponse(null, { status: 404 })
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

  // Statistics (admin)
  http.get(`${API}/statistics/overview`, () => HttpResponse.json(createTestStatsOverview())),
  http.get(`${API}/statistics/products`, () => HttpResponse.json(createTestProductStats())),
  http.get(`${API}/statistics/customers`, () => HttpResponse.json(createTestCustomerStats())),
  http.get(`${API}/statistics/current-list`, () => HttpResponse.json(createTestCurrentListStats())),
]
