export function uniqueId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function uniqueUserCredentials() {
  const id = uniqueId();
  return {
    username: `e2e${id}`,
    email: `e2e${id}@example.com`,
    password: 'password1',
  };
}

export function uniqueArticle(prefix = 'E2E') {
  const id = uniqueId();
  return {
    title: `${prefix} ${id}`,
    description: `Description ${id}`,
    body: `Body for article ${id}`,
  };
}

export function uniqueTag(): string {
  return `t${uniqueId()}`;
}
