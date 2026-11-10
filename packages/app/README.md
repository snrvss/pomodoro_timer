# Pomodoro Timer – app

Vue 3 + Vite front end of the Pomodoro timer: focus / short break / long break sessions with
configurable durations, a browser notification and sound when a session ends, and a short
motivational quote after each focus session.

The app is the outer layer of the monorepo:

- `packages/core` – entities, ports, errors and services (no Vue, no HTTP)
- `packages/infrastructure` – adapters for the ports, e.g. the DummyJSON quote API
- `packages/app` – this package: UI, Pinia stores and the composition root in `src/api`

## Commands

Run `yarn install` once in the repository root, then:

| Command                              | What it does                              |
| ------------------------------------ | ----------------------------------------- |
| `yarn dev` (in `packages/app`)       | Start the dev server                      |
| `yarn build` (in `packages/app`)     | Type-check and build to `dist/`           |
| `yarn test:unit` (in `packages/app`) | Run the app's unit tests in watch mode    |
| `yarn test` (in the repository root) | Run the unit tests of every package       |
| `yarn test:e2e` (in `packages/app`)  | Run Cypress against the last `yarn build` |

## Configuration

Copy `.env.example` to `.env.local` in this folder and adjust:

| Variable             | Values           | Default                 |
| -------------------- | ---------------- | ----------------------- |
| `VITE_QUOTE_ADAPTER` | `mock` \| `http` | `mock`                  |
| `VITE_QUOTE_API_URL` | base URL         | `https://dummyjson.com` |

- `mock` reads quotes from a local JSON file, no network needed.
- `http` fetches quotes from the DummyJSON-compatible API at `VITE_QUOTE_API_URL`.
