import { describe, expect, it } from 'vitest'
import {
  createServices,
  FALLBACK_QUOTES,
  InvalidResponseError,
  MAX_QUOTE_LENGTH,
  NetworkError,
  ServerError,
} from '@pomodoro-timer/core'
import { HttpQuoteAdapter, quoteEndpoints, RANDOM_QUOTE_COUNT } from '@/quote-api'
import { RestClient } from '@/rest-client'
import { failingFetch, requestedUrl, respondWith } from '@/rest-client/fake-fetch'

const BASE_URL = 'https://dummyjson.com'
const LONG = 'x'.repeat(MAX_QUOTE_LENGTH + 1)

const adapterWith = (fetch: typeof globalThis.fetch) =>
  new HttpQuoteAdapter(new RestClient(BASE_URL, { fetch }))

describe('quoteEndpoints', () => {
  it('builds the random path', () => {
    expect(quoteEndpoints.random(10)).toBe('quotes/random/10')
  })
})

describe('HttpQuoteAdapter', () => {
  it('requests 10 random quotes and converts them', async () => {
    const fetch = respondWith([
      { id: 1, quote: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
      { id: 2, quote: LONG, author: 'Someone' },
    ])

    const quotes = await adapterWith(fetch).getRandomQuotes()

    expect(RANDOM_QUOTE_COUNT).toBe(10)
    expect(requestedUrl(fetch)).toBe('https://dummyjson.com/quotes/random/10')
    // The adapter does not filter by length; that is the service's job
    expect(quotes).toEqual([
      { id: '1', text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
      { id: '2', text: LONG, author: 'Someone' },
    ])
  })

  it('throws InvalidResponseError for a payload with the wrong shape', async () => {
    const adapter = adapterWith(respondWith({ quotes: [] }))

    await expect(adapter.getRandomQuotes()).rejects.toThrow(InvalidResponseError)
  })

  it('throws InvalidResponseError for an unexpected 4xx status', async () => {
    const adapter = adapterWith(respondWith({ message: 'Not found' }, 404))

    await expect(adapter.getRandomQuotes()).rejects.toThrow(InvalidResponseError)
  })

  it('passes ServerError from the client through', async () => {
    const adapter = adapterWith(respondWith('', 503))

    await expect(adapter.getRandomQuotes()).rejects.toThrow(ServerError)
  })

  it('passes NetworkError from the client through', async () => {
    const adapter = adapterWith(failingFetch(new TypeError('offline')))

    await expect(adapter.getRandomQuotes()).rejects.toThrow(NetworkError)
  })
})

/*
 * One integration test for the intended setup: RestClient → HttpQuoteAdapter → createServices.
 */
describe('RestClient → HttpQuoteAdapter → createServices', () => {
  it('returns the short quote from the API', async () => {
    const services = createServices(
      adapterWith(
        respondWith([
          { id: 1, quote: LONG, author: 'Long' },
          { id: 2, quote: 'Great work!', author: 'Coach' },
        ]),
      ),
    )

    await expect(services.getShortQuote()).resolves.toEqual({
      id: '2',
      text: 'Great work!',
      author: 'Coach',
    })
  })

  it('falls back to a local quote when the network fails', async () => {
    const services = createServices(adapterWith(failingFetch(new TypeError('offline'))))

    const quote = await services.getShortQuote()

    expect(FALLBACK_QUOTES.map((fallback) => fallback.id)).toContain(quote.id)
  })
})
