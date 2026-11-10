import type { Quote, QuotePort } from '@pomodoro-timer/core'
import { convertQuote, readQuotes } from '@/quote-api/convert'
import quotes from './mock-data/quotes.json'

/**
 * Response body of `GET quotes/random/{count}` in DummyJSON's format.
 *
 * @remarks
 * Stays `unknown`: like an HTTP response it only becomes core {@link Quote}s after
 * {@link readQuotes} (runtime check) and {@link convertQuote} (mapping). A broken entry fails with
 * `InvalidResponseError`, exactly as a broken API response would.
 */
export const MOCK_QUOTES: unknown = quotes

/**
 * Options of the {@link MockQuoteAdapter}.
 */
export interface MockQuoteAdapterOptions {
  /** Artificial latency per call in milliseconds, so loading states are visible. Default `0`. */
  delayMs?: number
  /** Replaces the default {@link MOCK_QUOTES}, e.g. with broken data in tests */
  data?: unknown
}

/**
 * {@link QuotePort} implementation on a local JSON file instead of an HTTP API.
 *
 * @remarks
 * The default adapter of the app (`VITE_QUOTE_ADAPTER=mock`). It behaves like `HttpQuoteAdapter`:
 * the same response format and the same `readQuotes`/`convertQuote` steps. It returns all quotes
 * of the file, short and long, so core's filtering is exercised too.
 *
 * @example
 * ```ts
 * const services = createServices(new MockQuoteAdapter({ delayMs: 300 }))
 * await services.getShortQuote()
 * ```
 */
export class MockQuoteAdapter implements QuotePort {
  private readonly delayMs: number
  private readonly data: unknown

  /**
   * @param options - Optional {@link MockQuoteAdapterOptions}
   */
  constructor(options: MockQuoteAdapterOptions = {}) {
    this.delayMs = options.delayMs ?? 0
    this.data = options.data ?? MOCK_QUOTES
  }

  /** {@inheritDoc QuotePort.getRandomQuotes} */
  async getRandomQuotes(): Promise<Quote[]> {
    if (this.delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, this.delayMs))
    }
    return readQuotes(this.data).map(convertQuote)
  }
}
