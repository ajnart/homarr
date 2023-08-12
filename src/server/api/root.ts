import { createTRPCRouter } from '~/server/api/trpc';

import { appRouter } from './routers/app';
import { calendarRouter } from './routers/calendar';
import { configRouter } from './routers/config';
import { dashDotRouter } from './routers/dash-dot';
import { dnsHoleRouter } from './routers/dns-hole/router';
import { dockerRouter } from './routers/docker/router';
import { downloadRouter } from './routers/download';
import { iconRouter } from './routers/icon';
import { mediaRequestsRouter } from './routers/media-request';
import { mediaServerRouter } from './routers/media-server';
import { overseerrRouter } from './routers/overseerr';
import { rssRouter } from './routers/rss';
import { timezoneRouter } from './routers/timezone';
import { usenetRouter } from './routers/usenet/router';
import { weatherRouter } from './routers/weather';
import { notebookRouter } from './routers/notebook';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const rootRouter = createTRPCRouter({
  app: appRouter,
  calendar: calendarRouter,
  config: configRouter,
  dashDot: dashDotRouter,
  dnsHole: dnsHoleRouter,
  docker: dockerRouter,
  download: downloadRouter,
  icon: iconRouter,
  mediaRequest: mediaRequestsRouter,
  mediaServer: mediaServerRouter,
  overseerr: overseerrRouter,
  rss: rssRouter,
  timezone: timezoneRouter,
  usenet: usenetRouter,
  weather: weatherRouter,
  notebook: notebookRouter
});

// export type definition of API
export type RootRouter = typeof rootRouter;
