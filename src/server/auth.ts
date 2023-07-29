import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import Cookies from 'cookies';
import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next';
import { type DefaultSession, type NextAuthOptions, getServerSession } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '~/server/db';
import EmptyNextAuthProvider from '~/utils/empty-provider';
import { fromDate, generateSessionToken } from '~/utils/session';
import { colorSchemeParser, signInSchema } from '~/validations/user';

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
      language: string;
      // ...other properties
      // role: UserRole;
    };
  }

  interface User {
    isAdmin: boolean;
    colorScheme: 'light' | 'dark' | 'environment';
    language: string;
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

const adapter = PrismaAdapter(prisma);
const sessionMaxAgeInSeconds = 30 * 24 * 60 * 60; // 30 days

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const constructAuthOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions => ({
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // eslint-disable-next-line no-param-reassign
        session.user.id = user.id;
        // eslint-disable-next-line no-param-reassign
        session.user.name = user.name as string;

        const userFromDatabase = await prisma.user.findUniqueOrThrow({
          where: {
            id: user.id,
          },
          include: {
            settings: {
              select: {
                colorScheme: true,
                language: true,
              },
            },
          },
        });

        session.user.isAdmin = userFromDatabase.isAdmin;
        session.user.colorScheme = colorSchemeParser.parse(userFromDatabase.settings?.colorScheme);
        session.user.language = userFromDatabase.settings?.language ?? 'en';
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
  },
  session: {
    strategy: 'database',
    maxAge: sessionMaxAgeInSeconds,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  adapter: PrismaAdapter(prisma),
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
      async authorize(credentials) {
        const data = await signInSchema.parseAsync(credentials);

        const user = await prisma.user.findFirst({
          where: {
            name: data.name,
          },
          include: {
            settings: {
              select: {
                colorScheme: true,
                language: true,
              },
            },
          },
        });

        if (!user || !user.password) {
          return null;
        }

        console.log(`user ${user.id} is trying to log in. checking password...`);
        const isValidPassword = await bcrypt.compare(data.password, user.password);

        if (!isValidPassword) {
          console.log(`password for user ${user.id} was incorrect`);
          return null;
        }

        console.log(`user ${user.id} successfully authorized`);

        return {
          id: user.id,
          name: user.name,
          isAdmin: false,
          colorScheme: colorSchemeParser.parse(user.settings?.colorScheme),
          language: user.settings?.language ?? 'en',
        };
      },
    }),
    EmptyNextAuthProvider(),
  ],
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
  const nextAuthQueryParams = req.query.nextauth as ['callback', 'credentials'];
  return (
    nextAuthQueryParams.includes('callback') &&
    nextAuthQueryParams.includes('credentials') &&
    req.method === 'POST'
  );
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
  return getServerSession(
    ctx.req,
    ctx.res,
    constructAuthOptions(
      ctx.req as unknown as NextApiRequest,
      ctx.res as unknown as NextApiResponse
    )
  );
};
