import { describe, expect, it } from 'vitest'
import { DEFAULT_QUOTE_API_URL, readConfig } from '@/config'

describe('readConfig', () => {
  it('uses the HTTP adapter and DummyJSON when nothing is set', () => {
    expect(readConfig({})).toEqual({
      quoteAdapter: 'http',
      quoteApiUrl: DEFAULT_QUOTE_API_URL,
    })
    expect(DEFAULT_QUOTE_API_URL).toBe('https://dummyjson.com')
  })

  it.each([
    ['http', 'http'],
    [' HTTP ', 'http'],
    ['mock', 'mock'],
    [' MOCK ', 'mock'],
    ['graphql', 'http'],
    ['', 'http'],
  ])('reads VITE_QUOTE_ADAPTER=%j as %s', (value, expected) => {
    expect(readConfig({ VITE_QUOTE_ADAPTER: value }).quoteAdapter).toBe(expected)
  })

  it.each(['http', undefined])(
    'always uses the mock adapter in test mode (VITE_QUOTE_ADAPTER=%s)',
    (value) => {
      expect(readConfig({ MODE: 'test', VITE_QUOTE_ADAPTER: value }).quoteAdapter).toBe('mock')
    },
  )

  it('uses the HTTP adapter in development and production builds', () => {
    expect(readConfig({ MODE: 'development' }).quoteAdapter).toBe('http')
    expect(readConfig({ MODE: 'production' }).quoteAdapter).toBe('http')
  })

  it('reads the API URL without trailing slashes', () => {
    const config = readConfig({ VITE_QUOTE_API_URL: 'https://quotes.example.com//' })

    expect(config.quoteApiUrl).toBe('https://quotes.example.com')
  })

  it('treats an empty API URL as not set', () => {
    expect(readConfig({ VITE_QUOTE_API_URL: '  ' }).quoteApiUrl).toBe(DEFAULT_QUOTE_API_URL)
  })
})
