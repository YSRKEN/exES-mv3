import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseGetchu } from '../src/content_scripts/use/scrape/getchu'

const html1092994 = readFileSync(resolve(__dirname, 'fixtures/getchu-item-1092994.html'), 'utf-8')
const html1361161 = readFileSync(resolve(__dirname, 'fixtures/getchu-item-1361161.html'), 'utf-8')

describe('parseGetchu', () => {
  it('extracts JAN code 4560431864351 from item 1092994', () => {
    const result = parseGetchu(html1092994, '1092994')
    expect(result.janCode).toBe('4560431864351')
  })

  it('reads price 7980 from JSON-LD for item 1092994', () => {
    const result = parseGetchu(html1092994, '1092994')
    expect(result.getchu.price).toBe(7980)
  })

  it('extracts JAN code 4580885450580 from item 1361161', () => {
    const result = parseGetchu(html1361161, '1361161')
    expect(result.janCode).toBe('4580885450580')
  })

  it('reads price 9990 from JSON-LD for item 1361161', () => {
    const result = parseGetchu(html1361161, '1361161')
    expect(result.getchu.price).toBe(9990)
  })

  it('sets priceURL to the item URL', () => {
    const result = parseGetchu(html1092994, '1092994')
    expect(result.getchu.priceURL).toBe('https://www.getchu.com/item/1092994/')
  })

  it('returns empty janCode without throwing when JAN row is absent', () => {
    const noJanHtml = '<html><body><table id="soft_table"><tr><td>nothing here</td></tr></table></body></html>'
    const result = parseGetchu(noJanHtml, '9999')
    expect(result.janCode).toBe('')
    expect(result.getchu.price).toBe(0)
  })
})
