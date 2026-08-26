import type { Page } from '@playwright/test';

export class NotFoundPage {
  constructor(private readonly page: Page) {}

  title() {
    return this.page.getByTestId('not-found-title');
  }

  goHomeLink() {
    return this.page.getByTestId('go-home-link');
  }
}
