import { describe, it, expect } from 'vitest'
import { getASINFromAmazonURL, getDlsiteRequestURL } from '../src/content_scripts/use/utils'

describe('getASINFromAmazonURL', () => {
  it('extracts the path segment after ASIN', () => {
    const url = new URL('https://www.amazon.co.jp/dp/ASIN/B08XYZ1234')
    expect(getASINFromAmazonURL(url)).toBe('B08XYZ1234')
  })

  it('returns empty string when ASIN is absent', () => {
    const url = new URL('https://www.amazon.co.jp/dp/B08XYZ1234')
    expect(getASINFromAmazonURL(url)).toBe('')
  })
})

describe('getDlsiteRequestURL', () => {
  it('builds the ajax info URL from a product page URL', () => {
    const url = new URL('https://www.dlsite.com/maniax/work/=/product_id/RJ123456.html')
    expect(getDlsiteRequestURL(url)).toBe(
      'https://www.dlsite.com/maniax/product/info/ajax?product_id=RJ123456?cdn_cache_min=1'
    )
  })
})
