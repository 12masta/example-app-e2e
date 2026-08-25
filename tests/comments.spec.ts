import { expect, test } from './fixtures';
import { createArticle } from './helpers/api';
import { uniqueId } from './helpers/unique';
import { ArticlePage } from './pom/article.page';

test('add and delete a comment on an article', async ({ page, request, authedUser }) => {
  const existing = await createArticle(request, authedUser.token);
  const body = `Comment ${uniqueId()}`;
  const articlePage = new ArticlePage(page);

  await articlePage.goto(existing.slug);
  await articlePage.addComment(body);
  await expect(articlePage.commentItem(body)).toBeVisible();

  await articlePage.deleteComment(body);
  await expect(articlePage.commentItem(body)).toHaveCount(0);
});
