import NextAuth, { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

import { prisma } from '../../../server/db/client';
import { loginSchema } from '../../../validation/auth';
import { addSecurityEvent } from '../../../tools/events/addSecurityEvent';

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

export default NextAuth(authOptions);
