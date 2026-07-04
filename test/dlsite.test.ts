import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseDlsite } from '../src/content_scripts/use/scrape/dlsite'
import { getDlsiteRequestURL } from '../src/content_scripts/use/utils'

const jsonVJ013906 = readFileSync(resolve(__dirname, 'fixtures/dlsite-VJ013906.json'), 'utf-8')

describe('parseDlsite', () => {
  it('extracts the price from the product-info ajax JSON', () => {
    expect(parseDlsite(jsonVJ013906)).toBe(8800)
  })
})

describe('getDlsiteRequestURL', () => {
  it('builds a valid single-query-string ajax URL from an EGS dlaf link', () => {
    const url = new URL('https://www.dlsite.com/pro/dlaf/=/link/work/aid/erogamescape/id/VJ013906.html')
    expect(getDlsiteRequestURL(url)).toBe(
      'https://www.dlsite.com/pro/product/info/ajax?product_id=VJ013906&cdn_cache_min=1'
    )
  })
})
