import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import type { PoolOptions as PostgresPoolOptions } from "pg";
import { Pool as PostgresPool } from "pg";

import { dbEnv } from "../env";
import type { SharedDrizzleConfig } from "./shared";

export const createPostgresDb = <TSchema extends Record<string, unknown>>(config: SharedDrizzleConfig<TSchema>) => {
  const connection = createPostgresDbConnection();
  return drizzlePostgres({
    ...config,
    client: connection,
  });
};

const createPostgresDbConnection = () => {
  const defaultOptions = {
    max: 0,
    idleTimeoutMillis: 60000,
    allowExitOnIdle: false,
  } satisfies Partial<PostgresPoolOptions>;

  if (!dbEnv.HOST) {
    return new PostgresPool({
      ...defaultOptions,
      connectionString: dbEnv.URL,
    });
  }

  return new PostgresPool({
    ...defaultOptions,
    host: dbEnv.HOST,
    port: dbEnv.PORT,
    database: dbEnv.NAME,
    user: dbEnv.USER,
    password: dbEnv.PASSWORD,
  });
};
