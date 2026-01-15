import { createBooleanSchema, createEnv } from "../env";

export const dnsEnv = createEnv({
  server: {
    ENABLE_DNS_CACHING: createBooleanSchema(true),
  },
  experimental__runtimeEnv: process.env,
});
