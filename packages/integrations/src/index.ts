// General integrations
export { AdGuardHomeIntegration } from "./adguard-home/adguard-home-integration";
export { Aria2Integration } from "./download-client/aria2/aria2-integration";
export { DelugeIntegration } from "./download-client/deluge/deluge-integration";
export { NzbGetIntegration } from "./download-client/nzbget/nzbget-integration";
export { QBitTorrentIntegration } from "./download-client/qbittorrent/qbittorrent-integration";
export { SabnzbdIntegration } from "./download-client/sabnzbd/sabnzbd-integration";
export { TransmissionIntegration } from "./download-client/transmission/transmission-integration";
export { HomeAssistantIntegration } from "./homeassistant/homeassistant-integration";
export { JellyfinIntegration } from "./jellyfin/jellyfin-integration";
export { JellyseerrIntegration } from "./jellyseerr/jellyseerr-integration";
export { LidarrIntegration } from "./media-organizer/lidarr/lidarr-integration";
export { RadarrIntegration } from "./media-organizer/radarr/radarr-integration";
export { ReadarrIntegration } from "./media-organizer/readarr/readarr-integration";
export { SonarrIntegration } from "./media-organizer/sonarr/sonarr-integration";
export { NextcloudIntegration } from "./nextcloud/nextcloud.integration";
export { NTFYIntegration } from "./ntfy/ntfy-integration";
export { OpenMediaVaultIntegration } from "./openmediavault/openmediavault-integration";
export { OverseerrIntegration } from "./overseerr/overseerr-integration";
export { PiHoleIntegrationV5 } from "./pi-hole/v5/pi-hole-integration-v5";
export { PiHoleIntegrationV6 } from "./pi-hole/v6/pi-hole-integration-v6";
export { PlexIntegration } from "./plex/plex-integration";
export { ProwlarrIntegration } from "./prowlarr/prowlarr-integration";
export { TrueNasIntegration } from "./truenas/truenas-integration";
export { UnraidIntegration } from "./unraid/unraid-integration";
export { OPNsenseIntegration } from "./opnsense/opnsense-integration";
export { ICalIntegration } from "./ical/ical-integration";

// Types
export type { IntegrationInput } from "./base/integration";
export type { DownloadClientJobsAndStatus } from "./interfaces/downloads/download-client-data";
export type { ExtendedDownloadClientItem } from "./interfaces/downloads/download-client-items";
export type { ExtendedClientStatus } from "./interfaces/downloads/download-client-status";
export type {
  FirewallInterface,
  FirewallCpuSummary,
  FirewallInterfacesSummary,
  FirewallVersionSummary,
  FirewallMemorySummary,
} from "./interfaces/firewall-summary/firewall-summary-types";
export type { SystemHealthMonitoring } from "./interfaces/health-monitoring/health-monitoring-types";
export { UpstreamMediaRequestStatus } from "./interfaces/media-requests/media-request-types";
export type { MediaRequestList, MediaRequestStats } from "./interfaces/media-requests/media-request-types";
export type { StreamSession } from "./interfaces/media-server/media-server-types";
export type {
  TdarrQueue,
  TdarrPieSegment,
  TdarrStatistics,
  TdarrWorker,
} from "./interfaces/media-transcoding/media-transcoding-types";
export type { ReleasesRepository, ReleaseResponse } from "./interfaces/releases-providers/releases-providers-types";
export type { Notification } from "./interfaces/notifications/notification-types";

// Schemas
export { downloadClientItemSchema } from "./interfaces/downloads/download-client-items";

// Helpers
export { createIntegrationAsync } from "./base/creator";
