import { describe, expect, it } from 'vitest'
import { HttpQuoteAdapter, MockQuoteAdapter } from '@pomodoro-timer/infrastructure'
import { createQuoteAdapter, createQuoteServices } from '@/api'
import { config, readConfig } from '@/config'

describe('createQuoteAdapter', () => {
  it('uses the HTTP (DummyJSON) adapter by default', () => {
    expect(createQuoteAdapter(readConfig({}))).toBeInstanceOf(HttpQuoteAdapter)
  })

  it('uses the mock adapter with VITE_QUOTE_ADAPTER=mock', () => {
    const adapter = createQuoteAdapter(readConfig({ VITE_QUOTE_ADAPTER: 'mock' }))

    expect(adapter).toBeInstanceOf(MockQuoteAdapter)
  })
})

describe('createQuoteServices', () => {
  it('runs on the mock adapter in tests, so no test calls the real API', async () => {
    expect(config.quoteAdapter).toBe('mock')
    expect(createQuoteAdapter()).toBeInstanceOf(MockQuoteAdapter)

    const quote = await createQuoteServices().getShortQuote()

    expect(quote.text.length).toBeGreaterThan(0)
  })
})
