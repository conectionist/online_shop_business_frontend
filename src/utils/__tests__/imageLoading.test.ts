import { gridColumnsOnScreen, HERO_IMAGE_LOADING, listImageLoading } from '../imageLoading'

describe('listImageLoading', () => {
  test('first image loads right away at high priority', () => {
    expect(listImageLoading(0)).toEqual({ loading: 'eager', fetchPriority: 'high' })
  })

  test('the rest of the first row loads right away at default priority', () => {
    expect(listImageLoading(1, { eagerCount: 3 })).toEqual({ loading: 'eager' })
    expect(listImageLoading(2, { eagerCount: 3 })).toEqual({ loading: 'eager' })
  })

  test('later images load lazily', () => {
    expect(listImageLoading(1)).toEqual({ loading: 'lazy' })
    expect(listImageLoading(3, { eagerCount: 3 })).toEqual({ loading: 'lazy' })
  })

  test('high priority can be turned off when the page has a hero image', () => {
    expect(listImageLoading(0, { highPriority: false })).toEqual({ loading: 'eager' })
  })

  test('counts from the first entry that has an image', () => {
    // Entry 0 has no image, so entry 1 is the first one shown
    expect(listImageLoading(1, { firstImageIndex: 1 })).toEqual({ loading: 'eager', fetchPriority: 'high' })
    expect(listImageLoading(2, { firstImageIndex: 1 })).toEqual({ loading: 'lazy' })
  })

  test('no entry with an image (index -1) behaves like counting from 0', () => {
    expect(listImageLoading(0, { firstImageIndex: -1 })).toEqual({ loading: 'eager', fetchPriority: 'high' })
  })
})

describe('HERO_IMAGE_LOADING', () => {
  test('loads right away at high priority', () => {
    expect(HERO_IMAGE_LOADING).toEqual({ loading: 'eager', fetchPriority: 'high' })
  })
})

describe('gridColumnsOnScreen', () => {
  const original = window.matchMedia
  afterEach(() => {
    window.matchMedia = original
  })

  const mockWidth = (width: number) => {
    window.matchMedia = ((query: string) => ({
      matches: width >= Number(/min-width: (\d+)px/.exec(query)?.[1] ?? 0),
    })) as unknown as typeof window.matchMedia
  }

  test.each([
    [375, 1],
    [640, 2],
    [1024, 3],
  ])('%ipx wide -> %i columns', (width, columns) => {
    mockWidth(width)
    expect(gridColumnsOnScreen()).toBe(columns)
  })

  test('defaults to 1 without matchMedia', () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia
    expect(gridColumnsOnScreen()).toBe(1)
  })
})
