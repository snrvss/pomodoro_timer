import { InvalidResponseError, type Quote } from '@pomodoro-timer/core'
import type { QuoteDto } from '@/quote-api/entity'

/** Root label of validation error paths, e.g. `"quotes[2].author"`. */
export const RESPONSE_PATH = 'quotes'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Checks one entry of the response.
 *
 * @throws {@link InvalidResponseError} - Thrown if a field is missing or has the wrong type.
 */
const readQuote = (value: unknown, path: string): QuoteDto => {
  if (!isRecord(value)) {
    throw new InvalidResponseError(`${path} is not an object`)
  }
  const { id, quote, author } = value
  if (typeof id !== 'number' || !Number.isFinite(id)) {
    throw new InvalidResponseError(`${path}.id is not a number`)
  }
  if (typeof quote !== 'string') {
    throw new InvalidResponseError(`${path}.quote is not a string`)
  }
  if (typeof author !== 'string') {
    throw new InvalidResponseError(`${path}.author is not a string`)
  }
  return { id, quote, author }
}

/**
 * Step 1: checks the body of `GET quotes/random/{count}` at runtime and returns it as
 * {@link QuoteDto}s, keeping the API's field names.
 *
 * @param body - Parsed JSON body of a `2xx` response
 * @returns The checked quotes
 * @throws {@link InvalidResponseError} - Thrown if the body is not an array or an entry has the wrong shape.
 */
export const readQuotes = (body: unknown): QuoteDto[] => {
  if (!Array.isArray(body)) {
    throw new InvalidResponseError(`${RESPONSE_PATH} is not an array`)
  }
  return body.map((entry, index) => readQuote(entry, `${RESPONSE_PATH}[${index}]`))
}

/**
 * Step 2: maps a checked {@link QuoteDto} to the core {@link Quote}.
 *
 * @param dto - A checked quote from {@link readQuotes}
 * @returns The quote, with `quote` as `text` and the numeric id as a string
 */
export const convertQuote = (dto: QuoteDto): Quote => ({
  id: String(dto.id),
  text: dto.quote.trim(),
  author: dto.author.trim(),
})
