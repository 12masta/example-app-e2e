import type { Page } from '@playwright/test';

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async goto(username: string) {
    await this.page.goto(`/profile/${username}`);
  }

  username() {
    return this.page.getByTestId('app-header-username');
  }

  bio() {
    return this.page.getByTestId('app-header-bio');
  }

  followButton() {
    return this.page.getByRole('button', { name: 'Follow user' });
  }

  unfollowButton() {
    return this.page.getByRole('button', { name: 'Unfollow user' });
  }

  articlePreview(title: string) {
    return this.page.getByTestId('article-preview').filter({ hasText: title });
  }

  emptyFeed() {
    return this.page.getByText('No articles are here... yet.');
  }

  async follow() {
    await this.followButton().click();
  }

  async openMyArticles() {
    await this.page.getByRole('link', { name: 'My Articles' }).click();
  }

  async openFavoritedArticles() {
    await this.page.getByRole('link', { name: 'Favorited Articles' }).click();
  }
}
