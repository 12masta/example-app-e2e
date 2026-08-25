# Example app e2e

End-to-end tests for the private RealWorld (Conduit) demo app. Playwright covers the critical UI journeys (auth, articles, comments, follow/feed, favorite, settings, tags, guest gates, 404). Pair this repository with:

- Frontend: [example-app-frontend](https://github.com/12masta/example-app-frontend)
- Backend API: [example-app-backend](https://github.com/12masta/example-app-backend)

Local services:

- Frontend: `http://localhost:30401`
- Backend API: `http://localhost:5080/api`

## Local run

Start the apps yourself, then run Playwright. The tests do not start frontend or backend.

In [example-app-backend](https://github.com/12masta/example-app-backend):

```sh
make run-local
```

In [example-app-frontend](https://github.com/12masta/example-app-frontend):

```sh
yarn install
yarn generate
yarn start
```

In this repository:

```sh
npm install
npx playwright install chromium
npm test
```

Optional: copy `.env.example` to `.env` or set `BASE_URL` / `API_URL`. Defaults are `http://localhost:30401` and `http://localhost:5080/api`.

Tests that are not about registration use a precreated API user. Tests that are not about login authenticate with a JWT prehook instead of the login form.

```sh
npm run test:ui
```

opens the Playwright UI runner.

## CI

GitHub Actions checks out this repo plus frontend and backend, generates the frontend API client, starts backend on `:5080` and frontend on `:30401`, then runs Playwright (Chromium).

The workflow runs:

- on every pull request to this repository
- after merge to `main` in this repository
- after merge to `main` in frontend or backend (those repos call the reusable workflow here)

Manual runs: Actions → E2E → Run workflow.
