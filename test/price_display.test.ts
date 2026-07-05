import { describe, it, expect } from 'vitest'
import { convertPriceInfosToRowInfos } from '../src/content_scripts/use/utils'

describe('convertPriceInfosToRowInfos', () => {
  it('renders priceText in the price cell when present', () => {
    const rows = convertPriceInfosToRowInfos([
      { title: 'Steam', price: 1966, priceText: '¥ 3,278 → ¥ 1,966', priceURL: 'u' }
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0][0].text).toBe('Steam')
    expect(rows[0][1].text).toBe('¥ 3,278 → ¥ 1,966')
    expect(rows[0][1].url).toBe('u')
  })

  it('keeps a price:0 row when priceText is set (Steam free / unavailable)', () => {
    const rows = convertPriceInfosToRowInfos([
      { title: 'Steam', price: 0, priceText: '¥ 0' },
      { title: 'Steam', price: 0, priceText: '価格取得不可', priceURL: 's' }
    ])
    expect(rows).toHaveLength(2)
    expect(rows[0][1].text).toBe('¥ 0')
    expect(rows[1][1].text).toBe('価格取得不可')
  })

  it('still hides a price:0 row without priceText (other shops unchanged)', () => {
    const rows = convertPriceInfosToRowInfos([{ title: 'Getchu', price: 0 }])
    expect(rows).toHaveLength(0)
  })

  it('renders the numeric price when no priceText (existing behaviour)', () => {
    const rows = convertPriceInfosToRowInfos([{ title: 'dlsite', price: 8800, priceURL: 'd' }])
    expect(rows[0][1].text).toBe(8800)
  })
})
