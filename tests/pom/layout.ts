import type { Page } from '@playwright/test';

export class Layout {
  constructor(private readonly page: Page) {}

  homeLink() {
    return this.page.locator('nav').getByRole('link', { name: 'Home' });
  }

  signInLink() {
    return this.page.locator('nav').getByRole('link', { name: 'Sign in' });
  }

  signUpLink() {
    return this.page.locator('nav').getByRole('link', { name: 'Sign up' });
  }

  newArticleLink() {
    return this.page.locator('nav').getByRole('link', { name: /New Article/ });
  }

  settingsLink() {
    return this.page.locator('nav').getByRole('link', { name: /Settings/ });
  }

  userLink(username: string) {
    return this.page.locator('nav').getByRole('link', { name: username });
  }
}
