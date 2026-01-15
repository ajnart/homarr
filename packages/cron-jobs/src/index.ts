import { analyticsJob } from "./jobs/analytics";
import { dockerContainersJob } from "./jobs/docker";
import { iconsUpdaterJob } from "./jobs/icons-updater";
import { dnsHoleJob } from "./jobs/integrations/dns-hole";
import { downloadsJob } from "./jobs/integrations/downloads";
import {
  firewallCpuJob,
  firewallInterfacesJob,
  firewallMemoryJob,
  firewallVersionJob,
} from "./jobs/integrations/firewall";
import { healthMonitoringJob } from "./jobs/integrations/health-monitoring";
import { smartHomeEntityStateJob } from "./jobs/integrations/home-assistant";
import { indexerManagerJob } from "./jobs/integrations/indexer-manager";
import { mediaOrganizerJob } from "./jobs/integrations/media-organizer";
import { mediaRequestListJob, mediaRequestStatsJob } from "./jobs/integrations/media-requests";
import { mediaServerJob } from "./jobs/integrations/media-server";
import { mediaTranscodingJob } from "./jobs/integrations/media-transcoding";
import { networkControllerJob } from "./jobs/integrations/network-controller";
import { refreshNotificationsJob } from "./jobs/integrations/notifications";
import { minecraftServerStatusJob } from "./jobs/minecraft-server-status";
import { pingJob } from "./jobs/ping";
import { rssFeedsJob } from "./jobs/rss-feeds";
import { updateCheckerJob } from "./jobs/update-checker";
import { weatherJob } from "./jobs/weather";
import { createCronJobGroup } from "./lib";

export const jobGroup = createCronJobGroup({
  analytics: analyticsJob,
  iconsUpdater: iconsUpdaterJob,
  ping: pingJob,
  smartHomeEntityState: smartHomeEntityStateJob,
  mediaServer: mediaServerJob,
  mediaOrganizer: mediaOrganizerJob,
  downloads: downloadsJob,
  dnsHole: dnsHoleJob,
  mediaRequestStats: mediaRequestStatsJob,
  mediaRequestList: mediaRequestListJob,
  rssFeeds: rssFeedsJob,
  indexerManager: indexerManagerJob,
  healthMonitoring: healthMonitoringJob,
  updateChecker: updateCheckerJob,
  mediaTranscoding: mediaTranscodingJob,
  minecraftServerStatus: minecraftServerStatusJob,
  dockerContainers: dockerContainersJob,
  networkController: networkControllerJob,
  firewallCpu: firewallCpuJob,
  firewallMemory: firewallMemoryJob,
  firewallVersion: firewallVersionJob,
  firewallInterfaces: firewallInterfacesJob,
  refreshNotifications: refreshNotificationsJob,
  weather: weatherJob,
});

export type JobGroupKeys = ReturnType<(typeof jobGroup)["getKeys"]>[number];
