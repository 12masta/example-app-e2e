import type { Page } from '@playwright/test';

const TOKEN_STORAGE_KEY = 'realworld-auth-token';

export async function injectAuthToken(page: Page, token: string) {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: TOKEN_STORAGE_KEY, value: token },
  );
}
