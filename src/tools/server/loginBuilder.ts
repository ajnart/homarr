import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from 'next';

import { Session } from 'next-auth';

import { ParsedUrlQuery } from 'querystring';

export const checkForSessionOrAskForLogin = (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  session: Session | null,
  accessCallback: () => boolean
): GetServerSidePropsResult<never> | undefined => {
  const permitted = accessCallback();

  // user is logged in but does not have the required access
  if (session?.user && !permitted) {
    return {
      redirect: {
        destination: '/401',
        permanent: false
      }
    };
  }

  // user *may* be logged in and permitted
  if (permitted) {
    return undefined;
  }

  // user is logged out and needs to sign in
  return {
    redirect: {
      destination: `/auth/login?redirectAfterLogin=${context.resolvedUrl}`,
      permanent: false,
    },
  };
};
