import bcrypt from 'bcrypt';
import { type GetServerSidePropsContext } from 'next';
import { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { env } from '~/env.mjs';
import { prisma } from '~/server/db';
import { loginSchema } from '~/validation/auth';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
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
    jwt: ({ token }) => token,
    session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line no-param-reassign
        session.user.id = token.id as string;
        // eslint-disable-next-line no-param-reassign
        session.user.name = token.name as string;
      }

      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        name: {
          label: 'Username',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const cred = await loginSchema.parseAsync(credentials);

        const user = await prisma.user.findFirst({
          where: { name: cred.username },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = bcrypt.compareSync(cred.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
        };
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => getServerSession(ctx.req, ctx.res, authOptions);
