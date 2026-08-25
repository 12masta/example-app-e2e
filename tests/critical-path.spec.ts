import { expect, test } from '@playwright/test';

function uniqueUser() {
  const id = Date.now();
  return {
    username: `e2e${id}`,
    email: `e2e${id}@example.com`,
    password: 'password1',
  };
}

test('register, publish article, see it on Global Feed', async ({ page }) => {
  const user = uniqueUser();
  const article = {
    title: `E2E article ${user.username}`,
    description: 'Critical path article',
    body: 'This article was created by the e2e critical-path test.',
  };

  await page.goto('/register');
  await page.getByPlaceholder('Username').fill(user.username);
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/\/settings$/);

  await page.goto('/editor');
  await page.getByPlaceholder('Article Title').fill(article.title);
  await page.getByPlaceholder("What's this article about?").fill(article.description);
  await page.getByPlaceholder('Write your article (in markdown)').fill(article.body);
  await page.getByRole('button', { name: 'Publish Article' }).click();
  await expect(page).toHaveURL(/\/article\//);
  await expect(page.getByRole('heading', { name: article.title, level: 1 })).toBeVisible();

  await page.goto('/');
  await expect(
    page.locator('[data-test="article-preview"]').filter({ hasText: article.title }),
  ).toBeVisible();
});
