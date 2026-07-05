import { describe, it, expect } from 'vitest'
import { parseSteam } from '../src/content_scripts/use/scrape/steam'

const discounted = JSON.stringify({
  '2536840': { success: true, data: { is_free: false, price_overview: {
    currency: 'JPY', initial: 327800, final: 196600, discount_percent: 40,
    initial_formatted: '¥ 3,278', final_formatted: '¥ 1,966'
  } } }
})
const noDiscount = JSON.stringify({
  '1637320': { success: true, data: { is_free: false, price_overview: {
    currency: 'JPY', initial: 200000, final: 200000, discount_percent: 0,
    initial_formatted: '¥ 2,000', final_formatted: '¥ 2,000'
  } } }
})
const free = JSON.stringify({ '570': { success: true, data: { is_free: true } } })
const regionLocked = JSON.stringify({ '2325740': { success: true, data: { is_free: false, name: 'Minidwellers' } } })
const notFound = JSON.stringify({ '999999999': { success: false } })

describe('parseSteam', () => {
  it('① discounted: shows original → sale as bare integers', () => {
    const r = parseSteam(discounted, '2536840')!
    expect(r.title).toBe('Steam')
    expect(r.price).toBe(1966)
    expect(r.priceText).toBe('3278 → 1966')
    expect(r.priceURL).toBe('https://store.steampowered.com/app/2536840/')
  })

  it('① no discount: bare numeric price, no priceText', () => {
    const r = parseSteam(noDiscount, '1637320')!
    expect(r.price).toBe(2000)
    expect(r.priceText).toBeUndefined()
  })

  it('③ free game: price 0 with 無料', () => {
    const r = parseSteam(free, '570')!
    expect(r.price).toBe(0)
    expect(r.priceText).toBe('無料')
    expect(r.priceURL).toBe('https://store.steampowered.com/app/570/')
  })

  it('② region-locked (no price, not free): 価格取得不可 with store link', () => {
    const r = parseSteam(regionLocked, '2325740')!
    expect(r.price).toBe(0)
    expect(r.priceText).toBe('価格取得不可')
    expect(r.priceURL).toBe('https://store.steampowered.com/app/2325740/')
  })

  it('② success:false: 価格取得不可', () => {
    const r = parseSteam(notFound, '999999999')!
    expect(r.priceText).toBe('価格取得不可')
  })

  it('returns null when the app id is absent from the response', () => {
    expect(parseSteam(JSON.stringify({}), '2536840')).toBeNull()
  })
})
