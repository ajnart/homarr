import { createBooleanSchema, createEnv } from "@homarr/core/infrastructure/env";

export const env = createEnv({
  server: {
    UNSAFE_ENABLE_MOCK_INTEGRATION: createBooleanSchema(false),
  },
  experimental__runtimeEnv: process.env,
});
