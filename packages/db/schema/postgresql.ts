import type { AdapterAccount } from "@auth/core/adapters";
import type { MantineSize } from "@mantine/core";
import type { DayOfWeek } from "@mantine/dates";
import { relations } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  customType,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import {
  backgroundImageAttachments,
  backgroundImageRepeats,
  backgroundImageSizes,
  emptySuperJSON,
} from "@homarr/definitions";
import type {
  BackgroundImageAttachment,
  BackgroundImageRepeat,
  BackgroundImageSize,
  BoardPermission,
  ColorScheme,
  GroupPermissionKey,
  IntegrationKind,
  IntegrationPermission,
  IntegrationSecretKind,
  OnboardingStep,
  SearchEngineType,
  SectionKind,
  SupportedAuthProvider,
  WidgetKind,
} from "@homarr/definitions";

const customBlob = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export * from "@homarr/core/infrastructure/certificates/hostnames/db/postgresql";

export const apiKeys = pgTable("apiKey", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  apiKey: text().notNull(),
  salt: text().notNull(),
  userId: varchar({ length: 64 })
    .notNull()
    .references((): AnyPgColumn => users.id, {
      onDelete: "cascade",
    }),
});

export const users = pgTable("user", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  name: text(),
  email: text(),
  emailVerified: timestamp(),
  image: text(),
  password: text(),
  salt: text(),
  provider: varchar({ length: 64 }).$type<SupportedAuthProvider>().default("credentials").notNull(),
  homeBoardId: varchar({ length: 64 }).references((): AnyPgColumn => boards.id, {
    onDelete: "set null",
  }),
  mobileHomeBoardId: varchar({ length: 64 }).references((): AnyPgColumn => boards.id, {
    onDelete: "set null",
  }),
  defaultSearchEngineId: varchar({ length: 64 }).references(() => searchEngines.id, {
    onDelete: "set null",
  }),
  openSearchInNewTab: boolean().default(false).notNull(),
  colorScheme: varchar({ length: 5 }).$type<ColorScheme>().default("dark").notNull(),
  firstDayOfWeek: smallint().$type<DayOfWeek>().default(1).notNull(), // Defaults to Monday
  pingIconsEnabled: boolean().default(false).notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: varchar({ length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<AdapterAccount["type"]>().notNull(),
    provider: varchar({ length: 64 }).notNull(),
    providerAccountId: varchar({ length: 64 }).notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const sessions = pgTable(
  "session",
  {
    sessionToken: varchar({ length: 512 }).notNull().primaryKey(),
    userId: varchar({ length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp().notNull(),
  },
  (session) => ({
    userIdIdx: index("user_id_idx").on(session.userId),
  }),
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar({ length: 64 }).notNull(),
    token: varchar({ length: 512 }).notNull(),
    expires: timestamp().notNull(),
  },
  (verificationToken) => ({
    compoundKey: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const groupMembers = pgTable(
  "groupMember",
  {
    groupId: varchar({ length: 64 })
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: varchar({ length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (groupMember) => ({
    compoundKey: primaryKey({
      columns: [groupMember.groupId, groupMember.userId],
    }),
  }),
);

export const groups = pgTable("group", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  name: varchar({ length: 64 }).unique().notNull(),
  ownerId: varchar({ length: 64 }).references(() => users.id, {
    onDelete: "set null",
  }),
  homeBoardId: varchar({ length: 64 }).references(() => boards.id, {
    onDelete: "set null",
  }),
  mobileHomeBoardId: varchar({ length: 64 }).references(() => boards.id, {
    onDelete: "set null",
  }),
  position: smallint().notNull(),
});

export const groupPermissions = pgTable("groupPermission", {
  groupId: varchar({ length: 64 })
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  permission: text().$type<GroupPermissionKey>().notNull(),
});

export const invites = pgTable("invite", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  token: varchar({ length: 512 }).notNull().unique(),
  expirationDate: timestamp().notNull(),
  creatorId: varchar({ length: 64 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const medias = pgTable("media", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  name: varchar({ length: 512 }).notNull(),
  content: customBlob().notNull(),
  contentType: text().notNull(),
  size: integer().notNull(),
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  creatorId: varchar({ length: 64 }).references(() => users.id, { onDelete: "set null" }),
});

export const integrations = pgTable(
  "integration",
  {
    id: varchar({ length: 64 }).notNull().primaryKey(),
    name: text().notNull(),
    url: text().notNull(),
    kind: varchar({ length: 128 }).$type<IntegrationKind>().notNull(),
    appId: varchar({ length: 128 }).references(() => apps.id, { onDelete: "set null" }),
  },
  (integrations) => ({
    kindIdx: index("integration__kind_idx").on(integrations.kind),
  }),
);

export const integrationSecrets = pgTable(
  "integrationSecret",
  {
    kind: varchar({ length: 64 }).$type<IntegrationSecretKind>().notNull(),
    value: text().$type<`${string}.${string}`>().notNull(),
    updatedAt: timestamp()
      .$onUpdateFn(() => new Date())
      .notNull(),
    integrationId: varchar({ length: 64 })
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
  },
  (integrationSecret) => ({
    compoundKey: primaryKey({
      columns: [integrationSecret.integrationId, integrationSecret.kind],
    }),
    kindIdx: index("integration_secret__kind_idx").on(integrationSecret.kind),
    updatedAtIdx: index("integration_secret__updated_at_idx").on(integrationSecret.updatedAt),
  }),
);

export const integrationUserPermissions = pgTable(
  "integrationUserPermission",
  {
    integrationId: varchar({ length: 64 })
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    userId: varchar({ length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permission: varchar({ length: 128 }).$type<IntegrationPermission>().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.integrationId, table.userId, table.permission],
    }),
  }),
);

export const integrationGroupPermissions = pgTable(
  "integrationGroupPermissions",
  {
    integrationId: varchar({ length: 64 })
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    groupId: varchar({ length: 64 })
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    permission: varchar({ length: 128 }).$type<IntegrationPermission>().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.integrationId, table.groupId, table.permission],
      name: "integration_group_permission__pk",
    }),
  }),
);

export const boards = pgTable("board", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  name: varchar({ length: 256 }).unique().notNull(),
  isPublic: boolean().default(false).notNull(),
  creatorId: varchar({ length: 64 }).references(() => users.id, {
    onDelete: "set null",
  }),
  pageTitle: text(),
  metaTitle: text(),
  logoImageUrl: text(),
  faviconImageUrl: text(),
  backgroundImageUrl: text(),
  backgroundImageAttachment: text()
    .$type<BackgroundImageAttachment>()
    .default(backgroundImageAttachments.defaultValue)
    .notNull(),
  backgroundImageRepeat: text().$type<BackgroundImageRepeat>().default(backgroundImageRepeats.defaultValue).notNull(),
  backgroundImageSize: text().$type<BackgroundImageSize>().default(backgroundImageSizes.defaultValue).notNull(),
  primaryColor: text().default("#fa5252").notNull(),
  secondaryColor: text().default("#fd7e14").notNull(),
  opacity: integer().default(100).notNull(),
  customCss: text(),
  iconColor: text(),
  itemRadius: text().$type<MantineSize>().default("lg").notNull(),
  disableStatus: boolean().default(false).notNull(),
});

export const boardUserPermissions = pgTable(
  "boardUserPermission",
  {
    boardId: varchar({ length: 64 })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    userId: varchar({ length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permission: varchar({ length: 128 }).$type<BoardPermission>().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.boardId, table.userId, table.permission],
    }),
  }),
);

export const boardGroupPermissions = pgTable(
  "boardGroupPermission",
  {
    boardId: varchar({ length: 64 })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    groupId: varchar({ length: 64 })
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    permission: varchar({ length: 128 }).$type<BoardPermission>().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.boardId, table.groupId, table.permission],
    }),
  }),
);

export const layouts = pgTable("layout", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  name: varchar({ length: 32 }).notNull(),
  boardId: varchar({ length: 64 })
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  columnCount: smallint().notNull(),
  breakpoint: smallint().notNull().default(0),
});

export const itemLayouts = pgTable(
  "item_layout",
  {
    itemId: varchar({ length: 64 })
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    sectionId: varchar({ length: 64 })
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    layoutId: varchar({ length: 64 })
      .notNull()
      .references(() => layouts.id, { onDelete: "cascade" }),
    xOffset: integer().notNull(),
    yOffset: integer().notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.itemId, table.sectionId, table.layoutId],
    }),
  }),
);

export const sectionLayouts = pgTable(
  "section_layout",
  {
    sectionId: varchar({ length: 64 })
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    layoutId: varchar({ length: 64 })
      .notNull()
      .references(() => layouts.id, { onDelete: "cascade" }),
    parentSectionId: varchar({ length: 64 }).references((): AnyPgColumn => sections.id, {
      onDelete: "cascade",
    }),
    xOffset: integer().notNull(),
    yOffset: integer().notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.sectionId, table.layoutId],
    }),
  }),
);

export const sections = pgTable("section", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  boardId: varchar({ length: 64 })
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  kind: text().$type<SectionKind>().notNull(),
  xOffset: integer(),
  yOffset: integer(),
  name: text(),
  options: text().default(emptySuperJSON),
});

export const sectionCollapseStates = pgTable(
  "section_collapse_state",
  {
    userId: varchar({ length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sectionId: varchar({ length: 64 })
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    collapsed: boolean().default(false).notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.userId, table.sectionId],
    }),
  }),
);

export const items = pgTable("item", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  boardId: varchar({ length: 64 })
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  kind: text().$type<WidgetKind>().notNull(),
  options: text().default(emptySuperJSON).notNull(),
  advancedOptions: text().default(emptySuperJSON).notNull(),
});

export const apps = pgTable("app", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  name: text().notNull(),
  description: text(),
  iconUrl: text().notNull(),
  href: text(),
  pingUrl: text(),
});

export const integrationItems = pgTable(
  "integration_item",
  {
    itemId: varchar({ length: 64 })
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    integrationId: varchar({ length: 64 })
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.itemId, table.integrationId],
    }),
  }),
);

export const icons = pgTable("icon", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  name: varchar({ length: 250 }).notNull(),
  url: text().notNull(),
  checksum: text().notNull(),
  iconRepositoryId: varchar({ length: 64 })
    .notNull()
    .references(() => iconRepositories.id, { onDelete: "cascade" }),
});

export const iconRepositories = pgTable("iconRepository", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  slug: varchar({ length: 150 }).notNull(),
});

export const serverSettings = pgTable("serverSetting", {
  settingKey: varchar({ length: 64 }).notNull().unique().primaryKey(),
  value: text().default(emptySuperJSON).notNull(),
});

export const apiKeyRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const searchEngines = pgTable("search_engine", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  iconUrl: text().notNull(),
  name: varchar({ length: 64 }).notNull(),
  short: varchar({ length: 8 }).unique().notNull(),
  description: text(),
  urlTemplate: text(),
  type: varchar({ length: 64 }).$type<SearchEngineType>().notNull().default("generic"),
  integrationId: varchar({ length: 64 }).references(() => integrations.id, { onDelete: "cascade" }),
});

export const onboarding = pgTable("onboarding", {
  id: varchar({ length: 64 }).notNull().primaryKey(),
  step: varchar({ length: 64 }).$type<OnboardingStep>().notNull(),
  previousStep: varchar({ length: 64 }).$type<OnboardingStep>(),
});

export const cronJobConfigurations = pgTable("cron_job_configuration", {
  name: varchar({ length: 256 }).notNull().primaryKey(),
  cronExpression: varchar({ length: 32 }).notNull(),
  isEnabled: boolean().default(true).notNull(),
});

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  boards: many(boards),
  boardPermissions: many(boardUserPermissions),
  groups: many(groupMembers),
  ownedGroups: many(groups),
  invites: many(invites),
  medias: many(medias),
  defaultSearchEngine: one(searchEngines, {
    fields: [users.defaultSearchEngineId],
    references: [searchEngines.id],
  }),
}));

export const mediaRelations = relations(medias, ({ one }) => ({
  creator: one(users, {
    fields: [medias.creatorId],
    references: [users.id],
  }),
}));

export const iconRelations = relations(icons, ({ one }) => ({
  repository: one(iconRepositories, {
    fields: [icons.iconRepositoryId],
    references: [iconRepositories.id],
  }),
}));

export const iconRepositoryRelations = relations(iconRepositories, ({ many }) => ({
  icons: many(icons),
}));

export const inviteRelations = relations(invites, ({ one }) => ({
  creator: one(users, {
    fields: [invites.creatorId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const groupMemberRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const groupRelations = relations(groups, ({ one, many }) => ({
  permissions: many(groupPermissions),
  boardPermissions: many(boardGroupPermissions),
  members: many(groupMembers),
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),
  homeBoard: one(boards, {
    fields: [groups.homeBoardId],
    references: [boards.id],
    relationName: "groupRelations__board__homeBoardId",
  }),
  mobileHomeBoard: one(boards, {
    fields: [groups.mobileHomeBoardId],
    references: [boards.id],
    relationName: "groupRelations__board__mobileHomeBoardId",
  }),
}));

export const groupPermissionRelations = relations(groupPermissions, ({ one }) => ({
  group: one(groups, {
    fields: [groupPermissions.groupId],
    references: [groups.id],
  }),
}));

export const boardUserPermissionRelations = relations(boardUserPermissions, ({ one }) => ({
  user: one(users, {
    fields: [boardUserPermissions.userId],
    references: [users.id],
  }),
  board: one(boards, {
    fields: [boardUserPermissions.boardId],
    references: [boards.id],
  }),
}));

export const boardGroupPermissionRelations = relations(boardGroupPermissions, ({ one }) => ({
  group: one(groups, {
    fields: [boardGroupPermissions.groupId],
    references: [groups.id],
  }),
  board: one(boards, {
    fields: [boardGroupPermissions.boardId],
    references: [boards.id],
  }),
}));

export const integrationRelations = relations(integrations, ({ one, many }) => ({
  secrets: many(integrationSecrets),
  items: many(integrationItems),
  userPermissions: many(integrationUserPermissions),
  groupPermissions: many(integrationGroupPermissions),
  app: one(apps, {
    fields: [integrations.appId],
    references: [apps.id],
  }),
}));

export const integrationUserPermissionRelations = relations(integrationUserPermissions, ({ one }) => ({
  user: one(users, {
    fields: [integrationUserPermissions.userId],
    references: [users.id],
  }),
  integration: one(integrations, {
    fields: [integrationUserPermissions.integrationId],
    references: [integrations.id],
  }),
}));

export const integrationGroupPermissionRelations = relations(integrationGroupPermissions, ({ one }) => ({
  group: one(groups, {
    fields: [integrationGroupPermissions.groupId],
    references: [groups.id],
  }),
  integration: one(integrations, {
    fields: [integrationGroupPermissions.integrationId],
    references: [integrations.id],
  }),
}));

export const integrationSecretRelations = relations(integrationSecrets, ({ one }) => ({
  integration: one(integrations, {
    fields: [integrationSecrets.integrationId],
    references: [integrations.id],
  }),
}));

export const boardRelations = relations(boards, ({ many, one }) => ({
  sections: many(sections),
  items: many(items),
  creator: one(users, {
    fields: [boards.creatorId],
    references: [users.id],
  }),
  userPermissions: many(boardUserPermissions),
  groupPermissions: many(boardGroupPermissions),
  layouts: many(layouts),
  groupHomes: many(groups, {
    relationName: "groupRelations__board__homeBoardId",
  }),
  mobileHomeBoard: many(groups, {
    relationName: "groupRelations__board__mobileHomeBoardId",
  }),
}));

export const sectionRelations = relations(sections, ({ many, one }) => ({
  board: one(boards, {
    fields: [sections.boardId],
    references: [boards.id],
  }),
  collapseStates: many(sectionCollapseStates),
  layouts: many(sectionLayouts, {
    relationName: "sectionLayoutRelations__section__sectionId",
  }),
  children: many(sectionLayouts, {
    relationName: "sectionLayoutRelations__section__parentSectionId",
  }),
}));

export const sectionCollapseStateRelations = relations(sectionCollapseStates, ({ one }) => ({
  user: one(users, {
    fields: [sectionCollapseStates.userId],
    references: [users.id],
  }),
  section: one(sections, {
    fields: [sectionCollapseStates.sectionId],
    references: [sections.id],
  }),
}));

export const itemRelations = relations(items, ({ one, many }) => ({
  integrations: many(integrationItems),
  layouts: many(itemLayouts),
  board: one(boards, {
    fields: [items.boardId],
    references: [boards.id],
  }),
}));

export const integrationItemRelations = relations(integrationItems, ({ one }) => ({
  integration: one(integrations, {
    fields: [integrationItems.integrationId],
    references: [integrations.id],
  }),
  item: one(items, {
    fields: [integrationItems.itemId],
    references: [items.id],
  }),
}));

export const searchEngineRelations = relations(searchEngines, ({ one, many }) => ({
  integration: one(integrations, {
    fields: [searchEngines.integrationId],
    references: [integrations.id],
  }),
  usersWithDefault: many(users),
}));

export const itemLayoutRelations = relations(itemLayouts, ({ one }) => ({
  item: one(items, {
    fields: [itemLayouts.itemId],
    references: [items.id],
  }),
  section: one(sections, {
    fields: [itemLayouts.sectionId],
    references: [sections.id],
  }),
  layout: one(layouts, {
    fields: [itemLayouts.layoutId],
    references: [layouts.id],
  }),
}));

export const sectionLayoutRelations = relations(sectionLayouts, ({ one }) => ({
  section: one(sections, {
    fields: [sectionLayouts.sectionId],
    references: [sections.id],
    relationName: "sectionLayoutRelations__section__sectionId",
  }),
  layout: one(layouts, {
    fields: [sectionLayouts.layoutId],
    references: [layouts.id],
  }),
  parentSection: one(sections, {
    fields: [sectionLayouts.parentSectionId],
    references: [sections.id],
    relationName: "sectionLayoutRelations__section__parentSectionId",
  }),
}));

export const layoutRelations = relations(layouts, ({ one, many }) => ({
  items: many(itemLayouts),
  sections: many(sectionLayouts),
  board: one(boards, {
    fields: [layouts.boardId],
    references: [boards.id],
  }),
}));
