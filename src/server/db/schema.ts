import type { MantineColor } from '@mantine/core';
import { type InferSelectModel, relations } from 'drizzle-orm';
import { index, int, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { type AdapterAccount } from 'next-auth/adapters';

import type {
  AppNamePosition,
  AppNameStyle,
  BoardBackgroundImageAttachmentType,
  BoardBackgroundImageRepeatType,
  BoardBackgroundImageSizeType,
  ColorScheme,
  FirstDayOfWeek,
  IntegrationSecretKey,
  IntegrationSecretVisibility,
  IntegrationType,
  LayoutKind,
  SectionType,
  WidgetOptionType,
  WidgetSort,
} from './items';

export const users = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email'),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  password: text('password'),
  salt: text('salt'),
  isAdmin: int('is_admin', { mode: 'boolean' }).notNull().default(false),
  isOwner: int('is_owner', { mode: 'boolean' }).notNull().default(false),
});

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

export const userSettings = sqliteTable('user_setting', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  colorScheme: text('color_scheme').$type<ColorScheme>().notNull().default('environment'),
  language: text('language').notNull().default('en'),
  defaultBoard: text('default_board').notNull().default('default'),
  firstDayOfWeek: text('first_day_of_week').$type<FirstDayOfWeek>().notNull().default('monday'),
  searchTemplate: text('search_template').notNull().default('https://google.com/search?q=%s'),
  openSearchInNewTab: int('open_search_in_new_tab', { mode: 'boolean' }).notNull().default(true),
  disablePingPulse: int('disable_ping_pulse', { mode: 'boolean' }).notNull().default(false),
  replacePingWithIcons: int('replace_ping_with_icons', { mode: 'boolean' })
    .notNull()
    .default(false),
  useDebugLanguage: int('use_debug_language', { mode: 'boolean' }).notNull().default(false),
  autoFocusSearch: int('auto_focus_search', { mode: 'boolean' }).notNull().default(false),
});

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

export const boards = sqliteTable('board', {
  // Common
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),

  // Layout settings
  isPingEnabled: int('is_ping_enabled', { mode: 'boolean' }).default(false).notNull(),

  // Access control
  allowGuests: int('allow_guests', { mode: 'boolean' }).default(false).notNull(),

  // Page metadata
  pageTitle: text('page_title'),
  metaTitle: text('meta_title'),
  logoImageUrl: text('logo_image_url'),
  faviconImageUrl: text('favicon_image_url'),

  // Appearance
  backgroundImageUrl: text('background_image_url'),
  backgroundImageAttachment: text('background_image_attachment')
    .$type<BoardBackgroundImageAttachmentType>()
    .default('fixed')
    .notNull(),
  backgroundImageRepeat: text('background_image_repeat')
    .$type<BoardBackgroundImageRepeatType>()
    .default('no-repeat')
    .notNull(),
  backgroundImageSize: text('background_image_size')
    .$type<BoardBackgroundImageSizeType>()
    .default('cover')
    .notNull(),
  primaryColor: text('primary_color').$type<MantineColor>().default('red').notNull(),
  secondaryColor: text('secondary_color').$type<MantineColor>().default('orange').notNull(),
  primaryShade: int('primary_shade').default(6).notNull(),
  appOpacity: int('app_opacity').default(100).notNull(),
  customCss: text('custom_css'),

  // Other
  ownerId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const integrations = sqliteTable('integration', {
  id: text('id').notNull().primaryKey(),
  sort: text('sort').$type<IntegrationType>().notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
});

export const integrationSecrets = sqliteTable(
  'integration_secret',
  {
    key: text('key').$type<IntegrationSecretKey>().notNull(),
    value: text('value'),
    visibility: text('visibility').$type<IntegrationSecretVisibility>().notNull(),
    integrationId: text('integration_id')
      .notNull()
      .references(() => integrations.id, { onDelete: 'cascade' }),
  },
  (secret) => ({
    compoundKey: primaryKey(secret.integrationId, secret.key),
  })
);

export const boardIntegrations = sqliteTable(
  'board_integration',
  {
    boardId: text('board_id').notNull(),
    integrationId: text('integration_id').notNull(),
  },
  (boardIntegration) => ({
    compoundKey: primaryKey(boardIntegration.boardId, boardIntegration.integrationId),
  })
);

export const widgets = sqliteTable('widget', {
  id: text('id').notNull().primaryKey(),
  sort: text('sort').$type<WidgetSort>().notNull(),
  itemId: text('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
});

export const widgetIntegrations = sqliteTable(
  'widget_integration',
  {
    widgetId: text('widget_id')
      .notNull()
      .references(() => widgets.id, { onDelete: 'cascade' }),
    integrationId: text('integration_id')
      .notNull()
      .references(() => integrations.id, { onDelete: 'cascade' }),
  },
  (widgetIntegration) => ({
    compoundKey: primaryKey(widgetIntegration.widgetId, widgetIntegration.integrationId),
  })
);

export const widgetOptions = sqliteTable(
  'widget_option',
  {
    path: text('path').notNull(),
    value: text('value'),
    type: text('type').$type<WidgetOptionType>().notNull(),
    widgetId: text('widget_id')
      .notNull()
      .references(() => widgets.id, { onDelete: 'cascade' }),
  },
  (widgetOption) => ({
    compoundKey: primaryKey(widgetOption.widgetId, widgetOption.path),
  })
);

export const items = sqliteTable('item', {
  id: text('id').notNull().primaryKey(),
  kind: text('kind').$type<'app' | 'widget'>().notNull(),
  boardId: text('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
});

export const apps = sqliteTable('app', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  internalUrl: text('internal_url').notNull(),
  externalUrl: text('external_url'),
  iconUrl: text('icon_url').notNull(),
  openInNewTab: int('open_in_new_tab', { mode: 'boolean' }).notNull().default(false),
  isPingEnabled: int('is_ping_enabled', { mode: 'boolean' }).notNull().default(false),
  fontSize: int('font_size').notNull().default(16),
  namePosition: text('name_position').$type<AppNamePosition>().notNull().default('top'),
  nameStyle: text('name_style').$type<AppNameStyle>().notNull().default('normal'),
  nameLineClamp: int('name_line_clamp').notNull().default(1),
  itemId: text('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
});

export const statusCodes = sqliteTable('status_code', {
  code: int('code').notNull().primaryKey(),
});

export const appStatusCodes = sqliteTable(
  'app_status_code',
  {
    appId: text('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    code: int('code')
      .notNull()
      .references(() => statusCodes.code, { onDelete: 'cascade' }),
  },
  (appStatusCode) => ({
    compoundKey: primaryKey(appStatusCode.appId, appStatusCode.code),
  })
);

export const layoutItems = sqliteTable('layout_item', {
  id: text('id').notNull().primaryKey(),
  sectionId: text('section_id')
    .notNull()
    .references(() => sections.id, { onDelete: 'cascade' }),
  itemId: text('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  x: int('x').notNull(),
  y: int('y').notNull(),
  width: int('width').notNull(),
  height: int('height').notNull(),
});

export const layouts = sqliteTable('layout', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
  kind: text('kind').$type<LayoutKind>().notNull(),
  showRightSidebar: int('show_right_sidebar', { mode: 'boolean' }).notNull().default(false),
  showLeftSidebar: int('show_left_sidebar', { mode: 'boolean' }).notNull().default(false),
  columnCount: int('column_count').notNull().default(10),
  boardId: text('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
});

export const sections = sqliteTable('section', {
  id: text('id').notNull().primaryKey(),
  kind: text('kind').$type<SectionType>().notNull(),
  position: int('position'), // number, right = 0, left = 1
  name: text('name'),
  layoutId: text('layout_id')
    .notNull()
    .references(() => layouts.id, { onDelete: 'cascade' }),
});

export const sectionRelations = relations(sections, ({ one, many }) => ({
  layout: one(layouts, {
    fields: [sections.layoutId],
    references: [layouts.id],
  }),
  items: many(layoutItems),
}));

export const layoutRelations = relations(layouts, ({ many, one }) => ({
  sections: many(sections),
  board: one(boards, {
    fields: [layouts.boardId],
    references: [boards.id],
  }),
}));

export const layoutItemRelations = relations(layoutItems, ({ one }) => ({
  item: one(items, {
    fields: [layoutItems.itemId],
    references: [items.id],
  }),
  section: one(sections, {
    fields: [layoutItems.sectionId],
    references: [sections.id],
  }),
}));

export const statusCodeRelations = relations(statusCodes, ({ many }) => ({
  apps: many(appStatusCodes),
}));

export const appStatusCodeRelations = relations(appStatusCodes, ({ one }) => ({
  statusCode: one(statusCodes, {
    fields: [appStatusCodes.code],
    references: [statusCodes.code],
  }),
  app: one(apps, {
    fields: [appStatusCodes.appId],
    references: [apps.id],
  }),
}));

export const widgetOptionRelations = relations(widgetOptions, ({ one }) => ({
  widget: one(widgets, {
    fields: [widgetOptions.widgetId],
    references: [widgets.id],
  }),
}));

export const widgetRelations = relations(widgets, ({ one, many }) => ({
  item: one(items, {
    fields: [widgets.itemId],
    references: [items.id],
  }),
  options: many(widgetOptions),
  integrations: many(widgetIntegrations),
}));

export const widgetIntegrationRelations = relations(widgetIntegrations, ({ one }) => ({
  widget: one(widgets, {
    fields: [widgetIntegrations.widgetId],
    references: [widgets.id],
  }),
  integration: one(integrations, {
    fields: [widgetIntegrations.integrationId],
    references: [integrations.id],
  }),
}));

export const itemRelations = relations(items, ({ one, many }) => ({
  board: one(boards, {
    fields: [items.boardId],
    references: [boards.id],
  }),
  widget: one(widgets),
  app: one(apps),
  layouts: many(layoutItems),
}));

export const integrationRelations = relations(integrations, ({ many }) => ({
  secrets: many(integrationSecrets),
  widgets: many(widgetIntegrations),
  boards: many(boardIntegrations),
}));

export const appRelations = relations(apps, ({ many, one }) => ({
  statusCodes: many(appStatusCodes),
  item: one(items, {
    fields: [apps.itemId],
    references: [items.id],
  }),
}));

export const integrationSecretRelations = relations(integrationSecrets, ({ one }) => ({
  integration: one(integrations, {
    fields: [integrationSecrets.integrationId],
    references: [integrations.id],
  }),
}));

export const boardRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, {
    fields: [boards.ownerId],
    references: [users.id],
  }),
  items: many(items),
  layouts: many(layouts),
  mediaIntegrations: many(boardIntegrations),
}));

export const boardIntegrationRelations = relations(boardIntegrations, ({ one }) => ({
  board: one(boards, {
    fields: [boardIntegrations.boardId],
    references: [boards.id],
  }),
  integration: one(integrations, {
    fields: [boardIntegrations.integrationId],
    references: [integrations.id],
  }),
}));

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
  boards: many(boards),
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

export type UserSettings = InferSelectModel<typeof userSettings>;
export type Invite = InferSelectModel<typeof invites>;
export type Section = InferSelectModel<typeof sections>;
export type Integration = InferSelectModel<typeof integrations>;
