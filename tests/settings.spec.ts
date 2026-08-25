import { expect, test } from './fixtures';
import { waitForApi } from './helpers/network';
import { uniqueId } from './helpers/unique';
import { Layout } from './pom/layout';
import { ProfilePage } from './pom/profile.page';
import { SettingsPage } from './pom/settings.page';

test('update bio in settings and see it on the profile', async ({ page, authedUser }) => {
  const bio = `Bio ${uniqueId()}`;
  const settings = new SettingsPage(page);
  const profile = new ProfilePage(page);
  const layout = new Layout(page);

  await settings.goto();
  await Promise.all([waitForApi(page, 'PUT', '/user'), settings.updateBio(bio)]);

  await layout.userLink(authedUser.username).click();
  await expect(page).toHaveURL(new RegExp(`/profile/${authedUser.username}`));
  await expect(profile.bio()).toHaveText(bio);
});
