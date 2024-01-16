import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { Session, User } from 'next-auth';
import { v4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { db, sqlite } from '~/server/db';
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

  afterEach(async () => {
    // Delete all data from database
    const tables = sqlite.prepare(`select name from sqlite_master where type = 'table';`).all() as {
      name: string;
    }[];
    for (const table of tables) {
      if (table.name.startsWith('__')) continue;
      sqlite.prepare(`delete from ${table.name}`).run();
    }
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

  test('All invites should return invites from database', async () => {
    const expireDate = new Date(2021, 1, 1);
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
    await db.insert(invites).values({
      id: v4(),
      createdById: '123',
      expires: expireDate,
      token: v4(),
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    const result = await caller.all({ page: 0, limit: 1 });

    expect(result.countPages).toEqual(2);
    expect(result.invites[0]).toStrictEqual({
      id: '123',
      creator: 'John Doe',
      expires: expireDate,
    });
  });

  test('Create should create new invite in database with expiration in 6 minutes', async () => {
    const expireDate = dayjs().add(6, 'minutes').set('milliseconds', 0).toDate();
    await db.insert(users).values({
      id: '123',
      name: 'John Doe',
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    const result = await caller.create({ expiration: expireDate });

    const dbInvite = await db.query.invites.findFirst({
      where: eq(invites.id, result.id),
    });

    expect(result.id).toBeDefined();
    expect(result.expires).toEqual(expireDate);
    expect(result.token).toHaveLength(40);
    expect(dbInvite).toStrictEqual({
      id: result.id,
      createdById: '123',
      expires: expireDate,
      token: result.token,
    });
  });

  test('Create should create new invite in database with expiration in 30 days', async () => {
    const expireDate = dayjs().add(6, 'months').add(-1, 'minute').set('milliseconds', 0).toDate();
    await db.insert(users).values({
      id: '123',
      name: 'John Doe',
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    const result = await caller.create({ expiration: expireDate });

    const dbInvite = await db.query.invites.findFirst({
      where: eq(invites.id, result.id),
    });

    expect(result.id).toBeDefined();
    expect(result.expires).toEqual(expireDate);
    expect(result.token).toHaveLength(40);
    expect(dbInvite).toStrictEqual({
      id: result.id,
      createdById: '123',
      expires: expireDate,
      token: result.token,
    });
  });

  test('Create should throw too_small with expiration in 4 minutes', async () => {
    const expireDate = dayjs().add(4, 'minutes').set('milliseconds', 0).toDate();
    await db.insert(users).values({
      id: '123',
      name: 'John Doe',
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    const act = async () => await caller.create({ expiration: expireDate });

    expect(act).rejects.toThrowError(/"code": "too_small"/);
  });

  test('Create should throw too_big with expiration in 7 months', async () => {
    const expireDate = dayjs().add(7, 'months').set('milliseconds', 0).toDate();
    await db.insert(users).values({
      id: '123',
      name: 'John Doe',
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    const act = async () => await caller.create({ expiration: expireDate });

    expect(act).rejects.toThrowError(/"code": "too_big"/);
  });

  test('Delete should delete invite from database', async () => {
    const inviteId = '123';
    await db.insert(users).values({
      id: '123',
      name: 'John Doe',
    });
    await db.insert(invites).values({
      id: inviteId,
      createdById: '123',
      expires: new Date(2023, 1, 1),
      token: 'token',
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    await caller.delete({ id: inviteId });

    const dbInvite = await db.query.invites.findFirst({
      where: eq(invites.id, inviteId),
    });

    expect(dbInvite).toBeUndefined();
  });

  test('Delete should delete invite from database', async () => {
    const inviteId = '123';
    await db.insert(users).values({
      id: '123',
      name: 'John Doe',
    });
    await db.insert(invites).values({
      id: inviteId,
      createdById: '123',
      expires: new Date(2023, 1, 1),
      token: 'token',
    });

    const caller = inviteRouter.createCaller({
      session: sessionMock({ isAdmin: true }),
      cookies: {},
    });

    await caller.delete({ id: inviteId });

    const dbInvite = await db.query.invites.findFirst({
      where: eq(invites.id, inviteId),
    });

    expect(dbInvite).toBeUndefined();
  });
});
