import { createTRPCRouter } from '~/server/api/trpc';
import { configRouter } from '~/server/api/routers/config';
import { dockerRouter } from './routers/docker';
import { iconsRouter } from './routers/icon';
import { dashDotRouter } from './routers/dash-dot';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  config: configRouter,
  docker: dockerRouter,
  icon: iconsRouter,
  dashDot: dashDotRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
