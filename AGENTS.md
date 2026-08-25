# Repository Guidance

## Overview

- Playwright end-to-end tests for the private RealWorld (Conduit) demo stack.
- Pair this repository with `example-app-frontend` and `example-app-backend`. Tests do not start those apps.
- `tests/` contains the Playwright specs. Coverage is the critical UI journeys: register, login, logout, publish/edit/delete article, comments, follow/Your Feed, favorite, settings, tags, 404, and guest auth gates.
- `.github/workflows/e2e.yml` is the reusable GitHub Actions workflow. Frontend and backend call it after merge to `main`.

Local services (must already be running):

- Frontend: `http://localhost:30401`
- Backend API: `http://localhost:5080/api`

## Toolchain

- Node.js 22 (matches CI). Use npm with `package-lock.json`; do not introduce Yarn or pnpm.
- Playwright `@playwright/test`. CI installs Chromium only; keep local defaults aligned unless a task explicitly adds browsers.
- TypeScript with `strict` enabled. Specs live next to `playwright.config.ts` under `tests/`. Page objects live in `tests/pom/`. Shared fixtures live in `tests/fixtures.ts`.

## Validation

Install browsers once, then run the suite against a running stack:

```sh
npm install
npx playwright install chromium
npm test
```

Optional: copy `.env.example` to `.env` or set `BASE_URL` / `API_URL`. Defaults are `http://localhost:30401` and `http://localhost:5080/api`.

```sh
npm run test:ui
```

opens the Playwright UI runner.

Start the apps yourself before running tests:

- Backend: `make run-local` in `example-app-backend`
- Frontend: `yarn install && yarn generate && yarn start` in `example-app-frontend`

## Development Practices

- Prefer role, placeholder, and heading locators. Use existing `data-test` attributes (for example `article-preview`) when the UI exposes them; do not invent a parallel selector scheme. `playwright.config.ts` maps `getByTestId` to `data-test`.
- Keep tests independent and fully parallel. Create unique users and article titles per run; do not reuse fixed credentials.
- Playwright owns the UI under test (clicks, fills, navigation, on-screen assertions).
- If a test is not about registration, use a precreated user (`POST /api/users`). If a test is not about login, authenticate with the JWT prehook fixture (`authedUser` or `injectAuth`), not the login form.
- API helpers may only create users and articles. Do not follow, favorite, comment, update settings, or mutate articles through the API.
- Do not add a Playwright `webServer` that starts frontend or backend. Local and CI both assume those processes are already up.
- Stay on Chromium unless a task explicitly expands the browser matrix.
- Do not commit Playwright reports, traces, screenshots, or `.env` files.
