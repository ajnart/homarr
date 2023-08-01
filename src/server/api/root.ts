import { createTRPCRouter } from '~/server/api/trpc';

import { appRouter } from './routers/app';
import { calendarRouter } from './routers/calendar';
import { configRouter } from './routers/config';
import { dashDotRouter } from './routers/dash-dot';
import { dnsHoleRouter } from './routers/dns-hole';
import { dockerRouter } from './routers/docker/router';
import { downloadRouter } from './routers/download';
import { iconRouter } from './routers/icon';
import { inviteRouter } from './routers/invite';
import { mediaRequestsRouter } from './routers/media-request';
import { mediaServerRouter } from './routers/media-server';
import { overseerrRouter } from './routers/overseerr';
import { rssRouter } from './routers/rss';
import { usenetRouter } from './routers/usenet/router';
import { userRouter } from './routers/user';
import { weatherRouter } from './routers/weather';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const rootRouter = createTRPCRouter({
  app: appRouter,
  rss: rssRouter,
  user: userRouter,
  config: configRouter,
  docker: dockerRouter,
  icon: iconRouter,
  dashDot: dashDotRouter,
  dnsHole: dnsHoleRouter,
  download: downloadRouter,
  mediaRequest: mediaRequestsRouter,
  mediaServer: mediaServerRouter,
  overseerr: overseerrRouter,
  usenet: usenetRouter,
  calendar: calendarRouter,
  weather: weatherRouter,
  invites: inviteRouter,
});

// export type definition of API
export type RootRouter = typeof rootRouter;
