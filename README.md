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

- Phase A — MV3 platform migration: see `docs/superpowers/plans/`.
- Phase B — per-shop scraper repair: tracked separately; shops that cannot be
  repaired are listed as out of scope here.
