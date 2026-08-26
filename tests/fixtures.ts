import fs from 'node:fs';
import path from 'node:path';
import { expect, test as base } from '@playwright/test';

const collectJsCoverage = process.env.E2E_JS_COVERAGE === '1';

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

export const test = base.extend({
  page: async ({ page }, use) => {
    if (collectJsCoverage) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
    }

    try {
      await use(page);
    } finally {
      if (collectJsCoverage) {
        const entries = await page.coverage.stopJSCoverage();
        const records = [];
        for (const entry of entries) {
          records.push({
            url: entry.url,
            source: entry.source,
            sourceMap: await sourceMapFor(entry.url, entry.source),
            functions: entry.functions,
          });
        }

        const out =
          process.env.V8_RAW ?? path.join(process.cwd(), 'test-results/e2e-js/raw/v8-coverage.json');
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, JSON.stringify(records, null, 2));
      }
    }
  },
});

export { expect };
