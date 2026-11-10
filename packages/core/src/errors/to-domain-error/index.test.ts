import { describe, expect, it } from 'vitest'
import { toDomainError } from '.'
import { NetworkError, ServerError, UnexpectedError } from '@/errors'

describe('toDomainError', () => {
  it('returns a domain error unchanged', () => {
    const error = new ServerError(503)

    expect(toDomainError(error)).toBe(error)
  })

  it('keeps the retryable flag of transport errors', () => {
    expect(toDomainError(new NetworkError()).retryable).toBe(true)
  })

  it('wraps any other error in UnexpectedError and keeps it as cause', () => {
    const bug = new TypeError("Cannot read properties of undefined (reading 'quote')")

    const error = toDomainError(bug)

    expect(error).toBeInstanceOf(UnexpectedError)
    expect(error.retryable).toBe(false)
    expect(error.cause).toBe(bug)
  })

  it('wraps values that are not errors', () => {
    expect(toDomainError('boom')).toBeInstanceOf(UnexpectedError)
  })

  it('names each error after its class', () => {
    expect(new ServerError(500).name).toBe('ServerError')
  })
})
