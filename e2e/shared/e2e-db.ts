import { mkdir } from "fs/promises";
import path from "path";
import { createId } from "@paralleldrive/cuid2";
import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { DB_CASING } from "../../packages/core/src/infrastructure/db/constants";
import * as sqliteSchema from "../../packages/db/schema/sqlite";

export const createSqliteDbFileAsync = async () => {
  const localMountPath = path.join(__dirname, "tmp", createId());
  await mkdir(path.join(localMountPath, "db"), { recursive: true });

  const localDbUrl = path.join(localMountPath, "db", "db.sqlite");

  const connection = new Database(localDbUrl);
  const db = drizzle(connection, {
    schema: sqliteSchema,
    casing: DB_CASING,
  });

  await migrate(db, {
    migrationsFolder: path.join(__dirname, "..", "..", "packages", "db", "migrations", "sqlite"),
  });

  return {
    db,
    localMountPath,
  };
};

export type SqliteDatabase = BetterSQLite3Database<typeof sqliteSchema>;
