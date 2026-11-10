import { DomainError } from '@/errors/domain-error'

/**
 * Thrown when the payload is not valid JSON, has the wrong shape or an unexpected status.
 *
 * @remarks
 * Not retryable: the same request would return the same payload.
 */
export class InvalidResponseError extends DomainError {
  readonly code = 'INVALID_RESPONSE'
  readonly retryable = false

  /**
   * @param reason - What was wrong with the payload, e.g. `"quotes[0].quote is not a string"`
   * @param options - Standard `ErrorOptions`
   */
  constructor(
    readonly reason: string,
    options?: ErrorOptions,
  ) {
    super(`Invalid response: ${reason}`, options)
  }
}
