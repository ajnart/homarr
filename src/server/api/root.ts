import { createTRPCRouter } from '~/server/api/trpc';
import { configRouter } from '~/server/api/routers/config';
import { dockerRouter } from './routers/docker';
import { iconsRouter } from './routers/icon';
import { dashDotRouter } from './routers/dash-dot';
import { mediaRequestsRouter } from './routers/media-request';
import { mediaServerRouter } from './routers/media-server';
import { overseerrRouter } from './routers/overseerr';
import { rssRouter } from './routers/rss';

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
  mediaRequests: mediaRequestsRouter,
  mediaServer: mediaServerRouter,
  overseerr: overseerrRouter,
  rss: rssRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
