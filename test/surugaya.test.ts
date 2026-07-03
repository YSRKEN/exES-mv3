import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseSurugaya } from '../src/content_scripts/use/scrape/surugaya'

// Fixture: JAN 4580264780031 = PS3ソフト 真剣で私に恋しなさい!R
// Fetched from https://www.suruga-ya.jp/search?category=&search_word=4580264780031&searchbox=1&is_marketplace=0
// Returns exactly 1 result (product/detail/103001471), price ¥1,990 (time-sale on 2026-07-04).
const fixtureHtml = readFileSync(resolve(__dirname, 'fixtures/surugaya-4580264780031.html'), 'utf-8')

const TEST_JAN = '4580264780031'

describe('parseSurugaya', () => {
  it('returns at least one result for a JAN with matching products', () => {
    const result = parseSurugaya(fixtureHtml, TEST_JAN)
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns the correct numeric price from price_teika span', () => {
    const result = parseSurugaya(fixtureHtml, TEST_JAN)
    // Fixture has a time-sale price of ¥1,990 in the strong tag inside price_teika
    expect(result[0].price).toBe(1990)
  })

  it('sets priceURL to the /product/detail/ URL', () => {
    const result = parseSurugaya(fixtureHtml, TEST_JAN)
    expect(result[0].priceURL).toContain('/product/detail/103001471')
  })

  it('sets titleURL to the JAN search URL', () => {
    const result = parseSurugaya(fixtureHtml, TEST_JAN)
    expect(result[0].titleURL).toContain('search_word=4580264780031')
  })

  it('labels used items as 駿河屋(中古)', () => {
    const result = parseSurugaya(fixtureHtml, TEST_JAN)
    // Fixture item_price shows 中古通常価格 in price_normal → used item
    expect(result[0].title).toBe('駿河屋(中古)')
  })

  it('returns [] for a page with no item cards', () => {
    const emptyHtml = '<html><body><p>0件</p></body></html>'
    const result = parseSurugaya(emptyHtml, '0000000000000')
    expect(result).toEqual([])
  })

  it('returns [] for an empty HTML string', () => {
    const result = parseSurugaya('', 'invalid')
    expect(result).toEqual([])
  })
})
