import { describe, expect, it, vi } from 'vitest'
import { createServices, FALLBACK_QUOTES, type QuotePort } from '@pomodoro-timer/core'

describe('createServices public entry point', () => {
  it('makes getShortQuote available through the façade', async () => {
    const quote = { id: '1', text: 'Great work!', author: 'Coach' }
    const port: QuotePort = { getRandomQuotes: vi.fn(async () => [quote]) }

    await expect(createServices(port).getShortQuote()).resolves.toEqual(quote)
  })

  it('never rejects, even if the port does', async () => {
    const port: QuotePort = { getRandomQuotes: vi.fn().mockRejectedValue(new Error('offline')) }

    const quote = await createServices(port).getShortQuote()

    expect(FALLBACK_QUOTES.map((fallback) => fallback.id)).toContain(quote.id)
  })
})
