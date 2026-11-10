import { InvalidResponseError, type Quote, type QuotePort } from '@pomodoro-timer/core'
import type { RestClient } from '@/rest-client'
import { convertQuote, readQuotes } from '@/quote-api/convert'
import { quoteEndpoints } from '@/quote-api/endpoints'

export * from '@/quote-api/convert'
export * from '@/quote-api/endpoints'
export * from '@/quote-api/entity'
export * from '@/quote-api/mock'

/** How many quotes {@link HttpQuoteAdapter} requests per call. */
export const RANDOM_QUOTE_COUNT = 10

/**
 * {@link QuotePort} implementation against the DummyJSON quotes API over HTTP.
 *
 * @remarks
 * Sends `GET quotes/random/10` through the injected {@link RestClient}, checks the payload with
 * {@link readQuotes} and maps it with {@link convertQuote}. Filtering by length is left to core's
 * `QuoteService`.
 *
 * @example
 * ```ts
 * const client = new RestClient('https://dummyjson.com', { timeoutMs: 5000 })
 * const services = createServices(new HttpQuoteAdapter(client))
 * ```
 */
export class HttpQuoteAdapter implements QuotePort {
  /**
   * @param client - The {@link RestClient} configured with the quote API base URL
   */
  constructor(private readonly client: RestClient) {}

  /**
   * {@inheritDoc QuotePort.getRandomQuotes}
   *
   * @throws {@link InvalidResponseError} - Also thrown for an unexpected 4xx status.
   */
  async getRandomQuotes(): Promise<Quote[]> {
    const path = quoteEndpoints.random(RANDOM_QUOTE_COUNT)
    const response = await this.client.get(path)
    if (response.status < 200 || response.status >= 300) {
      throw new InvalidResponseError(`${path}: unexpected status ${response.status}`)
    }
    return readQuotes(response.body).map(convertQuote)
  }
}
