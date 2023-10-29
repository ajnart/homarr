import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  PreviewData,
} from 'next';

import { Session } from 'next-auth';

import { ParsedUrlQuery } from 'querystring';

export const checkForSessionOrAskForLogin = (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  session: Session | null,
  accessCallback: () => boolean
): GetServerSidePropsResult<any> | undefined => {
  if (!session?.user) {
    return {
      props: {},
      redirect: {
        destination: `/auth/login?redirectAfterLogin=${context.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  if (!accessCallback()) {
    return {
      props: {},
      redirect: {
        destination: '/401',
        permanent: false
      }
    };
  }

  return undefined;
};
