import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createServices, FALLBACK_QUOTES, type Quote, type QuotePort } from '@pomodoro-timer/core'
import { MockQuoteAdapter } from '@pomodoro-timer/infrastructure'
import { createQuoteServices } from '@/api'
import { useQuoteStore } from '@/stores/quote'

// The real factory picks the configured adapter; here it returns services on the mock adapter.
vi.mock('@/api', () => ({ createQuoteServices: vi.fn() }))

/** Makes `createQuoteServices` return services on `adapter`. */
const useAdapter = (adapter: QuotePort): void => {
  vi.mocked(createQuoteServices).mockImplementation(() => createServices(adapter))
}

/** A port whose next answer the test resolves manually. */
const deferredPort = () => {
  const resolvers: ((quotes: Quote[]) => void)[] = []
  const port: QuotePort = {
    getRandomQuotes: () => new Promise<Quote[]>((resolve) => resolvers.push(resolve)),
  }
  return { port, answer: (call: number, quotes: Quote[]) => resolvers[call]?.(quotes) }
}

describe('useQuoteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(createQuoteServices).mockReset()
    useAdapter(new MockQuoteAdapter())
  })

  it('starts idle without a quote', () => {
    const store = useQuoteStore()

    expect(store.status).toBe('idle')
    expect(store.quote).toBeNull()
  })

  it('is loading until the quote arrives, then success', async () => {
    const store = useQuoteStore()

    const loading = store.load()
    expect(store.status).toBe('loading')
    expect(store.quote).toBeNull()
    await loading

    expect(store.status).toBe('success')
    expect(store.quote?.text.length).toBeGreaterThan(0)
  })

  it('loads a short quote from the mock adapter data', async () => {
    const store = useQuoteStore()

    await store.load()

    const mockTexts = (await new MockQuoteAdapter().getRandomQuotes()).map((q) => q.text)
    expect(mockTexts).toContain(store.quote?.text)
  })

  it('still succeeds with a fallback quote when the adapter fails', async () => {
    useAdapter({ getRandomQuotes: vi.fn().mockRejectedValue(new Error('offline')) })
    const store = useQuoteStore()

    await store.load()

    expect(store.status).toBe('success')
    expect(FALLBACK_QUOTES.map((q) => q.id)).toContain(store.quote?.id)
  })

  it('keeps the newest quote when an older load finishes later', async () => {
    const { port, answer } = deferredPort()
    useAdapter(port)
    const store = useQuoteStore()

    const first = store.load()
    const second = store.load()
    answer(1, [{ id: 'new', text: 'Newer quote.', author: 'B' }])
    await second
    answer(0, [{ id: 'old', text: 'Older quote.', author: 'A' }])
    await first

    expect(store.quote?.id).toBe('new')
  })

  it('reset goes back to idle and ignores a load still running', async () => {
    const { port, answer } = deferredPort()
    useAdapter(port)
    const store = useQuoteStore()

    const loading = store.load()
    store.reset()
    answer(0, [{ id: 'late', text: 'Too late.', author: 'A' }])
    await loading

    expect(store.status).toBe('idle')
    expect(store.quote).toBeNull()
  })
})
