import type { Page } from '@playwright/test';

export class ArticlePage {
  constructor(private readonly page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/article/${slug}`);
  }

  title(text: string) {
    return this.page.getByRole('heading', { name: text, level: 1 });
  }

  editLink() {
    return this.page.getByRole('link', { name: /Edit Article/ }).first();
  }

  deleteButton() {
    return this.page.getByRole('button', { name: /Delete Article/ }).first();
  }

  favoriteButton() {
    return this.page.getByRole('button', { name: 'Favorite article' }).first();
  }

  unfavoriteButton() {
    return this.page.getByRole('button', { name: 'Unfavorite article' }).first();
  }

  signInToCommentLink() {
    return this.page.getByText('to add comments').locator('..').getByRole('link', { name: 'Sign in' });
  }

  commentItem(body: string) {
    return this.page.getByTestId('comment-item').filter({ hasText: body });
  }

  async addComment(body: string) {
    await this.page.getByTestId('comment-input').fill(body);
    await this.page.getByTestId('comment-submit').click();
  }

  async deleteComment(body: string) {
    await this.commentItem(body).getByTestId('comment-delete-button').click();
  }

  async favorite() {
    await this.favoriteButton().click();
  }

  async unfavorite() {
    await this.unfavoriteButton().click();
  }

  async deleteArticle() {
    await this.deleteButton().click();
  }
}
