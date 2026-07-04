# exES (Manifest V3 migration)

A Chrome/Brave extension for [ErogameScape](https://erogamescape.dyndns.org/)
that overlays price comparisons from Amazon / Getchu / Sofmap / Suruga-ya /
DMM(FANZA) / DLsite and past sale campaigns onto a game page.

This is a Manifest V3 migration of the original **[ryoha000/exES](https://github.com/ryoha000/exES)**
(MIT). The original targeted Manifest V2, which the latest Brave/Chrome no
longer load. Credit for the original design and scraping/UI logic goes to
ryoha000.

## Build

```
npm install
npm run build      # outputs dist/
```

## Load

Open `chrome://extensions` (or `brave://extensions`), enable Developer mode,
"Load unpacked", and select the `dist/` directory.

## Status

- **Phase A — MV3 platform migration:** done. `manifest_version 3`, background
  service worker, `host_permissions`, and the background fetch rewritten from
  axios/XHR to `fetch` (with `credentials:'include'` to restore MV2's behaviour
  of sending the user's cookies to shop domains). See `docs/superpowers/plans/`.
- **Phase B — per-shop scraper repair:** done. Repaired against each shop's
  current site and verified live in Brave (2026-07-04).

### Per-shop status

| Shop | Status | Notes |
|------|--------|-------|
| Getchu | ✅ working | `/item/{id}/?gc=gc` (age gate bypassed by `gc=gc`); JAN + JSON-LD price |
| Suruga-ya | ✅ working | redesigned Bootstrap search cards; used/new prices |
| Sofmap | ✅ working | `product_list_parts.aspx?...&aac=on` (adult gate bypassed by `aac=on`) |
| DLsite | ✅ working | product-info ajax JSON (`price`) |
| FANZA (DMM) | ✅ working | JSON-LD price; DMM age gate bypassed by a DNR rule that injects `age_check_done=1` |
| Amazon | ⚠️ code-ready, no data | Scraper repaired (`/dp/{asin}` + `.a-offscreen`, adult titles unlocked via the user's cookies), but **ErogameScape no longer publishes Amazon links** on game pages, so no Amazon price appears in practice. Kept working in case EGS restores the `/ASIN/` links. |

Steam is **not supported** — the original exES never scraped Steam, and EGS
Steam-only titles have no supported shop link (out of scope; a possible future
feature).
