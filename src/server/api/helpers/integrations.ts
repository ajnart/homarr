export const integrationTypes = [
  'readarr',
  'radarr',
  'sonarr',
  'lidarr',
  'sabnzbd',
  'jellyseerr',
  'overseerr',
  'deluge',
  'qBittorrent',
  'transmission',
  'plex',
  'jellyfin',
  'nzbGet',
] as const;
export type IntegrationsType = typeof integrationTypes;
export const mediaRequestIntegrationTypes = ['overseerr', 'jellyseerr'] as const;
export const mediaServerIntegrationTypes = ['jellyfin', 'plex'] as const;
export const usenetIntegrationTypes = ['nzbGet', 'sabnzbd'] as const;
export type IntegrationType = (typeof integrationTypes)[number];
