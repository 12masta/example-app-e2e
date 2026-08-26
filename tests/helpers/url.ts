import { expect, type Page } from '@playwright/test';

export async function expectPathname(page: Page, pathname: string) {
  const escaped = pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  await expect(page).toHaveURL(new RegExp(`${escaped}(?:\\?|$)`));
}
