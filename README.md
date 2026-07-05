# exES-mv3

English | [日本語](README.ja.md)

A Chrome / Brave extension (Manifest V3) for [ErogameScape](https://erogamescape.dyndns.org/)
that overlays shop price comparisons and past sale campaigns onto each game page.

This project started from [ryoha000/exES](https://github.com/ryoha000/exES) (MIT),
which targeted Manifest V2 and no longer loads on current browsers. This fork
migrates the platform to Manifest V3, rebuilds every shop scraper against the
shops' current sites, and adds Steam support. Credit for the original design
and UI goes to ryoha000.

## Supported shops

| Shop | Status | Notes |
|------|--------|-------|
| Getchu | ✅ | JAN code + JSON-LD price |
| Suruga-ya | ✅ | new / used prices |
| Sofmap | ✅ | new / used prices |
| DLsite | ✅ | product-info API |
| FANZA (DMM) | ✅ | age gate handled via a declarativeNetRequest rule |
| Steam | ✅ | official appdetails API; sales show as `3278 → 1966`, free games as `無料` |
| Amazon | ⚠️ | scraper works, but ErogameScape no longer publishes Amazon links, so it does not trigger in practice |

Past sale campaigns (過去のキャンペーン) are also listed, fetched from
ErogameScape itself.

## Install (load unpacked)

```
npm install
npm run build   # outputs dist/
```

Open `chrome://extensions` (or `brave://extensions`), enable **Developer mode**,
click **Load unpacked**, and select the `dist/` directory.

## Development

```
npm test            # vitest unit tests (parsers are fixture-tested offline)
npm run typecheck   # tsc --noEmit
npm run build       # webpack → dist/
```

## Privacy note

The background fetch uses `credentials:'include'`, so the extension sends
**your browser's cookies for the shop hosts it queries** (amazon.co.jp,
getchu.com, sofmap.com, suruga-ya.jp, dmm.co.jp, dlsite.com,
store.steampowered.com). This matches the original MV2 behaviour and is
required for cookie-gated pages (e.g. Amazon adult titles). Requests go only
to the shop they target; the extension collects nothing.

## License

MIT — see [LICENSE](LICENSE). Original work © 2021 ryoha000.
