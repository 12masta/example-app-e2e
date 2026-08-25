import { expect, test } from './fixtures';
import { createArticle } from './helpers/api';
import { uniqueArticle } from './helpers/unique';
import { expectPathname } from './helpers/url';
import { ArticlePage } from './pom/article.page';
import { EditorPage } from './pom/editor.page';
import { HomePage } from './pom/home.page';

test('edit own article through the editor', async ({ page, request, authedUser }) => {
  const existing = await createArticle(request, authedUser.token);
  const updated = uniqueArticle('Edited');
  const articlePage = new ArticlePage(page);
  const editor = new EditorPage(page);

  await articlePage.goto(existing.slug);
  await articlePage.editLink().click();
  await expect(page).toHaveURL(new RegExp(`/editor/${existing.slug}$`));

  await editor.publish(updated);
  await expect(page).toHaveURL(/\/article\//);
  await expect(articlePage.title(updated.title)).toBeVisible();
  await expect(page.getByText(updated.body)).toBeVisible();
});

test('delete own article and it is no longer readable', async ({ page, request, authedUser }) => {
  const existing = await createArticle(request, authedUser.token);
  const articlePage = new ArticlePage(page);
  const home = new HomePage(page);

  await articlePage.goto(existing.slug);
  await articlePage.deleteArticle();
  await expectPathname(page, '/');
  await expect(home.articlePreview(existing.title)).toHaveCount(0);

  await articlePage.goto(existing.slug);
  await expect(page.getByText('Could not load article')).toBeVisible();
});
