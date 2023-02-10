/**
 * This file contains the root router of your tRPC-backend
 */
import { observable } from '@trpc/server/observable';
import { clearInterval } from 'timers';
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

  hello: procedure
    .input(
      z
        .object({
          text: z.string().nullish(),
        })
        .nullish()
    )
    .query(({ input }) => ({
      greeting: `hello ${input?.text ?? 'world'}`,
    })),
  healthcheck: procedure.query(() => 'yay!'),
  randomNumber: procedure.subscription(() =>
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
