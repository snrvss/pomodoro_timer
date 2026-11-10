import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InvalidResponseError, NetworkError, ServerError, TimeoutError } from '@pomodoro-timer/core'
import { RestClient } from '.'
import { failingFetch, hangingFetch, requestedUrl, respondWith } from '@/rest-client/fake-fetch'

describe('RestClient', () => {
  describe('URL', () => {
    it.each([
      ['https://dummyjson.com', 'quotes/random/10'],
      ['https://dummyjson.com/', 'quotes/random/10'],
      ['https://dummyjson.com/', '/quotes/random/10'],
    ])('joins base "%s" and path "%s" with exactly one slash', async (base, path) => {
      const fetch = respondWith([])

      await new RestClient(base, { fetch }).get(path)

      expect(requestedUrl(fetch)).toBe('https://dummyjson.com/quotes/random/10')
    })

    it('sends a GET request that accepts JSON', async () => {
      const fetch = respondWith({})

      await new RestClient('https://api.test', { fetch }).get('x')

      expect(fetch.mock.calls[0]?.[1]).toMatchObject({
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
    })
  })

  describe('responses', () => {
    it('returns status and parsed JSON body', async () => {
      const client = new RestClient('https://api.test', { fetch: respondWith([{ id: 1 }]) })

      await expect(client.get('x')).resolves.toEqual({ status: 200, body: [{ id: 1 }] })
    })

    it('returns undefined as body for an empty response', async () => {
      const client = new RestClient('https://api.test', { fetch: respondWith('', 200, '') })

      await expect(client.get('x')).resolves.toEqual({ status: 200, body: undefined })
    })

    it('returns a 404 with its status instead of throwing, ignoring a non-JSON body', async () => {
      const client = new RestClient('https://api.test', {
        fetch: respondWith('<html>Not Found</html>', 404, 'text/html'),
      })

      await expect(client.get('x')).resolves.toEqual({ status: 404, body: undefined })
    })

    it('throws InvalidResponseError for a 2xx response that is not JSON', async () => {
      const client = new RestClient('https://api.test', {
        fetch: respondWith('<html></html>', 200, 'text/html'),
      })

      await expect(client.get('x')).rejects.toThrow(InvalidResponseError)
    })
  })

  describe('failures', () => {
    it.each([500, 503, 429])('throws ServerError with status %i', async (status) => {
      const client = new RestClient('https://api.test', {
        fetch: respondWith('<html></html>', status, 'text/html'),
      })

      const error = await client.get('x').catch((e: unknown) => e)

      expect(error).toBeInstanceOf(ServerError)
      expect((error as ServerError).status).toBe(status)
    })

    it('throws NetworkError when fetch rejects without a response, keeping the cause', async () => {
      const cause = new TypeError('Failed to fetch')
      const client = new RestClient('https://api.test', {
        fetch: failingFetch(cause),
      })

      const error = await client.get('x').catch((e: unknown) => e)

      expect(error).toBeInstanceOf(NetworkError)
      expect((error as NetworkError).cause).toBe(cause)
    })
  })

  describe('timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('throws TimeoutError with the configured time when no response arrives', async () => {
      const result = new RestClient('https://api.test', {
        fetch: hangingFetch(),
        timeoutMs: 5000,
      }).get('x')
      const caught = result.catch((e: unknown) => e)

      await vi.advanceTimersByTimeAsync(5000)

      const error = await caught
      expect(error).toBeInstanceOf(TimeoutError)
      expect((error as TimeoutError).timeoutMs).toBe(5000)
    })

    it('does not time out before the configured time', async () => {
      const onSettled = vi.fn()
      new RestClient('https://api.test', { fetch: hangingFetch(), timeoutMs: 5000 })
        .get('x')
        .catch(onSettled)

      await vi.advanceTimersByTimeAsync(4999)

      expect(onSettled).not.toHaveBeenCalled()
    })

    it('clears its timer after a response, so a late timeout never fires', async () => {
      const client = new RestClient('https://api.test', { fetch: respondWith({}), timeoutMs: 5000 })

      await client.get('x')

      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
