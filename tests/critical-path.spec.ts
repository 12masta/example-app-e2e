import { expect, test } from './fixtures';
import { uniqueArticle } from './helpers/unique';
import { EditorPage } from './pom/editor.page';
import { HomePage } from './pom/home.page';

test('publish article, see it on Global Feed', async ({ page, authedUser: _authedUser }) => {
  const article = uniqueArticle();
  const editor = new EditorPage(page);
  const home = new HomePage(page);

  await editor.gotoNew();
  await editor.publish(article);
  await expect(page).toHaveURL(/\/article\//);
  await expect(page.getByRole('heading', { name: article.title, level: 1 })).toBeVisible();

  await home.goto();
  await expect(home.articlePreview(article.title)).toBeVisible();
});
