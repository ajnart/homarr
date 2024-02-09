import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import {
  BaseSQLiteDatabase,
  SQLiteTableFn,
  sqliteTable as defaultSqliteTableFn,
  text,
} from 'drizzle-orm/sqlite-core';
import { User } from 'next-auth';
import { Adapter, AdapterAccount } from 'next-auth/adapters';
import { db } from '~/server/db';
import { _users, accounts, sessions, userSettings, verificationTokens } from '~/server/db/schema';

// Need to modify createTables with custom schema
const createTables = (sqliteTable: SQLiteTableFn) => ({
  users: sqliteTable('user', {
    ..._users,
    email: text('email').notNull(), // workaround for typescript
  }),
  accounts,
  sessions,
  verificationTokens,
});

export type DefaultSchema = ReturnType<typeof createTables>;

export const onCreateUser = async ({ user }: { user: User }) => {
  await db.insert(userSettings).values({
    id: randomUUID(),
    userId: user.id,
  });
};

// Keep this the same as original file @auth/drizzle-adapter/src/lib/sqlite.ts
// only change changed return type from Adapter to "satisfies Adapter", to tell typescript createUser exists

export function SQLiteDrizzleAdapter(
  client: InstanceType<typeof BaseSQLiteDatabase>,
  tableFn = defaultSqliteTableFn
) {
  const { users, accounts, sessions, verificationTokens } = createTables(tableFn);

  return {
    createUser(data) {
      return client
        .insert(users)
        .values({ ...data, id: crypto.randomUUID() })
        .returning()
        .get();
    },
    getUser(data) {
      return client.select().from(users).where(eq(users.id, data)).get() ?? null;
    },
    getUserByEmail(data) {
      return client.select().from(users).where(eq(users.email, data)).get() ?? null;
    },
    createSession(data) {
      return client.insert(sessions).values(data).returning().get();
    },
    getSessionAndUser(data) {
      return (
        client
          .select({
            session: sessions,
            user: users,
          })
          .from(sessions)
          .where(eq(sessions.sessionToken, data))
          .innerJoin(users, eq(users.id, sessions.userId))
          .get() ?? null
      );
    },
    updateUser(data) {
      if (!data.id) {
        throw new Error('No user id.');
      }

      return client.update(users).set(data).where(eq(users.id, data.id)).returning().get();
    },
    updateSession(data) {
      return client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning()
        .get();
    },
    linkAccount(rawAccount) {
      const updatedAccount = client.insert(accounts).values(rawAccount).returning().get();

      const account: AdapterAccount = {
        ...updatedAccount,
        type: updatedAccount.type,
        access_token: updatedAccount.access_token ?? undefined,
        token_type: updatedAccount.token_type ?? undefined,
        id_token: updatedAccount.id_token ?? undefined,
        refresh_token: updatedAccount.refresh_token ?? undefined,
        scope: updatedAccount.scope ?? undefined,
        expires_at: updatedAccount.expires_at ?? undefined,
        session_state: updatedAccount.session_state ?? undefined,
      };

      return account;
    },
    getUserByAccount(account) {
      const results = client
        .select()
        .from(accounts)
        .leftJoin(users, eq(users.id, accounts.userId))
        .where(
          and(
            eq(accounts.provider, account.provider),
            eq(accounts.providerAccountId, account.providerAccountId)
          )
        )
        .get();

      return results?.user ?? null;
    },
    deleteSession(sessionToken) {
      return (
        client.delete(sessions).where(eq(sessions.sessionToken, sessionToken)).returning().get() ??
        null
      );
    },
    createVerificationToken(token) {
      return client.insert(verificationTokens).values(token).returning().get();
    },
    useVerificationToken(token) {
      try {
        return (
          client
            .delete(verificationTokens)
            .where(
              and(
                eq(verificationTokens.identifier, token.identifier),
                eq(verificationTokens.token, token.token)
              )
            )
            .returning()
            .get() ?? null
        );
      } catch (err) {
        throw new Error('No verification token found.');
      }
    },
    deleteUser(id) {
      return client.delete(users).where(eq(users.id, id)).returning().get();
    },
    unlinkAccount(account) {
      client
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider)
          )
        )
        .run();

      return undefined;
    },
  } satisfies Adapter;
}

export default SQLiteDrizzleAdapter(db);
