import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseSofmap } from '../src/content_scripts/use/scrape/sofmap'

// Fixture: JAN 4933032011415 = ゲーム（＝エロゲー）みたいな、ステキな恋がしたいっ！ (裸足少女, 2022)
// Source: https://a.sofmap.com/product_list_parts.aspx?styp=p_bar&keyword=4933032011415
// Fetched after adult-mode confirmation on 2026-07-04.
// Contains: 1 new listing (¥8,980) and 1 used_box entry (lowest used ¥3,480, 4 items).
const fixtureHtml = readFileSync(
  resolve(__dirname, 'fixtures/sofmap-4933032011415.html'),
  'utf-8'
)

const TEST_JAN = '4933032011415'

describe('parseSofmap', () => {
  it('returns at least one result for a JAN with matching products', () => {
    const result = parseSofmap(fixtureHtml, TEST_JAN)
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a new-price entry with the correct price', () => {
    const result = parseSofmap(fixtureHtml, TEST_JAN)
    const newEntry = result.find(r => r.title === 'Sofmap')
    expect(newEntry).toBeDefined()
    expect(newEntry!.price).toBe(8980)
  })

  it('sets priceURL for the new entry to the product_detail URL', () => {
    const result = parseSofmap(fixtureHtml, TEST_JAN)
    const newEntry = result.find(r => r.title === 'Sofmap')
    expect(newEntry!.priceURL).toContain('product_detail.aspx?sku=22703751')
  })

  it('returns a used-price entry with the lowest used price', () => {
    const result = parseSofmap(fixtureHtml, TEST_JAN)
    const usedEntry = result.find(r => r.title === 'Sofmap(中古)')
    expect(usedEntry).toBeDefined()
    expect(usedEntry!.price).toBe(3480)
  })

  it('sets priceURL for the used entry to the used-search URL', () => {
    const result = parseSofmap(fixtureHtml, TEST_JAN)
    const usedEntry = result.find(r => r.title === 'Sofmap(中古)')
    expect(usedEntry!.priceURL).toContain('new_jan=4933032011415')
  })

  it('sets titleURL to the JAN search URL for all entries', () => {
    const result = parseSofmap(fixtureHtml, TEST_JAN)
    result.forEach(entry => {
      expect(entry.titleURL).toContain(`keyword=${TEST_JAN}`)
    })
  })

  it('resolves relative used URLs to absolute a.sofmap.com URLs', () => {
    const result = parseSofmap(fixtureHtml, TEST_JAN)
    const usedEntry = result.find(r => r.title === 'Sofmap(中古)')
    expect(usedEntry!.priceURL).toMatch(/^https:\/\/a\.sofmap\.com\//)
  })

  it('returns [] for a page with no product cards', () => {
    const emptyHtml = '<html><body><ul id="change_style_list"></ul></body></html>'
    expect(parseSofmap(emptyHtml, TEST_JAN)).toEqual([])
  })

  it('returns [] for an empty HTML string', () => {
    expect(parseSofmap('', 'invalid')).toEqual([])
  })
})
