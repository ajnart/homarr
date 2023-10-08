import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { Session, User } from 'next-auth';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '~/server/db';
import { invites, users } from '~/server/db/schema';

import { inviteRouter } from './invite-router';

const sessionMock = (user?: Partial<User>): Session => ({
  user: {
    id: user?.id ?? '123',
    name: user?.name ?? 'John Doe',
    language: user?.language ?? 'en',
    colorScheme: user?.colorScheme ?? 'dark',
    autoFocusSearch: user?.autoFocusSearch ?? false,
    isAdmin: user?.isAdmin ?? false,
  },
  expires: '1',
});

describe('invite router', () => {
  beforeEach(async () => {
    vi.stubEnv('DATABASE_URL', ':memory:');
    migrate(db, { migrationsFolder: './drizzle' });
  });

  test('Admin procedure check', async () => {
    const caller = inviteRouter.createCaller({
      session: sessionMock(),
      cookies: {},
    });

    await expect(
      (async () => {
        await caller.all({ page: 0 });
      })()
    ).rejects.toThrowError('FORBIDDEN');
  });

  test('Successfull request', async () => {
    let expireDate = new Date(2099, 1, 1);
    await db.insert(users).values({
      id: '123',
      name: 'John Doe',
    });
    await db.insert(invites).values({
      id: '123',
      createdById: '123',
      expires: expireDate,
      token: 'token',
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    const result = await caller.all({ page: 0 });

    expect(result.countPages).toEqual(1);
    expect(result.invites[0]).toStrictEqual({
      id: '123',
      creator: 'John Doe',
      expires: expireDate,
    });
  });
});
