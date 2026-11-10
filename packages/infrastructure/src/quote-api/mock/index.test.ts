import { afterEach, describe, expect, it, vi } from 'vitest'
import { createServices, InvalidResponseError, MAX_QUOTE_LENGTH } from '@pomodoro-timer/core'
import { MOCK_QUOTES, MockQuoteAdapter } from '@/quote-api/mock'
import { readQuotes } from '@/quote-api/convert'

describe('MockQuoteAdapter', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('returns every quote of the JSON file, checked and converted like an API response', async () => {
    const quotes = await new MockQuoteAdapter().getRandomQuotes()

    expect(quotes).toHaveLength(readQuotes(MOCK_QUOTES).length)
    expect(quotes[0]).toEqual({
      id: '1',
      text: 'Nice focus! One step at a time.',
      author: 'Pomodoro Coach',
    })
  })

  it('has short quotes as well as long ones, so core filtering is exercised', async () => {
    const quotes = await new MockQuoteAdapter().getRandomQuotes()

    expect(quotes.some((quote) => quote.text.length <= MAX_QUOTE_LENGTH)).toBe(true)
    expect(quotes.some((quote) => quote.text.length > MAX_QUOTE_LENGTH)).toBe(true)
  })

  it('fails like a broken API response when the data has the wrong shape', async () => {
    const broken = new MockQuoteAdapter({ data: [{ id: 1, quote: 'no author' }] })

    await expect(broken.getRandomQuotes()).rejects.toThrow(InvalidResponseError)
  })

  it('answers after the delay', async () => {
    vi.useFakeTimers()
    const slow = new MockQuoteAdapter({ delayMs: 300 })
    let quotes: unknown = 'pending'

    void slow.getRandomQuotes().then((result) => (quotes = result))
    await vi.advanceTimersByTimeAsync(299)
    expect(quotes).toBe('pending')
    await vi.advanceTimersByTimeAsync(1)

    expect(quotes).toEqual(expect.arrayContaining([expect.objectContaining({ id: '1' })]))
  })

  it('never touches the network', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    await new MockQuoteAdapter().getRandomQuotes()

    expect(fetch).not.toHaveBeenCalled()
  })

  it('works behind the core services façade and only returns short quotes', async () => {
    const services = createServices(new MockQuoteAdapter())

    for (let i = 0; i < 20; i++) {
      const quote = await services.getShortQuote()
      expect(quote.text.length).toBeLessThanOrEqual(MAX_QUOTE_LENGTH)
    }
  })
})
