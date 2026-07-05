import { backgroundFetch, getSteamAppId } from '../utils'
import { ResultResponse } from './scrape'

const storeURL = (appId: string) => `https://store.steampowered.com/app/${appId}/`

interface ISteamPriceOverview {
  initial: number
  final: number
  discount_percent: number
  initial_formatted: string
  final_formatted: string
}
interface ISteamAppData {
  is_free?: boolean
  price_overview?: ISteamPriceOverview
}
interface ISteamAppEntry {
  success: boolean
  data?: ISteamAppData | unknown[]
}

/**
 * Map a Steam appdetails (filters=basic,price_overview) response to a
 * ResultResponse. See the design spec for the ①/②/③ mapping.
 * Returns null only when the app id is absent from the response.
 */
export const parseSteam = (body: string, appId: string): ResultResponse | null => {
  const json = JSON.parse(body) as { [id: string]: ISteamAppEntry }
  const app = json[appId]
  if (!app) return null

  const base = { title: 'Steam', titleURL: storeURL(appId), priceURL: storeURL(appId) }

  if (!app.success) {
    return { ...base, price: 0, priceText: '価格取得不可' }
  }

  const data = app.data
  const appData = data && !Array.isArray(data) ? (data as ISteamAppData) : undefined
  const po = appData?.price_overview

  if (po) {
    // Unified display: bare integer yen (no ¥, no comma). initial/final are yen×100.
    const price = Math.round(po.final / 100)
    if (po.discount_percent > 0) {
      const original = Math.round(po.initial / 100)
      return { ...base, price, priceText: `${original} → ${price}` }
    }
    // No discount: leave priceText unset so the numeric price renders,
    // identical to every other shop.
    return { ...base, price }
  }

  if (appData?.is_free === true) {
    return { ...base, price: 0, priceText: '無料' }
  }

  return { ...base, price: 0, priceText: '価格取得不可' }
}

export const getSteamPrice = async (url: URL): Promise<ResultResponse | null> => {
  try {
    const appId = getSteamAppId(url)
    if (!appId) {
      return null
    }
    const body = await backgroundFetch({
      url: 'https://store.steampowered.com/api/appdetails',
      params: { appids: appId, cc: 'jp', l: 'japanese', filters: 'basic,price_overview' }
    })
    return parseSteam(body, appId)
  } catch (e) {
    console.error(e)
    return null
  }
}
