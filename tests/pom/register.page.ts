import type { Page } from '@playwright/test';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/register');
  }

  formErrors() {
    return this.page.locator('.auth-page').getByRole('list');
  }

  async register(user: { username: string; email: string; password: string }) {
    await this.page.getByPlaceholder('Username').fill(user.username);
    await this.page.getByPlaceholder('Email').fill(user.email);
    await this.page.getByPlaceholder('Password').fill(user.password);
    await this.page.getByRole('button', { name: 'Sign up' }).click();
  }
}
