import { backgroundFetch } from '../utils'
import { getNumber, JANCodeWithAssociatedPrices } from './scrape'

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

export const parseGetchu = (html: string, id: string): JANCodeWithAssociatedPrices => {
  const dom = new DOMParser().parseFromString(html, 'text/html')

  // JAN code: iterate <td> cells precisely — avoids ancestor <tr> false matches
  let code = ""
  const tds = dom.querySelectorAll("#soft_table td")
  tds.forEach(td => {
    if (td.textContent?.includes("JANコード")) {
      const sibling = td.nextElementSibling
      if (sibling) {
        const digits = getNumber(sibling.textContent ?? '').toString()
        if (digits.length === 13 || digits.length === 8) {
          code = digits
        }
      }
    }
  })

  // Price: read from JSON-LD (schema.org Offer). The .taxin <span> elements are
  // inside HTML comments on the live site and are invisible to the DOM parser.
  let getchuPrice = 0
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
    getchuPrice = Math.min(...allPrices)
  }

  return {
    janCode: code,
    getchu: {
      title: "Getchu",
      priceURL: "https://www.getchu.com/item/" + id + "/",
      price: getchuPrice
    }
  }
}

const scrapeGetchu = async (id: string): Promise<JANCodeWithAssociatedPrices> => {
  const body = await backgroundFetch({ url: 'https://www.getchu.com/item/' + id + '/', params: { gc: 'gc' } })
  return parseGetchu(body, id)
}

export default scrapeGetchu
