import { createServices, type QuotePort, type Services } from '@pomodoro-timer/core'
import { HttpQuoteAdapter, MockQuoteAdapter, RestClient } from '@pomodoro-timer/infrastructure'
import { type AppConfig, config } from '@/config'

/** Time limit for one request to the quote API. After it the request fails with a `TimeoutError`. */
export const REQUEST_TIMEOUT_MS = 5000

/** Latency of the mock adapter, so the loading text is visible for a moment. */
export const MOCK_DELAY_MS = 300

/**
 * Creates the {@link QuotePort} implementation the configuration asks for.
 *
 * @param settings - The app configuration, default: the one of this build
 * @returns An {@link HttpQuoteAdapter} (default) or a {@link MockQuoteAdapter}
 */
export const createQuoteAdapter = (settings: AppConfig = config): QuotePort => {
  if (settings.quoteAdapter === 'http') {
    const client = new RestClient(settings.quoteApiUrl, { timeoutMs: REQUEST_TIMEOUT_MS })
    return new HttpQuoteAdapter(client)
  }
  return new MockQuoteAdapter({ delayMs: MOCK_DELAY_MS })
}

/**
 * Creates the core services.
 *
 * @remarks
 * The composition root: the only place where the app decides which port implementation it uses.
 * By default that is a {@link RestClient} for `VITE_QUOTE_API_URL` (DummyJSON), injected into an
 * {@link HttpQuoteAdapter}; with `VITE_QUOTE_ADAPTER=mock`, and always in tests, it is the mock
 * adapter on a local JSON file. If the API fails, core's `QuoteService` falls back to a local quote. Either way the adapter is wrapped by core's `createServices`, so the
 * rest of the app never knows where the quotes come from.
 *
 * Stores call it in their load actions. Tests replace this module with `vi.mock('@/api', …)`.
 *
 * @returns The core services
 */
export const createQuoteServices = (): Services => createServices(createQuoteAdapter())
