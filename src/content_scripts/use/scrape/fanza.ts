import { backgroundFetch } from '../utils'
import { getNumber, ResultResponse } from './scrape'

/** Deep-search a parsed JSON value for schema.org Offer objects (have both price + priceCurrency). */
const collectOfferPrices = (value: unknown): number[] => {
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value)) {
    return value.flatMap(collectOfferPrices)
  }
  const obj = value as Record<string, unknown>
  const prices: number[] = []
  if ('price' in obj && 'priceCurrency' in obj) {
    const p = Number(String(obj['price']).replace(/[^0-9.]/g, ''))
    if (!isNaN(p) && p > 0) prices.push(p)
  }
  for (const v of Object.values(obj)) {
    prices.push(...collectOfferPrices(v))
  }
  return prices
}

/**
 * Parse a DMM/FANZA product page HTML and return the price in JPY.
 *
 * Price source: JSON-LD `<script type="application/ld+json">` with a schema.org
 * Offer object (`{ "price": "8800", "priceCurrency": "JPY" }`).
 * Falls back to `.sellingPrice__originalPrice` text content via getNumber().
 *
 * Returns 0 when neither source is found (e.g. age-gate page, product removed).
 *
 * NOTE: The DMM age gate (302 redirect to /age_check/) is handled by the DNR
 * rule in public/fanza_rule.json (rule id 111112), which injects the
 * `age_check_done=1` cookie on all requests to *.dmm.co.jp. This requires the
 * host permission `*://*.dmm.co.jp/*` (already declared in manifest.json) and
 * NEEDS LIVE IN-BROWSER VERIFICATION — Chrome's DNR `modifyHeaders` may treat
 * the Cookie request header as a forbidden header and silently drop the
 * injection (see https://crbug.com/1141632). If the DNR cookie rule does not
 * work, parseFanza will receive the age-gate HTML and return 0 gracefully.
 */
export const parseFanza = (html: string): number => {
  const dom = new DOMParser().parseFromString(html, 'text/html')

  // Primary: JSON-LD schema.org Offer
  const ldScripts = dom.querySelectorAll('script[type="application/ld+json"]')
  const allPrices: number[] = []
  ldScripts.forEach(script => {
    try {
      const parsed = JSON.parse(script.textContent ?? '')
      allPrices.push(...collectOfferPrices(parsed))
    } catch {
      // skip malformed JSON-LD blocks
    }
  })
  if (allPrices.length > 0) {
    return Math.min(...allPrices)
  }

  // Fallback: .sellingPrice__originalPrice text content
  const fallbackEl = dom.querySelector('.sellingPrice__originalPrice')
  if (fallbackEl) {
    const n = getNumber(fallbackEl.textContent ?? '')
    if (n > 0) return n
  }

  return 0
}

const scrapeFanza = async (url: string): Promise<ResultResponse> => {
  const body = await backgroundFetch({ url: url })
  return { title: 'FANZA', price: parseFanza(body), priceURL: url }
}

export default scrapeFanza
