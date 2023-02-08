/**
 * This file contains the root router of your tRPC-backend
 */
import { observable } from '@trpc/server/observable';
import { clearInterval } from 'timers';
import { router, publicProcedure } from '../trpc';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  randomNumber: publicProcedure.subscription(() =>
    observable<number>((emit) => {
      const int = setInterval(() => {
        emit.next(Math.random());
      }, 500);
      return () => {
        clearInterval(int);
      };
    })
  ),
});

export type AppRouter = typeof appRouter;
