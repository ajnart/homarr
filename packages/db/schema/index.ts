import type { InferSelectModel } from "drizzle-orm";

import { createSchema } from "@homarr/core/infrastructure/db";

import * as mysqlSchema from "./mysql";
import * as pgSchema from "./postgresql";
import * as sqliteSchema from "./sqlite";

export type PostgreSqlSchema = typeof pgSchema;
export type MySqlSchema = typeof mysqlSchema;

export const schema = createSchema({
  "better-sqlite3": () => sqliteSchema,
  mysql2: () => mysqlSchema,
  "node-postgres": () => pgSchema,
});

// Sadly we can't use export * from here as we have multiple possible exports
export const {
  accounts,
  apiKeys,
  apps,
  boardGroupPermissions,
  boardUserPermissions,
  boards,
  groupMembers,
  groupPermissions,
  groups,
  iconRepositories,
  icons,
  integrationGroupPermissions,
  integrationItems,
  integrationSecrets,
  integrationUserPermissions,
  integrations,
  invites,
  items,
  medias,
  onboarding,
  searchEngines,
  sections,
  serverSettings,
  sessions,
  users,
  verificationTokens,
  sectionCollapseStates,
  layouts,
  itemLayouts,
  sectionLayouts,
  trustedCertificateHostnames,
  cronJobConfigurations,
} = schema;

export type User = InferSelectModel<typeof schema.users>;
export type Account = InferSelectModel<typeof schema.accounts>;
export type Session = InferSelectModel<typeof schema.sessions>;
export type VerificationToken = InferSelectModel<typeof schema.verificationTokens>;
export type Integration = InferSelectModel<typeof schema.integrations>;
export type IntegrationSecret = InferSelectModel<typeof schema.integrationSecrets>;
