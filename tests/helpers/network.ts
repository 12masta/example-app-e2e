import type { Page, Response } from '@playwright/test';

function isSuccessfulApiPost(response: Response, pathSnippet: string) {
  return (
    response.request().method() === 'POST' &&
    response.url().includes(pathSnippet) &&
    response.status() >= 200 &&
    response.status() < 300
  );
}

export async function waitForApiPost(page: Page, pathSnippet: string) {
  return page.waitForResponse((response) => isSuccessfulApiPost(response, pathSnippet));
}
