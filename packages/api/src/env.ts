import { z } from "zod/v4";

import { createEnv } from "@homarr/core/infrastructure/env";

export const env = createEnv({
  server: {
    KUBERNETES_SERVICE_ACCOUNT_NAME: z.string().optional(),
  },
  runtimeEnv: {
    KUBERNETES_SERVICE_ACCOUNT_NAME: process.env.KUBERNETES_SERVICE_ACCOUNT_NAME,
  },
});
