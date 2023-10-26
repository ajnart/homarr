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
    console.log('detected logged out user!');
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
      notFound: true,
    };
  }

  return undefined;
};
