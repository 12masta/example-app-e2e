import { expect, type Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  articlePreview(title: string) {
    return this.page.getByTestId('article-preview').filter({ hasText: title });
  }

  emptyFeed() {
    return this.page.getByText('No articles are here... yet.');
  }

  async waitForFeedSettled() {
    await expect(this.emptyFeed().or(this.page.getByTestId('article-preview')).first()).toBeVisible();
  }

  yourFeedLink() {
    return this.page.getByRole('link', { name: 'Your Feed' });
  }

  globalFeedLink() {
    return this.page.getByRole('link', { name: 'Global Feed' });
  }

  async openYourFeed() {
    await this.yourFeedLink().click();
  }

  async clickPopularTag(tag: string) {
    await this.page.locator('.sidebar').getByRole('link', { name: tag, exact: true }).click();
  }
}
