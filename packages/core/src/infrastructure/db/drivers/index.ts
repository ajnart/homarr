import { DB_CASING } from "../constants";
import { createDbMapping } from "../mapping";
import { createMysqlDb } from "./mysql";
import { createPostgresDb } from "./postgresql";
import type { SharedDrizzleConfig } from "./shared";
import { WinstonDrizzleLogger } from "./shared";
import { createSqliteDb } from "./sqlite";

export type Database<TSchema extends Record<string, unknown>> = ReturnType<typeof createSqliteDb<TSchema>>;

export const createSharedConfig = <TSchema extends Record<string, unknown>>(
  schema: TSchema,
): SharedDrizzleConfig<TSchema> => ({
  logger: new WinstonDrizzleLogger(),
  casing: DB_CASING,
  schema,
});

export const createDb = <TSchema extends Record<string, unknown>>(schema: TSchema) => {
  const config = createSharedConfig(schema);

  return createDbMapping({
    mysql2: () => createMysqlDb(config),
    "node-postgres": () => createPostgresDb(config),
    "better-sqlite3": () => createSqliteDb(config),
  });
};
