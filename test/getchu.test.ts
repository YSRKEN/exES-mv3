import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseGetchu } from '../src/content_scripts/use/scrape/getchu'

const html = readFileSync(resolve(__dirname, 'fixtures/getchu-item-1092994.html'), 'utf-8')

describe('parseGetchu', () => {
  it('extracts JAN code 4560431864351 from item page', () => {
    const result = parseGetchu(html, '1092994')
    expect(result.janCode).toBe('4560431864351')
  })

  it('returns a numeric price (0 for discontinued products)', () => {
    const result = parseGetchu(html, '1092994')
    expect(typeof result.getchu.price).toBe('number')
  })

  it('sets priceURL to the item URL', () => {
    const result = parseGetchu(html, '1092994')
    expect(result.getchu.priceURL).toBe('https://www.getchu.com/item/1092994/')
  })

  it('returns empty janCode without throwing when JAN row is absent', () => {
    const noJanHtml = '<html><body><table id="soft_table"><tr><td>nothing here</td></tr></table></body></html>'
    const result = parseGetchu(noJanHtml, '9999')
    expect(result.janCode).toBe('')
    expect(result.getchu.price).toBe(0)
  })
})
