# @pomodoro-timer/core

The domain layer of the Pomodoro Timer: entities, typed errors, ports and services in plain
TypeScript. No Vue, no `fetch`, no browser APIs, so everything here is tested without a browser or
network.

## Contents

| Folder         | What's in it                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/entities` | `Quote`, `PomodoroSettings`, and the timer model for the planned engine: `Timer`, `SessionType`, `PomodoroSession`, `PomodoroSnapshot`                                  |
| `src/errors`   | `DomainError` (with `code` and `retryable`), `NetworkError`, `TimeoutError`, `ServerError`, `InvalidResponseError`, `UnexpectedError`, `toDomainError`, `isDomainError` |
| `src/ports`    | `QuotePort` (`getRandomQuotes()`), and `PomodoroPort`, the planned timer engine                                                                                         |
| `src/services` | `QuoteService.getShortQuote()`, `MAX_QUOTE_LENGTH` (80), `FALLBACK_QUOTES`, and the `createServices(quotePort)` façade                                                  |

`QuoteService` keeps quotes of at most `MAX_QUOTE_LENGTH` characters and returns a random one. If
the port throws or nothing is short enough, it returns a random `FALLBACK_QUOTES` entry. It never
throws.

```ts
import { createServices, type QuotePort } from '@pomodoro-timer/core'

const port: QuotePort = { getRandomQuotes: async () => [] } // any adapter
const quote = await createServices(port).getShortQuote() // a fallback quote here
```

## Dependency rule

Core depends on **nothing** at runtime (no `dependencies` in `package.json`). `infrastructure`
implements its ports, and `app` uses its types and services; core never imports from either.
Inside the package, imports use `@/…` for `src/…`.

## Scripts

```bash
yarn workspace @pomodoro-timer/core test         # Vitest
yarn workspace @pomodoro-timer/core type-check   # tsc
```

Tests sit next to the code (`*.test.ts`).

See the [root README](../../README.md) for the whole architecture and how to run the app.
