import { createEnv as createEnvT3 } from "@t3-oss/env-nextjs";

export const defaultEnvOptions = {
  emptyStringAsUndefined: true,
  skipValidation:
    Boolean(process.env.CI) || Boolean(process.env.SKIP_ENV_VALIDATION) || process.env.npm_lifecycle_event === "lint",
} satisfies Partial<Parameters<typeof createEnvT3>[0]>;

export const createEnv: typeof createEnvT3 = (options) => createEnvT3({ ...defaultEnvOptions, ...options });

export * from "./prefix";
export * from "./schemas";
