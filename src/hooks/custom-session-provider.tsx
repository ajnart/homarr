import dayjs from 'dayjs';
import { Session } from 'next-auth';
import { SessionProvider, signIn } from 'next-auth/react';
import { createContext, useContext, useEffect } from 'react';

interface CustomSessionProviderProps {
  session: Session;
  children: React.ReactNode;
  logoutUrl?: string;
}

export const CustomSessionProvider = ({
  session,
  children,
  logoutUrl,
}: CustomSessionProviderProps) => {
  //Automatically redirect to the login page after a session expires or after 24 days
  useEffect(() => {
    if (!session) return () => {};
    //setTimeout doesn't allow for a number higher than 2147483647 (2³¹-1 , or roughly 24 days)
    const timeout = setTimeout(signIn, Math.min(dayjs(session.expires).diff(), 2147483647));
    return () => clearTimeout(timeout);
  }, [session]);

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <SessionContext.Provider value={{ logoutUrl }}>{children}</SessionContext.Provider>
    </SessionProvider>
  );
};

interface SessionContextProps {
  logoutUrl?: string;
}

const SessionContext = createContext<SessionContextProps | null>(null);

export function useLogoutUrl() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('You cannot use logoutUrl outside of session context.');
  }
  return context.logoutUrl;
}
