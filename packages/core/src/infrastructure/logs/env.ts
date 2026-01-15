import { z } from "zod/v4";

import { createEnv, runtimeEnvWithPrefix } from "../env";
import { logLevels } from "./constants";

export const logsEnv = createEnv({
  server: {
    LEVEL: z.enum(logLevels).default("info"),
  },
  runtimeEnv: runtimeEnvWithPrefix("LOG_"),
});
