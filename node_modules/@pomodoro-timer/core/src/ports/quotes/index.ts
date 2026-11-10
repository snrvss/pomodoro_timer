import type { Quote } from '@/entities'

/**
 * Read access to a source of quotes.
 *
 * @remarks
 * Implemented in the infrastructure layer. The port returns whatever the source has, without
 * filtering: picking a quote that fits the UI is the job of `QuoteService`.
 */
export interface QuotePort {
  /**
   * Fetches a batch of random quotes.
   *
   * @returns The quotes in source order; may be empty
   * @throws {@link NetworkError} - Thrown if the server could not be reached.
   * @throws {@link TimeoutError} - Thrown if no response arrived in time.
   * @throws {@link ServerError} - Thrown for 5xx and 429 responses.
   * @throws {@link InvalidResponseError} - Thrown if the payload could not be mapped to {@link Quote}s.
   */
  getRandomQuotes(): Promise<Quote[]>
}
