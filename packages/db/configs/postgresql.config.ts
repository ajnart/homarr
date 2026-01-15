import type { Config } from "drizzle-kit";

import { DB_CASING } from "@homarr/core/infrastructure/db/constants";
import { dbEnv } from "@homarr/core/infrastructure/db/env";

export default {
  dialect: "postgresql",
  schema: "./schema",
  casing: DB_CASING,

  dbCredentials: dbEnv.URL
    ? { url: dbEnv.URL }
    : {
        host: dbEnv.HOST,
        port: dbEnv.PORT,
        database: dbEnv.NAME,
        user: dbEnv.USER,
        password: dbEnv.PASSWORD,
      },
  out: "./migrations/postgresql",
} satisfies Config;
