import { z } from "zod/v4";

import { createBooleanSchema, createDurationSchema, createEnv } from "@homarr/core/infrastructure/env";
import { supportedAuthProviders } from "@homarr/definitions";

const authProvidersSchema = z
  .string()
  .min(1)
  .transform((providers) =>
    providers
      .replaceAll(" ", "")
      .toLowerCase()
      .split(",")
      .filter((provider) => {
        if (supportedAuthProviders.some((supportedProvider) => supportedProvider === provider)) return true;
        else if (!provider)
          console.log("One or more of the entries for AUTH_PROVIDER could not be parsed and/or returned null.");
        else console.log(`The value entered for AUTH_PROVIDER "${provider}" is incorrect.`);
        return false;
      }),
  )
  .default(["credentials"]);

const authProviders = authProvidersSchema.safeParse(process.env.AUTH_PROVIDERS).data ?? [];

export const env = createEnv({
  server: {
    AUTH_LOGOUT_REDIRECT_URL: z.string().url().optional(),
    AUTH_SESSION_EXPIRY_TIME: createDurationSchema("30d"),
    AUTH_PROVIDERS: authProvidersSchema,
    ...(authProviders.includes("oidc")
      ? {
          AUTH_OIDC_ISSUER: z.string().url(),
          AUTH_OIDC_CLIENT_ID: z.string().min(1),
          AUTH_OIDC_CLIENT_SECRET: z.string().min(1),
          AUTH_OIDC_CLIENT_NAME: z.string().min(1).default("OIDC"),
          AUTH_OIDC_AUTO_LOGIN: createBooleanSchema(false),
          AUTH_OIDC_SCOPE_OVERWRITE: z.string().min(1).default("openid email profile groups"),
          AUTH_OIDC_GROUPS_ATTRIBUTE: z.string().default("groups"), // Is used in the signIn event to assign the correct groups, key is from object of decoded id_token
          AUTH_OIDC_NAME_ATTRIBUTE_OVERWRITE: z.string().optional(),
          AUTH_OIDC_FORCE_USERINFO: createBooleanSchema(false),
          AUTH_OIDC_ENABLE_DANGEROUS_ACCOUNT_LINKING: createBooleanSchema(false),
        }
      : {}),
    ...(authProviders.includes("ldap")
      ? {
          AUTH_LDAP_URI: z.string().url(),
          AUTH_LDAP_BIND_DN: z.string(),
          AUTH_LDAP_BIND_PASSWORD: z.string(),
          AUTH_LDAP_BASE: z.string(),
          AUTH_LDAP_SEARCH_SCOPE: z.enum(["base", "one", "sub"]).default("base"),
          AUTH_LDAP_USERNAME_ATTRIBUTE: z.string().default("uid"),
          AUTH_LDAP_USER_MAIL_ATTRIBUTE: z.string().default("mail"),
          AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG: z.string().optional(),
          AUTH_LDAP_GROUP_CLASS: z.string().default("groupOfUniqueNames"),
          AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE: z.string().default("member"),
          AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE: z.string().default("dn"),
          AUTH_LDAP_GROUP_FILTER_EXTRA_ARG: z.string().optional(),
        }
      : {}),
  },
  experimental__runtimeEnv: process.env,
});
