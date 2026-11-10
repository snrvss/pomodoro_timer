import { describe, expect, it, vi } from 'vitest'
import type { Quote } from '@/entities'
import { NetworkError, ServerError } from '@/errors'
import type { QuotePort } from '@/ports'
import { FALLBACK_QUOTES, MAX_QUOTE_LENGTH, QuoteService } from '@/services/quote'

const quote = (id: string, text: string): Quote => ({ id, text, author: `Author ${id}` })

const portReturning = (quotes: Quote[]): QuotePort => ({
  getRandomQuotes: vi.fn(async () => quotes),
})

const portFailingWith = (error: unknown): QuotePort => ({
  getRandomQuotes: vi.fn(async () => {
    throw error
  }),
})

const LONG = 'x'.repeat(MAX_QUOTE_LENGTH + 1)

describe('QuoteService', () => {
  it('returns only quotes that fit MAX_QUOTE_LENGTH', async () => {
    const short = quote('2', 'Stay hungry, stay foolish.')
    const port = portReturning([quote('1', LONG), short, quote('3', LONG + LONG)])

    // Whatever random() returns, the one short quote is the only candidate
    for (const value of [0, 0.5, 0.999]) {
      await expect(new QuoteService(port, () => value).getShortQuote()).resolves.toEqual(short)
    }
  })

  it('accepts a quote of exactly MAX_QUOTE_LENGTH characters', async () => {
    const exact = quote('1', 'y'.repeat(MAX_QUOTE_LENGTH))

    await expect(new QuoteService(portReturning([exact])).getShortQuote()).resolves.toEqual(exact)
  })

  it('ignores empty and whitespace-only texts', async () => {
    const service = new QuoteService(portReturning([quote('1', '   ')]), () => 0)

    await expect(service.getShortQuote()).resolves.toEqual(FALLBACK_QUOTES[0])
  })

  it('picks a random one of the short quotes', async () => {
    const a = quote('a', 'First.')
    const b = quote('b', 'Second.')
    const port = portReturning([a, quote('long', LONG), b])

    await expect(new QuoteService(port, () => 0).getShortQuote()).resolves.toEqual(a)
    await expect(new QuoteService(port, () => 0.99).getShortQuote()).resolves.toEqual(b)
  })

  it('falls back to a local quote when all quotes are too long', async () => {
    const service = new QuoteService(portReturning([quote('1', LONG), quote('2', LONG)]), () => 0)

    await expect(service.getShortQuote()).resolves.toEqual(FALLBACK_QUOTES[0])
  })

  it('falls back to a local quote when the port returns nothing', async () => {
    const service = new QuoteService(portReturning([]), () => 0)

    await expect(service.getShortQuote()).resolves.toEqual(FALLBACK_QUOTES[0])
  })

  it.each([
    ['a network error', new NetworkError()],
    ['a server error', new ServerError(503)],
    ['an unexpected error', new TypeError('adapter bug')],
  ])('falls back to a local quote on %s instead of throwing', async (_name, error) => {
    const service = new QuoteService(portFailingWith(error), () => 0.999)

    await expect(service.getShortQuote()).resolves.toEqual(
      FALLBACK_QUOTES[FALLBACK_QUOTES.length - 1],
    )
  })

  it('returns a copy, so callers cannot change the fallback list', async () => {
    const result = await new QuoteService(portReturning([]), () => 0).getShortQuote()
    result.text = 'changed'

    expect(FALLBACK_QUOTES[0]?.text).not.toBe('changed')
  })
})

describe('FALLBACK_QUOTES', () => {
  it('has about ten quotes that all fit MAX_QUOTE_LENGTH', () => {
    expect(FALLBACK_QUOTES.length).toBeGreaterThanOrEqual(10)
    for (const fallback of FALLBACK_QUOTES) {
      expect(fallback.text.length).toBeLessThanOrEqual(MAX_QUOTE_LENGTH)
      expect(fallback.author).not.toBe('')
    }
  })

  it('has unique ids', () => {
    expect(new Set(FALLBACK_QUOTES.map((q) => q.id)).size).toBe(FALLBACK_QUOTES.length)
  })
})
