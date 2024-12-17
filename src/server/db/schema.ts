import { InferSelectModel, relations } from 'drizzle-orm';
import { index, int, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { type AdapterAccount } from 'next-auth/adapters';

// workaround for typescript check in adapter
// preferably add email into credential login and make email non-nullable here
export const _users = {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email'),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  password: text('password'),
  salt: text('salt'),
  isAdmin: int('is_admin', { mode: 'boolean' }).notNull().default(false),
  isOwner: int('is_owner', { mode: 'boolean' }).notNull().default(false),
};

export const users = sqliteTable('user', _users);

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index('userId_idx').on(account.userId),
  })
);

export const sessions = sqliteTable(
  'session',
  {
    sessionToken: text('sessionToken').notNull().primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (session) => ({
    userIdIdx: index('user_id_idx').on(session.userId),
  })
);

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

const validColorScheme = ['environment', 'light', 'dark'] as const;
type ValidColorScheme = (typeof validColorScheme)[number];
const firstDaysOfWeek = ['monday', 'saturday', 'sunday'] as const;
type ValidFirstDayOfWeek = (typeof firstDaysOfWeek)[number];

export const userSettings = sqliteTable('user_setting', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  colorScheme: text('color_scheme').$type<ValidColorScheme>().notNull().default('environment'),
  language: text('language').notNull().default('en'),
  defaultBoard: text('default_board').notNull().default('default'),
  firstDayOfWeek: text('first_day_of_week')
    .$type<ValidFirstDayOfWeek>()
    .notNull()
    .default('monday'),
  searchTemplate: text('search_template').notNull().default('https://google.com/search?q=%s'),
  openSearchInNewTab: int('open_search_in_new_tab', { mode: 'boolean' }).notNull().default(true),
  disablePingPulse: int('disable_ping_pulse', { mode: 'boolean' }).notNull().default(false),
  replacePingWithIcons: int('replace_ping_with_icons', { mode: 'boolean' })
    .notNull()
    .default(false),
  useDebugLanguage: int('use_debug_language', { mode: 'boolean' }).notNull().default(false),
  autoFocusSearch: int('auto_focus_search', { mode: 'boolean' }).notNull().default(false),
});

export type UserSettings = InferSelectModel<typeof userSettings>;

export const invites = sqliteTable('invite', {
  id: text('id').notNull().primaryKey(),
  token: text('token').notNull().unique(),
  expires: int('expires', {
    mode: 'timestamp',
  }).notNull(),
  createdById: text('created_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export type Invite = InferSelectModel<typeof invites>;

export const migrateTokens = sqliteTable('migrate_token', {
  id: text('id').notNull().primaryKey(),
  token: text('token').notNull().unique(),
  boards: int('boards', { mode: 'boolean' }).notNull(),
  users: int('users', { mode: 'boolean' }).notNull(),
  integrations: int('integrations', { mode: 'boolean' }).notNull(),
  expires: int('expires', {
    mode: 'timestamp',
  }).notNull(),
});

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const userRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  settings: one(userSettings),
  invites: many(invites),
}));

export const userSettingRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const inviteRelations = relations(invites, ({ one }) => ({
  createdBy: one(users, {
    fields: [invites.createdById],
    references: [users.id],
  }),
}));
