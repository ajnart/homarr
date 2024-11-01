import Cookies from 'cookies';
import { eq } from 'drizzle-orm';
import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next';
import { type NextAuthOptions, getServerSession } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import { decode, encode } from 'next-auth/jwt';
import { env } from '~/env';
import { secondsFromTimeString } from '~/tools/client/parseDuration';
import { adapter, getProviders, onCreateUser } from '~/utils/auth';
import { createCookiesWithDefaultOptions } from '~/utils/auth/cookies';
import { createRedirectUri } from '~/utils/auth/oidc';
import EmptyNextAuthProvider from '~/utils/empty-provider';
import { fromDate, generateSessionToken } from '~/utils/session';
import { colorSchemeParser } from '~/validations/user';

import { db } from './db';
import { users } from './db/schema';

const sessionMaxAgeInSeconds =
  secondsFromTimeString(env.AUTH_SESSION_EXPIRY_TIME) ?? 30 * 24 * 60 * 60; // 30 days

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const constructAuthOptions = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<NextAuthOptions> => ({
  events: {
    createUser: onCreateUser,
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // eslint-disable-next-line no-param-reassign
        session.user.id = user.id;
        // eslint-disable-next-line no-param-reassign
        session.user.name = user.name as string;

        const userFromDatabase = await db.query.users.findFirst({
          with: {
            settings: {
              columns: {
                colorScheme: true,
                language: true,
                autoFocusSearch: true,
              },
            },
          },
          where: eq(users.id, user.id),
        });

        session.user.isAdmin = userFromDatabase?.isAdmin ?? false;
        session.user.colorScheme = userFromDatabase
          ? colorSchemeParser.parse(userFromDatabase.settings?.colorScheme)
          : 'environment';
        session.user.language = userFromDatabase?.settings?.language ?? 'en';
        session.user.autoFocusSearch = userFromDatabase?.settings?.autoFocusSearch ?? false;
      }

      return session;
    },
    async signIn({ user }) {
      // Check if this sign in callback is being called in the credentials authentication flow.
      // If so, use the next-auth adapter to create a session entry in the database
      // (SignIn is called after authorize so we can safely assume the user is valid and already authenticated).
      if (!isCredentialsRequest(req)) return true;

      if (!user) return true;

      const sessionToken = generateSessionToken();
      const sessionExpiry = fromDate(sessionMaxAgeInSeconds);

      // https://github.com/nextauthjs/next-auth/issues/6106
      if (!adapter?.createSession) {
        return false;
      }

      await adapter.createSession({
        sessionToken: sessionToken,
        userId: user.id,
        expires: sessionExpiry,
      });

      const cookies = new Cookies(req, res);
      cookies.set('next-auth.session-token', sessionToken, {
        expires: sessionExpiry,
      });

      return true;
    },
    async redirect({ url, baseUrl }) {
      const pathname = new URL(url, baseUrl).pathname;
      const redirectUrl = createRedirectUri(req.headers, pathname);
      return redirectUrl;
    },
  },
  session: {
    strategy: 'database',
    maxAge: sessionMaxAgeInSeconds,
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  adapter: adapter as Adapter,
  providers: [...(await getProviders(req.headers)), EmptyNextAuthProvider()],
  cookies: createCookiesWithDefaultOptions(req.url?.startsWith('https:') ?? false),
  jwt: {
    async encode(params) {
      if (!isCredentialsRequest(req)) {
        return encode(params);
      }

      const cookies = new Cookies(req, res);
      const cookie = cookies.get('next-auth.session-token');
      return cookie ?? '';
    },

    async decode(params) {
      if (!isCredentialsRequest(req)) {
        return decode(params);
      }

      return null;
    },
  },
});

const isCredentialsRequest = (req: NextApiRequest): boolean => {
  const nextAuthQueryParams = req.query.nextauth as string[];
  return (
    nextAuthQueryParams.includes('callback') &&
    (nextAuthQueryParams.includes('credentials') ||
      nextAuthQueryParams.includes('ldap') ||
      nextAuthQueryParams.includes('oidc')) &&
    req.method === 'POST'
  );
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return await getServerSession(
    ctx.req,
    ctx.res,
    await constructAuthOptions(
      ctx.req as unknown as NextApiRequest,
      ctx.res as unknown as NextApiResponse
    )
  );
};
