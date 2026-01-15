import type { Session } from "next-auth";

import { generateSecureRandomToken } from "@homarr/common/server";
import type { Database } from "@homarr/db";

import { getCurrentUserPermissionsAsync } from "./callbacks";

// Default of authjs
export const sessionTokenCookieName = "authjs.session-token";

export const expireDateAfter = (seconds: number) => {
  return new Date(Date.now() + seconds * 1000);
};

export const generateSessionToken = () => {
  return generateSecureRandomToken(48);
};

export const getSessionFromTokenAsync = async (db: Database, token: string | undefined): Promise<Session | null> => {
  if (!token) {
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: ({ sessionToken }, { eq }) => eq(sessionToken, token),
    columns: {
      expires: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
          colorScheme: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return {
    user: {
      ...session.user,
      permissions: await getCurrentUserPermissionsAsync(db, session.user.id),
    },
    expires: session.expires.toISOString(),
  };
};
