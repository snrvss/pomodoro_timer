import { type DomainError, isDomainError } from '@/errors/domain-error'
import { UnexpectedError } from '@/errors/unexpected-errors'

/**
 * Converts any caught value into a {@link DomainError}, so only our own error types leave a service.
 *
 * @param error - Any caught value
 * @returns `error` itself if it already is a {@link DomainError}, otherwise an
 * {@link UnexpectedError} with `error` as `cause`
 *
 * @example
 * ```ts
 * try {
 *   return await quotePort.getRandomQuotes()
 * } catch (error) {
 *   throw toDomainError(error)
 * }
 * ```
 */
export const toDomainError = (error: unknown): DomainError =>
  isDomainError(error) ? error : new UnexpectedError({ cause: error })
