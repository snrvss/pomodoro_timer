/**
 * Which `QuotePort` implementation the app uses.
 *
 * - `http`: the DummyJSON quotes API at {@link AppConfig.quoteApiUrl} (default)
 * - `mock`: quotes from a local JSON file, no network (`VITE_QUOTE_ADAPTER=mock`, and always in tests)
 */
export type QuoteAdapterKind = 'mock' | 'http'

/**
 * App settings from `VITE_*` environment variables (see `.env.example`).
 */
export interface AppConfig {
  /** `VITE_QUOTE_ADAPTER`, default `http`; always `mock` when Vite runs in `test` mode */
  readonly quoteAdapter: QuoteAdapterKind
  /** `VITE_QUOTE_API_URL`, without trailing slashes. Default {@link DEFAULT_QUOTE_API_URL}. */
  readonly quoteApiUrl: string
}

/** Base URL of the quote API when `VITE_QUOTE_API_URL` is not set */
export const DEFAULT_QUOTE_API_URL = 'https://dummyjson.com'

/** The environment variables {@link readConfig} reads, as Vite provides them in `import.meta.env`. */
export type ConfigEnv = Readonly<Record<string, string | boolean | undefined>>

/** A trimmed, non-empty string, or `undefined` */
const text = (value: string | boolean | undefined): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined

/**
 * Reads the {@link AppConfig} from environment variables, with a default for everything.
 *
 * @param env - Usually `import.meta.env`
 * @returns The settings; unknown or malformed values fall back to the defaults
 *
 * @remarks
 * Tests (`MODE=test`, as Vitest sets it) always get the mock adapter, so no test ever calls the
 * real API, whatever `.env.local` says.
 */
export const readConfig = (env: ConfigEnv): AppConfig => {
  const adapter = text(env['VITE_QUOTE_ADAPTER'])?.toLowerCase()
  const apiUrl = text(env['VITE_QUOTE_API_URL'])?.replace(/\/+$/, '')

  return {
    quoteAdapter: env['MODE'] === 'test' || adapter === 'mock' ? 'mock' : 'http',
    quoteApiUrl: apiUrl || DEFAULT_QUOTE_API_URL,
  }
}

/** The settings of this build */
export const config: AppConfig = readConfig(import.meta.env)
