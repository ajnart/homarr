import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Session } from 'next-auth';
import { SessionProvider, signIn } from 'next-auth/react';
import { useEffect } from 'react';

dayjs.extend(relativeTime);

interface CustomSessionProviderProps {
  session: Session;
  children: React.ReactNode;
}

export const CustomSessionProvider = ({ session, children }: CustomSessionProviderProps) => {
  //Automatically redirect to the login page after a session expires
  useEffect(() => {
    if (!session) return () => {};
    const timeout = setTimeout(signIn, dayjs(session?.expires).diff(new Date()));
    return () => clearTimeout(timeout);
  }, [session]);

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
};
