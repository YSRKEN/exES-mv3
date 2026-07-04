# FANZA Scraper Repair Report

**Date:** 2026-07-04  
**Task:** Phase B — FANZA/DMM scraper repair  
**Branch:** phase-b-scraper-repair

---

## Summary

The old `scrapeFanza` threw `"not found"` because it targeted `.normal-price > span` and `.campaign-price > span` CSS selectors that no longer exist on DMM product pages. The replacement reads price from JSON-LD (`schema.org/Offer`) and returns 0 gracefully when no price is found.

---

## Age-Gate Approach

**Problem:** Without the `age_check_done=1` cookie, `https://dlsoft.dmm.co.jp/detail/<id>/` issues a 302 redirect to `/age_check/=/?rurl=...` — a ~34 KB gate page with no product data. URL query params (`?age_check_done=1`) do not bypass it (confirmed by recon 2026-07-04).

**Approach:** Add a DNR `modifyHeaders` rule (id `111112`) in `public/fanza_rule.json` that sets `Cookie: age_check_done=1` on all `xmlhttprequest`/`other` requests matching `||dmm.co.jp/`. This is the cleanest MV3-compatible mechanism.

**Confidence: LOW — NEEDS LIVE IN-BROWSER VERIFICATION.**  
Chrome's DNR `modifyHeaders` may silently discard `Cookie` as a forbidden request header (tracked in https://crbug.com/1141632). The rule has been added per spec, with a comment in `fanza.ts` flagging this uncertainty. If the rule silently no-ops, `parseFanza` receives the age-gate HTML and returns `0` (no throw), so `getFanzaPrice` returns `null` gracefully. The parser itself is fully offline-testable and confirmed correct against the live fixture.

---

## Parser Source

Price is read from `<script type="application/ld+json">` containing a `schema.org` `Offer` object:
```json
{"@type":"Offer","price":"8800","priceCurrency":"JPY",...}
```
A deep-walk (`collectOfferPrices`) finds this regardless of nesting depth. Falls back to `.sellingPrice__originalPrice` text content via `getNumber` if JSON-LD is absent. Returns `0` when neither is present.

Verified against live page `https://dlsoft.dmm.co.jp/detail/mwnds_0009/` fetched with `age_check_done=1` cookie (203 KB full product page).

---

## Files Changed

| File | Change |
|------|--------|
| `src/content_scripts/use/scrape/fanza.ts` | Full rewrite: added `parseFanza` (pure, exported), `collectOfferPrices`, updated `scrapeFanza` to not throw |
| `public/fanza_rule.json` | Added rule id 111112: DNR `modifyHeaders` to inject `age_check_done=1` cookie |
| `test/fanza.test.ts` | New: 2 tests for `parseFanza` |
| `test/fixtures/fanza-mwnds_0009.html` | New: 203 KB un-gated product page (fetched with cookie) |

---

## Test Results

```
✓ test/fanza.test.ts (2 tests) 371ms
  ✓ extracts price 8800 from the un-gated product page JSON-LD
  ✓ returns 0 for an empty/age-gate page with no price data

Test Files  7 passed (7)
      Tests  32 passed (32)
```

All 32 tests pass (7 test files).

---

## Typecheck

```
npm run typecheck → tsc --noEmit → (exit 0, no errors)
```

---

## Build

```
webpack 5.108.3 compiled with 1 warning in 2927ms
```

The single warning (`'mode' option has not been set`) is pre-existing and unrelated to this change.

---

## Parsed Price

`parseFanza(fixture)` → **8800** (JPY)

---

## Commit

Commit hash: (see below — committed after this report)

---

## Concerns

1. **DNR Cookie injection confidence: LOW.** Chrome may treat `Cookie` as a forbidden request header for DNR `modifyHeaders`. If so, the age gate will not be bypassed in the browser and all FANZA lookups will return `null` (gracefully). A follow-up task should load the extension in Chrome, navigate to an ErogameScape DMM link, and check DevTools Network to confirm the `age_check_done=1` cookie is present on the DMM fetch.

2. **Alternative bypass strategies** (if DNR Cookie fails):
   - Use `chrome.cookies.set()` from the background service worker before fetching (requires `cookies` permission + `cookie_store` host entry)
   - Redirect `https://dlsoft.dmm.co.jp/age_check/*/` → original product URL via DNR redirect rule with appended cookie param (DMM-specific, fragile)
   - Show a one-time user-facing prompt to set the cookie via a content script on dmm.co.jp
