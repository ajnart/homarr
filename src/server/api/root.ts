import { createTRPCRouter } from '~/server/api/trpc';
import { appRouter } from './routers/app';
import { boardRouter } from './routers/board';
import { calendarRouter } from './routers/calendar';
import { configRouter } from './routers/config';
import { dashDotRouter } from './routers/dash-dot';
import { dnsHoleRouter } from './routers/dns-hole/router';
import { dockerRouter } from './routers/docker/router';
import { downloadRouter } from './routers/download';
import { iconRouter } from './routers/icon';
import { inviteRouter } from './routers/invite/invite-router';
import { mediaRequestsRouter } from './routers/media-request';
import { mediaServerRouter } from './routers/media-server';
import { notebookRouter } from './routers/notebook';
import { overseerrRouter } from './routers/overseerr';
import { passwordRouter } from './routers/password';
import { rssRouter } from './routers/rss';
import { smartHomeEntityStateRouter } from './routers/smart-home/entity-state';
import { timezoneRouter } from './routers/timezone';
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
  timezone: timezoneRouter,
  usenet: usenetRouter,
  weather: weatherRouter,
  invites: inviteRouter,
  boards: boardRouter,
  password: passwordRouter,
  notebook: notebookRouter,
  smartHomeEntityState: smartHomeEntityStateRouter
});

// export type definition of API
export type RootRouter = typeof rootRouter;
