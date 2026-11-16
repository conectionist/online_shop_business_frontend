import { isChunkLoadError, loadPage, reloadOnce, RETRY_DELAY_MS } from '../chunkLoad'

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

const setOnline = (online: boolean) =>
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => online })

afterEach(() => {
  setOnline(true)
  vi.useRealTimers()
})

describe('reloadOnce', () => {
  test('reloads the first time', () => {
    expect(reloadOnce()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('does not reload again, however much later the next failure comes', () => {
    vi.useFakeTimers()
    reloadOnce()
    vi.advanceTimersByTime(30_000) // e.g. a slow auth check before the page renders
    expect(reloadOnce()).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('never reloads while offline', () => {
    setOnline(false)
    expect(reloadOnce()).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('loadPage', () => {
  test('returns the module when the import works', async () => {
    const module = { default: () => null }
    await expect(loadPage(() => Promise.resolve(module))).resolves.toBe(module)
    expect(reload).not.toHaveBeenCalled()
  })

  test('retries once and succeeds without reloading', async () => {
    vi.useFakeTimers()
    const module = { default: () => null }
    const loader = vi.fn().mockRejectedValueOnce(chunkError()).mockResolvedValueOnce(module)
    const result = loadPage(loader)
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
    await expect(result).resolves.toBe(module)
    expect(loader).toHaveBeenCalledTimes(2)
    expect(reload).not.toHaveBeenCalled()
  })

  test('reloads the page once when the retry also fails', async () => {
    vi.useFakeTimers()
    let settled = false
    loadPage(() => Promise.reject(chunkError())).then(() => { settled = true }, () => { settled = true })
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(settled).toBe(false)
  })

  test('a successful load allows a later recovery reload', async () => {
    vi.useFakeTimers()
    reloadOnce()
    await loadPage(() => Promise.resolve({ default: () => null }))
    const failing = loadPage(() => Promise.reject(chunkError()))
    failing.catch(() => {})
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
    expect(reload).toHaveBeenCalledTimes(2)
  })

  test('shows the error instead of reloading when offline', async () => {
    setOnline(false)
    const loader = vi.fn().mockRejectedValue(chunkError())
    await expect(loadPage(loader)).rejects.toThrow(/dynamically imported module/)
    expect(loader).toHaveBeenCalledTimes(1)
    expect(reload).not.toHaveBeenCalled()
  })

  test('rethrows when a reload already happened', async () => {
    vi.useFakeTimers()
    reloadOnce()
    const result = loadPage(() => Promise.reject(chunkError()))
    const check = expect(result).rejects.toThrow(/dynamically imported module/)
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
    await check
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('rethrows other errors without retrying or reloading', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('boom'))
    await expect(loadPage(loader)).rejects.toThrow('boom')
    expect(loader).toHaveBeenCalledTimes(1)
    expect(reload).not.toHaveBeenCalled()
  })
})
