import { backgroundFetch } from '../utils'
import { getNumber, ResultResponse } from './scrape'

/**
 * Parse a Sofmap product_list_parts.aspx response for a JAN search.
 *
 * Endpoint: https://a.sofmap.com/product_list_parts.aspx?styp=p_bar&keyword=<JAN>&aac=on
 * NOTE: Adult-category products (virtually all eroge) are hidden behind an
 * adult gate, but the `aac=on` query param bypasses it cookie-free (verified
 * 2026-07-04) — the same approach as Getchu's `?gc=gc`. No session cookie or
 * preflight is needed, which matters because the MV3 service-worker fetch does
 * not share the browser cookie jar for cross-site requests.
 *
 * Selectors verified 2026-07-04 against a.sofmap.com:
 *   Product card: ul#change_style_list > li
 *   Product URL:  a.itemimg  (href, absolute)
 *   New price:    span.price > strong  (text, "¥8,980(税込)")
 *   Used lowest:  div.used_box a > span.price-txt  (text, "¥3,480(税込)～")
 *   Used URL:     div.used_box > a  (href, may be relative → prepend host)
 */
export const parseSofmap = (html: string, jan: string): ResultResponse[] => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const titleURL = `https://a.sofmap.com/search_result.aspx?product_type=ALL&styp=p_bar&keyword=${jan}&gid=&aac=on`
  const result: ResultResponse[] = []

  const items = doc.querySelectorAll('#change_style_list > li')
  items.forEach(item => {
    // New price
    const priceEl = item.querySelector('span.price > strong')
    const linkEl = item.querySelector('a.itemimg')
    if (priceEl && linkEl) {
      const price = getNumber(priceEl.textContent ?? '')
      const priceURL = linkEl.getAttribute('href') ?? ''
      if (price > 0 && priceURL) {
        result.push({ title: 'Sofmap', price, titleURL, priceURL })
      }
    }

    // Lowest used price (shown inline in the new-item card)
    const usedLinkEl = item.querySelector('div.used_box a')
    const usedPriceEl = item.querySelector('div.used_box a span.price-txt')
    if (usedLinkEl && usedPriceEl) {
      const usedPrice = getNumber(usedPriceEl.textContent ?? '')
      const usedHref = usedLinkEl.getAttribute('href') ?? ''
      const usedURL = usedHref.startsWith('/')
        ? `https://a.sofmap.com${usedHref}`
        : usedHref
      if (usedPrice > 0 && usedURL) {
        result.push({ title: 'Sofmap(中古)', price: usedPrice, titleURL, priceURL: usedURL })
      }
    }
  })

  return result
}

const scrapeSofmap = async (jan: string): Promise<ResultResponse[]> => {
  try {
    // `aac=on` bypasses the adult gate cookie-free (no preflight needed).
    const body = await backgroundFetch({
      url: 'https://a.sofmap.com/product_list_parts.aspx',
      params: { styp: 'p_bar', keyword: jan, aac: 'on' }
    })
    return parseSofmap(body, jan)
  } catch (e) {
    console.error(e)
    return []
  }
}

export default scrapeSofmap
