import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseAmazon } from '../src/content_scripts/use/scrape/amazon'

const htmlB01MQ5YNTB = readFileSync(resolve(__dirname, 'fixtures/amazon-B01MQ5YNTB.html'), 'utf-8')

describe('parseAmazon', () => {
  it('extracts the buy-box price and title from a product page', () => {
    const res = parseAmazon(htmlB01MQ5YNTB, 'B01MQ5YNTB')
    expect(res.price).toBe(10999)
    expect(res.title).toBe('リアルエロゲシチュエーション!')
    expect(res.priceURL).toBe('https://www.amazon.co.jp/dp/B01MQ5YNTB')
  })

  it('returns an empty result when price/title are absent (e.g. black-curtain page)', () => {
    const res = parseAmazon('<html><body>18歳以上ですか？</body></html>', 'B01MQ5YNTB')
    expect(res.price).toBe(0)
    expect(res.title).toBe('')
  })
})
