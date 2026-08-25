import { expect, test } from './fixtures';
import { createArticle, createUser } from './helpers/api';
import { waitForApiPost } from './helpers/network';
import { ArticlePage } from './pom/article.page';
import { HomePage } from './pom/home.page';
import { ProfilePage } from './pom/profile.page';

test('follow an author and see their article on Your Feed', async ({ page, request, injectAuth }) => {
  const author = await createUser(request);
  const article = await createArticle(request, author.token);
  const reader = await createUser(request);
  await injectAuth(reader.token);

  const home = new HomePage(page);
  const profile = new ProfilePage(page);

  await home.goto();
  await home.openYourFeed();
  await expect(home.emptyFeed()).toBeVisible();

  await profile.goto(author.username);
  await Promise.all([waitForApiPost(page, `/profiles/${author.username}/follow`), profile.follow()]);
  await expect(profile.unfollowButton()).toBeVisible();

  await home.goto();
  await home.openYourFeed();
  await expect(home.articlePreview(article.title)).toBeVisible();
});

test('favorite an article and see it on Favorited Articles', async ({ page, request, injectAuth }) => {
  const author = await createUser(request);
  const article = await createArticle(request, author.token);
  const reader = await createUser(request);
  await injectAuth(reader.token);

  const articlePage = new ArticlePage(page);
  const profile = new ProfilePage(page);

  await articlePage.goto(article.slug);
  await Promise.all([waitForApiPost(page, `/articles/${article.slug}/favorite`), articlePage.favorite()]);
  await expect(articlePage.unfavoriteButton()).toBeVisible();

  await profile.goto(reader.username);
  await profile.openFavoritedArticles();
  await expect(profile.articlePreview(article.title)).toBeVisible();

  await articlePage.goto(article.slug);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        response.url().includes(`/articles/${article.slug}/favorite`) &&
        response.status() >= 200 &&
        response.status() < 300,
    ),
    articlePage.unfavorite(),
  ]);
  await expect(articlePage.favoriteButton()).toBeVisible();

  await profile.goto(reader.username);
  await profile.openFavoritedArticles();
  await expect(profile.emptyFeed()).toBeVisible();
});
