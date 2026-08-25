import { expect, test } from './fixtures';
import { createArticle, createUser } from './helpers/api';
import { uniqueArticle, uniqueTag } from './helpers/unique';
import { HomePage } from './pom/home.page';

test('filter Global Feed by a popular tag', async ({ page, request }) => {
  const tag = uniqueTag();
  const author = await createUser(request);
  const article = await createArticle(request, author.token, { ...uniqueArticle(), tagList: [tag] });
  const home = new HomePage(page);

  await home.goto();
  await home.clickPopularTag(tag);
  await expect(page).toHaveURL(new RegExp(`[?&]tag=${tag}`));
  await expect(page.getByText(`#${tag}`)).toBeVisible();
  await expect(home.articlePreview(article.title)).toBeVisible();
});
