import { expect, test } from './fixtures';
import { uniqueUserCredentials } from './helpers/unique';
import { Layout } from './pom/layout';
import { LoginPage } from './pom/login.page';
import { RegisterPage } from './pom/register.page';
import { SettingsPage } from './pom/settings.page';

test('register through the form and land on settings', async ({ page }) => {
  const user = uniqueUserCredentials();
  const registerPage = new RegisterPage(page);
  const layout = new Layout(page);

  await registerPage.goto();
  await registerPage.register(user);

  await expect(page).toHaveURL(/\/settings$/);
  await expect(layout.userLink(user.username)).toBeVisible();
  await expect(layout.settingsLink()).toBeVisible();
});

test('register with a short password shows inline errors', async ({ page }) => {
  const user = uniqueUserCredentials();
  const registerPage = new RegisterPage(page);

  await registerPage.goto();
  await registerPage.register({ ...user, password: 'short7x' });

  await expect(page).toHaveURL(/\/register$/);
  await expect(registerPage.formErrors()).toBeVisible();
  await expect(registerPage.formErrors()).toContainText(/password/i);
});

test('login through the form with a precreated user', async ({ page, testUser }) => {
  const loginPage = new LoginPage(page);
  const layout = new Layout(page);

  await loginPage.goto();
  await loginPage.login(testUser.email, testUser.password);

  await expect(page).toHaveURL(/\/settings$/);
  await expect(layout.userLink(testUser.username)).toBeVisible();
});

test('login with the wrong password shows authentication expired', async ({ page, testUser }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(testUser.email, 'wrong-password-1');

  await expect(page.getByText('Authentication expired')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to login' })).toBeVisible();
});

test('logout from a prehook session returns to guest nav', async ({ page, authedUser: _authedUser }) => {
  const settings = new SettingsPage(page);
  const layout = new Layout(page);

  await settings.goto();
  await settings.logout();

  await expect(page).toHaveURL(/\/login$/);
  await expect(layout.signInLink()).toBeVisible();
  await expect(layout.signUpLink()).toBeVisible();
});
