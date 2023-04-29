import { createNextApiHandler } from '@trpc/server/adapters/next';
import Consola from 'consola';
import { env } from '~/env.mjs';
import { createTRPCContext } from '~/server/api/trpc';
import { appRouter } from '~/server/api/root';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          Consola.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        }
      : undefined,
});
