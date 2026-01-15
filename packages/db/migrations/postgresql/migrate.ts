import { migrate } from "drizzle-orm/node-postgres/migrator";

import { createPostgresDb, createSharedDbConfig } from "@homarr/core/infrastructure/db";

import type { Database } from "../..";
import * as pgSchema from "../../schema/postgresql";
import { applyCustomMigrationsAsync } from "../custom";
import { seedDataAsync } from "../seed";

const migrationsFolder = process.argv[2] ?? ".";

const migrateAsync = async () => {
  const config = createSharedDbConfig(pgSchema);
  const db = createPostgresDb(config);

  await migrate(db, { migrationsFolder });
  await seedDataAsync(db as unknown as Database);
  await applyCustomMigrationsAsync(db as unknown as Database);
};

migrateAsync()
  .then(() => {
    console.log("Migration complete");
    process.exit(0);
  })
  .catch((err) => {
    console.log("Migration failed", err);
    process.exit(1);
  });
