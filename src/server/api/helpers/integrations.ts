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

export type IntegrationType = (typeof integrationTypes)[number];

export const mediaRequestIntegrationTypes = ['overseerr', 'jellyseerr'] as const;
