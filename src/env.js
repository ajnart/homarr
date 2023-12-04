const { z } = require('zod');
const { createEnv } = require('@t3-oss/env-nextjs');

const trueStrings = ["1", "t", "T", "TRUE", "true", "True"];
const falseStrings = ["0", "f", "F", "FALSE", "false", "False"];

const zodParsedBoolean = () => z
  .enum([...trueStrings, ...falseStrings])
  .default("false")
  .transform((value) => trueStrings.includes(value))

const portSchema = z
  .string()
  .regex(/\d*/)
  .transform((value) => (value === undefined ? undefined : Number(value)))
  .optional();
const envSchema = z.enum(['development', 'test', 'production']);

const authProviders = process.env.AUTH_PROVIDER?.replaceAll(' ', '').split(',') || ['credentials'];

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

    // Authentication
    AUTH_PROVIDER: z.string().default('credentials').transform(providers => providers.replaceAll(' ', '').split(',')),
    // LDAP
    ...(authProviders.includes('ldap')
      ? {
        AUTH_LDAP_URI: z.string().url(),
        AUTH_LDAP_BIND_DN: z.string(),
        AUTH_LDAP_BIND_PASSWORD: z.string(),
        AUTH_LDAP_BASE: z.string(),
        AUTH_LDAP_USERNAME_ATTRIBUTE: z.string().default('uid'),
        AUTH_LDAP_GROUP_CLASS: z.string().default('groupOfUniqueNames'),
        AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE: z.string().default('member'),
        AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE: z.string().default('dn'),
        AUTH_LDAP_ADMIN_GROUP: z.string().default('admin'),
        AUTH_LDAP_OWNER_GROUP: z.string().default('admin'),
      }
      : {}),
    // OIDC
    ...(authProviders.includes('oidc')
      ? {
        AUTH_OIDC_CLIENT_ID: z.string(),
        AUTH_OIDC_CLIENT_SECRET: z.string(),
        AUTH_OIDC_URI: z.string().url(),
        // Custom Display name, defaults to OIDC
        AUTH_OIDC_CLIENT_NAME: z.string().default('OIDC'),
        AUTH_OIDC_ADMIN_GROUP: z.string().default('admin'),
        AUTH_OIDC_OWNER_GROUP: z.string().default('admin'),
        AUTH_OIDC_AUTO_LOGIN: zodParsedBoolean()
      }
      : {}),
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
    AUTH_PROVIDER: process.env.AUTH_PROVIDER,
    AUTH_LDAP_URI: process.env.AUTH_LDAP_URI,
    AUTH_LDAP_BIND_DN: process.env.AUTH_LDAP_BIND_DN,
    AUTH_LDAP_BIND_PASSWORD: process.env.AUTH_LDAP_BIND_PASSWORD,
    AUTH_LDAP_BASE: process.env.AUTH_LDAP_BASE,
    AUTH_LDAP_USERNAME_ATTRIBUTE: process.env.AUTH_LDAP_USERNAME_ATTRIBUTE,
    AUTH_LDAP_GROUP_CLASS: process.env.AUTH_LDAP_GROUP_CLASS,
    AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE: process.env.AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE,
    AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE: process.env.AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE,
    AUTH_LDAP_ADMIN_GROUP: process.env.AUTH_LDAP_ADMIN_GROUP,
    AUTH_LDAP_OWNER_GROUP: process.env.AUTH_LDAP_OWNER_GROUP,
    AUTH_OIDC_CLIENT_ID: process.env.AUTH_OIDC_CLIENT_ID,
    AUTH_OIDC_CLIENT_SECRET: process.env.AUTH_OIDC_CLIENT_SECRET,
    AUTH_OIDC_URI: process.env.AUTH_OIDC_URI,
    AUTH_OIDC_CLIENT_NAME: process.env.AUTH_OIDC_CLIENT_NAME,
    AUTH_OIDC_GROUP_CLAIM: process.env.AUTH_OIDC_GROUP_CLAIM,
    AUTH_OIDC_ADMIN_GROUP: process.env.AUTH_OIDC_ADMIN_GROUP,
    AUTH_OIDC_OWNER_GROUP: process.env.AUTH_OIDC_OWNER_GROUP,
    AUTH_OIDC_AUTO_LOGIN: process.env.AUTH_OIDC_AUTO_LOGIN,
    DEMO_MODE: process.env.DEMO_MODE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

module.exports = {
  env,
};
