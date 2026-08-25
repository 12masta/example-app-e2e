import type { APIRequestContext } from '@playwright/test';
import { API_URL } from './config';
import { uniqueArticle, uniqueUserCredentials } from './unique';

export type CreatedUser = {
  username: string;
  email: string;
  password: string;
  token: string;
};

export type ArticleFields = {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
};

export type CreatedArticle = ArticleFields & {
  slug: string;
};

async function readError(response: { status: () => number; text: () => Promise<string> }) {
  const body = await response.text();
  return `API ${response.status()}: ${body}`;
}

export async function createUser(
  request: APIRequestContext,
  credentials = uniqueUserCredentials(),
): Promise<CreatedUser> {
  const response = await request.post(`${API_URL}/users`, {
    data: { user: credentials },
  });

  if (!response.ok()) {
    throw new Error(`createUser failed: ${await readError(response)}`);
  }

  const body = (await response.json()) as { user: { token: string; username: string; email: string } };
  return {
    username: body.user.username,
    email: body.user.email,
    password: credentials.password,
    token: body.user.token,
  };
}

export async function createArticle(
  request: APIRequestContext,
  token: string,
  article: ArticleFields = uniqueArticle(),
): Promise<CreatedArticle> {
  const response = await request.post(`${API_URL}/articles`, {
    headers: { Authorization: `Token ${token}` },
    data: { article },
  });

  if (!response.ok()) {
    throw new Error(`createArticle failed: ${await readError(response)}`);
  }

  const body = (await response.json()) as { article: CreatedArticle };
  return {
    slug: body.article.slug,
    title: body.article.title,
    description: body.article.description,
    body: body.article.body,
    tagList: body.article.tagList,
  };
}
