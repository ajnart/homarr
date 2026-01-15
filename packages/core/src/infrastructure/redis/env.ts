import { z } from "zod/v4";

import { createEnv } from "../env";
import { runtimeEnvWithPrefix } from "../env/prefix";
import { createBooleanSchema } from "../env/schemas";

export const redisEnv = createEnv({
  server: {
    IS_EXTERNAL: createBooleanSchema(false),
    HOST: z.string().optional(),
    PORT: z.coerce.number().default(6379).optional(),
    TLS_CA: z.string().optional(),
    USERNAME: z.string().optional(),
    PASSWORD: z.string().optional(),
    DATABASE_INDEX: z.coerce.number().optional(),
  },
  runtimeEnv: runtimeEnvWithPrefix("REDIS_"),
});
