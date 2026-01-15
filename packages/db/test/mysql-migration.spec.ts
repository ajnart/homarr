import path from "path";
import { MySqlContainer } from "@testcontainers/mysql";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2";
import { describe, test } from "vitest";

import { DB_CASING } from "@homarr/core/infrastructure/db/constants";

import * as mysqlSchema from "../schema/mysql";

describe("Mysql Migration", () => {
  test("should add all tables and keys specified in migration files", async () => {
    const mysqlContainer = await new MySqlContainer("mysql:latest").start();

    const connection = mysql.createConnection({
      host: mysqlContainer.getHost(),
      database: mysqlContainer.getDatabase(),
      port: mysqlContainer.getPort(),
      user: mysqlContainer.getUsername(),
      password: mysqlContainer.getUserPassword(),
    });

    const database = drizzle(connection, {
      schema: mysqlSchema,
      mode: "default",
      casing: DB_CASING,
    });

    // Run migrations and check if it works
    await migrate(database, {
      migrationsFolder: path.join(__dirname, "..", "migrations", "mysql"),
    });

    // Check if users table exists
    await database.query.users.findMany();

    connection.end();
    await mysqlContainer.stop();
  }, 40_000);
});
