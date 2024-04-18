import Consola from 'consola';
import { OAuthConfig } from 'next-auth/providers/oauth';
import { env } from '~/env';

import adapter from './adapter';

type Profile = {
  sub: string;
  name: string;
  email: string;
  groups: string[];
  preferred_username: string;
  email_verified: boolean;
};

export type OidcRedirectCallbackHeaders = {
  'x-forwarded-proto'?: string;
  'x-forwarded-host'?: string;
  host?: string;
};

// The redirect_uri is constructed to work behind a reverse proxy. It is constructed from the headers x-forwarded-proto and x-forwarded-host.
export const createRedirectUri = (headers: OidcRedirectCallbackHeaders, pathname: string) => {
  let protocol = headers['x-forwarded-proto'] ?? 'http';

  // @see https://support.glitch.com/t/x-forwarded-proto-contains-multiple-protocols/17219
  if (protocol.includes(',')) {
    protocol = protocol.includes('https') ? 'https' : 'http';
  }

  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  const host = headers['x-forwarded-host'] ?? headers.host;


  return `${protocol}://${host}${path}`;
};

const createProvider = (headers: OidcRedirectCallbackHeaders): OAuthConfig<Profile> => ({
  id: 'oidc',
  name: env.AUTH_OIDC_CLIENT_NAME,
  type: 'oauth',
  clientId: env.AUTH_OIDC_CLIENT_ID,
  clientSecret: env.AUTH_OIDC_CLIENT_SECRET,
  wellKnown: `${env.AUTH_OIDC_URI}/.well-known/openid-configuration`,
  authorization: {
    params: {
      scope: env.AUTH_OIDC_SCOPE_OVERWRITE,
      redirect_uri: createRedirectUri(headers, '/api/auth/callback/oidc'),
    },
  },
  idToken: true,
  httpOptions: {
    timeout: env.AUTH_OIDC_TIMEOUT,
  },
  async profile(profile) {
    const user = await adapter.getUserByEmail!(profile.email);

    if (profile.groups == undefined) {
      Consola.warn('no groups found in profile of oidc user');
    }

    const isAdmin = profile.groups?.includes(env.AUTH_OIDC_ADMIN_GROUP);
    const isOwner = profile.groups?.includes(env.AUTH_OIDC_OWNER_GROUP);

    // check for role update
    if (user && (user.isAdmin != isAdmin || user.isOwner != isOwner)) {
      Consola.log(`updating roles of user ${user.name}`);
      adapter.updateUser({
        ...user,
        isAdmin,
        isOwner,
      });
    }

    return {
      id: profile.sub,
      name: profile.preferred_username,
      email: profile.email,
      isAdmin,
      isOwner,
    };
  },
});

export default createProvider;
