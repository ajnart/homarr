import { objectKeys } from "@homarr/common";
import type { AtLeastOneOf } from "@homarr/common/types";

import { createDocumentationLink } from "./docs";

export const integrationSecretKindObject = {
  apiKey: { isPublic: false, multiline: false },
  username: { isPublic: true, multiline: false },
  password: { isPublic: false, multiline: false },
  tokenId: { isPublic: true, multiline: false },
  realm: { isPublic: true, multiline: false },
  personalAccessToken: { isPublic: false, multiline: false },
  topic: { isPublic: true, multiline: false },
  opnsenseApiKey: { isPublic: false, multiline: false },
  opnsenseApiSecret: { isPublic: false, multiline: false },
  url: { isPublic: false, multiline: false },
  privateKey: { isPublic: false, multiline: true },
  githubAppId: { isPublic: true, multiline: false },
  githubInstallationId: { isPublic: true, multiline: false },
} satisfies Record<string, { isPublic: boolean; multiline: boolean }>;

export const integrationSecretKinds = objectKeys(integrationSecretKindObject);

interface integrationDefinition {
  name: string;
  iconUrl: string;
  secretKinds: AtLeastOneOf<IntegrationSecretKind[]>; // at least one secret kind set is required
  category: AtLeastOneOf<IntegrationCategory>;
  documentationUrl: string | null;
  defaultUrl?: string; // optional default URL for the integration
}

export const integrationDefs = {
  sabNzbd: {
    name: "SABnzbd",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/sabnzbd.svg",
    category: ["downloadClient", "usenet"],
    documentationUrl: createDocumentationLink("/docs/integrations/sabnzbd"),
  },
  nzbGet: {
    name: "NZBGet",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/nzbget.svg",
    category: ["downloadClient", "usenet"],
    documentationUrl: createDocumentationLink("/docs/integrations/nzbget"),
  },
  deluge: {
    name: "Deluge",
    secretKinds: [["password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/deluge.svg",
    category: ["downloadClient", "torrent"],
    documentationUrl: createDocumentationLink("/docs/integrations/deluge"),
  },
  transmission: {
    name: "Transmission",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/transmission.svg",
    category: ["downloadClient", "torrent"],
    documentationUrl: createDocumentationLink("/docs/integrations/transmission"),
  },
  qBittorrent: {
    name: "qBittorrent",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/qbittorrent.svg",
    category: ["downloadClient", "torrent"],
    documentationUrl: createDocumentationLink("/docs/integrations/q-bittorent"),
  },
  aria2: {
    name: "Aria2",
    secretKinds: [[], ["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus_icons@latest/src/system_downloads_3.svg",
    category: ["downloadClient", "torrent", "miscellaneous"],
    documentationUrl: createDocumentationLink("/docs/integrations/aria2"),
  },
  sonarr: {
    name: "Sonarr",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/sonarr.svg",
    category: ["calendar"],
    documentationUrl: createDocumentationLink("/docs/integrations/sonarr"),
  },
  radarr: {
    name: "Radarr",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/radarr.svg",
    category: ["calendar"],
    documentationUrl: createDocumentationLink("/docs/integrations/radarr"),
  },
  lidarr: {
    name: "Lidarr",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/lidarr.svg",
    category: ["calendar"],
    documentationUrl: createDocumentationLink("/docs/integrations/lidarr"),
  },
  readarr: {
    name: "Readarr",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/readarr.svg",
    category: ["calendar"],
    documentationUrl: createDocumentationLink("/docs/integrations/readarr"),
  },
  prowlarr: {
    name: "Prowlarr",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/prowlarr.svg",
    category: ["indexerManager"],
    documentationUrl: createDocumentationLink("/docs/integrations/prowlarr"),
  },
  jellyfin: {
    name: "Jellyfin",
    secretKinds: [["username", "password"], ["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/jellyfin.svg",
    category: ["mediaService", "mediaRelease"],
    documentationUrl: createDocumentationLink("/docs/integrations/jellyfin"),
  },
  emby: {
    name: "Emby",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/emby.svg",
    category: ["mediaService", "mediaRelease"],
    documentationUrl: createDocumentationLink("/docs/integrations/emby"),
  },
  plex: {
    name: "Plex",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/plex.svg",
    category: ["mediaService", "mediaRelease"],
    documentationUrl: createDocumentationLink("/docs/integrations/plex"),
  },
  jellyseerr: {
    name: "Jellyseerr",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/jellyseerr.svg",
    category: ["mediaSearch", "mediaRequest", "search"],
    documentationUrl: createDocumentationLink("/docs/integrations/jellyseerr"),
  },
  overseerr: {
    name: "Overseerr",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/overseerr.svg",
    category: ["mediaSearch", "mediaRequest", "search"],
    documentationUrl: createDocumentationLink("/docs/integrations/overseerr"),
  },
  piHole: {
    name: "Pi-hole",
    secretKinds: [["apiKey"], []],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/pi-hole.svg",
    category: ["dnsHole"],
    documentationUrl: createDocumentationLink("/docs/integrations/pi-hole"),
  },
  adGuardHome: {
    name: "AdGuard Home",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/adguard-home.svg",
    category: ["dnsHole"],
    documentationUrl: createDocumentationLink("/docs/integrations/adguard-home"),
  },
  homeAssistant: {
    name: "Home Assistant",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/home-assistant.svg",
    category: ["smartHomeServer", "calendar"],
    documentationUrl: createDocumentationLink("/docs/integrations/home-assistant"),
  },
  openmediavault: {
    name: "OpenMediaVault",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/openmediavault.svg",
    category: ["healthMonitoring"],
    documentationUrl: createDocumentationLink("/docs/integrations/open-media-vault"),
  },
  dashDot: {
    name: "Dash.",
    secretKinds: [[]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/png/dashdot.png",
    category: ["healthMonitoring"],
    documentationUrl: createDocumentationLink("/docs/integrations/dash-dot"),
  },
  tdarr: {
    name: "Tdarr",
    secretKinds: [[], ["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/png/tdarr.png",
    category: ["mediaTranscoding"],
    documentationUrl: createDocumentationLink("/docs/integrations/tdarr"),
  },
  proxmox: {
    name: "Proxmox",
    secretKinds: [["username", "tokenId", "apiKey", "realm"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/proxmox.svg",
    category: ["healthMonitoring"],
    documentationUrl: createDocumentationLink("/docs/integrations/proxmox"),
  },
  nextcloud: {
    name: "Nextcloud",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/nextcloud.svg",
    category: ["calendar"],
    documentationUrl: createDocumentationLink("/docs/integrations/nextcloud"),
  },
  unifiController: {
    name: "Unifi Controller",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/png/unifi.png",
    category: ["networkController"],
    documentationUrl: createDocumentationLink("/docs/integrations/unifi-controller"),
  },
  opnsense: {
    name: "OPNsense",
    secretKinds: [["opnsenseApiKey", "opnsenseApiSecret"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/opnsense.svg",
    category: ["firewall"],
    documentationUrl: createDocumentationLink("/docs/integrations/opnsense"),
  },
  github: {
    name: "Github",
    secretKinds: [[], ["personalAccessToken"], ["githubAppId", "githubInstallationId", "privateKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/github.svg",
    category: ["releasesProvider"],
    defaultUrl: "https://api.github.com",
    documentationUrl: createDocumentationLink("/docs/integrations/github"),
  },
  dockerHub: {
    name: "Docker Hub",
    secretKinds: [[], ["username", "personalAccessToken"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/docker.svg",
    category: ["releasesProvider"],
    defaultUrl: "https://hub.docker.com",
    documentationUrl: createDocumentationLink("/docs/integrations/docker-hub"),
  },
  gitlab: {
    name: "Gitlab",
    secretKinds: [[], ["personalAccessToken"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/gitlab.svg",
    category: ["releasesProvider"],
    defaultUrl: "https://gitlab.com",
    documentationUrl: createDocumentationLink("/docs/integrations/gitlab"),
  },
  npm: {
    name: "NPM",
    secretKinds: [[]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/npm.svg",
    category: ["releasesProvider"],
    defaultUrl: "https://registry.npmjs.org",
    documentationUrl: createDocumentationLink("/docs/integrations/npm"),
  },
  codeberg: {
    name: "Codeberg",
    secretKinds: [[], ["personalAccessToken"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/codeberg.svg",
    category: ["releasesProvider"],
    defaultUrl: "https://codeberg.org",
    documentationUrl: createDocumentationLink("/docs/integrations/codeberg"),
  },
  linuxServerIO: {
    name: "LinuxServer.io",
    secretKinds: [[]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/linuxserver-io.svg",
    category: ["releasesProvider"],
    defaultUrl: "https://api.linuxserver.io",
    documentationUrl: createDocumentationLink("/docs/integrations/linux-server-io"),
  },
  gitHubContainerRegistry: {
    name: "GitHub Container Registry",
    secretKinds: [[], ["personalAccessToken"], ["githubAppId", "githubInstallationId", "privateKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/github.svg",
    category: ["releasesProvider"],
    defaultUrl: "https://api.github.com",
    documentationUrl: createDocumentationLink("/docs/integrations/github"),
  },
  quay: {
    name: "Quay",
    secretKinds: [[], ["personalAccessToken"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/png/quay.png",
    category: ["releasesProvider"],
    defaultUrl: "https://quay.io",
    documentationUrl: createDocumentationLink("/docs/integrations/quay"),
  },
  ntfy: {
    name: "ntfy",
    secretKinds: [["topic"], ["topic", "apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/ntfy.svg",
    category: ["notifications"],
    documentationUrl: createDocumentationLink("/docs/integrations/ntfy"),
  },
  ical: {
    name: "iCal",
    secretKinds: [["url"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/ical.svg",
    category: ["calendar"],
    documentationUrl: createDocumentationLink("/docs/integrations/ical"),
  },
  truenas: {
    name: "TrueNAS",
    secretKinds: [["username", "password"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/truenas.svg",
    category: ["healthMonitoring"],
    documentationUrl: createDocumentationLink("/docs/integrations/truenas"),
  },
  unraid: {
    name: "Unraid",
    secretKinds: [["apiKey"]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/unraid.svg",
    category: ["healthMonitoring"],
    documentationUrl: createDocumentationLink("/docs/integrations/unraid"),
  },
  // This integration only returns mock data, it is used during development (but can also be used in production by directly going to the create page)
  mock: {
    name: "Mock",
    secretKinds: [[]],
    iconUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/vitest.svg",
    category: [
      "calendar",
      "dnsHole",
      "downloadClient",
      "healthMonitoring",
      "indexerManager",
      "mediaRelease",
      "mediaRequest",
      "mediaService",
      "mediaTranscoding",
      "networkController",
      "notifications",
      "smartHomeServer",
    ],
    documentationUrl: null,
  },
} as const satisfies Record<string, integrationDefinition>;

export const integrationKinds = objectKeys(integrationDefs) as AtLeastOneOf<IntegrationKind>;

export const getIconUrl = (integration: IntegrationKind) => integrationDefs[integration].iconUrl;

export const getIntegrationName = (integration: IntegrationKind) => integrationDefs[integration].name;

export const getDefaultSecretKinds = (integration: IntegrationKind): IntegrationSecretKind[] =>
  integrationDefs[integration].secretKinds[0];

export const getAllSecretKindOptions = (integration: IntegrationKind): AtLeastOneOf<IntegrationSecretKind[]> =>
  integrationDefs[integration].secretKinds;

export const getIntegrationDefaultUrl = (integration: IntegrationKind) => {
  const definition = integrationDefs[integration];
  return "defaultUrl" in definition ? definition.defaultUrl : undefined;
};

/**
 * Get all integration kinds that share a category, typed only by the kinds belonging to the category
 * @param category Category to filter by, belonging to IntegrationCategory
 * @returns Partial list of integration kinds
 */
export const getIntegrationKindsByCategory = <TCategory extends IntegrationCategory>(category: TCategory) => {
  return objectKeys(integrationDefs).filter((integration) =>
    integrationDefs[integration].category.some((defCategory) => defCategory === category),
  ) as AtLeastOneOf<IntegrationKindByCategory<TCategory>>;
};

/**
 * Directly get the types of the list returned by getIntegrationKindsByCategory
 */
export type IntegrationKindByCategory<TCategory extends IntegrationCategory> = {
  [Key in keyof typeof integrationDefs]: TCategory extends (typeof integrationDefs)[Key]["category"][number]
    ? Key
    : never;
}[keyof typeof integrationDefs] extends infer U
  ? //Needed to simplify the type when using it
    U
  : never;

export type IntegrationSecretKind = keyof typeof integrationSecretKindObject;
export type IntegrationKind = keyof typeof integrationDefs;

export const integrationCategories = [
  "dnsHole",
  "mediaService",
  "calendar",
  "mediaSearch",
  "mediaRelease",
  "mediaRequest",
  "downloadClient",
  "usenet",
  "torrent",
  "miscellaneous",
  "smartHomeServer",
  "indexerManager",
  "healthMonitoring",
  "search",
  "mediaTranscoding",
  "networkController",
  "releasesProvider",
  "notifications",
  "firewall",
] as const;

export type IntegrationCategory = (typeof integrationCategories)[number];
