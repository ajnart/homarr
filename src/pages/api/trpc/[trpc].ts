import { createNextApiHandler } from '@trpc/server/adapters/next';
import Consola from 'consola';
import { env } from '~/env';
import { rootRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

// export API handler
export default createNextApiHandler({
  router: rootRouter,
  createContext: createTRPCContext,
  onError:
    env.NEXT_PUBLIC_NODE_ENV === 'development'
      ? ({ path, error }) => {
          Consola.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        }
      : undefined,
});
