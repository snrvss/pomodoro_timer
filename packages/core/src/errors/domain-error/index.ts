/**
 * Machine-readable code of a {@link DomainError}, one per subclass.
 */
export type DomainErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'INVALID_RESPONSE'
  | 'UNEXPECTED_ERROR'

/**
 * Base class of every error that crosses a port.
 *
 * @remarks
 * `retryable` tells callers whether the same call may succeed when tried again.
 */
export abstract class DomainError extends Error {
  /** Machine-readable error code */
  abstract readonly code: DomainErrorCode
  /** `true` if the same call may succeed when tried again */
  abstract readonly retryable: boolean

  /**
   * @param message - Developer-facing message
   * @param options - Standard `ErrorOptions`, use `cause` to keep the original error
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = new.target.name
  }
}

/**
 * Type guard that tells expected domain errors apart from unexpected ones (bugs).
 *
 * @param error - Any caught value
 * @returns `true` if `error` is a {@link DomainError}
 */
export const isDomainError = (error: unknown): error is DomainError => error instanceof DomainError
