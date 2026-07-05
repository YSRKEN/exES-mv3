import { describe, it, expect } from 'vitest'
import { getSteamAppId } from '../src/content_scripts/use/utils'

describe('getSteamAppId', () => {
  it('extracts the app id from a Steam store URL', () => {
    expect(getSteamAppId(new URL('https://store.steampowered.com/app/2536840/'))).toBe('2536840')
  })

  it('extracts the app id when there is no trailing slash', () => {
    expect(getSteamAppId(new URL('https://store.steampowered.com/app/570'))).toBe('570')
  })

  it('returns empty string for a non-app URL', () => {
    expect(getSteamAppId(new URL('https://store.steampowered.com/'))).toBe('')
  })
})
