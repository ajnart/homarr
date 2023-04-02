import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import superjson from 'superjson';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { createTRPCContext } from './trpc';
import { appRouter } from './root';

export const createSSGHelper = async (context: GetServerSidePropsContext) =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      req: context.req as NextApiRequest,
      res: context.res as NextApiResponse,
    }),
    transformer: superjson,
  });
