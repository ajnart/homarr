import { createTRPCRouter } from '~/server/api/trpc';
import { appRouter } from './routers/app';
import { rssRouter } from './routers/rss';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const rootRouter = createTRPCRouter({
  app: appRouter,
  rss: rssRouter,
});

// export type definition of API
export type RootRouter = typeof rootRouter;
