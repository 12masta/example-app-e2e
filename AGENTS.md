# Repository Guidance

## Overview

- Playwright end-to-end tests for the private RealWorld (Conduit) demo stack.
- Pair this repository with `example-app-frontend` and `example-app-backend`. Tests do not start those apps.
- `tests/` contains the Playwright specs. The current critical path is register → publish article → see it on Global Feed.
- `.github/workflows/e2e.yml` is the reusable GitHub Actions workflow.

Unit coverage is not collected here. Jest lives in the frontend PR pipeline. Coverlet on Mediator slices lives in the backend PR pipeline. Those jobs must not start Playwright.

## E2E workflow modes

The same Playwright specs run in both modes. The difference is how the API process is started.

| Mode | When | API process | JS coverage |
|------|------|-------------|-------------|
| Real (`COVERAGE=0`) | Cron 07:00 and 19:00 Europe/Warsaw (CEST), e2e PRs, dispatch with coverage unchecked | `dotnet run` with no collector | Off |
| Coverage (`COVERAGE=1`) | After application merges to `main` (frontend and backend call this workflow with `coverage: true`), or dispatch with coverage checked | `dotnet-coverage` wraps `dotnet run` | `E2E_JS_COVERAGE=1` |

Set `coverage: true` on `workflow_call` / `workflow_dispatch` to mutate the backend harness. The scheduled runs ignore that flag and always stay real.

Local services (must already be running):

- Frontend: `http://localhost:30401`
- Backend API: `http://localhost:5080/api`

To collect JS coverage locally against an already running stack: `E2E_JS_COVERAGE=1 npm test`. Map the JSON with `tools/v8-map`. To collect API coverage locally, start the API under `dotnet-coverage` yourself. Do not add a Playwright `webServer`.

## Toolchain

- Node.js 22 (matches CI). Use npm with `package-lock.json`; do not introduce Yarn or pnpm.
- Playwright `@playwright/test`. CI installs Chromium only; keep local defaults aligned unless a task explicitly adds browsers.
- TypeScript with `strict` enabled. Specs live next to `playwright.config.ts` under `tests/`.

## Validation

Install browsers once, then run the suite against a running stack:

```sh
npm install
npx playwright install chromium
npm test
```

Optional: copy `.env.example` to `.env` or set `BASE_URL`. The default is `http://localhost:30401`.

```sh
npm run test:ui
```

opens the Playwright UI runner.

Start the apps yourself before running tests:

- Backend: `make run-local` in `example-app-backend`
- Frontend: `yarn install && yarn generate && yarn start` in `example-app-frontend`

## Development Practices

- Prefer role, placeholder, and heading locators. Use existing `data-test` attributes (for example `article-preview`) when the UI exposes them; do not invent a parallel selector scheme.
- Keep tests independent and fully parallel. Create unique users and article titles per run; do not reuse fixed credentials.
- Do not add a Playwright `webServer` that starts frontend or backend. Local and CI both assume those processes are already up.
- Stay on Chromium unless a task explicitly expands the browser matrix.
- Do not commit Playwright reports, traces, screenshots, or `.env` files.
- `E2E_JS_COVERAGE=1` is optional. It records Chromium JS coverage for the existing specs. It does not start apps and it does not add journeys.
