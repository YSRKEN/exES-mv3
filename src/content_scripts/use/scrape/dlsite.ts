import { backgroundFetch } from '../utils'

interface IDlsiteAjax {
  [key: string]: {
    price: number
  }
}

/**
 * Parse the DLsite product-info ajax JSON (`{ "<product_id>": { price, ... } }`)
 * and return the price of the first (only) product entry. Verified 2026-07-04:
 * the endpoint still returns a top-level `price` integer and is not age-gated.
 */
export const parseDlsite = (body: string): number => {
  const response = JSON.parse(body) as IDlsiteAjax
  return response[Object.keys(response)[0]].price
}

const scrapeDlsite = async (url: string): Promise<number> => {
  const body = await backgroundFetch({ url: url })
  return parseDlsite(body)
}

export default scrapeDlsite
