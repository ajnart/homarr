import { createNextApiHandler } from '@trpc/server/adapters/next';
import Consola from 'consola';
import { createTRPCContext } from '~/server/api/trpc';
import { rootRouter } from '~/server/api/root';

// export API handler
export default createNextApiHandler({
  router: rootRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          Consola.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        }
      : undefined,
});
