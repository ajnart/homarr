const { z } = require('zod');
const { createEnv } = require('@t3-oss/env-nextjs');

const portSchema = z
  .string()
  .regex(/\d*/)
  .transform((value) => (value === undefined ? undefined : Number(value)))
  .optional();
const envSchema = z.enum(['development', 'test', 'production']);

const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url().default('file:../database/db.sqlite'),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url()
    ),
    DOCKER_HOST: z.string().optional(),
    DOCKER_PORT: portSchema,
    DEMO_MODE: z.string().optional(),
    HOSTNAME: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    NEXT_PUBLIC_DISABLE_ANALYTICS: z.string().optional(),
    NEXT_PUBLIC_PORT: portSchema,
    NEXT_PUBLIC_NODE_ENV: envSchema,
    NEXT_PUBLIC_DEFAULT_COLOR_SCHEME: z
      .string()
      .toLowerCase()
      .refine((s) => s === 'light' || s === 'dark')
      .optional()
      .default('light'),
    NEXT_PUBLIC_DOCKER_HOST: z.string().optional(),
  },
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_DISABLE_ANALYTICS: process.env.DISABLE_ANALYTICS,
    DOCKER_HOST: process.env.DOCKER_HOST,
    DOCKER_PORT: process.env.DOCKER_PORT,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_DEFAULT_COLOR_SCHEME: process.env.DEFAULT_COLOR_SCHEME,
    NEXT_PUBLIC_PORT: process.env.PORT,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    HOSTNAME: process.env.HOSTNAME,
    DEMO_MODE: process.env.DEMO_MODE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

module.exports = {
  env,
};
