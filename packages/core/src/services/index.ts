import type { Quote } from '@/entities'
import type { QuotePort } from '@/ports'
import { QuoteService } from '@/services/quote'

export * from '@/services/quote'

/**
 * Single entry point for the app to all core services.
 *
 * @remarks
 * Only forwards each call to the matching service; the façade adds no logic of its own.
 *
 * @example
 * ```ts
 * const services = createServices(new MockQuoteAdapter())
 * const quote = await services.getShortQuote()
 * ```
 */
export class Services {
  /**
   * @param quoteService - Picks short quotes
   */
  constructor(private readonly quoteService: QuoteService) {}

  /**
   * Loads a short quote. Forwards to {@link QuoteService.getShortQuote}.
   *
   * @returns A random short quote. Never rejects.
   */
  getShortQuote(): Promise<Quote> {
    return this.quoteService.getShortQuote()
  }
}

/**
 * Creates the service façade and its services on top of one quote adapter.
 *
 * @param quotePort - The adapter used to retrieve quotes
 * @returns The single entry point for the app's services
 */
export const createServices = (quotePort: QuotePort): Services =>
  new Services(new QuoteService(quotePort))
