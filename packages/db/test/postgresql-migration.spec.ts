import path from "path";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { describe, test } from "vitest";

import { DB_CASING } from "@homarr/core/infrastructure/db/constants";

import * as pgSchema from "../schema/postgresql";

describe("PostgreSql Migration", () => {
  test("should add all tables and keys specified in migration files", async () => {
    const container = new PostgreSqlContainer("postgres:latest");
    const postgreSqlContainer = await container.start();

    const pool = new Pool({
      user: postgreSqlContainer.getUsername(),
      database: postgreSqlContainer.getDatabase(),
      password: postgreSqlContainer.getPassword(),
      port: postgreSqlContainer.getPort(),
      host: postgreSqlContainer.getHost(),
      keepAlive: true,
      max: 0,
      idleTimeoutMillis: 60000,
      allowExitOnIdle: false,
    });

    const database = drizzle({
      schema: pgSchema,
      casing: DB_CASING,
      client: pool,
    });

    // Run migrations and check if it works
    await migrate(database, {
      migrationsFolder: path.join(__dirname, "..", "migrations", "postgresql"),
    });

    // Check if users table exists
    await database.query.users.findMany();

    // Close the pool to release resources
    await pool.end();
    // Stop the container
    await postgreSqlContainer.stop();
  }, 40_000);
});
