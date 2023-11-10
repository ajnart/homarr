import { createServerSideHelpers } from '@trpc/react-query/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { GetServerSidePropsContext } from 'next';
import superjson from 'superjson';

import { rootRouter } from './root';
import { createTRPCContext } from './trpc';

export const createTrpcServersideHelpers = async (
  props: Pick<GetServerSidePropsContext, 'req' | 'res'>
) =>
  createServerSideHelpers({
    router: rootRouter,
    ctx: await createTRPCContext(props as CreateNextContextOptions),
    transformer: superjson,
  });
