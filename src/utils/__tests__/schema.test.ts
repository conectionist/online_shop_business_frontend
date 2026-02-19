import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateProductSchema,
  generateOrganizationSchema,
  generateMainPageSchema,
  injectSchemaMarkup,
  removeSchemaMarkup,
} from '@/utils/schema'

vi.mock('@/services/api', () => ({
  getProductImageUrl: vi.fn(() => 'http://localhost:3000/images/test.jpg'),
}))

const mockProduct = {
  id: 1,
  nume: 'Pâine albă',
  pret: 5.5,
  cantitate: 10,
  description: 'Pâine proaspătă din aluat dospit',
  category_id: 1,
  unitati_id: 1,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  is_deleted: false,
  images: [],
  image_versions: { original: '', medium: '', thumbnail: '' },
} as any

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  // Clean up any injected script tags
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove())
})

// --- generateProductSchema ---

describe('generateProductSchema', () => {
  test('returns object with @context and @type "Product"', () => {
    const schema = generateProductSchema(mockProduct, 'Pâine', 'bucată')
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Product')
  })

  test('uses product.nume as name', () => {
    const schema = generateProductSchema(mockProduct, 'Pâine', 'bucată')
    expect(schema.name).toBe('Pâine albă')
  })

  test('uses product.description when present', () => {
    const schema = generateProductSchema(mockProduct, 'Pâine', 'bucată')
    expect(schema.description).toBe('Pâine proaspătă din aluat dospit')
  })

  test('falls back to generated description when description is missing', () => {
    const noDesc = { ...mockProduct, description: undefined }
    const schema = generateProductSchema(noDesc, 'Pâine', 'bucată')
    expect(schema.description).toContain('Pâine albă')
  })

  test('includes offers with price, currency "RON", and product URL', () => {
    const schema = generateProductSchema(mockProduct, 'Pâine', 'bucată')
    expect(schema.offers.price).toBe(5.5)
    expect(schema.offers.priceCurrency).toBe('RON')
    expect(schema.offers.url).toContain('/product/1')
  })

  test('includes additionalProperty with unit name and quantity', () => {
    const schema = generateProductSchema(mockProduct, 'Pâine', 'bucată')
    const unitProp = schema.additionalProperty.find((p: any) => p.name === 'unit')
    const qtyProp = schema.additionalProperty.find((p: any) => p.name === 'quantity')
    expect(unitProp!.value).toBe('bucată')
    expect(qtyProp!.value).toBe(10)
  })
})

// --- generateOrganizationSchema ---

describe('generateOrganizationSchema', () => {
  test('returns object with @context and @type "Organization"', () => {
    const schema = generateOrganizationSchema()
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Organization')
  })

  test('includes logo URL when businessDetails.logo_path is provided', () => {
    const schema = generateOrganizationSchema({ logo_path: '/uploads/logo.png' })
    expect(schema.logo).toContain('/uploads/logo.png')
  })

  test('omits logo when businessDetails has no logo_path', () => {
    const schema = generateOrganizationSchema({})
    expect(schema.logo).toBeUndefined()
  })

  test('includes contactPoint when businessDetails.telefon is provided', () => {
    const schema = generateOrganizationSchema({ telefon: '0712345678' })
    expect(schema.contactPoint).toBeDefined()
    expect(schema.contactPoint!.telephone).toBe('0712345678')
    expect(schema.contactPoint!.contactType).toBe('customer service')
  })

  test('omits contactPoint when no telefon', () => {
    const schema = generateOrganizationSchema()
    expect(schema.contactPoint).toBeUndefined()
  })
})

// --- generateMainPageSchema ---

describe('generateMainPageSchema', () => {
  test('returns object with @type "WebPage"', () => {
    const schema = generateMainPageSchema()
    expect(schema['@type']).toBe('WebPage')
  })

  test('includes publisher as organization schema', () => {
    const schema = generateMainPageSchema({ logo_path: '/logo.png' })
    expect(schema.publisher['@type']).toBe('Organization')
    expect(schema.publisher.logo).toContain('/logo.png')
  })
})

// --- injectSchemaMarkup ---

describe('injectSchemaMarkup', () => {
  test('adds script[type=application/ld+json] to document.head', () => {
    injectSchemaMarkup({ '@type': 'Test' })
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    expect(JSON.parse(script!.textContent!)).toEqual({ '@type': 'Test' })
  })

  test('sets data-schema-id attribute when id is provided', () => {
    injectSchemaMarkup({ '@type': 'Test' }, 'product-1')
    const script = document.querySelector('script[data-schema-id="product-1"]')
    expect(script).not.toBeNull()
  })

  test('replaces existing script with same data-schema-id', () => {
    injectSchemaMarkup({ '@type': 'Old' }, 'my-id')
    injectSchemaMarkup({ '@type': 'New' }, 'my-id')

    const scripts = document.querySelectorAll('script[data-schema-id="my-id"]')
    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0].textContent!)).toEqual({ '@type': 'New' })
  })

  test('warns and returns early for invalid schema (null)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    injectSchemaMarkup(null)
    expect(warnSpy).toHaveBeenCalled()
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
  })
})

// --- removeSchemaMarkup ---

describe('removeSchemaMarkup', () => {
  test('removes script by data-schema-id', () => {
    injectSchemaMarkup({ '@type': 'Test' }, 'remove-me')
    expect(document.querySelector('script[data-schema-id="remove-me"]')).not.toBeNull()

    removeSchemaMarkup('remove-me')
    expect(document.querySelector('script[data-schema-id="remove-me"]')).toBeNull()
  })

  test('removes first generic ld+json script when no id', () => {
    injectSchemaMarkup({ '@type': 'Generic' })
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeNull()

    removeSchemaMarkup()
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
  })

  test('no-ops when no matching script exists', () => {
    // Should not throw
    removeSchemaMarkup('nonexistent')
    removeSchemaMarkup()
  })
})
