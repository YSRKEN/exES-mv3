import { backgroundFetch } from '../utils'
import { getNumber, ResultResponse } from './scrape'

/**
 * Parse Suruga-ya JAN-search result HTML into ResultResponse entries.
 *
 * Data source: server-rendered HTML item cards (div.item_box).
 * These are preferred over the embedded `var item_product = {...}` analytics
 * objects because the cards show the *current* price (including time-sales),
 * while the analytics objects carry the catalog (pre-sale) price and may have
 * truncated item_name values.
 *
 * Selectors verified against the Bootstrap-based redesign (2026-07-04):
 *   Item card:    div.item_box
 *   Product URL:  div.item_detail div.title a  (href, already absolute)
 *   Current price: p.price_teika span.text-red strong
 *   Used/new flag: "中古" text in p.price_teika or p.price_normal
 */
export const parseSurugaya = (html: string, jan: string): ResultResponse[] => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const titleURL = `https://www.suruga-ya.jp/search?category=&search_word=${jan}&searchbox=1&is_marketplace=0`
  const result: ResultResponse[] = []

  const itemBoxes = doc.querySelectorAll('div.item_box')
  itemBoxes.forEach(box => {
    const linkEl = box.querySelector('div.item_detail div.title a')
    const priceEl = box.querySelector('p.price_teika span.text-red strong')
    if (!linkEl || !priceEl) return

    const priceURL = linkEl.getAttribute('href') ?? ''
    const price = getNumber(priceEl.textContent ?? '')
    if (!priceURL || price <= 0) return

    // Determine used vs new: used items print "中古" in either the price_teika
    // paragraph (e.g. "中古：￥160") or the price_normal paragraph
    // ("中古通常価格"). New items carry neither; default to used label.
    const teikaTxt = box.querySelector('p.price_teika')?.textContent ?? ''
    const normalTxt = box.querySelector('p.price_normal')?.textContent ?? ''
    const isUsed = teikaTxt.includes('中古') || normalTxt.includes('中古')

    result.push({
      title: isUsed ? '駿河屋(中古)' : '駿河屋',
      price,
      priceURL,
      titleURL
    })
  })

  return result
}

const scrapeSurugaya = async (jan: string): Promise<ResultResponse[]> => {
  try {
    const body = await backgroundFetch({
      url: 'https://www.suruga-ya.jp/search',
      params: { search_word: jan, searchbox: 1, is_marketplace: 0 }
    })
    return parseSurugaya(body, jan)
  } catch (e) {
    console.error(e)
    return []
  }
}

export default scrapeSurugaya
