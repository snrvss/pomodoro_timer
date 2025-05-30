import { Quote } from 'entities/quote'

export interface QuotePort {
  /**
   * tryFetchQuote is a function that fetches one quote
   * @throws {FailedError} - thrown if the result can't be fetched
   * @returns {Promise<Quote>} - a single array
   */
  tryFetchQuote(): Promise<Quote>
}
