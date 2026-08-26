import type { Page } from '@playwright/test';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/settings');
  }

  async updateBio(bio: string) {
    await this.page.getByPlaceholder('Short bio about you').fill(bio);
    await this.page.getByRole('button', { name: 'Update Settings' }).click();
  }

  async logout() {
    await this.page.getByRole('button', { name: 'Or click here to logout.' }).click();
  }
}
