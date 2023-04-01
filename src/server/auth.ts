import bcrypt from 'bcrypt';
import { type GetServerSidePropsContext } from 'next';
import { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { addSecurityEvent } from '../tools/events/addSecurityEvent';
import { loginSchema } from '../validation/auth';
import { prisma } from './db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        // eslint-disable-next-line no-param-reassign
        token.id = user.id;
        // eslint-disable-next-line no-param-reassign
        token.username = user.name;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line no-param-reassign
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const cred = await loginSchema.parseAsync(credentials);

        const user = await prisma.user.findFirst({
          where: { username: cred.username },
        });

        if (!user || !user.isEnabled) {
          await addSecurityEvent(
            'login-failed',
            {
              fallbackUsername: cred.username,
              reason: !user ? 'not-found' : 'disabled',
            },
            null
          );
          return null;
        }

        const isValidPassword = bcrypt.compareSync(cred.password, user.password);

        if (!isValidPassword) {
          await addSecurityEvent('login-failed', { reason: 'invalid-credentials' }, user.id);
          return null;
        }

        await addSecurityEvent('login', {}, user.id);

        return {
          id: user.id,
          username: user.username,
        };
      },
    }),
    // ...add more providers here
  ],
  events: {
    signOut: async ({ token }) => {
      await addSecurityEvent('logout', {}, token.sub ?? null);
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
