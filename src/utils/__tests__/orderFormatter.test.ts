import { formatOrderText } from '@/utils/orderFormatter'
import type { OrderConfirmationData, OrderFormatterConfig } from '@/utils/orderFormatter'
import type { OrderRead, DeliveryType, BusinessDetails } from '@/types/api'

// ─── Fixtures ────────────────────────────────────────────────────

const pickupType: DeliveryType = { id: 1, denumire: 'Ridicare din magazin', order_index: 1 }
const deliveryType: DeliveryType = { id: 2, denumire: 'Livrare la domiciliu', order_index: 2 }

const businessDetails: BusinessDetails = {
  id: 1,
  delivery_tax: 10,
}

const confirmationOrder: OrderConfirmationData = {
  prenume: 'Ion',
  nume: 'Popescu',
  phone_number: '+40712345678',
  items: [
    { quantity: 2, nume: 'Pâine', pret: 5 },
    { quantity: 1, nume: 'Covrigi', pret: 3 },
  ],
  subtotal: 13,
  delivery_tax: 10,
  total: 23,
  paymentMethod: { name: 'Cash' },
  deliveryType: deliveryType,
  address: 'Str. Pâinii 42',
  observatii: 'Fără semințe',
}

const orderRead: OrderRead = {
  id: 1,
  nume_client: 'Ion Popescu',
  data_plasarii: '2026-02-14',
  liste_id: 1,
  delivery_type_id: 2,
  payment_method_id: 1,
  delivery_address: 'Str. Pâinii 42',
  order_notes: 'Fără semințe',
  phone_number: '+40712345678',
  created_at: '2026-02-14T10:00:00Z',
  updated_at: '2026-02-14T10:00:00Z',
  items: [
    { comenzi_id: 1, produse_id: 10, pret_produs: 5, cantitate_produs: 2, unitati_id: 1 },
    { comenzi_id: 1, produse_id: 20, pret_produs: 3, cantitate_produs: 1, unitati_id: 1 },
  ],
}

const productMap: Record<number, string> = { 10: 'Pâine', 20: 'Covrigi' }

const orderReadConfig: OrderFormatterConfig = {
  getProductName: (id) => productMap[id] || `Produs #${id}`,
  getPaymentMethodName: () => 'Cash',
  deliveryTypes: [pickupType, deliveryType],
  businessDetails,
}

// ─── OrderConfirmationData path ──────────────────────────────────

describe('formatOrderText — OrderConfirmationData', () => {
  test('includes customer full name', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('Ion Popescu')
  })

  test('includes item lines with quantity, name, and line total', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('2 x Pâine (10 RON)')
    expect(text).toContain('1 x Covrigi (3 RON)')
  })

  test('includes separator by default', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('=======================')
  })

  test('omits separator when includeSeparator is false', () => {
    const text = formatOrderText(confirmationOrder, { includeSeparator: false })
    expect(text).not.toContain('=======================')
  })

  test('shows subtotal and delivery tax when tax > 0', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('Subtotal: 13 RON')
    expect(text).toContain('Taxă livrare: 10 RON')
  })

  test('omits subtotal/tax lines when delivery_tax is 0', () => {
    const order = { ...confirmationOrder, delivery_tax: 0, total: 13 }
    const text = formatOrderText(order)
    expect(text).not.toContain('Subtotal:')
    expect(text).not.toContain('Taxă livrare:')
    expect(text).toContain('Total: 13 RON')
  })

  test('includes total', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('Total: 23 RON')
  })

  test('includes payment method (lowercase)', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('Plata cash.')
  })

  test('includes delivery address when delivery requires address', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('Livrare la adresa: Str. Pâinii 42')
  })

  test('shows delivery type name when no address required', () => {
    const order = { ...confirmationOrder, deliveryType: pickupType, address: undefined }
    const text = formatOrderText(order)
    expect(text).toContain('Ridicare din magazin.')
    expect(text).not.toContain('Livrare la adresa:')
  })

  test('includes phone number', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('Telefon: +40712345678')
  })

  test('includes observații', () => {
    const text = formatOrderText(confirmationOrder)
    expect(text).toContain('Observații: Fără semințe')
  })

  test('appends footer text', () => {
    const text = formatOrderText(confirmationOrder, { appendFooterText: '--- Mulțumim!' })
    expect(text).toContain('--- Mulțumim!')
  })

  test('appends list date in Romanian format', () => {
    const text = formatOrderText(confirmationOrder, { listDate: '2026-02-14' })
    // Should contain Romanian formatted date
    expect(text).toMatch(/14 februarie 2026|14\.02\.2026/)
  })

  test('omits phone if not provided', () => {
    const order = { ...confirmationOrder, phone_number: undefined }
    const text = formatOrderText(order)
    expect(text).not.toContain('Telefon:')
  })

  test('omits observații if not provided', () => {
    const order = { ...confirmationOrder, observatii: undefined }
    const text = formatOrderText(order)
    expect(text).not.toContain('Observații:')
  })
})

// ─── OrderRead path ──────────────────────────────────────────────

describe('formatOrderText — OrderRead', () => {
  test('includes customer name from nume_client', () => {
    const text = formatOrderText(orderRead, orderReadConfig)
    expect(text).toContain('Ion Popescu')
  })

  test('uses getProductName callback for item names', () => {
    const text = formatOrderText(orderRead, orderReadConfig)
    expect(text).toContain('2 x Pâine (10 RON)')
    expect(text).toContain('1 x Covrigi (3 RON)')
  })

  test('falls back to "Produs #id" without getProductName', () => {
    const text = formatOrderText(orderRead, { ...orderReadConfig, getProductName: undefined })
    expect(text).toContain('Produs #10')
    expect(text).toContain('Produs #20')
  })

  test('calculates subtotal from items', () => {
    const text = formatOrderText(orderRead, orderReadConfig)
    // subtotal = 2*5 + 1*3 = 13, delivery_tax = 10 (livrare type + businessDetails)
    expect(text).toContain('Subtotal: 13 RON')
  })

  test('includes delivery tax when delivery type requires address', () => {
    const text = formatOrderText(orderRead, orderReadConfig)
    expect(text).toContain('Taxă livrare: 10 RON')
    expect(text).toContain('Total: 23 RON')
  })

  test('no delivery tax for pickup type', () => {
    const pickupOrder = { ...orderRead, delivery_type_id: 1 }
    const text = formatOrderText(pickupOrder, orderReadConfig)
    expect(text).not.toContain('Taxă livrare:')
    expect(text).toContain('Total: 13 RON')
  })

  test('includes payment method via callback', () => {
    const text = formatOrderText(orderRead, orderReadConfig)
    expect(text).toContain('Plata cash.')
  })

  test('includes delivery address for delivery type', () => {
    const text = formatOrderText(orderRead, orderReadConfig)
    expect(text).toContain('Livrare la adresa: Str. Pâinii 42')
  })

  test('shows delivery type name for pickup', () => {
    const pickupOrder = { ...orderRead, delivery_type_id: 1, delivery_address: undefined }
    const text = formatOrderText(pickupOrder, orderReadConfig)
    expect(text).toContain('Ridicare din magazin.')
  })

  test('includes phone and notes', () => {
    const text = formatOrderText(orderRead, orderReadConfig)
    expect(text).toContain('Telefon: +40712345678')
    expect(text).toContain('Observații: Fără semințe')
  })
})
