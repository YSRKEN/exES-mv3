import { describe, it, expect } from 'vitest'
import { editONP } from '../src/content_scripts/use/edit_distance'

describe('editONP', () => {
  it('returns 1 for identical strings', () => {
    expect(editONP('abc', 'abc')).toBe(1)
  })

  it('reflects normalized similarity for kitten/sitting (insert-delete distance 5, len 7)', () => {
    expect(editONP('kitten', 'sitting')).toBeCloseTo(1 - 5 / 7, 10)
  })

  it('returns negative for completely different equal-length strings (insert-delete distance 6, len 3)', () => {
    expect(editONP('abc', 'xyz')).toBe(-1)
  })
})
