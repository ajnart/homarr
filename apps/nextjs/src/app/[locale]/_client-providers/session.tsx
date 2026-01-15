"use client";

import { createContext, useContext, useEffect } from "react";
import type { PropsWithChildren } from "react";
import dayjs from "dayjs";

import type { Session } from "@homarr/auth";
import { SessionProvider, signIn } from "@homarr/auth/client";

interface AuthProviderProps extends AuthContextProps {
  session: Session | null;
}

export const AuthProvider = ({ children, session, logoutUrl }: PropsWithChildren<AuthProviderProps>) => {
  useLoginRedirectOnSessionExpiry(session);

  return (
    <SessionProvider session={session}>
      <AuthContext.Provider value={{ logoutUrl }}>{children}</AuthContext.Provider>
    </SessionProvider>
  );
};

interface AuthContextProps {
  logoutUrl: string | undefined;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");

  return context;
};

const useLoginRedirectOnSessionExpiry = (session: Session | null) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!session) return () => {};
    //setTimeout doesn't allow for a number higher than 2147483647 (2³¹-1 , or roughly 24 days)
    const timeout = setTimeout(() => void signIn(), Math.min(dayjs(session.expires).diff(), 2147483647));
    return () => clearTimeout(timeout);
  }, [session]);
};
