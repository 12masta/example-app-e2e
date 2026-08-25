import fs from 'node:fs';
import path from 'node:path';
import { expect, test as base, type Page } from '@playwright/test';
import { createUser, type CreatedUser } from './helpers/api';
import { injectAuthToken } from './helpers/auth';

const collectJsCoverage = process.env.E2E_JS_COVERAGE === '1';

type CoverageRecord = {
  url: string;
  source: string | undefined;
  sourceMap: string | undefined;
  functions: unknown;
};

type Fixtures = {
  testUser: CreatedUser;
  authedUser: CreatedUser;
  injectAuth: (token: string) => Promise<void>;
};

async function sourceMapFor(url: string, source: string | undefined): Promise<string | undefined> {
  if (!source) {
    return undefined;
  }
  const match = source.match(/sourceMappingURL=(\S+)/);
  if (!match || match[1].startsWith('data:')) {
    return undefined;
  }
  try {
    const response = await fetch(new URL(match[1], url).toString());
    if (!response.ok) {
      return undefined;
    }
    return await response.text();
  } catch {
    return undefined;
  }
}

async function recordsFrom(entries: Awaited<ReturnType<Page['coverage']['stopJSCoverage']>>): Promise<CoverageRecord[]> {
  const records: CoverageRecord[] = [];
  for (const entry of entries) {
    records.push({
      url: entry.url,
      source: entry.source,
      sourceMap: await sourceMapFor(entry.url, entry.source),
      functions: entry.functions,
    });
  }
  return records;
}

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    const harvested: CoverageRecord[] = [];
    let coverageRunning = false;

    async function startCoverage() {
      await page.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: true });
      coverageRunning = true;
    }

    async function harvest() {
      if (!coverageRunning) {
        return;
      }
      coverageRunning = false;
      const entries = await page.coverage.stopJSCoverage();
      harvested.push(...(await recordsFrom(entries)));
    }

    if (collectJsCoverage) {
      await startCoverage();
      const originalGoto = page.goto.bind(page);
      const originalReload = page.reload.bind(page);
      page.goto = async (url, options) => {
        await harvest();
        await startCoverage();
        return originalGoto(url, options);
      };
      page.reload = async options => {
        await harvest();
        await startCoverage();
        return originalReload(options);
      };
    }

    try {
      await use(page);
    } finally {
      if (collectJsCoverage) {
        await harvest();
        const out =
          process.env.V8_RAW ?? path.join(process.cwd(), 'test-results/e2e-js/raw/v8-coverage.json');
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, JSON.stringify(harvested, null, 2));
      }
    }
  },
  testUser: async ({ request }, use) => {
    await use(await createUser(request));
  },
  injectAuth: async ({ page }, use) => {
    await use(async (token: string) => {
      await injectAuthToken(page, token);
    });
  },
  authedUser: async ({ page, request }, use) => {
    const user = await createUser(request);
    await injectAuthToken(page, user.token);
    await use(user);
  },
});

export { expect };
