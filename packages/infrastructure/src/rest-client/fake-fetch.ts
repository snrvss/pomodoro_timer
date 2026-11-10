import { vi } from 'vitest'

/** The call signature of `fetch`, without the overloads that confuse `vi.fn` typing across Vitest versions. */
type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

/*
 * Test helpers for mocking `fetch`. Only used by tests, not exported from the package.
 */

/**
 * Creates a `fetch` mock that answers every request with the given body and status.
 *
 * @param body - Response body; objects are sent as JSON, strings as they are
 * @param status - HTTP status, default `200`
 * @param contentType - Content type header, default `application/json`
 * @returns The mock, to inspect the requested URLs
 */
export const respondWith = (body: unknown, status = 200, contentType = 'application/json') => {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  const answer: FetchFn = async () =>
    new Response(text, { status, headers: { 'Content-Type': contentType } })
  return vi.fn(answer)
}

/**
 * Creates a `fetch` mock that never answers, but rejects with an `AbortError` once its signal
 * aborts, like the native `fetch` does.
 *
 * @returns The mock
 */
export const hangingFetch = () => {
  const hang: FetchFn = (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('The operation was aborted.', 'AbortError')),
      )
    })
  return vi.fn(hang)
}

/**
 * Creates a `fetch` mock that rejects every request with `error`, like the native `fetch` does
 * when there is no response (offline, DNS, CORS).
 *
 * @param error - The rejection reason
 * @returns The mock
 */
export const failingFetch = (error: unknown) => {
  const fail: FetchFn = async () => {
    throw error
  }
  return vi.fn(fail)
}

/**
 * Returns the URL a `fetch` mock was called with.
 *
 * @param fetchMock - The mock
 * @param call - Index of the call, default `0`
 * @returns The requested URL
 */
export const requestedUrl = (fetchMock: ReturnType<typeof respondWith>, call = 0): string =>
  String(fetchMock.mock.calls[call]?.[0])
