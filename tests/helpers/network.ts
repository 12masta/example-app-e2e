import type { Page, Response } from '@playwright/test';

function isSuccessfulApiResponse(response: Response, method: string, pathSnippet: string) {
  if (response.request().method() !== method) {
    return false;
  }

  if (response.status() < 200 || response.status() >= 300) {
    return false;
  }

  const pathname = new URL(response.url()).pathname;
  return pathname.endsWith(pathSnippet);
}

export async function waitForApi(page: Page, method: string, pathSnippet: string) {
  return page.waitForResponse((response) => isSuccessfulApiResponse(response, method, pathSnippet));
}

export async function waitForApiPost(page: Page, pathSnippet: string) {
  return waitForApi(page, 'POST', pathSnippet);
}
