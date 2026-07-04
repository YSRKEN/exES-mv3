import { backgroundFetch } from '../utils'
import { ResultResponse, getNumber, removeNewLine } from './scrape'

const productURL = (asin: string) => `https://www.amazon.co.jp/dp/${asin}`

/**
 * Parse an Amazon.co.jp product page for the buy-box price and title.
 *
 * Verified 2026-07-04: the retired `#priceblock_ourprice` is replaced by the
 * `.a-offscreen` span inside the core price block (e.g. `￥10,999`). Adult
 * ("black curtain") titles only expose the price when the user's age-eligibility
 * cookie is sent — the background fetch uses `credentials:'include'` for that.
 *
 * Returns `{ price: 0, title: "" }` when the price/title cannot be found (e.g.
 * the black-curtain interstitial, or a removed product), which the caller
 * (`getAmazonPrice`) treats as "no result".
 */
export const parseAmazon = (html: string, asin: string): ResultResponse => {
  const doms = new DOMParser().parseFromString(html, 'text/html')

  // Buy-box price: prefer the core price block, fall back to the first a-price.
  const priceDOM =
    doms.querySelector('#corePriceDisplay_desktop_feature_div .a-offscreen') ??
    doms.querySelector('#corePrice_feature_div .a-offscreen') ??
    doms.querySelector('.a-price .a-offscreen')
  const titleDOM = doms.querySelector('#productTitle')
  if (!priceDOM || !titleDOM) {
    return { price: 0, title: '' }
  }

  const price = getNumber(priceDOM.textContent ?? '')
  const title = removeNewLine(titleDOM.textContent ?? '').trim()
  return { price, title, priceURL: productURL(asin) }
}

const scrapeAmazon = async (asin: string): Promise<ResultResponse> => {
  const body = await backgroundFetch({ url: productURL(asin) })
  return parseAmazon(body, asin)
}

export default scrapeAmazon
