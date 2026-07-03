import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseFanza } from '../src/content_scripts/use/scrape/fanza'

const htmlMwnds0009 = readFileSync(resolve(__dirname, 'fixtures/fanza-mwnds_0009.html'), 'utf-8')

describe('parseFanza', () => {
  it('extracts price 8800 from the un-gated product page JSON-LD', () => {
    expect(parseFanza(htmlMwnds0009)).toBe(8800)
  })

  it('returns 0 for an empty/age-gate page with no price data', () => {
    expect(parseFanza('<html><body>Age check required</body></html>')).toBe(0)
  })
})
