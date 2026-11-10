# @pomodoro-timer/infrastructure

Adapters for the ports of [`@pomodoro-timer/core`](../core/README.md): a small HTTP client and two
implementations of `QuotePort`, one for the DummyJSON quotes API and one on a local JSON file.

## Contents

| Folder               | What's in it                                                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/rest-client`    | `RestClient(baseUrl, { timeoutMs, fetch })` with `get(path)`: GET with JSON, a timeout (`DEFAULT_TIMEOUT_MS`, 8 s), and failures mapped to core errors (`NetworkError`, `TimeoutError`, `ServerError` for 5xx/429, `InvalidResponseError`) |
| `src/quote-api`      | `HttpQuoteAdapter` (requests `quotes/random/10` via `quoteEndpoints`), the `QuoteDto` shape, and the converters `readQuotes` (runtime check) and `convertQuote` (`quote` → `text`, id → string)                                            |
| `src/quote-api/mock` | `MockQuoteAdapter({ delayMs })` on `mock-data/quotes.json`, run through the same `readQuotes` / `convertQuote` as a real response                                                                                                          |

```ts
import { createServices } from '@pomodoro-timer/core'
import { HttpQuoteAdapter, MockQuoteAdapter, RestClient } from '@pomodoro-timer/infrastructure'

const http = new HttpQuoteAdapter(new RestClient('https://dummyjson.com', { timeoutMs: 5000 }))
const quote = await createServices(http).getShortQuote()

const offline = createServices(new MockQuoteAdapter({ delayMs: 300 }))
```

The adapters don't filter or fall back; picking a short quote and the fallback live in core's
`QuoteService`. Which adapter the app uses is decided in `packages/app/src/api`.

## Dependency rule

Infrastructure depends **only on core** (`@pomodoro-timer/core` is its one dependency). It never
imports from `app`. Inside the package, imports use `@/…` for `src/…`.

## Scripts

```bash
yarn workspace @pomodoro-timer/infrastructure test         # Vitest, with a fake fetch, no network
yarn workspace @pomodoro-timer/infrastructure type-check   # tsc
```

Tests sit next to the code (`*.test.ts`); `src/rest-client/fake-fetch.ts` holds the test helpers
and is not exported.

See the [root README](../../README.md) for the whole architecture and how to run the app.
