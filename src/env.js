const { z } = require('zod');
const { createEnv } = require('@t3-oss/env-nextjs');

const trueStrings = ['1', 't', 'T', 'TRUE', 'true', 'True'];
const falseStrings = ['0', 'f', 'F', 'FALSE', 'false', 'False'];

const ldapSearchScope = z.enum(['base', 'one', 'sub']).default('base');

const zodParsedBoolean = () =>
  z
    .enum([...trueStrings, ...falseStrings])
    .default('false')
    .transform((value) => trueStrings.includes(value));

const numberSchema = z
  .string()
  .regex(/\d*/)
  .transform((value) => (value === undefined ? undefined : Number(value)))
  .optional();

const portSchema = z
  .string()
  .regex(/\d*/)
  .transform((value) => (value === undefined ? undefined : Number(value)))
  .optional();
const envSchema = z.enum(['development', 'test', 'production']);

const validAuthProviders = ['credentials', 'ldap', 'oidc'];
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
    DOCKER_HOST: z.string().optional(),
    DOCKER_PORT: portSchema,
    DEMO_MODE: z.string().optional(),
    HOSTNAME: z.string().optional(),

    //regex allows number with extra letter as time multiplier, applied with secondsFromTimeString
    AUTH_SESSION_EXPIRY_TIME: z
      .string()
      .regex(/^\d+[smhd]?$/)
      .optional(),

    // Authentication
    AUTH_PROVIDER: z
      .string()
      .min(1)
      .default('credentials')
      .transform((providers) =>
        providers
          .replaceAll(' ', '')
          .toLowerCase()
          .split(',')
          .filter((provider) => {
            if (validAuthProviders.includes(provider)) return provider;
            else if (!provider)
              console.log(
                `One or more of the entries for AUTH_PROVIDER could not be parsed and/or returned null.`
              );
            else console.log(`The value entered for AUTH_PROVIDER "${provider}" is incorrect.`);
          })
      ),
    // LDAP
    ...(authProviders.includes('ldap')
      ? {
          AUTH_LDAP_URI: z.string().url(),
          AUTH_LDAP_BIND_DN: z.string(),
          AUTH_LDAP_BIND_PASSWORD: z.string(),
          AUTH_LDAP_BASE: z.string(),
          AUTH_LDAP_SEARCH_SCOPE: z.enum(['base', 'one', 'sub']).default('base'),
          AUTH_LDAP_USERNAME_ATTRIBUTE: z.string().default('uid'),
          AUTH_LDAP_USER_MAIL_ATTRIBUTE: z.string().default('mail'),
          AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG: z.string().optional(),
          AUTH_LDAP_GROUP_CLASS: z.string().default('groupOfUniqueNames'),
          AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE: z.string().default('member'),
          AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE: z.string().default('dn'),
          AUTH_LDAP_GROUP_FILTER_EXTRA_ARG: z.string().optional(),
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
          AUTH_OIDC_AUTO_LOGIN: zodParsedBoolean(),
          AUTH_OIDC_SCOPE_OVERWRITE: z.string().default('openid email profile groups'),
          AUTH_OIDC_TIMEOUT: numberSchema.default('3500'),
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
    AUTH_LOGOUT_REDIRECT_URL: z.string().optional(),
  },
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
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
    AUTH_LDAP_SEARCH_SCOPE: process.env.AUTH_LDAP_SEARCH_SCOPE?.toLowerCase(),
    AUTH_LDAP_USERNAME_ATTRIBUTE: process.env.AUTH_LDAP_USERNAME_ATTRIBUTE,
    AUTH_LDAP_USER_MAIL_ATTRIBUTE: process.env.AUTH_LDAP_USER_MAIL_ATTRIBUTE,
    AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG: process.env.AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG,
    AUTH_LDAP_GROUP_CLASS: process.env.AUTH_LDAP_GROUP_CLASS,
    AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE: process.env.AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE,
    AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE: process.env.AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE,
    AUTH_LDAP_GROUP_FILTER_EXTRA_ARG: process.env.AUTH_LDAP_GROUP_FILTER_EXTRA_ARG,
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
    AUTH_OIDC_SCOPE_OVERWRITE: process.env.AUTH_OIDC_SCOPE_OVERWRITE,
    AUTH_OIDC_TIMEOUT: process.env.AUTH_OIDC_TIMEOUT,
    AUTH_LOGOUT_REDIRECT_URL: process.env.AUTH_LOGOUT_REDIRECT_URL,
    AUTH_SESSION_EXPIRY_TIME: process.env.AUTH_SESSION_EXPIRY_TIME,
    DEMO_MODE: process.env.DEMO_MODE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

module.exports = {
  env,
};
