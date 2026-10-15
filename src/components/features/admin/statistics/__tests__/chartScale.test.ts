import { describe, test, expect } from 'vitest'
import { labelStep, niceTicks } from '../chartScale'

describe('niceTicks', () => {
  test('rounds to 1 / 2 / 5 steps (2,5 only scaled up) covering the maximum', () => {
    expect(niceTicks(6600)).toEqual([0, 2000, 4000, 6000, 8000])
    expect(niceTicks(98)).toEqual([0, 25, 50, 75, 100])
    expect(niceTicks(67)).toEqual([0, 20, 40, 60, 80])
    expect(niceTicks(12480)).toEqual([0, 5000, 10000, 15000])
  })

  test('keeps small charts on whole-number ticks', () => {
    expect(niceTicks(9)).toEqual([0, 5, 10])
    expect(niceTicks(10)).toEqual([0, 5, 10])
    expect(niceTicks(8)).toEqual([0, 2, 4, 6, 8])
  })

  test('never steps below 1 and handles an empty chart', () => {
    expect(niceTicks(3)).toEqual([0, 1, 2, 3])
    expect(niceTicks(1)).toEqual([0, 1])
    expect(niceTicks(0)).toEqual([0, 1])
  })
})

describe('labelStep', () => {
  test('prints at most the requested number of labels', () => {
    expect(labelStep(4, 6)).toBe(1)
    expect(labelStep(12, 6)).toBe(2)
    expect(labelStep(52, 12)).toBe(5)
  })
})
