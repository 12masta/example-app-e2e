import { expect, test } from './fixtures';
import { createArticle, createUser } from './helpers/api';
import { expectPathname } from './helpers/url';
import { Layout } from './pom/layout';
import { LoginPage } from './pom/login.page';
import { NotFoundPage } from './pom/not-found.page';
import { ArticlePage } from './pom/article.page';

test('guest visiting editor and settings is sent to login', async ({ page }) => {
  await page.goto('/editor');
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/settings');
  await expect(page).toHaveURL(/\/login$/);
});

test('authenticated user visiting login and register is sent home', async ({ page, authedUser }) => {
  void authedUser;
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expectPathname(page, '/');

  await page.goto('/register');
  await expectPathname(page, '/');
});

test('guest on an article is prompted to sign in to comment', async ({ page, request }) => {
  const author = await createUser(request);
  const article = await createArticle(request, author.token);
  const articlePage = new ArticlePage(page);
  const layout = new Layout(page);

  await articlePage.goto(article.slug);
  await expect(page.getByText('to add comments')).toBeVisible();
  await articlePage.signInToCommentLink().click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(layout.signInLink()).toBeVisible();
});

test('unknown path shows 404 and can return home', async ({ page }) => {
  const notFound = new NotFoundPage(page);

  await page.goto('/this-page-does-not-exist');
  await expect(page).toHaveURL(/\/404$/);
  await expect(notFound.title()).toHaveText('Page not found');

  await notFound.goHomeLink().click();
  await expectPathname(page, '/');
});
