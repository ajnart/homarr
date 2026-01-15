import type { Config } from "drizzle-kit";

import { DB_CASING } from "@homarr/core/infrastructure/db/constants";
import { dbEnv } from "@homarr/core/infrastructure/db/env";

export default {
  dialect: "sqlite",
  schema: "./schema",
  casing: DB_CASING,
  dbCredentials: { url: dbEnv.URL },
  out: "./migrations/sqlite",
} satisfies Config;
