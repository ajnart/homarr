/**
 * This file contains the root router of your tRPC-backend
 */
import { z } from 'zod';
import { procedure, router } from '../trpc';

export const appRouter = router({
  // Ping should take a Query param for URL
  ping: procedure.input(z.string()).query(async ({ input }) => {
    const result = await fetch(input);
    return {
      status: result.status,
    };
  }),

  healthcheck: procedure.query(() => 'yay!'),
});

export type AppRouter = typeof appRouter;
