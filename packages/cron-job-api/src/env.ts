import { z } from "zod/v4";

import { env as commonEnv } from "@homarr/common/env";
import { createEnv } from "@homarr/core/infrastructure/env";

export const env = createEnv({
  server: {
    CRON_JOB_API_KEY: commonEnv.NODE_ENV === "development" ? z.string().default("test") : z.string(),
  },
  experimental__runtimeEnv: process.env,
});
