import { vi } from 'vitest'
import axios from 'axios'

vi.mock('@/utils/appConfig', () => ({
  getApiBaseUrl: () => 'http://localhost:8001',
  getAppName: () => 'Test Shop',
}))

import {
  handleApiError,
  createFormData,
  createQueryParams,
  getImageUrl,
  getProductImageUrl,
  getCategoryImageUrl,
  getProductImageUrlFromImage,
  getLogoUrl,
} from '@/services/api'

// ─── handleApiError ──────────────────────────────────────────────

describe('handleApiError', () => {
  test('returns generic message for non-Axios errors', () => {
    const result = handleApiError(new Error('boom'))
    expect(result.detail).toBe('Something went wrong. Please try again.')
  })

  test('returns network error message for ERR_NETWORK', () => {
    const err = new axios.AxiosError('net', 'ERR_NETWORK')
    const result = handleApiError(err)
    expect(result.detail).toContain('temporarily unavailable')
  })

  test('returns network error message for ECONNREFUSED', () => {
    const err = new axios.AxiosError('refused', 'ECONNREFUSED')
    const result = handleApiError(err)
    expect(result.detail).toContain('temporarily unavailable')
  })

  test('returns timeout message for ECONNABORTED', () => {
    const err = new axios.AxiosError('timeout', 'ECONNABORTED')
    const result = handleApiError(err)
    expect(result.detail).toContain('taking longer than expected')
  })

  test('returns server error message for 500', () => {
    const err = new axios.AxiosError('server', undefined, undefined, undefined, {
      status: 500,
      data: {},
      headers: {},
      statusText: 'Internal Server Error',
      config: {} as any,
    })
    const result = handleApiError(err)
    expect(result.detail).toContain('Something went wrong on our end')
  })

  test('returns detail from 409 response', () => {
    const err = new axios.AxiosError('conflict', undefined, undefined, undefined, {
      status: 409,
      data: { detail: 'Duplicate name' },
      headers: {},
      statusText: 'Conflict',
      config: {} as any,
    })
    const result = handleApiError(err)
    expect(result.detail).toBe('Duplicate name')
  })

  test('returns default 409 message when no detail', () => {
    const err = new axios.AxiosError('conflict', undefined, undefined, undefined, {
      status: 409,
      data: {},
      headers: {},
      statusText: 'Conflict',
      config: {} as any,
    })
    const result = handleApiError(err)
    expect(result.detail).toContain('deja folosit')
  })

  test('returns detail from 422 response', () => {
    const err = new axios.AxiosError('validation', undefined, undefined, undefined, {
      status: 422,
      data: { detail: 'Invalid field' },
      headers: {},
      statusText: 'Unprocessable Entity',
      config: {} as any,
    })
    const result = handleApiError(err)
    expect(result.detail).toBe('Invalid field')
  })

  test('returns detail from 404 response', () => {
    const err = new axios.AxiosError('not found', undefined, undefined, undefined, {
      status: 404,
      data: { detail: 'Order not found' },
      headers: {},
      statusText: 'Not Found',
      config: {} as any,
    })
    const result = handleApiError(err)
    expect(result.detail).toBe('Order not found')
  })

  test('returns generic 4xx message for other client errors', () => {
    const err = new axios.AxiosError('forbidden', undefined, undefined, undefined, {
      status: 403,
      data: {},
      headers: {},
      statusText: 'Forbidden',
      config: {} as any,
    })
    const result = handleApiError(err)
    expect(result.detail).toBe('The request could not be completed.')
  })

  test('returns fallback for Axios error with no response and no code', () => {
    const err = new axios.AxiosError('unknown')
    const result = handleApiError(err)
    expect(result.detail).toBe('An unexpected error occurred. Please try again.')
  })
})

// ─── createFormData ──────────────────────────────────────────────

describe('createFormData', () => {
  test('appends string values', () => {
    const fd = createFormData({ name: 'Pâine' })
    expect(fd.get('name')).toBe('Pâine')
  })

  test('appends number values as strings', () => {
    const fd = createFormData({ price: 5.5 })
    expect(fd.get('price')).toBe('5.5')
  })

  test('appends boolean values as strings', () => {
    const fd = createFormData({ active: true })
    expect(fd.get('active')).toBe('true')
  })

  test('appends File instances', () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const fd = createFormData({ image: file })
    expect(fd.get('image')).toBe(file)
  })

  test('JSON-stringifies plain objects', () => {
    const obj = { nested: 'value' }
    const fd = createFormData({ meta: obj })
    expect(fd.get('meta')).toBe(JSON.stringify(obj))
  })

  test('skips null and undefined values', () => {
    const fd = createFormData({ a: null, b: undefined, c: 'keep' })
    expect(fd.get('a')).toBeNull()
    expect(fd.get('b')).toBeNull()
    expect(fd.get('c')).toBe('keep')
  })
})

// ─── createQueryParams ──────────────────────────────────────────

describe('createQueryParams', () => {
  test('builds query string from params', () => {
    const qs = createQueryParams({ search: 'bread', page: 1 })
    expect(qs).toContain('search=bread')
    expect(qs).toContain('page=1')
  })

  test('skips null and undefined params', () => {
    const qs = createQueryParams({ a: null, b: undefined, c: 'ok' })
    expect(qs).toBe('c=ok')
  })

  test('returns empty string for empty object', () => {
    expect(createQueryParams({})).toBe('')
  })

  test('URL-encodes special characters', () => {
    const qs = createQueryParams({ q: 'pâine & covrigi' })
    expect(qs).not.toContain('&')
    // The & should be encoded
    expect(qs).toContain('p')
  })
})

// ─── getImageUrl ─────────────────────────────────────────────────

describe('getImageUrl', () => {
  test('returns null for null input', () => {
    expect(getImageUrl(null)).toBeNull()
  })

  test('returns null for undefined input', () => {
    expect(getImageUrl(undefined)).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(getImageUrl('')).toBeNull()
  })

  test('returns full URL as-is (http)', () => {
    expect(getImageUrl('http://example.com/img.jpg')).toBe('http://example.com/img.jpg')
  })

  test('returns full URL as-is (https)', () => {
    expect(getImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg')
  })

  test('prepends base URL for paths starting with /', () => {
    expect(getImageUrl('/api/v1/static/img.jpg')).toBe('http://localhost:8001/api/v1/static/img.jpg')
  })

  test('constructs full static URL for plain filename', () => {
    expect(getImageUrl('photo.jpg')).toBe('http://localhost:8001/api/v1/static/photo.jpg')
  })
})

// ─── getProductImageUrl ──────────────────────────────────────────

describe('getProductImageUrl', () => {
  const BASE = 'http://localhost:8001'

  test('uses image_versions directly when available (absolute path)', () => {
    const product = { image_versions: { thumbnail: '/api/v1/static/uploads/thumb.jpg', medium: '', original: '' } }
    expect(getProductImageUrl(product)).toBe(`${BASE}/api/v1/static/uploads/thumb.jpg`)
  })

  test('uses image_versions directly (relative path)', () => {
    const product = { image_versions: { thumbnail: 'thumb.jpg', medium: '', original: '' } }
    expect(getProductImageUrl(product)).toBe(`${BASE}/api/v1/static/uploads/thumb.jpg`)
  })

  test('falls back to images array', () => {
    const product = {
      images: [{ image_versions: { thumbnail: '/api/v1/static/uploads/thumb.jpg', medium: '', original: '' } }],
    }
    expect(getProductImageUrl(product)).toBe(`${BASE}/api/v1/static/uploads/thumb.jpg`)
  })

  test('returns placeholder when no images', () => {
    expect(getProductImageUrl({})).toBe(`${BASE}/api/v1/static/placeholders/product_placeholder.jpg`)
  })

  test('returns placeholder when images array is empty', () => {
    expect(getProductImageUrl({ images: [] })).toBe(`${BASE}/api/v1/static/placeholders/product_placeholder.jpg`)
  })

  test('respects version parameter', () => {
    const product = {
      image_versions: {
        thumbnail: '/api/v1/static/uploads/thumb.jpg',
        medium: '/api/v1/static/uploads/medium.jpg',
        original: '/api/v1/static/uploads/original.jpg',
      },
    }
    expect(getProductImageUrl(product, 'original')).toBe(`${BASE}/api/v1/static/uploads/original.jpg`)
  })
})

// ─── getProductImageUrlFromImage ─────────────────────────────────

describe('getProductImageUrlFromImage', () => {
  const BASE = 'http://localhost:8001'

  test('returns placeholder for null image', () => {
    expect(getProductImageUrlFromImage(null)).toBe(`${BASE}/api/v1/static/placeholders/product_placeholder.jpg`)
  })

  test('returns placeholder for undefined image', () => {
    expect(getProductImageUrlFromImage(undefined)).toBe(`${BASE}/api/v1/static/placeholders/product_placeholder.jpg`)
  })

  test('returns URL for absolute path', () => {
    const image = { image_versions: { thumbnail: '/api/v1/static/uploads/t.jpg', medium: '', original: '' } }
    expect(getProductImageUrlFromImage(image)).toBe(`${BASE}/api/v1/static/uploads/t.jpg`)
  })

  test('returns URL for relative path', () => {
    const image = { image_versions: { thumbnail: 'rel.jpg', medium: '', original: '' } }
    expect(getProductImageUrlFromImage(image)).toBe(`${BASE}/api/v1/static/uploads/rel.jpg`)
  })
})

// ─── getCategoryImageUrl ─────────────────────────────────────────

describe('getCategoryImageUrl', () => {
  const BASE = 'http://localhost:8001'

  test('returns placeholder when no image_versions', () => {
    expect(getCategoryImageUrl({})).toBe(`${BASE}/api/v1/static/placeholders/category_placeholder.jpg`)
  })

  test('returns URL for absolute path', () => {
    const category = { image_versions: { thumbnail: '/api/v1/static/uploads/cat.jpg', medium: '', original: '' } }
    expect(getCategoryImageUrl(category)).toBe(`${BASE}/api/v1/static/uploads/cat.jpg`)
  })

  test('returns URL for relative path', () => {
    const category = { image_versions: { thumbnail: 'cat.jpg', medium: '', original: '' } }
    expect(getCategoryImageUrl(category)).toBe(`${BASE}/api/v1/static/uploads/cat.jpg`)
  })

  test('respects version parameter', () => {
    const category = {
      image_versions: {
        thumbnail: '/api/v1/static/uploads/t.jpg',
        medium: '/api/v1/static/uploads/m.jpg',
        original: '/api/v1/static/uploads/o.jpg',
      },
    }
    expect(getCategoryImageUrl(category, 'original')).toBe(`${BASE}/api/v1/static/uploads/o.jpg`)
  })
})

// ─── getLogoUrl ──────────────────────────────────────────────────

describe('getLogoUrl', () => {
  test('returns default logo for null', () => {
    expect(getLogoUrl(null)).toBe('/test/test_data/logo.jpg')
  })

  test('returns default logo for undefined', () => {
    expect(getLogoUrl(undefined)).toBe('/test/test_data/logo.jpg')
  })

  test('returns full URL as-is', () => {
    expect(getLogoUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png')
  })

  test('returns path starting with / as-is', () => {
    expect(getLogoUrl('/custom/logo.png')).toBe('/custom/logo.png')
  })

  test('prepends / for relative path', () => {
    expect(getLogoUrl('logo.png')).toBe('/logo.png')
  })
})
