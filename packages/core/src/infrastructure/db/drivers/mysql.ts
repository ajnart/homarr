import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import type { PoolOptions } from "mysql2";

import { dbEnv } from "../env";
import type { SharedDrizzleConfig } from "./shared";

export const createMysqlDb = <TSchema extends Record<string, unknown>>(config: SharedDrizzleConfig<TSchema>) => {
  const connection = createMysqlDbConnection();
  return drizzle<TSchema>(connection, {
    ...config,
    mode: "default",
  });
};

const createMysqlDbConnection = () => {
  const defaultOptions = {
    maxIdle: 0,
    idleTimeout: 60000,
    enableKeepAlive: true,
  } satisfies Partial<PoolOptions>;

  if (!dbEnv.HOST) {
    return mysql.createPool({ ...defaultOptions, uri: dbEnv.URL });
  }

  return mysql.createPool({
    ...defaultOptions,
    host: dbEnv.HOST,
    port: dbEnv.PORT,
    database: dbEnv.NAME,
    user: dbEnv.USER,
    password: dbEnv.PASSWORD,
  });
};
