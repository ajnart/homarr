import type { IntegrationKind } from "@homarr/definitions";

import { AdGuardHomeIntegration } from "../adguard-home/adguard-home-integration";
import { CodebergIntegration } from "../codeberg/codeberg-integration";
import { DashDotIntegration } from "../dashdot/dashdot-integration";
import { DockerHubIntegration } from "../docker-hub/docker-hub-integration";
import { Aria2Integration } from "../download-client/aria2/aria2-integration";
import { DelugeIntegration } from "../download-client/deluge/deluge-integration";
import { NzbGetIntegration } from "../download-client/nzbget/nzbget-integration";
import { QBitTorrentIntegration } from "../download-client/qbittorrent/qbittorrent-integration";
import { SabnzbdIntegration } from "../download-client/sabnzbd/sabnzbd-integration";
import { TransmissionIntegration } from "../download-client/transmission/transmission-integration";
import { EmbyIntegration } from "../emby/emby-integration";
import { GitHubContainerRegistryIntegration } from "../github-container-registry/github-container-registry-integration";
import { GithubIntegration } from "../github/github-integration";
import { GitlabIntegration } from "../gitlab/gitlab-integration";
import { HomeAssistantIntegration } from "../homeassistant/homeassistant-integration";
import { ICalIntegration } from "../ical/ical-integration";
import { JellyfinIntegration } from "../jellyfin/jellyfin-integration";
import { JellyseerrIntegration } from "../jellyseerr/jellyseerr-integration";
import { LinuxServerIOIntegration } from "../linuxserverio/linuxserverio-integration";
import { LidarrIntegration } from "../media-organizer/lidarr/lidarr-integration";
import { RadarrIntegration } from "../media-organizer/radarr/radarr-integration";
import { ReadarrIntegration } from "../media-organizer/readarr/readarr-integration";
import { SonarrIntegration } from "../media-organizer/sonarr/sonarr-integration";
import { TdarrIntegration } from "../media-transcoding/tdarr-integration";
import { MockIntegration } from "../mock/mock-integration";
import { NextcloudIntegration } from "../nextcloud/nextcloud.integration";
import { NPMIntegration } from "../npm/npm-integration";
import { NTFYIntegration } from "../ntfy/ntfy-integration";
import { OpenMediaVaultIntegration } from "../openmediavault/openmediavault-integration";
import { OPNsenseIntegration } from "../opnsense/opnsense-integration";
import { OverseerrIntegration } from "../overseerr/overseerr-integration";
import { createPiHoleIntegrationAsync } from "../pi-hole/pi-hole-integration-factory";
import { PlexIntegration } from "../plex/plex-integration";
import { ProwlarrIntegration } from "../prowlarr/prowlarr-integration";
import { ProxmoxIntegration } from "../proxmox/proxmox-integration";
import { QuayIntegration } from "../quay/quay-integration";
import { TrueNasIntegration } from "../truenas/truenas-integration";
import { UnifiControllerIntegration } from "../unifi-controller/unifi-controller-integration";
import { UnraidIntegration } from "../unraid/unraid-integration";
import type { Integration, IntegrationInput } from "./integration";

export const createIntegrationAsync = async <TKind extends keyof typeof integrationCreators>(
  integration: IntegrationInput & { kind: TKind },
) => {
  if (!(integration.kind in integrationCreators)) {
    throw new Error(
      `Unknown integration kind ${integration.kind}. Did you forget to add it to the integration creator?`,
    );
  }

  const creator = integrationCreators[integration.kind];

  // factories are an array, to differentiate in js between class constructors and functions
  if (Array.isArray(creator)) {
    return (await creator[0](integration)) as IntegrationInstanceOfKind<TKind>;
  }

  return new creator(integration) as IntegrationInstanceOfKind<TKind>;
};

type IntegrationInstance = new (integration: IntegrationInput) => Integration;

// factories are an array, to differentiate in js between class constructors and functions
export const integrationCreators = {
  piHole: [createPiHoleIntegrationAsync],
  adGuardHome: AdGuardHomeIntegration,
  homeAssistant: HomeAssistantIntegration,
  jellyfin: JellyfinIntegration,
  plex: PlexIntegration,
  sonarr: SonarrIntegration,
  radarr: RadarrIntegration,
  sabNzbd: SabnzbdIntegration,
  nzbGet: NzbGetIntegration,
  qBittorrent: QBitTorrentIntegration,
  deluge: DelugeIntegration,
  transmission: TransmissionIntegration,
  aria2: Aria2Integration,
  jellyseerr: JellyseerrIntegration,
  overseerr: OverseerrIntegration,
  prowlarr: ProwlarrIntegration,
  openmediavault: OpenMediaVaultIntegration,
  lidarr: LidarrIntegration,
  readarr: ReadarrIntegration,
  dashDot: DashDotIntegration,
  tdarr: TdarrIntegration,
  proxmox: ProxmoxIntegration,
  emby: EmbyIntegration,
  nextcloud: NextcloudIntegration,
  unifiController: UnifiControllerIntegration,
  opnsense: OPNsenseIntegration,
  github: GithubIntegration,
  dockerHub: DockerHubIntegration,
  gitlab: GitlabIntegration,
  npm: NPMIntegration,
  codeberg: CodebergIntegration,
  linuxServerIO: LinuxServerIOIntegration,
  gitHubContainerRegistry: GitHubContainerRegistryIntegration,
  ical: ICalIntegration,
  quay: QuayIntegration,
  ntfy: NTFYIntegration,
  mock: MockIntegration,
  truenas: TrueNasIntegration,
  unraid: UnraidIntegration,
} satisfies Record<IntegrationKind, IntegrationInstance | [(input: IntegrationInput) => Promise<Integration>]>;

type IntegrationInstanceOfKind<TKind extends keyof typeof integrationCreators> = {
  [kind in TKind]: (typeof integrationCreators)[kind] extends [(input: IntegrationInput) => Promise<Integration>]
    ? Awaited<ReturnType<(typeof integrationCreators)[kind][0]>>
    : (typeof integrationCreators)[kind] extends IntegrationInstance
      ? InstanceType<(typeof integrationCreators)[kind]>
      : never;
}[TKind];
