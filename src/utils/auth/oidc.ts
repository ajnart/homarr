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

const provider: OAuthConfig<Profile> = {
  id: 'oidc',
  name: env.AUTH_OIDC_CLIENT_NAME,
  type: 'oauth',
  clientId: env.AUTH_OIDC_CLIENT_ID,
  clientSecret: env.AUTH_OIDC_CLIENT_SECRET,
  wellKnown: `${env.AUTH_OIDC_URI}/.well-known/openid-configuration`,
  authorization: { params: { scope: 'openid email profile groups' } },
  idToken: true,
  async profile(profile) {
    const user = await adapter.getUserByEmail!(profile.email);

    const isAdmin = profile.groups.includes(env.AUTH_OIDC_ADMIN_GROUP);
    const isOwner = profile.groups.includes(env.AUTH_OIDC_OWNER_GROUP);

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
};

export default provider;
