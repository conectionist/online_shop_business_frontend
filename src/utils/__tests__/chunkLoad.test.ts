import { isChunkLoadError, loadPage, reloadOnce } from '../chunkLoad'

const chunkError = () => new TypeError('Failed to fetch dynamically imported module: /assets/CartPage-abc.js')

let reload: ReturnType<typeof vi.fn>
const originalLocation = window.location

beforeEach(() => {
  sessionStorage.clear()
  reload = vi.fn()
  Object.defineProperty(window, 'location', { configurable: true, value: { ...originalLocation, reload } })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
})

describe('isChunkLoadError', () => {
  test.each([
    'Failed to fetch dynamically imported module: /assets/x.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
    'Unable to preload CSS for /assets/x.css',
  ])('recognises "%s"', (message) => {
    expect(isChunkLoadError(new Error(message))).toBe(true)
  })

  test('ignores other errors', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isChunkLoadError('not an error')).toBe(false)
  })
})

describe('reloadOnce', () => {
  test('reloads the first time', () => {
    expect(reloadOnce()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('does not reload again within a few seconds', () => {
    reloadOnce()
    expect(reloadOnce()).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })
})

describe('loadPage', () => {
  test('returns the module when the import works', async () => {
    const module = { default: () => null }
    await expect(loadPage(() => Promise.resolve(module))).resolves.toBe(module)
    expect(reload).not.toHaveBeenCalled()
  })

  test('reloads the page once on a chunk load error', async () => {
    let settled = false
    loadPage(() => Promise.reject(chunkError())).then(() => { settled = true }, () => { settled = true })
    await new Promise((r) => setTimeout(r, 0))
    expect(reload).toHaveBeenCalledTimes(1)
    expect(settled).toBe(false)
  })

  test('rethrows when a reload just happened', async () => {
    reloadOnce()
    await expect(loadPage(() => Promise.reject(chunkError()))).rejects.toThrow(/dynamically imported module/)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('rethrows other errors without reloading', async () => {
    await expect(loadPage(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
    expect(reload).not.toHaveBeenCalled()
  })
})
