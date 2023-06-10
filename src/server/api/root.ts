import { createTRPCRouter } from '~/server/api/trpc';
import { appRouter } from './routers/app';
import { rssRouter } from './routers/rss';
import { configRouter } from './routers/config';
import { dockerRouter } from './routers/docker/router';
import { iconRouter } from './routers/icon';
import { dashDotRouter } from './routers/dash-dot';
import { dnsHoleRouter } from './routers/dns-hole';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const rootRouter = createTRPCRouter({
  app: appRouter,
  rss: rssRouter,
  config: configRouter,
  docker: dockerRouter,
  icon: iconRouter,
  dashDot: dashDotRouter,
  dnsHole: dnsHoleRouter,
});

// export type definition of API
export type RootRouter = typeof rootRouter;
