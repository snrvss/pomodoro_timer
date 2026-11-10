/**
 * One quote as DummyJSON returns it, e.g. from `GET quotes/random/{count}`.
 *
 * @remarks
 * `GET quotes/random/{count}` answers with a plain JSON array of these.
 */
export interface QuoteDto {
  /** Numeric id, e.g. `468` */
  readonly id: number
  /** The quote text */
  readonly quote: string
  /** Who said it, e.g. `"Confucius"` */
  readonly author: string
}
