import { z } from 'zod'
import {
  phoneSchema,
  emailSchema,
  passwordSchema,
  productSchema,
  deliveryTypeSchema,
  listSchema,
  orderSchema,
  formatValidationErrors,
  validateFormData,
} from '@/utils/validation'

describe('phoneSchema', () => {
  test('accepts valid Romanian number "+40712345678"', () => {
    expect(phoneSchema.safeParse('+40712345678').success).toBe(true)
  })

  test('accepts number without prefix "0712345678"', () => {
    expect(phoneSchema.safeParse('0712345678').success).toBe(true)
  })

  test('accepts short international "+1234567"', () => {
    expect(phoneSchema.safeParse('+1234567').success).toBe(true)
  })

  test('rejects too-short number "12345"', () => {
    expect(phoneSchema.safeParse('12345').success).toBe(false)
  })

  test('rejects letters "abc123"', () => {
    expect(phoneSchema.safeParse('abc123').success).toBe(false)
  })

  test('rejects empty string', () => {
    expect(phoneSchema.safeParse('').success).toBe(false)
  })
})

describe('emailSchema', () => {
  test('accepts valid email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true)
  })

  test('rejects missing @ symbol', () => {
    expect(emailSchema.safeParse('userexample.com').success).toBe(false)
  })

  test('rejects missing domain', () => {
    expect(emailSchema.safeParse('user@').success).toBe(false)
  })
})

describe('passwordSchema', () => {
  test('accepts 8+ character password', () => {
    expect(passwordSchema.safeParse('12345678').success).toBe(true)
  })

  test('rejects 7-character password', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false)
  })
})

describe('productSchema', () => {
  const validProduct = {
    nume: 'Pâine',
    cantitate: 10,
    pret: 5.5,
    category_id: 1,
    unitati_id: 1,
  }

  test('validates complete product data', () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true)
  })

  test('rejects missing name', () => {
    expect(productSchema.safeParse({ ...validProduct, nume: '' }).success).toBe(false)
  })

  test('rejects negative price', () => {
    expect(productSchema.safeParse({ ...validProduct, pret: -1 }).success).toBe(false)
  })

  test('rejects missing category_id', () => {
    expect(productSchema.safeParse({ ...validProduct, category_id: 0 }).success).toBe(false)
  })

  test('rejects missing unitati_id', () => {
    expect(productSchema.safeParse({ ...validProduct, unitati_id: 0 }).success).toBe(false)
  })
})

describe('orderSchema', () => {
  const validOrder = {
    nume_client: 'Ion Popescu',
    data_plasarii: '2026-02-14',
    liste_id: 1,
    delivery_type_id: 1,
    payment_method_id: 1,
  }

  test('validates complete order data', () => {
    expect(orderSchema.safeParse(validOrder).success).toBe(true)
  })

  test('rejects missing customer name', () => {
    expect(orderSchema.safeParse({ ...validOrder, nume_client: '' }).success).toBe(false)
  })

  test('rejects missing list id', () => {
    expect(orderSchema.safeParse({ ...validOrder, liste_id: 0 }).success).toBe(false)
  })

  test('rejects missing delivery type', () => {
    expect(orderSchema.safeParse({ ...validOrder, delivery_type_id: 0 }).success).toBe(false)
  })

  test('rejects missing payment method', () => {
    expect(orderSchema.safeParse({ ...validOrder, payment_method_id: 0 }).success).toBe(false)
  })

  test('accepts optional empty phone', () => {
    expect(orderSchema.safeParse({ ...validOrder, phone_number: '' }).success).toBe(true)
  })

  test('accepts undefined phone', () => {
    expect(orderSchema.safeParse({ ...validOrder, phone_number: undefined }).success).toBe(true)
  })

  test('validates phone when provided', () => {
    expect(orderSchema.safeParse({ ...validOrder, phone_number: '+40712345678' }).success).toBe(true)
    expect(orderSchema.safeParse({ ...validOrder, phone_number: 'abc' }).success).toBe(false)
  })
})

describe('listSchema', () => {
  const validList = {
    data: '2026-02-14',
    is_current: true,
    orare_livrari_id: 1,
  }

  test('validates complete list data', () => {
    expect(listSchema.safeParse(validList).success).toBe(true)
  })

  test('rejects missing date', () => {
    expect(listSchema.safeParse({ ...validList, data: '' }).success).toBe(false)
  })

  test('rejects mesaj_introducere over 45 chars', () => {
    const result = listSchema.safeParse({
      ...validList,
      mesaj_introducere: 'a'.repeat(46),
    })
    expect(result.success).toBe(false)
  })

  test('rejects alte_detalii over 500 chars', () => {
    const result = listSchema.safeParse({
      ...validList,
      alte_detalii: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('deliveryTypeSchema', () => {
  const validDeliveryType = {
    denumire: 'Livrare la domiciliu',
    order_index: 1,
  }

  test('validates complete delivery type', () => {
    expect(deliveryTypeSchema.safeParse(validDeliveryType).success).toBe(true)
  })

  test('rejects empty denumire', () => {
    expect(deliveryTypeSchema.safeParse({ ...validDeliveryType, denumire: '' }).success).toBe(false)
  })

  test('rejects denumire over 100 chars', () => {
    expect(deliveryTypeSchema.safeParse({
      ...validDeliveryType,
      denumire: 'a'.repeat(101),
    }).success).toBe(false)
  })

  test('rejects order_index below 1', () => {
    expect(deliveryTypeSchema.safeParse({ ...validDeliveryType, order_index: 0 }).success).toBe(false)
  })

  test('rejects order_index above 127', () => {
    expect(deliveryTypeSchema.safeParse({ ...validDeliveryType, order_index: 128 }).success).toBe(false)
  })
})

describe('formatValidationErrors', () => {
  test('formats single field error', () => {
    const result = emailSchema.safeParse('invalid')
    if (!result.success) {
      const errors = formatValidationErrors(result.error)
      expect(errors['']).toBeDefined()
    }
  })

  test('formats multiple field errors', () => {
    const result = productSchema.safeParse({ nume: '', pret: -1, category_id: 0, unitati_id: 0, cantitate: -1 })
    if (!result.success) {
      const errors = formatValidationErrors(result.error)
      expect(Object.keys(errors).length).toBeGreaterThan(1)
    }
  })

  test('formats nested field paths with dot notation', () => {
    const nestedSchema = z.object({
      address: z.object({
        street: z.string().min(1, 'Street required'),
      }),
    })
    const result = nestedSchema.safeParse({ address: { street: '' } })
    if (!result.success) {
      const errors = formatValidationErrors(result.error)
      expect(errors['address.street']).toBeDefined()
    }
  })
})

describe('validateFormData', () => {
  test('returns success with valid data', () => {
    const result = validateFormData(emailSchema, 'user@example.com')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('user@example.com')
    }
  })

  test('returns errors with invalid data', () => {
    const result = validateFormData(emailSchema, 'invalid')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    }
  })
})
