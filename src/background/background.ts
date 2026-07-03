import * as Encoding from 'encoding-japanese'
import { IFetchMessageRequest, IFetchMessageResult } from '../utils'

const TIMEOUT_MS = 2000

const buildURL = (url: string, params?: { [key: string]: string | number }): string => {
  if (!params || Object.keys(params).length === 0) return url
  const u = new URL(url)
  for (const [key, value] of Object.entries(params)) {
    u.searchParams.set(key, String(value))
  }
  return u.toString()
}

const fetchAsUnicode = async (req: IFetchMessageRequest): Promise<string> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(buildURL(req.url, req.params), { signal: controller.signal })
    const buf = await res.arrayBuffer()
    const codes = new Uint8Array(buf)
    const encoding = Encoding.detect(codes)
    if (!encoding) {
      throw new Error("couldn't detect encoding")
    }
    return Encoding.convert(codes, { to: 'UNICODE', from: encoding, type: 'string' }) as string
  } finally {
    clearTimeout(timer)
  }
}

chrome.runtime.onMessage.addListener(
  (req: IFetchMessageRequest, _sender, sendResponse: (res: IFetchMessageResult) => void) => {
    fetchAsUnicode(req)
      .then((body) => sendResponse({ type: 'success', body }))
      .catch((e) => sendResponse({ type: 'error', body: e instanceof Error ? e.message : String(e) }))
    return true
  }
)
