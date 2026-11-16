import { listImageLoading } from '../imageLoading'

describe('listImageLoading', () => {
  test('first image loads right away at high priority', () => {
    expect(listImageLoading(0)).toEqual({ loading: 'eager', fetchPriority: 'high' })
  })

  test('the rest of the first row loads right away at normal priority', () => {
    expect(listImageLoading(1, 3)).toEqual({ loading: 'eager', fetchPriority: 'auto' })
    expect(listImageLoading(2, 3)).toEqual({ loading: 'eager', fetchPriority: 'auto' })
  })

  test('later images load lazily', () => {
    expect(listImageLoading(1)).toEqual({ loading: 'lazy' })
    expect(listImageLoading(3, 3)).toEqual({ loading: 'lazy' })
  })
})
