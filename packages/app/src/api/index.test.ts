import { describe, expect, it } from 'vitest'
import { HttpQuoteAdapter, MockQuoteAdapter } from '@pomodoro-timer/infrastructure'
import { createQuoteAdapter, createQuoteServices } from '@/api'
import { readConfig } from '@/config'

describe('createQuoteAdapter', () => {
  it('uses the mock adapter by default', () => {
    expect(createQuoteAdapter(readConfig({}))).toBeInstanceOf(MockQuoteAdapter)
  })

  it('uses the HTTP adapter with VITE_QUOTE_ADAPTER=http', () => {
    const adapter = createQuoteAdapter(readConfig({ VITE_QUOTE_ADAPTER: 'http' }))

    expect(adapter).toBeInstanceOf(HttpQuoteAdapter)
  })
})

describe('createQuoteServices', () => {
  it('returns services that load a quote with the configured (mock) adapter', async () => {
    const quote = await createQuoteServices().getShortQuote()

    expect(quote.text.length).toBeGreaterThan(0)
  })
})
