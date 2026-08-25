import { test as base } from '@playwright/test';
import { createUser, type CreatedUser } from './helpers/api';
import { injectAuthToken } from './helpers/auth';

type Fixtures = {
  testUser: CreatedUser;
  authedUser: CreatedUser;
  injectAuth: (token: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  testUser: async ({ request }, use) => {
    await use(await createUser(request));
  },
  injectAuth: async ({ page }, use) => {
    await use(async (token: string) => {
      await injectAuthToken(page, token);
    });
  },
  authedUser: async ({ page, request }, use) => {
    const user = await createUser(request);
    await injectAuthToken(page, user.token);
    await use(user);
  },
});

export { expect } from '@playwright/test';
