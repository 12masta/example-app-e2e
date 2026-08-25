import type { Page } from '@playwright/test';

export type EditorFields = {
  title: string;
  description: string;
  body: string;
  tags?: string;
};

export class EditorPage {
  constructor(private readonly page: Page) {}

  async gotoNew() {
    await this.page.goto('/editor');
  }

  async gotoEdit(slug: string) {
    await this.page.goto(`/editor/${slug}`);
  }

  async publish(article: EditorFields) {
    await this.page.getByPlaceholder('Article Title').fill(article.title);
    await this.page.getByPlaceholder("What's this article about?").fill(article.description);
    await this.page.getByPlaceholder('Write your article (in markdown)').fill(article.body);
    if (article.tags !== undefined) {
      await this.page.getByPlaceholder('Enter tags').fill(article.tags);
    }
    await this.page.getByRole('button', { name: 'Publish Article' }).click();
  }
}
