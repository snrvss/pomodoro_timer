import type { Quote } from '@/entities'
import type { QuotePort } from '@/ports'
import { FALLBACK_QUOTES } from '@/services/quote/fallback-quotes'

export { FALLBACK_QUOTES }

/** Longest quote text, in characters, that fits the session-complete card. */
export const MAX_QUOTE_LENGTH = 80

/**
 * Picks one random entry of a non-empty list.
 *
 * @param list - The entries to choose from
 * @param random - Returns a number in [0, 1)
 * @returns A copy of the chosen entry
 */
const pickRandom = (list: readonly Quote[], random: () => number): Quote => {
  const index = Math.min(list.length - 1, Math.max(0, Math.floor(random() * list.length)))
  return { ...list[index]! }
}

/**
 * Picks a short quote to show after a focus session.
 *
 * @remarks
 * Calls {@link QuotePort.getRandomQuotes}, keeps only quotes of at most {@link MAX_QUOTE_LENGTH}
 * characters and returns a random one of them. If the port throws or nothing is short enough it
 * returns a random {@link FALLBACK_QUOTES} entry instead, so the UI always has something to show.
 */
export class QuoteService {
  /**
   * @param quotePort - The adapter that implements {@link QuotePort}
   * @param random - Returns a number in [0, 1); injectable for tests. Default `Math.random`.
   */
  constructor(
    private readonly quotePort: QuotePort,
    private readonly random: () => number = Math.random,
  ) {}

  /**
   * @returns A random short quote. Never rejects.
   */
  async getShortQuote(): Promise<Quote> {
    let quotes: Quote[]
    try {
      quotes = await this.quotePort.getRandomQuotes()
    } catch {
      return pickRandom(FALLBACK_QUOTES, this.random)
    }

    const short = quotes.filter((quote) => {
      const length = quote.text.trim().length
      return length > 0 && length <= MAX_QUOTE_LENGTH
    })
    return pickRandom(short.length > 0 ? short : FALLBACK_QUOTES, this.random)
  }
}
