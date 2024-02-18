import { DefaultSession } from 'next-auth';
import { CredentialsConfig, OAuthConfig } from 'next-auth/providers';
import { env } from '~/env';

import { OidcRedirectCallbackHeaders } from './oidc';

export { default as adapter, onCreateUser } from './adapter';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
      isAdmin: boolean;
      colorScheme: 'light' | 'dark' | 'environment';
      autoFocusSearch: boolean;
      language: string;
      // ...other properties
      // role: UserRole;
    };
  }

  interface User {
    isAdmin: boolean;
    isOwner?: boolean;
    // ...other properties
    // role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isAdmin: boolean;
  }
}

export const getProviders = async (headers: OidcRedirectCallbackHeaders) => {
  const providers: (CredentialsConfig | OAuthConfig<any>)[] = [];

  if (env.AUTH_PROVIDER?.includes('ldap')) providers.push((await import('./ldap')).default);
  if (env.AUTH_PROVIDER?.includes('credentials'))
    providers.push((await import('./credentials')).default);
  if (env.AUTH_PROVIDER?.includes('oidc')) {
    const createProvider = (await import('./oidc')).default;
    providers.push(createProvider(headers));
  }

  return providers;
};
