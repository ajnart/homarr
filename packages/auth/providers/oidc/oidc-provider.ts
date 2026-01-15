import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import type { OIDCConfig } from "@auth/core/providers";
import type { Profile } from "@auth/core/types";
import { customFetch } from "next-auth";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import { env } from "../../env";
import { createRedirectUri } from "../../redirect";

export const OidcProvider = (headers: ReadonlyHeaders | null): OIDCConfig<Profile> => ({
  id: "oidc",
  name: env.AUTH_OIDC_CLIENT_NAME,
  type: "oidc",
  clientId: env.AUTH_OIDC_CLIENT_ID,
  clientSecret: env.AUTH_OIDC_CLIENT_SECRET,
  issuer: env.AUTH_OIDC_ISSUER,
  allowDangerousEmailAccountLinking: env.AUTH_OIDC_ENABLE_DANGEROUS_ACCOUNT_LINKING,
  authorization: {
    params: {
      scope: env.AUTH_OIDC_SCOPE_OVERWRITE,
      // We fallback to https as generally oidc providers require https
      redirect_uri: createRedirectUri(headers, "/api/auth/callback/oidc", "https"),
    },
  },
  token: {
    // Providers like fusionauth may return www-authenticate which results in an error
    // https://github.com/nextauthjs/next-auth/issues/8745
    // https://github.com/homarr-labs/homarr/issues/2690
    conform: (response: Response) => {
      if (response.status === 401) return response;

      const newHeaders = Array.from(response.headers.entries())
        .filter(([key]) => key.toLowerCase() !== "www-authenticate")
        .reduce((headers, [key, value]) => {
          headers.append(key, value);
          return headers;
        }, new Headers());

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    },
  },
  // idToken false forces the use of the userinfo endpoint
  // Userinfo endpoint is required for authelia since v4.39
  // See https://github.com/homarr-labs/homarr/issues/2635
  idToken: !env.AUTH_OIDC_FORCE_USERINFO,
  profile(profile) {
    if (!profile.sub) {
      throw new Error(`OIDC provider did not return a sub property='${Object.keys(profile).join(",")}'`);
    }
    const name = extractProfileName(profile);
    if (!name) {
      throw new Error(`OIDC provider did not return a name properties='${Object.keys(profile).join(",")}'`);
    }

    return {
      id: profile.sub,
      name,
      email: profile.email,
      image: typeof profile.picture === "string" ? profile.picture : null,
      provider: "oidc",
    };
  },
  // The type for fetch is not identical, but for what we need it it's okay to not be an 1:1 match
  // See documentation https://authjs.dev/guides/corporate-proxy?framework=next-js
  // @ts-expect-error `undici` has a `duplex` option
  [customFetch]: fetchWithTrustedCertificatesAsync,
});

export const extractProfileName = (profile: Profile) => {
  if (!env.AUTH_OIDC_NAME_ATTRIBUTE_OVERWRITE) {
    // Use the name as the username if the preferred_username is an email address
    return profile.preferred_username?.includes("@") ? profile.name : profile.preferred_username;
  }

  return profile[env.AUTH_OIDC_NAME_ATTRIBUTE_OVERWRITE as keyof typeof profile] as string;
};
