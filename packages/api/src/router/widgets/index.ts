import { createTRPCRouter } from "../../trpc";
import { appRouter } from "./app";
import { calendarRouter } from "./calendar";
import { dnsHoleRouter } from "./dns-hole";
import { downloadsRouter } from "./downloads";
import { firewallRouter } from "./firewall";
import { healthMonitoringRouter } from "./health-monitoring";
import { indexerManagerRouter } from "./indexer-manager";
import { mediaReleaseRouter } from "./media-release";
import { mediaRequestsRouter } from "./media-requests";
import { mediaServerRouter } from "./media-server";
import { mediaTranscodingRouter } from "./media-transcoding";
import { minecraftRouter } from "./minecraft";
import { networkControllerRouter } from "./network-controller";
import { notebookRouter } from "./notebook";
import { notificationsRouter } from "./notifications";
import { optionsRouter } from "./options";
import { releasesRouter } from "./releases";
import { rssFeedRouter } from "./rssFeed";
import { smartHomeRouter } from "./smart-home";
import { stockPriceRouter } from "./stocks";
import { weatherRouter } from "./weather";

export const widgetRouter = createTRPCRouter({
  notebook: notebookRouter,
  weather: weatherRouter,
  app: appRouter,
  dnsHole: dnsHoleRouter,
  smartHome: smartHomeRouter,
  stockPrice: stockPriceRouter,
  mediaServer: mediaServerRouter,
  mediaRelease: mediaReleaseRouter,
  calendar: calendarRouter,
  downloads: downloadsRouter,
  mediaRequests: mediaRequestsRouter,
  rssFeed: rssFeedRouter,
  indexerManager: indexerManagerRouter,
  healthMonitoring: healthMonitoringRouter,
  mediaTranscoding: mediaTranscodingRouter,
  minecraft: minecraftRouter,
  options: optionsRouter,
  releases: releasesRouter,
  networkController: networkControllerRouter,
  firewall: firewallRouter,
  notifications: notificationsRouter,
});
